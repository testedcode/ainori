'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Users, DollarSign } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Ride {
  id: number
  user_name: string
  corridor_name: string
  ride_date: string
  ride_time: string
  pickup_point: string
  drop_point: string
  price_per_seat: number
  available_seats: number
  total_seats: number
}

export default function FindRidePage() {
  const router = useRouter()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    corridor_id: '',
    date: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchRides()
  }, [router, filters])

  const fetchRides = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.corridor_id) params.append('corridor_id', filters.corridor_id)
      if (filters.date) params.append('date', filters.date)

      const data = await api.get(`/rides?${params.toString()}`)
      setRides(data as unknown as Ride[])
    } catch (error) {
      toast.error('Failed to load rides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Find a Ride</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Date
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
            <div>
              <button
                onClick={() => setFilters({ corridor_id: '', date: '' })}
                className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Rides List */}
        {loading ? (
          <div className="text-center py-12">Loading rides...</div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">No rides available. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map((ride) => (
              <Link
                key={ride.id}
                href={`/rides/${ride.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{ride.corridor_name}</h3>
                  <span className="text-sm text-gray-600">by {ride.user_name}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{ride.pickup_point} → {ride.drop_point}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDate(ride.ride_date)} at {ride.ride_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{ride.available_seats} of {ride.total_seats} seats available</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(ride.price_per_seat)} per seat</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <span className="text-sm text-blue-600 hover:underline">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

