'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Corridor {
  id: number
  name: string
  location_from: string
  location_to: string
}

interface Vehicle {
  id: number
  vehicle_type: string
  make: string
  model: string
  vehicle_number: string
  total_seats: number
}

export default function OfferRidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [corridors, setCorridors] = useState<Corridor[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [formData, setFormData] = useState({
    corridor_id: '',
    vehicle_id: '',
    ride_date: '',
    ride_time: '',
    pickup_point: '',
    drop_point: '',
    route_description: '',
    price_per_seat: '',
    available_seats: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchData = async () => {
      try {
        const [corridorsData, vehiclesData] = await Promise.all([
          api.get('/user/corridors'),
          api.get('/vehicles'),
        ])
        const corridors = corridorsData as unknown as Corridor[]
        const vehicles = vehiclesData as unknown as Vehicle[]
        setCorridors(corridors)
        setVehicles(vehicles)

        if (vehicles.length === 0) {
          toast.error('Please register a vehicle first')
          router.push('/vehicles')
        }
      } catch (error) {
        toast.error('Failed to load data')
      }
    }

    fetchData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/rides', {
        ...formData,
        corridor_id: parseInt(formData.corridor_id),
        vehicle_id: parseInt(formData.vehicle_id),
        price_per_seat: parseFloat(formData.price_per_seat),
        available_seats: parseInt(formData.available_seats),
      })
      toast.success('Ride offered successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to offer ride')
    } finally {
      setLoading(false)
    }
  }

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData((prev) => ({ ...prev, ride_date: today }))
  }, [])

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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Offer a Ride</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corridor *
            </label>
            <select
              required
              value={formData.corridor_id}
              onChange={(e) => setFormData({ ...formData, corridor_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select a corridor</option>
              {corridors.map((corridor) => (
                <option key={corridor.id} value={corridor.id}>
                  {corridor.name} ({corridor.location_from} → {corridor.location_to})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle *
            </label>
            <select
              required
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} ({vehicle.vehicle_number}) - {vehicle.total_seats} seats
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date * (Today or next 2 days)
              </label>
              <input
                type="date"
                required
                value={formData.ride_date}
                onChange={(e) => setFormData({ ...formData, ride_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                min={new Date().toISOString().split('T')[0]}
                max={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time * (e.g., 8:10 AM)
              </label>
              <input
                type="text"
                required
                value={formData.ride_time}
                onChange={(e) => setFormData({ ...formData, ride_time: e.target.value })}
                placeholder="8:10 AM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Point *
            </label>
            <input
              type="text"
              required
              value={formData.pickup_point}
              onChange={(e) => setFormData({ ...formData, pickup_point: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Drop Point *
            </label>
            <input
              type="text"
              required
              value={formData.drop_point}
              onChange={(e) => setFormData({ ...formData, drop_point: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route Description (optional)
            </label>
            <textarea
              value={formData.route_description}
              onChange={(e) => setFormData({ ...formData, route_description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per Seat (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price_per_seat}
                onChange={(e) => setFormData({ ...formData, price_per_seat: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Seats *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.available_seats}
                onChange={(e) => setFormData({ ...formData, available_seats: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Offer Ride
          </button>
        </form>
      </main>
    </div>
  )
}

