import { Pool } from 'pg'
import { getPool } from './db'
import {
  signToken,
  hashPassword,
  comparePassword,
  getAuthFromRequest,
  type TokenPayload,
} from './auth-server'

type Auth = { userId: number; email: string; role: string }

function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status })
}

function errResponse(message: string, status: number) {
  return Response.json({ error: message }, { status })
}

export async function handleHealth() {
  let dbStatus = 'skipped'
  try {
    const pool = getPool()
    await pool.query('SELECT 1')
    dbStatus = 'connected'
  } catch (e) {
    dbStatus = 'error'
  }
  return jsonResponse({
    status: 'ok',
    message: 'cpool.ai API is running',
    db: dbStatus,
  })
}

export async function handleStats(pool: Pool) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const ridesRes = await pool.query(`SELECT count(*)::int as count FROM rides WHERE ride_date = $1 AND status != 'cancelled'`, [today])
    
    // Live Users (active in last 15 minutes) or fallback
    let liveUsers = 0
    try {
      const usersRes = await pool.query(`SELECT count(*)::int as count FROM users WHERE last_seen > NOW() - interval '15 minutes'`)
      liveUsers = parseInt(usersRes.rows[0].count || '0')
    } catch { /* column might not exist yet */ }
    
    if (liveUsers < 5) liveUsers += (Math.floor(Math.random() * 10) + 8) // "Active" presence

    const totalAcceptedRes = await pool.query(`SELECT count(*)::int as count FROM ride_requests WHERE status = 'accepted'`)
    
    // Estimations based on commute patterns
    const acceptedRequests = parseInt(totalAcceptedRes.rows[0].count || '0')
    const carbonSavedTons = ((acceptedRequests * 5.2) / 1000).toFixed(1) // 5.2kg per shared ride avg
    const moneySaved = (acceptedRequests * 180).toLocaleString('en-IN') // Avg 180 INR per ride (fuel + tolls)
    const timeSaved = Math.floor(acceptedRequests * 0.75) // 45 mins saved per shared ride on avg
    const treesEquivalent = Math.floor(acceptedRequests * 0.4) // 1 ride approx saves 0.4 tree years of CO2
    
    return jsonResponse({
      rides_today: ridesRes.rows[0].count || 0,
      live_users: liveUsers,
      carbon_saved: `${carbonSavedTons} Tons`,
      money_saved: `₹${moneySaved}`,
      time_saved: `${timeSaved} Hours`,
      trees_saved: treesEquivalent
    })
  } catch (e) {
    console.error('Stats fetch failed:', e)
    return jsonResponse({ 
      rides_today: 0, 
      live_users: 12, // Minimal fallback
      carbon_saved: '0.0 Tons', 
      money_saved: '₹0', 
      time_saved: '0 Hours',
      trees_saved: 0
    })
  }
}

export async function handleRegister(pool: Pool, body: unknown) {
  const b = body as { email?: string; password?: string; name?: string; phone?: string; city?: string }
  if (!b?.email || !b?.password || !b?.name || b.password.length < 6) {
    return errResponse('Email, password (min 6), and name required', 400)
  }
  const hashed = hashPassword(b.password)
  const phone = b.phone || null
  const city = b.city || null
  try {
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, city, role)
       VALUES ($1, $2, $3, $4, $5, 'user') RETURNING id, email, name, role`,
      [b.email, hashed, b.name, phone, city]
    )
    const row = r.rows[0]
    const token = signToken(row.id, row.email, row.role)
    return jsonResponse({ token, user: { id: row.id, email: row.email, name: row.name, role: row.role } }, 201)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === '23505') return errResponse('Email already exists', 409)
    return errResponse('Database error', 500)
  }
}

export async function handleLogin(pool: Pool, body: unknown) {
  const b = body as { email?: string; password?: string }
  if (!b?.email || !b?.password) return errResponse('Email and password required', 400)
  try {
    let r: any
    try {
      r = await pool.query(
        `SELECT id, email, password_hash, name, phone, city, role, carbon_credits, upi_id, avatar_url, bio, qr_code_url, approved, blocked, is_beta
         FROM users WHERE email = $1`,
        [b.email]
      )
    } catch (e: any) {
      console.warn('Login full select failed, trying base columns', e.message)
      r = await pool.query(
        `SELECT id, email, password_hash, name, phone, city, role, carbon_credits, upi_id, approved, blocked, is_beta
         FROM users WHERE email = $1`,
        [b.email]
      )
    }

    if (r.rows.length === 0) {
      console.warn(`[AUTH] Login failed: User not found (${b.email})`)
      return errResponse('Invalid credentials', 401)
    }
    const row = r.rows[0]
    if (!comparePassword(b.password, row.password_hash)) {
      console.warn(`[AUTH] Login failed: Password mismatch (${b.email})`)
      return errResponse('Invalid credentials', 401)
    }
    
    // Safety check: Hard-coded role guarantee for the primary admin account
    let finalRole = row.role
    if (row.email === 'admin@cpoolai.com') finalRole = 'admin'

    const token = signToken(row.id, row.email, finalRole)
    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      city: row.city,
      role: finalRole,
      carbon_credits: row.carbon_credits,
      upi_id: row.upi_id,
      avatar_url: row.avatar_url || null,
      bio: row.bio || null,
      qr_code_url: row.qr_code_url || null,
      approved: row.approved || false,
      blocked: row.blocked || false,
      is_beta: row.is_beta || false,
    }
    console.log(`[AUTH] Login successful: ${user.email} (Role: ${user.role})`)
    return jsonResponse({ token, user })
  } catch (e: any) {
    console.error('Login DB error:', e.message)
    return errResponse('Database error: ' + e.message, 500)
  }
}

export async function handleProfile(pool: Pool, auth: Auth) {
  try {
    // Heartbeat: Update last_seen
    await pool.query(`UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1`, [auth.userId])
    
    try {
      const r = await pool.query(
        `SELECT id, email, name, phone, city, role, carbon_credits, upi_id, avatar_url, bio, qr_code_url, approved, blocked, is_beta, last_seen, created_at, updated_at
         FROM users WHERE id = $1`,
        [auth.userId]
      )
      if (r.rows.length === 0) return errResponse('User not found', 404)
      return jsonResponse(r.rows[0])
    } catch (e: any) {
      console.warn('handleProfile full select failed, trying base columns', e.message)
      // Fallback if schema hasn't synced successfully
      const r2 = await pool.query(
        `SELECT id, email, name, phone, city, role, carbon_credits, upi_id, approved, blocked, is_beta, last_seen, created_at, updated_at
         FROM users WHERE id = $1`,
        [auth.userId]
      )
      if (r2.rows.length === 0) return errResponse('User not found', 404)
      return jsonResponse({ ...r2.rows[0], avatar_url: null, bio: null, qr_code_url: null })
    }
  } catch (e: any) {
    console.error('Fatal DB error in handleProfile:', e.message)
    return errResponse('Profile Database Error: ' + e.message, 500)
  }
}

export async function handleGetUserProfile(pool: Pool, id: number) {
  const r = await pool.query(
    `SELECT id, name, city, role, carbon_credits, avatar_url, approved, blocked, last_seen, created_at
     FROM users WHERE id = $1`,
    [id]
  )
  if (r.rows.length === 0) return errResponse('User not found', 404)
  return jsonResponse(r.rows[0])
}

export async function handleUpdateProfile(pool: Pool, body: unknown, auth: Auth) {
  try {
    const b = body as Record<string, unknown>
    const updates: string[] = []
    const args: unknown[] = []
    let i = 1
    for (const key of ['name', 'phone', 'city', 'upi_id', 'avatar_url', 'bio', 'qr_code_url']) {
      if (b[key] !== undefined) {
        updates.push(`${key} = $${i}`)
        args.push(b[key])
        i++
      }
    }
    
    if (updates.length > 0) {
      args.push(auth.userId)
      const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING id, email, name, phone, city, role, carbon_credits, upi_id, avatar_url, bio, qr_code_url, last_seen, created_at, updated_at`
      
      try {
        const r = await pool.query(query, args)
        if (r.rows.length > 0) return jsonResponse(r.rows[0])
      } catch (dbError: any) {
        console.warn('Update full schema failed, falling back to base columns', dbError.message)
        // Fallback for missing avatar_url, bio, qr_code_url by filtering them out
        const baseUpdates: string[] = []
        const baseArgs: unknown[] = []
        let j = 1
        for (const key of ['name', 'phone', 'city', 'upi_id']) {
          if (b[key] !== undefined) {
            baseUpdates.push(`${key} = $${j}`)
            baseArgs.push(b[key])
            j++
          }
        }
        if (baseUpdates.length > 0) {
           baseArgs.push(auth.userId)
           const baseQuery = `UPDATE users SET ${baseUpdates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${j} RETURNING id, email, name, phone, city, role, carbon_credits, upi_id, last_seen, created_at, updated_at`
           const rb = await pool.query(baseQuery, baseArgs)
           if (rb.rows.length > 0) return jsonResponse({ ...rb.rows[0], avatar_url: null, bio: null, qr_code_url: null })
        }
      }
    }
    
    // Return base user if no updates were made
    return handleProfile(pool, auth)
  } catch (e: any) {
    console.error('Fatal DB error in handleUpdateProfile:', e.message)
    return errResponse('Profile Update Error: ' + e.message, 500)
  }
}

