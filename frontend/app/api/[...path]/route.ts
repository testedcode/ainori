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
    const { data: { user }, error } = await supabase.auth.getUser()

    if (user && user.email) {
      // Fetch role and userId from our database based on email
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
      }
    }
  } catch (e) {
    console.error('Supabase auth error in API:', e)
  }

  return { error: Response.json({ error: 'Authorization required' }, { status: 401 }) }
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

  let pool
  try {
    pool = getPool()
  } catch (e) {
    return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 })
  }

  if (pathStr === 'auth/profile') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleProfile(pool, r.auth)
  }
  if (pathStr === 'stats') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleStats(pool)
  }
  if (pathStr === 'cities') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetCities(pool)
  }
  if (pathStr === 'corridors') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetCorridors(pool, searchParams)
  }
  if (pathStr === 'user/corridors') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetUserCorridors(pool, r.auth)
  }
  if (pathStr === 'vehicles') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetVehicles(pool, r.auth)
  }
  if (path.length === 2 && path[0] === 'vehicles' && /^\d+$/.test(path[1])) {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetVehicle(pool, parseInt(path[1], 10), r.auth)
  }
  if (pathStr === 'rides') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetRides(pool, searchParams)
  }
  if (path.length === 2 && path[0] === 'rides' && /^\d+$/.test(path[1])) {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetRide(pool, parseInt(path[1], 10))
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'requests') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetRideRequests(pool, parseInt(path[1], 10))
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'messages') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetMessages(pool, parseInt(path[1], 10), searchParams)
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'payments') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetPayments(pool, parseInt(path[1], 10))
  }
  if (pathStr === 'admin/users') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    const adminErr = requireAdmin(r.auth)
    if (adminErr) return adminErr
    return h.handleGetAllUsers(pool, r.auth)
  }
  if (pathStr === 'admin/analytics') {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    const adminErr = requireAdmin(r.auth)
    if (adminErr) return adminErr
    return h.handleGetAnalytics(pool)
  }
  if (path.length === 2 && path[0] === 'corridors' && /^\d+$/.test(path[1])) {
    const r = await requireAuth(request)
    if ('error' in r) return r.error
    return h.handleGetCorridor(pool, parseInt(path[1], 10))
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pathStr = path.join('/')
  const body = await request.json().catch(() => ({}))

  let pool
  try {
    pool = getPool()
  } catch (e) {
    return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 })
  }

  if (pathStr === 'auth/register') return h.handleRegister(pool, body)
  if (pathStr === 'auth/login') return h.handleLogin(pool, body)

  const r = await requireAuth(request)
  if ('error' in r) return r.error
  const { auth } = r

  if (pathStr === 'vehicles') return h.handleCreateVehicle(pool, body, auth)
  if (pathStr === 'rides') return h.handleCreateRide(pool, body, auth)
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
    return h.handleCreateRideRequest(pool, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'messages') {
    return h.handleCreateMessage(pool, parseInt(path[1], 10), body, auth)
  }
  if (path.length === 3 && path[0] === 'rides' && /^\d+$/.test(path[1]) && path[2] === 'payments') {
    return h.handleCreatePayment(pool, parseInt(path[1], 10), body, auth)
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pool = getPool()
  const pathStr = path.join('/')
  const body = await request.json().catch(() => ({}))

  const r = await requireAuth(request)
  if ('error' in r) return r.error
  const { auth } = r

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
  const pool = getPool()
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
  if (path.length === 2 && path[0] === 'corridors' && /^\d+$/.test(path[1])) {
    const adminErr = requireAdmin(auth)
    if (adminErr) return adminErr
    return h.handleDeleteCorridor(pool, parseInt(path[1], 10))
  }
  return Response.json({ error: 'Not found' }, { status: 404 })
}
