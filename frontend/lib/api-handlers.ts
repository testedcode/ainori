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
    const r = await pool.query(
      `SELECT id, email, password_hash, name, phone, city, role, carbon_credits, upi_id
       FROM users WHERE email = $1`,
      [b.email]
    )
    if (r.rows.length === 0) return errResponse('Invalid credentials', 401)
    const row = r.rows[0]
    if (!comparePassword(b.password, row.password_hash)) return errResponse('Invalid credentials', 401)
    const token = signToken(row.id, row.email, row.role)
    const user = {
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone,
      city: row.city,
      role: row.role,
      carbon_credits: row.carbon_credits,
      upi_id: row.upi_id,
    }
    return jsonResponse({ token, user })
  } catch (e: any) {
    console.error('Login DB error:', e.message)
    return errResponse('Database error: ' + e.message, 500)
  }
}

export async function handleProfile(pool: Pool, auth: Auth) {
  const r = await pool.query(
    `SELECT id, email, name, phone, city, role, carbon_credits, upi_id, created_at, updated_at
     FROM users WHERE id = $1`,
    [auth.userId]
  )
  if (r.rows.length === 0) return errResponse('User not found', 404)
  return jsonResponse(r.rows[0])
}

export async function handleStats(pool: Pool) {
  const today = new Date().toISOString().slice(0, 10)
  const ridesToday = await pool.query(
    `SELECT COUNT(*)::int FROM rides WHERE ride_date = $1 AND status != 'cancelled'`,
    [today]
  )
  const ridesTakenToday = await pool.query(
    `SELECT COUNT(*)::int FROM ride_requests WHERE DATE(created_at) = $1 AND status = 'accepted'`,
    [today]
  )
  const usersOnline = await pool.query(
    `SELECT COUNT(DISTINCT user_id)::int FROM rides WHERE DATE(created_at) = $1 OR DATE(updated_at) = $1`,
    [today]
  )
  return jsonResponse({
    rides_today: ridesToday.rows[0].count,
    rides_taken_today: ridesTakenToday.rows[0].count,
    users_online: usersOnline.rows[0].count,
  })
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

export async function handleGetCorridors(pool: Pool, searchParams: URLSearchParams) {
  const cityId = searchParams.get('city_id')
  const activeOnly = searchParams.get('active') === 'true'
  let query = `
    SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, c.location_to,
           c.pickup_points, c.terms_conditions, c.is_active, c.map_enabled, c.created_at, c.updated_at
    FROM corridors c JOIN cities ci ON c.city_id = ci.id WHERE 1=1
  `
  const args: unknown[] = []
  let i = 1
  if (cityId) {
    query += ` AND c.city_id = $${i++}`
    args.push(cityId)
  }
  if (activeOnly) query += ` AND c.is_active = true`
  query += ` ORDER BY c.name`
  const r = await pool.query(query, args)
  return jsonResponse(r.rows)
}

export async function handleGetCorridor(pool: Pool, id: number) {
  const r = await pool.query(
    `SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, c.location_to,
            c.pickup_points, c.terms_conditions, c.is_active, c.map_enabled, c.created_at, c.updated_at
     FROM corridors c JOIN cities ci ON c.city_id = ci.id WHERE c.id = $1`,
    [id]
  )
  if (r.rows.length === 0) return errResponse('Corridor not found', 404)
  return jsonResponse(r.rows[0])
}

export async function handleGetUserCorridors(pool: Pool, auth: Auth) {
  const r = await pool.query(
    `SELECT c.id, c.city_id, ci.name as city_name, c.name, c.location_from, c.location_to,
            c.pickup_points, c.terms_conditions, c.is_active, c.map_enabled, c.created_at, c.updated_at
     FROM user_corridors uc JOIN corridors c ON uc.corridor_id = c.id JOIN cities ci ON c.city_id = ci.id
     WHERE uc.user_id = $1 AND c.is_active = true ORDER BY c.name`,
    [auth.userId]
  )
  return jsonResponse(r.rows)
}

export async function handleGetVehicles(pool: Pool, auth: Auth) {
  const r = await pool.query(
    `SELECT id, user_id, vehicle_type, make, model, color, vehicle_number,
            total_seats, default_available_seats, created_at, updated_at
     FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC`,
    [auth.userId]
  )
  return jsonResponse(r.rows)
}

export async function handleGetVehicle(pool: Pool, id: number, auth: Auth) {
  const r = await pool.query(
    `SELECT id, user_id, vehicle_type, make, model, color, vehicle_number,
            total_seats, default_available_seats, created_at, updated_at
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
  if (b.vehicle_type !== 'car' && b.vehicle_type !== 'bike') return errResponse('vehicle_type must be car or bike', 400)
  if (b.default_available_seats > b.total_seats) return errResponse('Available seats cannot exceed total seats', 400)
  try {
    const r = await pool.query(
      `INSERT INTO vehicles (user_id, vehicle_type, make, model, color, vehicle_number, total_seats, default_available_seats)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [auth.userId, b.vehicle_type, b.make, b.model, b.color || null, b.vehicle_number, b.total_seats, b.default_available_seats]
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
  for (const key of ['make', 'model', 'color', 'total_seats', 'default_available_seats']) {
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
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const dayAfter = new Date(Date.now() + 172800000).toISOString().slice(0, 10)

  let query = `
    SELECT r.id, r.user_id, u.name as user_name, r.corridor_id, c.name as corridor_name,
           r.vehicle_id, r.ride_date, r.ride_time, r.pickup_point, r.drop_point,
           r.route_description, r.price_per_seat, r.available_seats, r.total_seats,
           r.status, r.created_at, r.updated_at
    FROM rides r JOIN users u ON r.user_id = u.id JOIN corridors c ON r.corridor_id = c.id WHERE 1=1
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
  } else {
    query += ` AND r.ride_date IN ($${i++}, $${i++}, $${i++})`
    args.push(today, tomorrow, dayAfter)
  }
  if (status) {
    query += ` AND r.status = $${i++}`
    args.push(status)
  } else {
    query += ` AND r.status IN ('open', 'partially_filled')`
  }
  if (userId) {
    query += ` AND r.user_id = $${i++}`
    args.push(userId)
  }
  query += ` ORDER BY r.ride_date, r.ride_time`
  const r = await pool.query(query, args)
  return jsonResponse(r.rows)
}

export async function handleGetRide(pool: Pool, id: number) {
  const r = await pool.query(
    `SELECT r.id, r.user_id, u.name as user_name, r.corridor_id, c.name as corridor_name,
            r.vehicle_id, r.ride_date, r.ride_time, r.pickup_point, r.drop_point,
            r.route_description, r.price_per_seat, r.available_seats, r.total_seats,
            r.status, r.created_at, r.updated_at
     FROM rides r JOIN users u ON r.user_id = u.id JOIN corridors c ON r.corridor_id = c.id WHERE r.id = $1`,
    [id]
  )
  if (r.rows.length === 0) return errResponse('Ride not found', 404)
  const ride = r.rows[0]
  if (ride.vehicle_id) {
    const v = await pool.query(
      `SELECT id, user_id, vehicle_type, make, model, color, vehicle_number, total_seats, default_available_seats FROM vehicles WHERE id = $1`,
      [ride.vehicle_id]
    )
    if (v.rows[0]) ride.vehicle_info = v.rows[0]
  }
  return jsonResponse(ride)
}

export async function handleCreateRide(pool: Pool, body: unknown, auth: Auth) {
  const b = body as { corridor_id?: number; vehicle_id?: number; ride_date?: string; ride_time?: string; pickup_point?: string; drop_point?: string; route_description?: string; price_per_seat?: number; available_seats?: number }
  if (!b?.corridor_id || !b?.vehicle_id || !b?.ride_date || !b?.ride_time || !b?.pickup_point || !b?.drop_point || b?.price_per_seat == null || b?.available_seats == null)
    return errResponse('corridor_id, vehicle_id, ride_date, ride_time, pickup_point, drop_point, price_per_seat, available_seats required', 400)
  const rideDate = new Date(b.ride_date)
  const now = new Date()
  const daysDiff = Math.floor((rideDate.getTime() - now.getTime()) / 86400000)
  if (daysDiff < 0 || daysDiff > 2) return errResponse('Ride date must be today or within next 2 days', 400)

  const v = await pool.query(`SELECT total_seats FROM vehicles WHERE id = $1 AND user_id = $2`, [b.vehicle_id, auth.userId])
  if (v.rows.length === 0) return errResponse('Vehicle not found', 404)
  const totalSeats = v.rows[0].total_seats
  if (b.available_seats > totalSeats) return errResponse('Available seats cannot exceed vehicle capacity', 400)

  const access = await pool.query(`SELECT 1 FROM user_corridors WHERE user_id = $1 AND corridor_id = $2`, [auth.userId, b.corridor_id])
  if (access.rows.length === 0) return errResponse("You don't have access to this corridor", 403)

  const r = await pool.query(
    `INSERT INTO rides (user_id, corridor_id, vehicle_id, ride_date, ride_time, pickup_point, drop_point, route_description, price_per_seat, available_seats, total_seats, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'open') RETURNING id`,
    [auth.userId, b.corridor_id, b.vehicle_id, b.ride_date, b.ride_time, b.pickup_point, b.drop_point, b.route_description || null, b.price_per_seat, b.available_seats, totalSeats]
  )
  return jsonResponse({ id: r.rows[0].id, message: 'Ride created' }, 201)
}

export async function handleUpdateRide(pool: Pool, id: number, body: unknown, auth: Auth) {
  const b = body as Record<string, unknown>
  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  for (const key of ['ride_time', 'pickup_point', 'drop_point', 'route_description', 'price_per_seat', 'available_seats', 'status']) {
    if (b[key] !== undefined) {
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
  await pool.query(`
    UPDATE rides SET status = CASE
      WHEN available_seats = 0 THEN 'full'
      WHEN available_seats < total_seats THEN 'partially_filled'
      ELSE 'open'
    END WHERE id = $1
  `, [id])
  return jsonResponse({ message: 'Ride updated' })
}

export async function handleCancelRide(pool: Pool, id: number, auth: Auth) {
  const r = await pool.query(`UPDATE rides SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id`, [id, auth.userId])
  if (r.rowCount === 0) return errResponse('Ride not found', 404)
  return jsonResponse({ message: 'Ride cancelled' })
}

export async function handleGetRideRequests(pool: Pool, rideId: number) {
  const r = await pool.query(
    `SELECT rr.id, rr.ride_id, rr.user_id, u.name as user_name, rr.seats_requested, rr.comment, rr.status, rr.created_at, rr.updated_at
     FROM ride_requests rr JOIN users u ON rr.user_id = u.id WHERE rr.ride_id = $1 ORDER BY rr.created_at DESC`,
    [rideId]
  )
  return jsonResponse(r.rows)
}

export async function handleCreateRideRequest(pool: Pool, rideId: number, body: unknown, auth: Auth) {
  const b = body as { seats_requested?: number; comment?: string }
  if (!b?.seats_requested || b.seats_requested < 1) return errResponse('seats_requested required (min 1)', 400)
  const ride = await pool.query(`SELECT available_seats, user_id FROM rides WHERE id = $1 AND status IN ('open', 'partially_filled')`, [rideId])
  if (ride.rows.length === 0) return errResponse('Ride not found or not available', 404)
  const { available_seats, user_id: rideUserId } = ride.rows[0]
  if (rideUserId === auth.userId) return errResponse('Cannot request your own ride', 400)
  if (b.seats_requested > available_seats) return errResponse('Not enough available seats', 400)
  const existing = await pool.query(`SELECT status FROM ride_requests WHERE ride_id = $1 AND user_id = $2`, [rideId, auth.userId])
  if (existing.rows.length > 0 && (existing.rows[0].status === 'pending' || existing.rows[0].status === 'accepted'))
    return errResponse('You already have a request for this ride', 409)
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
  } else if (b.status === 'rejected' && currentStatus === 'accepted') {
    await pool.query(`UPDATE rides SET available_seats = available_seats + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [seats_requested, rideId])
  }
  return jsonResponse({ message: 'Request updated' })
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
  const r = await pool.query(
    `SELECT id, email, name, phone, city, role, carbon_credits, upi_id, created_at, updated_at FROM users ORDER BY created_at DESC`
  )
  return jsonResponse(r.rows)
}

export async function handleUpdateUser(pool: Pool, id: number, body: unknown, _auth: Auth) {
  const b = body as Record<string, unknown>
  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  for (const key of ['name', 'phone', 'city', 'role', 'carbon_credits', 'upi_id']) {
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
  const b = body as { city_id?: number; name?: string; location_from?: string; location_to?: string; pickup_points?: string; terms_conditions?: string; is_active?: boolean; map_enabled?: boolean }
  if (!b?.city_id || !b?.name || !b?.location_from || !b?.location_to) return errResponse('city_id, name, location_from, location_to required', 400)
  const r = await pool.query(
    `INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, terms_conditions, is_active, map_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [b.city_id, b.name, b.location_from, b.location_to, b.pickup_points || null, b.terms_conditions || null, b.is_active ?? true, b.map_enabled ?? false]
  )
  return jsonResponse({ id: r.rows[0].id, message: 'Corridor created' }, 201)
}

export async function handleUpdateCorridor(pool: Pool, id: number, body: unknown, _auth: Auth) {
  const b = body as Record<string, unknown>
  const updates: string[] = []
  const args: unknown[] = []
  let i = 1
  for (const key of ['name', 'location_from', 'location_to', 'pickup_points', 'terms_conditions', 'is_active', 'map_enabled']) {
    if (b[key] !== undefined) {
      updates.push(`${key} = $${i++}`)
      args.push(b[key])
    }
  }
  if (updates.length === 0) return errResponse('No fields to update', 400)
  updates.push('updated_at = CURRENT_TIMESTAMP')
  args.push(id)
  await pool.query(`UPDATE corridors SET ${updates.join(', ')} WHERE id = $${i}`, args)
  return jsonResponse({ message: 'Corridor updated' })
}

export async function handleDeleteCorridor(pool: Pool, id: number) {
  await pool.query(`DELETE FROM corridors WHERE id = $1`, [id])
  return jsonResponse({ message: 'Corridor deleted' })
}

export async function handleAssignCorridor(pool: Pool, body: unknown) {
  const b = body as { user_id?: number; corridor_id?: number }
  if (!b?.user_id || !b?.corridor_id) return errResponse('user_id and corridor_id required', 400)
  await pool.query(`INSERT INTO user_corridors (user_id, corridor_id) VALUES ($1, $2) ON CONFLICT (user_id, corridor_id) DO NOTHING`, [b.user_id, b.corridor_id])
  return jsonResponse({ message: 'Corridor assigned' }, 201)
}
