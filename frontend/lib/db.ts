import { Pool } from 'pg'

const globalForDb = globalThis as unknown as { pool: Pool | null }
let schemaSyncPromise: Promise<void> | null = null

/** Normalize connection string so password with ! or other special chars works (encode for URL). */
function normalizeConnectionString(url: string): string {
  if (!url.includes('postgresql://') && !url.includes('postgres://')) return url
  const at = url.indexOf('@')
  if (at === -1) return url
  const beforeAt = url.slice(0, at)
  const afterAt = url.slice(at)
  const lastColon = beforeAt.lastIndexOf(':')
  if (lastColon === -1) return url
  const prefix = beforeAt.slice(0, lastColon + 1)
  const password = beforeAt.slice(lastColon + 1)
  const encoded = password.replace(/!/g, '%21').replace(/#/g, '%23')
  return prefix + encoded + afterAt
}

function isIdentityCriticalQuery(text: string): boolean {
  const t = text.toLowerCase()
  return (
    t.includes('select id, email, role from users') ||
    t.includes('from users where id =') ||
    t.includes('from users where email =') ||
    t.includes('select id, email, name, phone, city, role, carbon_credits') ||
    t.includes('update users set last_seen')
  )
}

// Mock Pool that prevents 500 errors if DB is unreachable locally
class MockPool {
  private static usersByEmail = new Map<string, any>()
  private static usersById = new Map<number, any>()
  private static nextUserId = 1000

  private static ensureUser(email: string, role = 'user', nameHint?: string) {
    const normalizedEmail = (email || '').toLowerCase()
    const existing = this.usersByEmail.get(normalizedEmail)
    if (existing) return existing

    const id = this.nextUserId++
    const now = new Date().toISOString()
    const inferredName = nameHint || (normalizedEmail.split('@')[0] || 'User')
    const user = {
      id,
      email: normalizedEmail || `user${id}@local.dev`,
      name: inferredName,
      role: role || 'user',
      carbon_credits: 0,
      phone: null,
      city: null,
      upi_id: null,
      avatar_url: null,
      bio: null,
      qr_code_url: null,
      last_seen: now,
      created_at: now,
      updated_at: now,
    }
    this.usersByEmail.set(user.email, user)
    this.usersById.set(user.id, user)
    return user
  }

  async query(text: string, params?: any[]) {
    const t = text.toLowerCase();
    console.warn('[Mock DB] Query executed without DATABASE_URL:', text.slice(0, 100));
    
    if (t.includes('count(*) from users')) return { rows: [{ count: 142 }] };
    if (t.includes('count(*) from rides')) return { rows: [{ count: 85 }] };
    
    // Identity-safe mock auth/profile behavior: deterministic per-email, no demo/admin fallback.
    if (t.includes('select id, email, role from users')) {
      const email = String(params?.[0] || '').toLowerCase()
      const existing = MockPool.usersByEmail.get(email)
      return { rows: existing ? [{ id: existing.id, email: existing.email, role: existing.role }] : [], rowCount: existing ? 1 : 0 };
    }
    if (t.includes('insert into users')) {
      const email = String(params?.[0] || '').toLowerCase()
      const name = String(params?.[1] || email.split('@')[0] || 'User')
      const role = String(params?.[2] || 'user')
      const user = MockPool.ensureUser(email, role, name)
      return {
        rows: [{ id: user.id, email: user.email, role: user.role }],
        rowCount: 1
      }
    }
    if (t.includes('update users set last_seen') && t.includes('where id =')) {
      const id = Number(params?.[0])
      const user = MockPool.usersById.get(id)
      if (!user) return { rows: [], rowCount: 0 }
      user.last_seen = new Date().toISOString()
      user.updated_at = user.last_seen
      return { rows: [], rowCount: 1 }
    }
    if ((t.includes('select id, email, name, phone, city, role, carbon_credits') || t.includes('from users where id =')) && t.includes('from users')) {
      const id = Number(params?.[0])
      const user = MockPool.usersById.get(id)
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 }
    }
    if (t.includes('update users set') && t.includes('where id =')) {
      const safeParams = params ?? []
      const id = Number(safeParams[safeParams.length - 1])
      const user = MockPool.usersById.get(id)
      if (!user) return { rows: [], rowCount: 0 }

      const keys = ['name', 'phone', 'city', 'upi_id', 'avatar_url', 'bio', 'qr_code_url']
      for (let i = 0; i < safeParams.length - 1 && i < keys.length; i++) {
        user[keys[i]] = safeParams[i]
      }
      user.updated_at = new Date().toISOString()
      MockPool.usersByEmail.set(user.email, user)
      MockPool.usersById.set(user.id, user)
      return { rows: [], rowCount: 1 }
    }

    // Handle generic INSERTs (return a dummy ID)
    if (t.includes('insert into')) {
      return { rows: [{ id: Math.floor(Math.random() * 1000) + 100 }], rowCount: 1 };
    }

    // Handle common SELECT patterns
    if (isIdentityCriticalQuery(t)) {
      console.warn('[Mock DB] Identity-critical query had no mock handler; returning empty set.')
      return { rows: [], rowCount: 0 }
    }
    if (t.includes('from corridors')) {
      return {
        rows: [
          { id: 1, city_id: 1, city_name: 'Mumbai', name: 'Casa Rio', location_from: 'Casa Rio', location_to: 'RCP', description: 'Palava City Gate 1 to Reliance Corporate Park', is_active: true, pickup_points: 'Gate 1, Gate 2', image_url: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400' },
          { id: 2, city_id: 1, city_name: 'Mumbai', name: 'Casa Bella', location_from: 'Casa Bella', location_to: 'RCP', description: 'Casa Bella Main Gate to Reliance Corporate Park', is_active: true, pickup_points: 'Main Gate', image_url: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400' },
          { id: 3, city_id: 1, city_name: 'Mumbai', name: 'Lakeshore', location_from: 'Lakeshore', location_to: 'RCP', description: 'Lakeshore Greens Phase 2 to RCP', is_active: true, pickup_points: 'Phase 2', image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
          { id: 4, city_id: 1, city_name: 'Mumbai', name: 'Kharghar', location_from: 'Kharghar', location_to: 'RCP', description: 'Kharghar Sector 20 to RCP via Highway', is_active: true, pickup_points: 'Sector 20', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400' }
        ]
      };
    }
    if (t.includes('from user_corridors')) {
       return { rows: [{ id: 1, name: 'Casa Rio', location_from: 'Casa Rio', location_to: 'RCP' }] };
    }
    if (t.includes('from vehicles')) {
      return {
        rows: [
          { id: 101, user_id: 1, vehicle_type: 'car', make: 'Honda', model: 'City', color: 'White', vehicle_number: 'MH04 AB 1234', total_seats: 4, default_available_seats: 3 }
        ]
      };
    }
    if (t.includes('from cities')) {
      return { rows: [{ id: 1, name: 'Mumbai', status: 'active' }, { id: 2, name: 'Navi Mumbai', status: 'active' }] };
    }
    if (t.includes('from rides')) {
      return {
        rows: [
          { 
            id: 1, user_id: 2, user_name: 'Aayushi Singh', corridor_id: 1, corridor_name: 'Casa Rio', 
            vehicle_id: 101, ride_date: new Date().toISOString().split('T')[0], ride_time: '08:30:00', 
            pickup_point: 'Casa Rio Gate 1', drop_point: 'RCP', price_per_seat: 120, 
            available_seats: 3, total_seats: 4, status: 'open', direction: 'to_office'
          },
          { 
            id: 2, user_id: 3, user_name: 'Rajiv Mehta', corridor_id: 2, corridor_name: 'Casa Bella', 
            vehicle_id: 102, ride_date: new Date().toISOString().split('T')[0], ride_time: '18:30:00', 
            pickup_point: 'RCP', drop_point: 'Casa Bella Main Gate', price_per_seat: 100, 
            available_seats: 2, total_seats: 4, status: 'open', direction: 'to_home'
          }
        ],
        rowCount: 2
      };
    }
    if (t.includes('from ride_requests')) {
      return { rows: [] };
    }
    if (t.includes('count')) return { rows: [{ count: 42 }] };
    if (t.includes('sum')) return { rows: [{ v: 5000 }] };

    return { rows: [], rowCount: 0 };
  }
  async end() {}
}

class HybridPool {
  realPool: Pool
  mockPool: MockPool

  constructor(realPool: Pool) {
    this.realPool = realPool
    this.mockPool = new MockPool()
  }

  private async ensureRuntimeSchema() {
    if (!schemaSyncPromise) {
      schemaSyncPromise = (async () => {
        const statements = [
          // Users table
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS carbon_credits INTEGER DEFAULT 0`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_url TEXT`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`,
          
          // Corridors table
          `ALTER TABLE corridors ADD COLUMN IF NOT EXISTS description TEXT`,
          `ALTER TABLE corridors ADD COLUMN IF NOT EXISTS image_url TEXT`,
          
          // Vehicles table
          `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS color TEXT`,
          `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT`,
          `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS total_seats INTEGER DEFAULT 4`,
          `ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS default_available_seats INTEGER DEFAULT 3`,
        ]
        for (const statement of statements) {
          try {
            await this.realPool.query(statement)
          } catch (err: any) {
            // Log but don't crash the whole promise if one ALTER fails (e.g. if table doesn't exist yet)
            console.error(`Schema Sync - Failed statement: ${statement} - Error: ${err.message}`)
          }
        }
      })().catch((error: any) => {
        console.error('Fatal Runtime schema sync error:', error?.message || error)
      })
    }
    await schemaSyncPromise
  }

  async query(text: string, params?: any[]): Promise<any> {
    await this.ensureRuntimeSchema()
    try {
      return await this.realPool.query(text, params)
    } catch (e: any) {
      console.error('CRITICAL DB ERROR IN HYBRID POOL:', e.message)
      if (isIdentityCriticalQuery(text)) {
        console.error('Identity-critical query failed. Refusing mock fallback.')
        throw e
      }
      console.warn('Falling back to mock database response to keep UI alive.')
      return this.mockPool.query(text, params)
    }
  }

  async end() {
    return this.realPool.end()
  }
}

export function getPool() {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    console.error('DATABASE_URL is not set. Falling back to mock database to prevent 500 errors.');
    return new MockPool();
  }
  const url = normalizeConnectionString(raw)
  if (!globalForDb.pool) {
    const p = new Pool({
      connectionString: url,
      ssl: url.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    })
    globalForDb.pool = p
  }
  return new HybridPool(globalForDb.pool)
}
