import { NextRequest } from 'next/server'
import { getPool } from '@/lib/db'
import { getAuthFromRequest, verifyToken } from '@/lib/auth-server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import * as h from '@/lib/api-handlers'

async function requireAuth(request: NextRequest) {
  const pool = getPool()
  
  // 1. Try legacy auth first (for transition)
  const legacyAuth = getAuthFromRequest(request)
  if (legacyAuth) return { auth: legacyAuth }

  // 2. Try Supabase Auth
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    if (!supabase) return { error: Response.json({ error: 'Supabase not configured' }, { status: 500 }) }
    
    // Check for token in header first (more reliable for API calls)
    const authHeader = request.headers.get('authorization')
    let user = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const { data } = await supabase.auth.getUser(token)
      user = data.user
    }
    
    // Fallback to cookies
    if (!user) {
      const { data } = await supabase.auth.getUser()
      user = data.user
    }

    if (user && user.email) {
      // 1. Fetch role and userId from our database based on email
      const r = await pool.query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [user.email]
      )

      if (r.rows.length > 0) {
        const row = r.rows[0]
        return { 
          auth: { 
            userId: row.id, 
            email: row.email, 
            role: row.role 
          } 
        }
      } else {
        // 2. Auto-create the user in our database if they don't exist yet
        const name = user.user_metadata?.full_name || user.email.split('@')[0]
        const role = user.email === 'admin@cpoolai.com' ? 'admin' : 'user'
        
        try {
          const insertRes = await pool.query(
            `INSERT INTO users (email, name, role, password_hash) 
             VALUES ($1, $2, $3, 'supabase_auth') RETURNING id, email, role`,
            [user.email, name, role]
          )
          const newRow = insertRes.rows[0]
          return { 
            auth: { 
              userId: newRow.id, 
              email: newRow.email, 
              role: newRow.role 
            } 
          }
        } catch (e: any) {
          console.error('Error auto-creating PG user:', e)
          return { error: Response.json({ error: 'Database sync failed: ' + e.message }, { status: 500 }) }
        }
      }
    } else {
      return { error: Response.json({ error: 'Supabase could not verify user' }, { status: 401 }) }
    }
  } catch (e: any) {
    console.error('Supabase auth error in API:', e)
    return { error: Response.json({ error: 'Auth system error: ' + e.message }, { status: 500 }) }
  }

  return { error: Response.json({ error: 'Authorization failed' }, { status: 401 }) }
}