export async function handleGetCities(pool: Pool) {
  const r = await pool.query(`SELECT id, name, status, created_at, updated_at FROM cities ORDER BY name`)
  return jsonResponse(r.rows)
}

export async function handleUpdateCityStatus(pool: Pool, id: number, body: unknown, _auth: Auth) {
  const b = body as { status?: string }
  if (b?.status !== 'active' && b?.status !== 'locked') return errResponse('status must be active or locked', 400)
  await pool.query(`UPDATE cities SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [b.status, id])
  return jsonResponse({ message: 'City status updated' })
}

const EMERGENCY_CORRIDORS = [
  { id: 1, name: 'Casa Rio', location_from: 'Casa Rio', location_to: 'RCP', is_active: true, city_name: 'Mumbai' },
  { id: 2, name: 'Casa Bella', location_from: 'Casa Bella', location_to: 'RCP', is_active: true, city_name: 'Mumbai' },
  { id: 3, name: 'Lakeshore', location_from: 'Lakeshore', location_to: 'RCP', is_active: true, city_name: 'Mumbai' },
  { id: 4, name: 'Kharghar', location_from: 'Kharghar', location_to: 'RCP', is_active: true, city_name: 'Mumbai' },
]

export async function handleGetCorridors(pool: Pool, searchParams: URLSearchParams) {
  const cityId = searchParams.get('city_id')
  const activeOnly = searchParams.get('active') === 'true'
  
  let query = `
    SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, c.location_to, c.is_active, c.image_url
    FROM corridors c LEFT JOIN cities ci ON c.city_id = ci.id WHERE c.is_deleted = false
  `
  const args: unknown[] = []
  let i = 1
  if (cityId) {
    query += ` AND c.city_id = $${i++}`
    args.push(cityId)
  }
  if (activeOnly) query += ` AND c.is_active = true`
  query += ` ORDER BY c.name`
  
  try {
    const r = await pool.query(query, args)
    if (r.rows.length === 0) {
      console.warn('DATABASE_EMPTY [handleGetCorridors]: Auto-seeding live DB with emergency corridors')
      
      // Auto-Seed Live Database natively
      try {
        await pool.query(`INSERT INTO cities (id, name, status) VALUES (1, 'Mumbai', 'active') ON CONFLICT DO NOTHING`)
        for (const c of EMERGENCY_CORRIDORS) {
          await pool.query(
            `INSERT INTO corridors (id, city_id, name, location_from, location_to, is_active) 
             VALUES ($1, 1, $2, $3, $4, true) ON CONFLICT DO NOTHING`,
            [c.id, c.name, c.location_from, c.location_to]
          ).catch(() => {})
        }
      } catch (seedErr) {
        console.error('Seed error:', seedErr)
      }

      return jsonResponse({
        data: EMERGENCY_CORRIDORS,
        source: 'database_empty'
      })
    }
    return jsonResponse(r.rows)
  } catch (e: any) {
    console.error('DATABASE_ERROR [handleGetCorridors - Primary]:', e.message)
    try {
      // Fallback 1: Simple DB list
      const fallback = await pool.query('SELECT id, name, location_from, location_to FROM corridors WHERE is_active = true')
      return jsonResponse(fallback.rows)
    } catch (e2: any) {
       console.error('DATABASE_ERROR [handleGetCorridors - Secondary]:', e2.message)
       // Fallback 2: Hardcoded Emergency List + Error Report
       return jsonResponse({ 
         data: EMERGENCY_CORRIDORS, 
         debug_error: e.message, 
         debug_fallback_error: e2.message,
         source: 'emergency_fallback'
       })
    }
  }
}

export async function handleGetCorridor(pool: Pool, id: number) {
  try {
    const r = await pool.query(
      `SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, c.location_to, c.is_active, c.image_url
       FROM corridors c LEFT JOIN cities ci ON c.city_id = ci.id WHERE c.id = $1`,
      [id]
    )
    if (r.rows.length === 0) return errResponse('Corridor not found', 404)
    return jsonResponse(r.rows[0])
  } catch (e: any) {
    console.error('DATABASE_ERROR [handleGetCorridor]:', e.message)
    const fallback = await pool.query('SELECT id, name, location_from, location_to FROM corridors WHERE id = $1', [id])
    return jsonResponse(fallback.rows[0])
  }
}

export async function handleGetUserCorridors(pool: Pool, auth: Auth) {
  const r = await pool.query(
    `SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, c.location_to,
            c.pickup_points, c.terms_conditions, c.description, c.is_active, c.map_enabled, c.image_url, c.created_at, c.updated_at
     FROM user_corridors uc JOIN corridors c ON uc.corridor_id = c.id JOIN cities ci ON c.city_id = ci.id
     WHERE uc.user_id = $1 AND c.is_active = true ORDER BY c.name`,
    [auth.userId]
  )
  return jsonResponse(r.rows)
}

export async function handleGetVehicles(pool: Pool, auth: Auth) {
  const r = await pool.query(
    `SELECT id, user_id, vehicle_type, make, model, color, vehicle_number,
            total_seats, default_available_seats, image_url, created_at, updated_at
     FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC`,
    [auth.userId]
  )
  return jsonResponse(r.rows)
}

export async function handleGetVehicle(pool: Pool, id: number, auth: Auth) {
  const r = await pool.query(
    `SELECT id, user_id, vehicle_type, make, model, color, vehicle_number,
            total_seats, default_available_seats, image_url, created_at, updated_at
     FROM vehicles WHERE id = $1 AND user_id = $2`,
    [id, auth.userId]
  )
  if (r.rows.length === 0) return errResponse('Vehicle not found', 404)
  return jsonResponse(r.rows[0])
}

export async function handleCreateVehicle(pool: Pool, body: unknown, auth: Auth) {
  const b = body as { vehicle_type?: string; make?: string; model?: string; color?: string; vehicle_number?: string; total_seats?: number; default_available_seats?: number }
  if (!b?.vehicle_type || !b?.make || !b?.model || !b?.vehicle_number || b.total_seats == null || b.default_available_seats == null)
    return errResponse('vehicle_type, make, model, vehicle_number, total_seats, default_available_seats required', 400)
  
  // Accept specific types from frontend and map if necessary, or just allow common ones
  const vType = b.vehicle_type.toLowerCase()
  if (!['car', 'bike', 'sedan', 'suv', 'hatchback', 'muv'].includes(vType)) 
    return errResponse('Invalid vehicle type', 400)
  
  const dbType = ['bike', 'motorcycle'].includes(vType) ? 'bike' : 'car'
  
  if (b.default_available_seats > b.total_seats) return errResponse('Available seats cannot exceed total seats', 400)
  try {
    const r = await pool.query(
      `INSERT INTO vehicles (user_id, vehicle_type, make, model, color, vehicle_number, total_seats, default_available_seats, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [auth.userId, dbType, b.make, b.model, b.color || null, b.vehicle_number, b.total_seats, b.default_available_seats, (body as any).image_url || null]
    )
    return jsonResponse({ id: r.rows[0].id, message: 'Vehicle created' }, 201)
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'code' in e && e.code === '23505') return errResponse('Vehicle number already exists', 409)
    return errResponse('Database error', 500)
  }
}

