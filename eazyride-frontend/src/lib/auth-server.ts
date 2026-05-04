import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key-in-production'
const BCRYPT_ROUNDS = 10

export interface TokenPayload {
  user_id: number
  email: string
  role: string
  exp: number
}

export function signToken(userId: number, email: string, role: string): string {
  return jwt.sign(
    {
      user_id: userId,
      email,
      role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    },
    JWT_SECRET
  )
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch {
    return null
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS)
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function getAuthFromRequest(request: Request): { userId: number; email: string; role: string } | null {
  const auth = request.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  const payload = verifyToken(auth.slice(7))
  if (!payload) return null
  return { userId: payload.user_id, email: payload.email, role: payload.role }
}