function requireAdmin(auth: { role: string }) {
  if (auth.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 })
  return null
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const searchParams = request.nextUrl.searchParams
  const pathStr = path.join('/')

  if (pathStr === 'health') return h.handleHealth()

  let pool: any = getPool()

  if (pathStr === 'auth/profile') {
    // Fast path: decode token directly without requiring DB round-trip
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { verifyToken } = await import('@/lib/auth-server')
        const token = authHeader.split(' ')[1]
        const payload = verifyToken(token)
        if (payload) {
          // Try DB first, fall back to token data
          try {
            const r = await pool.query(
              `SELECT id, email, name, phone, city, role, carbon_credits, upi_id FROM users WHERE id = $1`,
              [payload.user_id]
            )
            if (r.rows.length > 0) return Response.json(r.rows[0])
          } catch {}
          // Fallback: return profile from JWT payload
          return Response.json({
            id: payload.user_id,
            email: payload.email,
            name: payload.email.split('@')[0],
            role: payload.role,
            carbon_credits: 450,
            phone: null, city: null
          })
        }
      } catch {}
    }
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleProfile(pool as any, r.auth)
  }
  if (pathStr === 'stats') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleStats(pool as any)
  }
  if (pathStr === 'cities') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetCities(pool as any)
  }
  if (pathStr === 'corridors') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetCorridors(pool as any, searchParams)
  }
  if (pathStr === 'user/corridors') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetUserCorridors(pool as any, r.auth)
  }
  if (pathStr === 'vehicles') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetVehicles(pool as any, r.auth)
  }
  if (path.length === 2 && path[0] === 'vehicles' && /^\d+$/.test(path[1])) {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetVehicle(pool as any, parseInt(path[1], 10), r.auth)
  }
  if (pathStr === 'user/rides') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetUserRides(pool as any, r.auth)
  }
  if (pathStr === 'rides') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetRides(pool as any, searchParams)
  }
  if (path.length === 2 && path[0] === 'rides' && /^\d+$/.test(path[1])) {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetRide(pool as any, parseInt(path[1], 10))
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'requests') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetRideRequests(pool as any, parseInt(path[1], 10))
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'messages') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetMessages(pool as any, parseInt(path[1], 10), searchParams)
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'payments') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetPayments(pool as any, parseInt(path[1], 10))
  }
  if (pathStr === 'admin/users') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    const adminErr = requireAdmin(r.auth)
    if (adminErr) return adminErr
    return h.handleGetAllUsers(pool as any, r.auth)
  }
  if (pathStr === 'admin/analytics') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    const adminErr = requireAdmin(r.auth)
    if (adminErr) return adminErr
    return h.handleGetAnalytics(pool as any)
  }
  if (path.length === 2 && path[0] === 'corridors' && /^\d+$/.test(path[1])) {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetCorridor(pool as any, parseInt(path[1], 10))
  }
  if (path.length === 2 && path[0] === 'users' && /^\d+$/.test(path[1])) {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetUserProfile(pool as any, parseInt(path[1], 10))
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pathStr = path.join('/')
  const body = await request.json().catch(() => ({}))

  let pool: any
  try {
    pool = getPool()
  } catch (e) {
    return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 })
  }

  if (pathStr === 'auth/register') return h.handleRegister(pool, body)
  if (pathStr === 'auth/login') return h.handleLogin(pool, body)

  const r = await requireAuth(request)
  if ('error' in r) {
    if (pathStr === 'rides') console.warn('[DEBUG] 403/401 Check on /rides POST. Path:', pathStr, 'Auth Error:', r.error)
    return r.error
  }
  const { auth } = r

  if (pathStr === 'vehicles') return h.handleCreateVehicle(pool, body, auth)
  if (pathStr === 'rides') {
    try {
      return await h.handleCreateRide(pool, body, auth)
    } catch (e: any) {
      console.error('[CRITICAL] Ride creation failed at handler level:', e.message)
      return Response.json({ error: 'Server Error: ' + e.message }, { status: 500 })
    }
  }
  if (pathStr === 'user/corridors') {
    const adminErr = requireAdmin(auth)
    if (adminErr) return adminErr
    return h.handleAssignCorridor(pool, body)
  }
  if (pathStr === 'corridors') {
    const adminErr = requireAdmin(auth)
    if (adminErr) return adminErr
    return h.handleCreateCorridor(pool, body, auth)
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'requests') {
    return h.handleCreateRideRequest(pool as any, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'messages') {
    return h.handleCreateMessage(pool as any, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'payments') {
    return h.handleCreatePayment(pool as any, parseInt(path[1], 10), body, auth)
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pool: any = getPool()
  const pathStr = path.join('/')
  const body = await request.json().catch(() => ({}))

  const r = await requireAuth(request)
  if ('error' in r) return r.error
  const { auth } = r

  if (pathStr === 'auth/profile') {
    return h.handleUpdateProfile(pool, body, auth)
  }

  if (path.length === 3 && path[0] === 'cities' && /^\d+$/.test(path[1]) && path[2] === 'status') {
    const adminErr = requireAdmin(auth)
    if (adminErr) return adminErr
    return h.handleUpdateCityStatus(pool, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 2 && path[0] === 'vehicles' && /^\d+$/.test(path[1])) {
    return h.handleUpdateVehicle(pool, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 2 && path[0] === 'rides' && /^\d+$/.test(path[1])) {
    return h.handleUpdateRide(pool, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 2 && path[0] === 'corridors' && /^\d+$/.test(path[1])) {
    const adminErr = requireAdmin(auth)
    if (adminErr) return adminErr
    return h.handleUpdateCorridor(pool, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 4 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'requests' && /^\d+$/.test(path[3])) {
    return h.handleUpdateRideRequest(pool, parseInt(path[1], 10), parseInt(path[3], 10), body, auth)
  }
  if (path.length === 4 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'payments' && /^\d+$/.test(path[3])) {
    return h.handleUpdatePaymentStatus(pool, parseInt(path[1], 10), parseInt(path[3], 10), body, auth)
  }
  if (path.length === 2 && path[0] === 'admin' && path[1] === 'users') {
    return Response.json({ error: 'Use PUT /admin/users/:id' }, { status: 400 })
  }
  if (path.length === 3 && path[0] === 'admin' && path[1] === 'users' && /^\d+$/.test(path[2])) {
    const adminErr = requireAdmin(auth)
    if (adminErr) return adminErr
    return h.handleUpdateUser(pool, parseInt(path[2], 10), body, auth)
  }
  if (path.length === 3 && path[0] === 'admin' && path[1] === 'features') {
    const adminErr = requireAdmin(auth)
    if (adminErr) return adminErr
    return h.handleToggleFeature(pool, path[2], body)
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pool: any = getPool()
  const pathStr = path.join('/')

  const r = await requireAuth(request)
  if ('error' in r) return r.error
  const { auth } = r

  if (path.length === 2 && path[0] === 'vehicles' && /^\d+$/.test(path[1])) {
    return h.handleDeleteVehicle(pool, parseInt(path[1], 10), auth)
  }
  if (path.length === 2 && path[0] === 'rides' && /^\d+$/.test(path[1])) {
    return h.handleCancelRide(pool, parseInt(path[1], 10), auth)
  }
  if (path.length === 4 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'requests' && /^\d+$/.test(path[3])) {
    return h.handleCancelRideRequest(pool, parseInt(path[1], 10), parseInt(path[3], 10), auth)
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}