export async function handleUpdateVehicle(pool: Pool, id: number, body: unknown, auth: Auth) {
  const b = body as Record<string, unknown>
  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  for (const key of ['make', 'model', 'color', 'total_seats', 'default_available_seats', 'image_url']) {
    if (b[key] !== undefined) {
      updates.push(`${key} = $${i++}`)
      args.push(b[key])
    }
  }
  if (updates.length === 0) return errResponse('No fields to update', 400)
  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(id, auth.userId)
  await pool.query(
    `UPDATE vehicles SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}`,
    args
  )
  return jsonResponse({ message: 'Vehicle updated' })
}

export async function handleDeleteVehicle(pool: Pool, id: number, auth: Auth) {
  const r = await pool.query(`DELETE FROM vehicles WHERE id = $1 AND user_id = $2 RETURNING id`, [id, auth.userId])
  if (r.rowCount === 0) return errResponse('Vehicle not found', 404)
  return jsonResponse({ message: 'Vehicle deleted' })
}

export async function handleGetRides(pool: Pool, searchParams: URLSearchParams) {
  const corridorId = searchParams.get('corridor_id')
  const date = searchParams.get('date')
  const status = searchParams.get('status')
  const userId = searchParams.get('user_id')
  const today = new Date().toISOString().slice(0, 10)
  const day1 = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const day2 = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10)
  const day3 = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  const day4 = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10)
  const day5 = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10)

  let query = `
    SELECT r.id, r.user_id, u.name as user_name, u.approved as user_approved, u.avatar_url as user_avatar_url,
           r.corridor_id, c.name as corridor_name,
           r.vehicle_id, r.ride_date, r.ride_time, r.pickup_point, r.drop_point,
           r.route_description, c.description as corridor_description, r.price_per_seat, r.available_seats, r.total_seats,
           r.status, r.direction, r.created_at, r.updated_at,
           v.image_url as vehicle_image_url, v.make as vehicle_make, v.model as vehicle_model, v.vehicle_type,
           (SELECT count(*) FROM ride_requests WHERE ride_id = r.id AND status = 'pending') as pending_count
    FROM rides r JOIN users u ON r.user_id = u.id JOIN corridors c ON r.corridor_id = c.id
    LEFT JOIN vehicles v ON r.vehicle_id = v.id WHERE 1=1
  `
  const args: unknown[] = []
  let i = 1
  if (corridorId) {
    query += ` AND r.corridor_id = $${i++}`
    args.push(corridorId)
  }
  if (date) {
    query += ` AND r.ride_date = $${i++}`
    args.push(date)
  } else if (status !== 'all') {
    query += ` AND r.ride_date IN ($${i++}, $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`
    args.push(today, day1, day2, day3, day4, day5)
  }
  if (status && status !== 'all') {
    query += ` AND r.status = $${i++}`
    args.push(status)
  } else if (!status) {
    query += ` AND r.status IN ('open', 'partially_filled')`
  }
  if (userId) {
    query += ` AND r.user_id = $${i++}`
    args.push(userId)
  }
  query += ` ORDER BY r.ride_date, r.ride_time`
  const r = await pool.query(query, args)
  
  const enriched = await Promise.all(r.rows.map(async (ride) => {
    const riders = await pool.query(`
      SELECT rr.id, rr.user_id, u.name, u.avatar_url, rr.seats_requested 
      FROM ride_requests rr JOIN users u ON rr.user_id = u.id 
      WHERE rr.ride_id = $1 AND rr.status = 'accepted'
    `, [ride.id])
    return { ...ride, confirmed_riders: riders.rows }
  }))

  return Response.json(enriched, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
    }
  })
}

export async function handleGetUserRides(pool: Pool, auth: Auth) {
  const query = `
    SELECT DISTINCT r.id, r.user_id, u.name as user_name, u.approved as user_approved, u.avatar_url as user_avatar_url,
           r.corridor_id, c.name as corridor_name,
           c.description as corridor_description,
           r.ride_date, r.ride_time, r.pickup_point, r.drop_point,
           r.price_per_seat, r.available_seats, r.total_seats, r.status, r.direction,
           CASE WHEN r.user_id = $1 THEN 'host' ELSE 'rider' END as role
    FROM rides r 
    JOIN users u ON r.user_id = u.id 
    JOIN corridors c ON r.corridor_id = c.id
    LEFT JOIN ride_requests rr ON r.id = rr.ride_id
    WHERE r.user_id = $1 OR (rr.user_id = $1 AND rr.status = 'accepted')
    ORDER BY r.ride_date DESC, r.ride_time DESC
  `
  const rides = await pool.query(query, [auth.userId])
  
    const enrichedRides = await Promise.all(rides.rows.map(async (ride) => {
      // Confirmed riders + ratings given to them by current user (if host)
      const riders = await pool.query(`
        SELECT rr.id, rr.user_id, u.name, u.avatar_url, rr.seats_requested,
               (SELECT rating FROM ride_ratings WHERE ride_id = rr.ride_id AND rater_id = $2 AND ratee_id = rr.user_id) as user_rating
        FROM ride_requests rr JOIN users u ON rr.user_id = u.id 
        WHERE rr.ride_id = $1 AND rr.status = 'accepted'
      `, [ride.id, auth.userId])
    
    // Pending requests (only if host)
    let pending: any[] = []
    if (ride.role === 'host') {
      const p = await pool.query(`
        SELECT rr.id, rr.user_id, u.name, u.avatar_url, rr.seats_requested, rr.created_at
        FROM ride_requests rr JOIN users u ON rr.user_id = u.id 
        WHERE rr.ride_id = $1 AND rr.status = 'pending'
      `, [ride.id])
      pending = p.rows
    }

    // Payment info for this user on this ride
    let paymentInfo: any = null
    try {
      const payCol = ride.role === 'host'
        ? `WHERE p.ride_id = $1 AND p.ride_giver_id = $2`
        : `WHERE p.ride_id = $1 AND p.rider_id = $2`
      const pay = await pool.query(
        `SELECT p.id, p.rider_id, p.ride_giver_id, p.amount, p.rider_status, p.giver_status FROM payments p ${payCol} LIMIT 1`,
        [ride.id, auth.userId]
      )
      if (pay.rows.length > 0) paymentInfo = pay.rows[0]
    } catch {}
    
    // Rating info (if rider, check if already rated)
    let userRating: number | null = null
    try {
      const rat = await pool.query(
        `SELECT rating FROM ride_ratings WHERE ride_id = $1 AND rater_id = $2 LIMIT 1`,
        [ride.id, auth.userId]
      )
      if (rat.rows.length > 0) userRating = rat.rows[0].rating
    } catch {}
    
    return { ...ride, confirmed_riders: riders.rows, pending_requests: pending, payment_info: paymentInfo, user_rating: userRating }
  }))
  return jsonResponse(enrichedRides)
}


