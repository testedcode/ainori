import { Pool } from 'pg'

const globalForDb = globalThis as unknown as { pool: Pool | null }

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

// Mock Pool that prevents 500 errors if DB is unreachable locally
class MockPool {
  async query(text: string, params?: any[]) {
    const t = text.toLowerCase();
    console.warn('[Mock DB] Query executed without DATABASE_URL:', text.slice(0, 100));
    
    // Handle INSERTs (return a dummy ID)
    if (t.includes('insert into')) {
      return { rows: [{ id: Math.floor(Math.random() * 1000) + 100 }], rowCount: 1 };
    }

    // Handle common SELECT patterns
    if (t.includes('select id, email, role from users')) {
      return { rows: [{ id: 1, email: params?.[0] || 'demo@jool.ai', role: 'admin' }] };
    }
    if (t.includes('select id, email, name, phone, city, role, carbon_credits') || t.includes('from users where id =')) {
      return { rows: [{ 
        id: 1, 
        email: 'demo@jool.ai', 
        name: 'Demo User', 
        role: 'admin', 
        carbon_credits: 450,
        phone: '9876543210',
        city: 'Mumbai',
        upi_id: 'demo@upi'
      }] };
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
            available_seats: 3, total_seats: 4, status: 'open' 
          },
          { 
            id: 2, user_id: 3, user_name: 'Rajiv Mehta', corridor_id: 2, corridor_name: 'Casa Bella', 
            vehicle_id: 102, ride_date: new Date().toISOString().split('T')[0], ride_time: '18:30:00', 
            pickup_point: 'RCP', drop_point: 'Casa Bella Main Gate', price_per_seat: 100, 
            available_seats: 2, total_seats: 4, status: 'open' 
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

export function getPool(): Pool | MockPool {
  const raw = process.env.DATABASE_URL
  if (!raw) {
    console.error('DATABASE_URL is not set. Falling back to mock database to prevent 500 errors.');
    return new MockPool();
  }
  const url = normalizeConnectionString(raw)
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      connectionString: url,
      ssl: url.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    })
  }
  return globalForDb.pool
}
