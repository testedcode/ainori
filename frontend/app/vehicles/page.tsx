'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Car, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface Vehicle {
  id: number
  vehicle_type: string
  make: string
  model: string
  color: string
  vehicle_number: string
  total_seats: number
  default_available_seats: number
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vehicle_type: 'car',
    make: '',
    model: '',
    color: '',
    vehicle_number: '',
    total_seats: '',
    default_available_seats: '',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchVehicles()
  }, [router])

  const fetchVehicles = async () => {
    try {
      const data = await api.get('/vehicles')
      setVehicles(data as unknown as Vehicle[])
    } catch (error) {
      toast.error('Failed to load vehicles')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/vehicles', {
        ...formData,
        total_seats: parseInt(formData.total_seats),
        default_available_seats: parseInt(formData.default_available_seats),
      })
      toast.success('Vehicle registered successfully!')
      setShowForm(false)
      setFormData({
        vehicle_type: 'car',
        make: '',
        model: '',
        color: '',
        vehicle_number: '',
        total_seats: '',
        default_available_seats: '',
      })
      fetchVehicles()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to register vehicle')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      await api.delete(`/vehicles/${id}`)
      toast.success('Vehicle deleted')
      fetchVehicles()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete vehicle')
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Vehicles</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Vehicle
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Register New Vehicle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                  </label>
                  <select
                    required
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    placeholder="MH01AB1234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Make *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Maruti"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., Swift"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                    placeholder="e.g., White"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Seats *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total_seats}
                    onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Available Seats *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.default_available_seats}
                  onChange={(e) => setFormData({ ...formData, default_available_seats: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Register Vehicle
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles List */}
        {vehicles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No vehicles registered yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Register Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-gray-600 capitalize">{vehicle.vehicle_type}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-semibold">Number:</span> {vehicle.vehicle_number}</p>
                  {vehicle.color && <p className="text-sm"><span className="font-semibold">Color:</span> {vehicle.color}</p>}
                  <p className="text-sm"><span className="font-semibold">Seats:</span> {vehicle.total_seats} total, {vehicle.default_available_seats} default</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