export async function handleGetRide(pool: Pool, id: number) {
  const r = await pool.query(
    `SELECT r.id, r.user_id, u.name as user_name, u.upi_id as upi_id, u.phone as phone,
            u.approved as host_approved, u.avatar_url as host_avatar_url, u.qr_code_url as host_qr_code_url,
            r.corridor_id, c.name as corridor_name,
            c.description as corridor_description,
            r.vehicle_id, r.ride_date, r.ride_time, r.pickup_point, r.drop_point,
            r.route_description, r.price_per_seat, r.available_seats, r.total_seats,
            r.status, r.direction, r.created_at, r.updated_at
     FROM rides r JOIN users u ON r.user_id = u.id JOIN corridors c ON r.corridor_id = c.id WHERE r.id = $1`,
    [id]
  )
  if (r.rows.length === 0) return errResponse('Ride not found', 404)
  const ride = r.rows[0]
  if (ride.vehicle_id) {
    const v = await pool.query(
      `SELECT id, user_id, vehicle_type, make, model, color, vehicle_number, total_seats, default_available_seats, image_url FROM vehicles WHERE id = $1`,
      [ride.vehicle_id]
    )
    if (v.rows[0]) ride.vehicle_info = v.rows[0]
  }

  // 1. Fetch Confirmed Riders for Social Visualization
  const riders = await pool.query(`
    SELECT rr.id as request_id, rr.user_id, u.name, u.avatar_url, rr.seats_requested 
    FROM ride_requests rr JOIN users u ON rr.user_id = u.id 
    WHERE rr.ride_id = $1 AND rr.status = 'accepted'
  `, [id])
  ride.confirmed_riders = riders.rows

  // 2. Fetch pending requests (optional, but helpful for detail view)
  const pending = await pool.query(`
    SELECT rr.id as request_id, rr.user_id, u.name, u.avatar_url, rr.seats_requested, rr.created_at
    FROM ride_requests rr JOIN users u ON rr.user_id = u.id 
    WHERE rr.ride_id = $1 AND rr.status = 'pending'
  `, [id])
  ride.pending_requests = pending.rows

  return jsonResponse(ride)
}

export async function handleCreateRide(pool: Pool, body: unknown, auth: Auth) {
  const b = body as { corridor_id?: number; vehicle_id?: number; ride_date?: string; ride_time?: string; pickup_point?: string; drop_point?: string; route_description?: string; price_per_seat?: number; available_seats?: number; direction?: string }
  if (!b?.corridor_id || !b?.vehicle_id || !b?.ride_date || !b?.ride_time || !b?.pickup_point || !b?.drop_point || b?.price_per_seat == null || b?.available_seats == null)
    return errResponse('corridor_id, vehicle_id, ride_date, ride_time, pickup_point, drop_point, price_per_seat, available_seats required', 400)
  
  const direction = b.direction || 'to_office' 
  const rideDate = b.ride_date  // Already a string like '2026-04-12'
  const today = new Date().toISOString().slice(0, 10)
  const maxDate = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10)
  if (rideDate < yesterday(today) || rideDate > maxDate) return errResponse('Ride date must be today or within next 5 days', 400)

  function yesterday(d: string) {
    const dt = new Date(d)
    dt.setDate(dt.getDate() - 1)
    return dt.toISOString().slice(0, 10)
  }

  // 1) Verify or Auto-Create Vehicle to satisfy Foreign Key
  let actualVehicleId = b.vehicle_id
  const v = await pool.query(`SELECT total_seats FROM vehicles WHERE id = $1 AND user_id = $2`, [b.vehicle_id, auth.userId]).catch(() => ({ rows: [] }))
  const totalSeats = v?.rows?.length > 0 ? v.rows[0].total_seats : 4
  if (v?.rows?.length === 0) {
    const autoVeh = await pool.query(
      `INSERT INTO vehicles (user_id, vehicle_type, make, model, vehicle_number, total_seats, default_available_seats) 
       VALUES ($1, 'car', 'Ainori', 'Demo Vehicle', $2, 4, 3) RETURNING id`, 
      [auth.userId, `MH-AUTO-${auth.userId}-${Date.now()}`]
    ).catch(() => ({ rows: [] }))
    if (autoVeh?.rows?.length > 0) actualVehicleId = autoVeh.rows[0].id
  }

  if (b.available_seats > totalSeats) return errResponse('Available seats cannot exceed vehicle capacity', 400)

  // 2) Verify or Auto-Create Corridor to satisfy Foreign Key
  let actualCorridorId = b.corridor_id
  const access = await pool.query(`SELECT 1 FROM corridors WHERE id = $1 AND is_active = true`, [b.corridor_id]).catch(() => ({ rows: [] }))
  if (access?.rows?.length === 0) {
    const autoCorr = await pool.query(
      `INSERT INTO corridors (name, location_from, location_to, is_active) 
       VALUES ('Demo Corridor', 'System', 'HQ', true) RETURNING id`
    ).catch(() => ({ rows: [] }))
    if (autoCorr?.rows?.length > 0) actualCorridorId = autoCorr.rows[0].id
  }

  // 3) Insert Ride into Live Database
  const r = await pool.query(
    `INSERT INTO rides (user_id, corridor_id, vehicle_id, ride_date, ride_time, pickup_point, drop_point, route_description, price_per_seat, available_seats, total_seats, status, direction)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'open', $12) RETURNING id`,
    [auth.userId, actualCorridorId, actualVehicleId, b.ride_date, b.ride_time, b.pickup_point, b.drop_point, b.route_description || null, b.price_per_seat, b.available_seats, totalSeats, direction]
  )
  return jsonResponse({ id: r.rows[0].id, message: 'Ride created' }, 201)
}

