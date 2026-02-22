import { Pool } from 'pg'

const globalForDb = globalThis as unknown as { pool: Pool | null }

/** Normalize connection string so password with ! or other special chars works (encode for URL). */
function normalizeConnectionString(url: string): string {
  if (!url.includes('postgresql://') && !url.includes('postgres://')) return url
  // If password contains unencoded !, the URL can be parsed wrong. Encode ! in the userinfo part.
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

export function getPool(): Pool {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error('DATABASE_URL is not set')
  const url = normalizeConnectionString(raw)
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      connectionString: url,
      ssl: url.includes('supabase') ? { rejectUnauthorized: false } : undefined,
    })
  }
  return globalForDb.pool
}
