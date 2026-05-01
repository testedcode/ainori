// ─── JOOL TIER CONFIGURATION ─────────────────────────────────────────────────
// All users are currently premium (approved = true in DB).
// When free tier is introduced, flip getUserTier() logic here — no other changes needed.

export const RIDE_LIMITS = {
  free:    { tripsPerDay: 1, ridesPerCorridorPerDay: 1 },
  premium: { tripsPerDay: 2, ridesPerCorridorPerDay: 2 },
} as const

export type UserTier = keyof typeof RIDE_LIMITS

export function getUserTier(approved: boolean | null | undefined): UserTier {
  return approved ? 'premium' : 'free'
}

export function getTripLimit(approved: boolean | null | undefined): number {
  return RIDE_LIMITS[getUserTier(approved)].tripsPerDay
}

export function getRidePublishLimit(approved: boolean | null | undefined): number {
  return RIDE_LIMITS[getUserTier(approved)].ridesPerCorridorPerDay
}