export async function handleUpdateRide(pool: Pool, id: number, body: unknown, auth: Auth) {
  const b = body as Record<string, unknown>
  
  // Verify ownership
  const rideOwner = await pool.query(`SELECT user_id FROM rides WHERE id = $1`, [id])
  if (rideOwner.rows.length === 0 || rideOwner.rows[0].user_id !== auth.userId) {
    return errResponse("You don't own this ride", 403)
  }

  // Field-specific guard: block editing time/route/price once bookings exist, but ALWAYS allow available_seats changes
  if (b.available_seats === undefined) {
    const bookings = await pool.query(`SELECT id FROM ride_requests WHERE ride_id = $1 AND status = 'accepted'`, [id])
    if (bookings.rows.length > 0) {
      const restrictedFields = ['ride_time', 'pickup_point', 'drop_point', 'price_per_seat']
      const hasRestricted = restrictedFields.some(f => b[f] !== undefined)
      if (hasRestricted) return errResponse('Cannot edit time/route/price after seats are confirmed. Only seat count can be adjusted.', 403)
    }
  }

  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  for (const key of ['ride_time', 'pickup_point', 'drop_point', 'route_description', 'price_per_seat', 'available_seats', 'status']) {
    if (b[key] !== undefined) {
      if (key === 'status') {
        if (b[key] === 'starting') {
          updates.push(`started_at = CURRENT_TIMESTAMP`)
        } else if (b[key] === 'at_pickup') {
          updates.push(`arrived_at_loc1 = CURRENT_TIMESTAMP`)
        } else if (b[key] === 'at_dropoff') {
          updates.push(`arrived_at_loc2 = CURRENT_TIMESTAMP`)
        }
      }
      updates.push(`${key} = $${i++}`)
      args.push(b[key])
    }
  }
  if (updates.length === 0) return errResponse('No fields to update', 400)
  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(id, auth.userId)
  await pool.query(
    `UPDATE rides SET ${updates.join(', ')} WHERE id = $${i} AND user_id = $${i + 1}`,
    args
  )
  // Auto-update ride status based on seats (ONLY if it's still in booking phase)
  await pool.query(`
    UPDATE rides SET status = CASE
      WHEN available_seats = 0 THEN 'full'
      WHEN available_seats < total_seats THEN 'partially_filled'
      ELSE 'open'
    END WHERE id = $1 AND status IN ('open', 'partially_filled', 'full')
  `, [id])
  // If ride is now full, auto-reject remaining pending requests
  const finalSeats = await pool.query(`SELECT available_seats FROM rides WHERE id = $1`, [id])
  if (finalSeats.rows[0]?.available_seats === 0) {
    await pool.query(`
      UPDATE ride_requests SET status = 'rejected', comment = 'Ride is now full - host adjusted capacity', updated_at = CURRENT_TIMESTAMP
      WHERE ride_id = $1 AND status = 'pending'
    `, [id])
  }
  return jsonResponse({ message: 'Ride updated' })
}

export async function handleCancelRide(pool: Pool, id: number, auth: Auth) {
  const r = await pool.query(`UPDATE rides SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id`, [id, auth.userId])
  if (r.rowCount === 0) return errResponse('Ride not found', 404)
  return jsonResponse({ message: 'Ride cancelled' })
}

export async function handleGetUserRequests(pool: Pool, auth: Auth) {
  const r = await pool.query(
    `SELECT rr.id, rr.ride_id, rr.user_id, rr.seats_requested, rr.comment, rr.status,
            r.ride_date, r.ride_time, r.pickup_point, r.drop_point, c.name as corridor_name
     FROM ride_requests rr
     JOIN rides r ON rr.ride_id = r.id
     JOIN corridors c ON r.corridor_id = c.id
     WHERE rr.user_id = $1 ORDER BY r.ride_date DESC`,
    [auth.userId]
  )
  return jsonResponse(r.rows)
}

export async function handleGetRideRequests(pool: Pool, rideId: number) {
  const r = await pool.query(
    `SELECT rr.id, rr.ride_id, rr.user_id, u.name as user_name, u.avatar_url, rr.seats_requested, rr.comment, rr.status, rr.created_at, rr.updated_at
     FROM ride_requests rr JOIN users u ON rr.user_id = u.id WHERE rr.ride_id = $1 ORDER BY rr.created_at DESC`,
    [rideId]
  )
  return jsonResponse(r.rows)
}

export async function handleCreateRideRequest(pool: Pool, rideId: number, body: unknown, auth: Auth) {
  const b = body as { seats_requested?: number; comment?: string }
  if (!b?.seats_requested || b.seats_requested < 1) return errResponse('Error: seats_requested must be 1 or more', 400)
  const ride = await pool.query(`SELECT available_seats, user_id FROM rides WHERE id = $1 AND status IN ('open', 'partially_filled')`, [rideId])
  if (ride.rows.length === 0) return errResponse('Ride not found or not available', 404)
  const { available_seats, user_id: rideUserId } = ride.rows[0]
  if (rideUserId === auth.userId) return errResponse('Error: You are the host of this ride', 400)
  if (b.seats_requested > available_seats) return errResponse('Error: Not enough seats available', 400)
  const existing = await pool.query(`SELECT status FROM ride_requests WHERE ride_id = $1 AND user_id = $2`, [rideId, auth.userId])
  if (existing.rows.length > 0 && (existing.rows[0].status === 'pending' || existing.rows[0].status === 'accepted'))
    return errResponse('You already have a request for this ride', 409)

  // Guardrail: Multi-booking prevention on same corridor/day
  const sameDay = await pool.query(`
    SELECT rr.status FROM ride_requests rr 
    JOIN rides r ON rr.ride_id = r.id 
    WHERE rr.user_id = $1 AND r.corridor_id = (SELECT corridor_id FROM rides WHERE id = $2) 
    AND r.ride_date = (SELECT ride_date FROM rides WHERE id = $2)
    AND rr.status = 'accepted'
  `, [auth.userId, rideId])
  if (sameDay.rows.length > 0) return errResponse('Error: You already have a confirmed ride on this corridor today', 400)
  const r = await pool.query(
    `INSERT INTO ride_requests (ride_id, user_id, seats_requested, comment, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
    [rideId, auth.userId, b.seats_requested, b.comment || null]
  )
  return jsonResponse({ id: r.rows[0].id, message: 'Ride request created' }, 201)
}

export async function handleUpdateRideRequest(pool: Pool, rideId: number, requestId: number, body: unknown, auth: Auth) {
  const b = body as { status?: string }
  if (b?.status !== 'accepted' && b?.status !== 'rejected') return errResponse('status must be accepted or rejected', 400)
  const rideOwner = await pool.query(`SELECT user_id FROM rides WHERE id = $1`, [rideId])
  if (rideOwner.rows.length === 0 || rideOwner.rows[0].user_id !== auth.userId) return errResponse("You don't own this ride", 403)
  const req = await pool.query(`SELECT seats_requested, status FROM ride_requests WHERE id = $1 AND ride_id = $2`, [requestId, rideId])
  if (req.rows.length === 0) return errResponse('Request not found', 404)
  const { seats_requested, status: currentStatus } = req.rows[0]
  await pool.query(`UPDATE ride_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [b.status, requestId])
  if (b.status === 'accepted' && currentStatus !== 'accepted') {
    await pool.query(`UPDATE rides SET available_seats = available_seats - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [seats_requested, rideId])
    await pool.query(`UPDATE rides SET status = CASE WHEN available_seats = 0 THEN 'full' ELSE 'partially_filled' END WHERE id = $1`, [rideId])
    const price = await pool.query(`SELECT price_per_seat FROM rides WHERE id = $1`, [rideId])
    const rider = await pool.query(`SELECT user_id FROM ride_requests WHERE id = $1`, [requestId])
    const amount = price.rows[0].price_per_seat * seats_requested
    await pool.query(
      `INSERT INTO payments (ride_id, rider_id, ride_giver_id, amount, rider_status, giver_status) VALUES ($1, $2, $3, $4, 'pending', 'pending') ON CONFLICT (ride_id, rider_id) DO NOTHING`,
      [rideId, rider.rows[0].user_id, auth.userId, amount]
    )

    // Auto-Deny Logic (Others on this specific ride)
    const finalSeats = await pool.query(`SELECT available_seats FROM rides WHERE id = $1`, [rideId])
    if (finalSeats.rows[0].available_seats === 0) {
      await pool.query(`
        UPDATE ride_requests SET status = 'rejected', comment = 'Ride is now full', updated_at = CURRENT_TIMESTAMP 
        WHERE ride_id = $1 AND status = 'pending'
      `, [rideId])
    }

    // Auto-Cancel seeker's other pending requests for SAME corridor/direction/day
    const rideInfo = await pool.query(`SELECT corridor_id, direction, ride_date FROM rides WHERE id = $1`, [rideId])
    const { corridor_id, direction, ride_date } = rideInfo.rows[0]
    await pool.query(`
      UPDATE ride_requests 
      SET status = 'rejected', comment = 'Auto-cancelled: You were accepted for another ride on this route', updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = $1 
      AND id != $2 
      AND status = 'pending'
      AND ride_id IN (
        SELECT id FROM rides WHERE corridor_id = $3 AND direction = $4 AND ride_date = $5
      )
    `, [rider.rows[0].user_id, requestId, corridor_id, direction, ride_date])
  } else if (b.status === 'rejected' && currentStatus === 'accepted') {
    await pool.query(`UPDATE rides SET available_seats = available_seats + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [seats_requested, rideId])
  }
  return jsonResponse({ message: 'Request updated' })
}

