import { getPool } from '@/lib/db'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const pool = getPool()
  
  try {
    // Fetch ride details directly from DB for SEO/Sharing speed
    const res = await pool.query(`
      SELECT r.*, c.name as corridor_name, u.name as user_name, u.avatar_url
      FROM rides r 
      LEFT JOIN corridors c ON r.corridor_id = c.id 
      LEFT JOIN users u ON r.user_id = u.id 
      WHERE r.id = $1
    `, [id])
    
    if (res.rows.length > 0) {
      const ride = res.rows[0]
      const time = ride.ride_time ? ride.ride_time.slice(0, 5) : '--:--'
      const title = `Ride: ${ride.corridor_name} at ${time}`
      const description = `Join ${ride.user_name || 'a neighbor'} on Pulse for a commute from ${ride.pickup_point || 'Start'} to ${ride.drop_point || 'Destination'}. Safe and shared.`
      
      return {
        title: `${title} | Pulse`,
        description,
        openGraph: {
          title,
          description,
          type: 'website',
          images: ride.avatar_url ? [ride.avatar_url] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
        }
      }
    }
  } catch (e) {
    console.error('Metadata generation failed:', e)
  }
  
  return {
    title: 'Ride Details | Pulse',
    description: 'View ride details and join the commute on Pulse.'
  }
}

export default function RideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