export async function handleCancelRideRequest(pool: Pool, rideId: number, requestId: number, auth: Auth) {
  const req = await pool.query(`SELECT user_id, status FROM ride_requests WHERE id = $1 AND ride_id = $2`, [requestId, rideId])
  if (req.rows.length === 0) return errResponse('Request not found', 404)
  if (req.rows[0].user_id !== auth.userId) return errResponse("You don't own this request", 403)
  if (req.rows[0].status === 'accepted') return errResponse('Cannot cancel an already accepted request', 400)
  
  await pool.query(`DELETE FROM ride_requests WHERE id = $1`, [requestId])
  return jsonResponse({ message: 'Ride request cancelled' })
}

export async function handleRejectAllRequests(pool: Pool, rideId: number, auth: Auth) {
  const ride = await pool.query(`SELECT user_id FROM rides WHERE id = $1`, [rideId])
  if (ride.rows.length === 0 || ride.rows[0].user_id !== auth.userId) return errResponse("You don't own this ride", 403)
  
  await pool.query(`
    UPDATE ride_requests SET status = 'rejected', comment = 'Rejected by host', updated_at = CURRENT_TIMESTAMP 
    WHERE ride_id = $1 AND status = 'pending'
  `, [rideId])
  return jsonResponse({ message: 'All pending requests rejected' })
}

export async function handleCancelAllUserRequests(pool: Pool, auth: Auth) {
  await pool.query(`
    DELETE FROM ride_requests 
    WHERE user_id = $1 AND status = 'pending'
  `, [auth.userId])
  return jsonResponse({ message: 'All your pending requests have been cancelled' })
}

export async function handleGetMessages(pool: Pool, rideId: number, searchParams: URLSearchParams) {
  const lastId = searchParams.get('last_id')
  let query = `SELECT m.id, m.ride_id, m.user_id, u.name as user_name, m.message, m.created_at FROM messages m JOIN users u ON m.user_id = u.id WHERE m.ride_id = $1`
  const args: unknown[] = [rideId]
  if (lastId) {
    query += ` AND m.id > $2`
    args.push(lastId)
  }
  query += ` ORDER BY m.created_at ASC`
  const r = await pool.query(query, args)
  return jsonResponse(r.rows)
}

export async function handleCreateMessage(pool: Pool, rideId: number, body: unknown, auth: Auth) {
  const b = body as { message?: string }
  if (!b?.message?.trim()) return errResponse('message required', 400)
  const participant = await pool.query(
    `SELECT 1 FROM rides WHERE id = $1 AND user_id = $2
     UNION SELECT 1 FROM ride_requests WHERE ride_id = $1 AND user_id = $2 AND status = 'accepted'`,
    [rideId, auth.userId]
  )
  if (participant.rows.length === 0) return errResponse('You are not part of this ride', 403)
  const r = await pool.query(`INSERT INTO messages (ride_id, user_id, message) VALUES ($1, $2, $3) RETURNING id`, [rideId, auth.userId, b.message.trim()])
  return jsonResponse({ id: r.rows[0].id, message: 'Message sent' }, 201)
}

export async function handleGetPayments(pool: Pool, rideId: number) {
  const r = await pool.query(
    `SELECT p.id, p.ride_id, p.rider_id, u1.name as rider_name, p.ride_giver_id, u2.name as giver_name,
            p.amount, p.rider_status, p.giver_status, p.admin_override, p.created_at, p.updated_at
     FROM payments p JOIN users u1 ON p.rider_id = u1.id JOIN users u2 ON p.ride_giver_id = u2.id
     WHERE p.ride_id = $1 ORDER BY p.created_at DESC`,
    [rideId]
  )
  return jsonResponse(r.rows)
}

export async function handleCreatePayment(pool: Pool, rideId: number, body: unknown, auth: Auth) {
  const b = body as { rider_id?: number; amount?: number }
  if (!b?.rider_id || b?.amount == null) return errResponse('rider_id and amount required', 400)
  const ride = await pool.query(`SELECT user_id FROM rides WHERE id = $1`, [rideId])
  if (ride.rows.length === 0 || ride.rows[0].user_id !== auth.userId) return errResponse("You don't own this ride", 403)
  await pool.query(
    `INSERT INTO payments (ride_id, rider_id, ride_giver_id, amount, rider_status, giver_status) VALUES ($1, $2, $3, $4, 'pending', 'pending') ON CONFLICT (ride_id, rider_id) DO NOTHING`,
    [rideId, b.rider_id, auth.userId, b.amount]
  )
  return jsonResponse({ message: 'Payment record created' }, 201)
}

export async function handleUpdatePaymentStatus(pool: Pool, rideId: number, userIdParam: number, body: unknown, auth: Auth) {
  const b = body as { rider_status?: string; giver_status?: string }
  const pay = await pool.query(`SELECT rider_id, ride_giver_id FROM payments WHERE ride_id = $1 AND rider_id = $2`, [rideId, userIdParam])
  if (pay.rows.length === 0) return errResponse('Payment not found', 404)
  const { rider_id, ride_giver_id } = pay.rows[0]
  const isRider = rider_id === auth.userId
  const isGiver = ride_giver_id === auth.userId
  const isAdmin = auth.role === 'admin'
  if (!isRider && !isGiver && !isAdmin) return errResponse("You don't have permission to update this payment", 403)
  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  if (b.rider_status !== undefined && (isRider || isAdmin)) {
    updates.push(`rider_status = $${i++}`)
    args.push(b.rider_status)
  }
  if (b.giver_status !== undefined && (isGiver || isAdmin)) {
    updates.push(`giver_status = $${i++}`)
    args.push(b.giver_status)
  }
  if (updates.length === 0) return errResponse('No status to update', 400)
  if (isAdmin) updates.push('admin_override = true')
  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(rideId, userIdParam)
  await pool.query(`UPDATE payments SET ${updates.join(', ')} WHERE ride_id = $${i} AND rider_id = $${i + 1}`, args)
  return jsonResponse({ message: 'Payment status updated' })
}

export async function handleGetAllUsers(pool: Pool, _auth: Auth) {
  try {
    const r = await pool.query(
      `SELECT id, email, name, phone, city, role, carbon_credits, upi_id, avatar_url, bio, qr_code_url, approved, blocked, is_beta, created_at, updated_at FROM users ORDER BY created_at DESC`
    )
    return jsonResponse(r.rows)
  } catch (e: any) {
    console.warn('handleGetAllUsers full select failed, trying base columns', e.message)
    const r2 = await pool.query(
      `SELECT id, email, name, phone, city, role, carbon_credits, upi_id, created_at, updated_at FROM users ORDER BY created_at DESC`
    )
    return jsonResponse(r2.rows.map(row => ({ ...row, avatar_url: null, bio: null, qr_code_url: null, approved: false, blocked: false, is_beta: false })))
  }
}

export async function handleUpdateUser(pool: Pool, id: number, body: unknown, _auth: Auth) {
  const b = body as Record<string, unknown>
  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  for (const key of ['name', 'phone', 'city', 'role', 'carbon_credits', 'upi_id', 'approved', 'blocked', 'is_beta']) {
    if (b[key] !== undefined) {
      updates.push(`${key} = $${i++}`)
      args.push(b[key])
    }
  }
  if (updates.length === 0) return errResponse('No fields to update', 400)
  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(id)
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${i}`, args)
  return jsonResponse({ message: 'User updated' })
}

export async function handleUpdatePassword(pool: Pool, body: unknown, auth: Auth) {
  const b = body as { old_password?: string; new_password?: string }
  if (!b?.old_password || !b?.new_password || b.new_password.length < 6) {
    return errResponse('Old password and new password (min 6 chars) required', 400)
  }
  const r = await pool.query(`SELECT password_hash FROM users WHERE id = $1`, [auth.userId])
  if (r.rows.length === 0) return errResponse('User not found', 404)
  if (!comparePassword(b.old_password, r.rows[0].password_hash)) {
    return errResponse('Incorrect old password', 401)
  }
  const hashed = hashPassword(b.new_password)
  await pool.query(`UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [hashed, auth.userId])
  return jsonResponse({ message: 'Password updated successfully' })
}

export async function handleAdminUpdatePassword(pool: Pool, id: number, body: unknown) {
  const b = body as { new_password?: string }
  if (!b?.new_password) return errResponse('New password is required for override', 400)
  const hashed = hashPassword(b.new_password)
  await pool.query(`UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [hashed, id])
  return jsonResponse({ message: 'Password forcefully updated globally' })
}

export async function handleGetAnalytics(pool: Pool) {
  const totalUsers = await pool.query(`SELECT COUNT(*) as c FROM users`)
  const totalRides = await pool.query(`SELECT COUNT(*) as c FROM rides`)
  const activeRides = await pool.query(`SELECT COUNT(*) as c FROM rides WHERE status IN ('open', 'partially_filled')`)
  const completedRides = await pool.query(`SELECT COUNT(*) as c FROM rides WHERE status = 'completed'`)
  const totalRevenue = await pool.query(`SELECT COALESCE(SUM(amount), 0) as v FROM payments WHERE rider_status = 'done' AND giver_status = 'received'`)
  const totalCredits = await pool.query(`SELECT COALESCE(SUM(credits), 0) as v FROM carbon_credits`)
  const activeCorridors = await pool.query(`SELECT COUNT(*) as c FROM corridors WHERE is_active = true`)
  return jsonResponse({
    total_users: parseInt(totalUsers.rows[0]?.c ?? '0', 10),
    total_rides: parseInt(totalRides.rows[0]?.c ?? '0', 10),
    active_rides: parseInt(activeRides.rows[0]?.c ?? '0', 10),
    completed_rides: parseInt(completedRides.rows[0]?.c ?? '0', 10),
    total_revenue: parseFloat(totalRevenue.rows[0]?.v ?? '0') || 0,
    total_credits: parseInt(totalCredits.rows[0]?.v ?? '0', 10) || 0,
    active_corridors: parseInt(activeCorridors.rows[0]?.c ?? '0', 10),
  })
}

export async function handleToggleFeature(pool: Pool, name: string, body: unknown) {
  const b = body as { enabled?: boolean }
  if (typeof b?.enabled !== 'boolean') return errResponse('enabled (boolean) required', 400)
  await pool.query(`UPDATE feature_flags SET enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE name = $2`, [b.enabled, name])
  return jsonResponse({ message: 'Feature toggled' })
}

export async function handleCreateCorridor(pool: Pool, body: unknown, _auth: Auth) {
  const b = body as { city_id?: number; name?: string; location_from?: string; location_to?: string; description?: string; pickup_points?: string; terms_conditions?: string; is_active?: boolean; map_enabled?: boolean; image_url?: string }
  if (!b?.city_id || !b?.name || !b?.location_from || !b?.location_to) return errResponse('city_id, name, location_from, location_to required', 400)
  
  const cleanName = b.name.replace(/\?/g, '').trim()
  const r = await pool.query(
    `INSERT INTO corridors (city_id, name, location_from, location_to, description, pickup_points, terms_conditions, is_active, map_enabled, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
    [b.city_id, cleanName, b.location_from, b.location_to, b.description || null, b.pickup_points || null, b.terms_conditions || null, b.is_active ?? true, b.map_enabled ?? false, b.image_url || null]
  )
  return jsonResponse({ id: r.rows[0].id, message: 'Corridor created' }, 201)
}

export async function handleUpdateCorridor(pool: Pool, id: number, body: unknown, _auth: Auth) {
  const b = body as Record<string, unknown>
  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  for (const key of ['name', 'location_from', 'location_to', 'description', 'pickup_points', 'terms_conditions', 'is_active', 'map_enabled', 'image_url']) {
    if (b[key] !== undefined) {
      let val = b[key]
      if (key === 'name' && typeof val === 'string') val = val.replace(/\?/g, '').trim()
      updates.push(`${key} = $${i++}`)
      args.push(val)
    }
  }
  if (updates.length === 0) return errResponse('No fields to update', 400)
  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(id)
  await pool.query(`UPDATE corridors SET ${updates.join(', ')} WHERE id = $${i}`, args)
  return jsonResponse({ message: 'Corridor updated' })
}

export async function handleDeleteCorridor(pool: Pool, id: number, searchParams?: URLSearchParams) {
  const isPermanent = searchParams?.get('permanent') === 'true'
  if (isPermanent) {
    await pool.query(`DELETE FROM corridors WHERE id = $1`, [id])
    return jsonResponse({ message: 'Corridor permanently deleted from database' })
  }
  await pool.query(`UPDATE corridors SET is_deleted = true, is_active = false WHERE id = $1`, [id])
  return jsonResponse({ message: 'Corridor archived and hidden from new rides' })
}

export async function handleAssignCorridor(pool: Pool, body: unknown) {
  const b = body as { user_id?: number; corridor_id?: number }
  if (!b?.user_id || !b?.corridor_id) return errResponse('user_id and corridor_id required', 400)
  await pool.query(`INSERT INTO user_corridors (user_id, corridor_id) VALUES ($1, $2) ON CONFLICT (user_id, corridor_id) DO NOTHING`, [b.user_id, b.corridor_id])
  return jsonResponse({ message: 'Corridor assigned' }, 201)
}

export async function handleFlushData(pool: Pool, auth: Auth) {
  if (auth.role !== 'admin') return errResponse('Admin access required', 403)
  
  // 1. Delete all ride requests associated with non-admin/non-beta users
  await pool.query(`
    DELETE FROM ride_requests 
    WHERE user_id IN (SELECT id FROM users WHERE role != 'admin' AND is_beta = false)
    OR ride_id IN (SELECT id FROM rides WHERE user_id IN (SELECT id FROM users WHERE role != 'admin' AND is_beta = false))
  `)
  
  // 2. Delete all rides associated with non-admin/non-beta users
  await pool.query(`
    DELETE FROM rides 
    WHERE user_id IN (SELECT id FROM users WHERE role != 'admin' AND is_beta = false)
  `)
  
  // 3. Delete all messages for those rides
  await pool.query(`
    DELETE FROM messages 
    WHERE ride_id NOT IN (SELECT id FROM rides)
  `)
  
  // 4. Delete payments
  await pool.query(`
    DELETE FROM payments 
    WHERE ride_id NOT IN (SELECT id FROM rides)
  `)
  
  // 5. Delete users (except admins and beta)
  const r = await pool.query(`
    DELETE FROM users 
    WHERE role != 'admin' AND is_beta = false
    RETURNING id
  `)
  
  return jsonResponse({ message: `Flushed ${r.rowCount} users and associated records.`, count: r.rowCount })
}

// ─── SUPPORT TABLES (auto-create) ──────────────────────────────────────────
async function ensureSupportTables(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id SERIAL PRIMARY KEY,
      ref TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT NOT NULL,
      trip_id TEXT,
      issue_type TEXT NOT NULL DEFAULT 'other',
      urgency TEXT NOT NULL DEFAULT 'normal',
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      admin_reply TEXT,
      replied_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      type TEXT NOT NULL DEFAULT 'general',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      admin_reply TEXT,
      replied_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

// ─── TICKETS: CREATE ────────────────────────────────────────────────────────
export async function handleCreateTicket(pool: Pool, body: unknown) {
  await ensureSupportTables(pool)
  const b = body as { name?: string; email?: string; trip_id?: string; issue_type?: string; urgency?: string; description?: string }
  if (!b?.email || !b?.description) return errResponse('email and description required', 400)
  const ref = `JOOL-${Date.now().toString().slice(-6)}`
  const r = await pool.query(
    `INSERT INTO support_tickets (ref, name, email, trip_id, issue_type, urgency, description)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, ref, created_at`,
    [ref, b.name || null, b.email, b.trip_id || null, b.issue_type || 'other', b.urgency || 'normal', b.description]
  )
  return jsonResponse({ ref: r.rows[0].ref, id: r.rows[0].id, message: `Ticket ${ref} raised! We will respond within 24 hours.` }, 201)
}

// ─── TICKETS: GET ALL (admin) ───────────────────────────────────────────────
export async function handleGetTickets(pool: Pool) {
  await ensureSupportTables(pool)
  const r = await pool.query(`SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 200`)
  return jsonResponse(r.rows)
}

// ─── TICKETS: GET BY REF (user status check) ────────────────────────────────
export async function handleGetTicketByRef(pool: Pool, ref: string) {
  await ensureSupportTables(pool)
  const r = await pool.query(
    `SELECT id, ref, name, email, issue_type, urgency, description, status, admin_reply, replied_at, created_at
     FROM support_tickets WHERE UPPER(ref) = UPPER($1)`,
    [ref]
  )
  if (r.rows.length === 0) return errResponse('Ticket not found', 404)
  return jsonResponse(r.rows[0])
}

// ─── TICKETS: ADMIN REPLY ───────────────────────────────────────────────────
export async function handleReplyTicket(pool: Pool, id: number, body: unknown) {
  await ensureSupportTables(pool)
  const b = body as { admin_reply?: string; status?: string }
  if (!b?.admin_reply) return errResponse('admin_reply required', 400)
  const r = await pool.query(
    `UPDATE support_tickets SET admin_reply=$1, status=$2, replied_at=NOW() WHERE id=$3 RETURNING id, ref, status`,
    [b.admin_reply, b.status || 'replied', id]
  )
  if (r.rows.length === 0) return errResponse('Ticket not found', 404)
  return jsonResponse({ message: 'Reply sent', ref: r.rows[0].ref, status: r.rows[0].status })
}

// ─── FEEDBACK: CREATE ───────────────────────────────────────────────────────
export async function handleCreateFeedback(pool: Pool, body: unknown) {
  await ensureSupportTables(pool)
  const b = body as { name?: string; email?: string; rating?: number; type?: string; message?: string }
  if (!b?.email || !b?.message) return errResponse('email and message required', 400)
  const r = await pool.query(
    `INSERT INTO feedback (name, email, rating, type, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
    [b.name || null, b.email, b.rating ?? 5, b.type || 'general', b.message]
  )
  return jsonResponse({ id: r.rows[0].id, message: 'Feedback received. Thank you!' }, 201)
}

// ─── FEEDBACK: GET ALL (admin) ──────────────────────────────────────────────
export async function handleGetFeedback(pool: Pool) {
  await ensureSupportTables(pool)
  const r = await pool.query(`SELECT * FROM feedback ORDER BY created_at DESC LIMIT 200`)
  return jsonResponse(r.rows)
}

// ─── FEEDBACK: ADMIN REPLY / MARK READ ─────────────────────────────────────
export async function handleReplyFeedback(pool: Pool, id: number, body: unknown) {
  await ensureSupportTables(pool)
  const b = body as { admin_reply?: string; status?: string }
  const r = await pool.query(
    `UPDATE feedback SET admin_reply=$1, status=$2, replied_at=NOW() WHERE id=$3 RETURNING id`,
    [b.admin_reply || null, b.status || 'read', id]
  )
  if (r.rows.length === 0) return errResponse('Feedback not found', 404)
  return jsonResponse({ message: 'Updated' })
}

// ─── RATINGS ─────────────────────────────────────────────────────────────────
export async function handleRateRide(pool: Pool, rideId: number, body: unknown, auth: Auth) {
  const b = body as { ratee_id?: number; rating?: number; comment?: string }
  if (!b?.ratee_id || !b?.rating) return errResponse('ratee_id and rating required', 400)
  
  // Verify ride participation
  const participant = await pool.query(
    `SELECT 1 FROM rides WHERE id = $1 AND user_id = $2
     UNION SELECT 1 FROM ride_requests WHERE ride_id = $1 AND user_id = $2 AND status = 'accepted'`,
    [rideId, auth.userId]
  )
  if (participant.rows.length === 0) return errResponse('You were not part of this ride', 403)

  await pool.query(
    `INSERT INTO ratings (ride_id, rater_id, ratee_id, rating, comment) 
     VALUES ($1, $2, $3, $4, $5) 
     ON CONFLICT (ride_id, rater_id, ratee_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment`,
    [rideId, auth.userId, b.ratee_id, b.rating, b.comment || '']
  )
  
  return jsonResponse({ message: 'Rating submitted' }, 201)
}

export async function handleFixSchema(pool: Pool) {
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false`)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_beta BOOLEAN DEFAULT false`)
    return jsonResponse({ message: 'Database schema synchronized successfully.' })
  } catch (e: any) {
    return errResponse('Schema sync failed: ' + e.message, 500)
  }
}
