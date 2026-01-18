'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, MapPin, Car, Settings, Lock, Unlock } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface City {
  id: number
  name: string
  status: string
}

interface Corridor {
  id: number
  name: string
  city_name: string
  is_active: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cities, setCities] = useState<City[]>([])
  const [corridors, setCorridors] = useState<Corridor[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'cities' | 'corridors' | 'analytics'>('analytics')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      const userData = JSON.parse(userStr)
      setUser(userData)
      if (userData.role !== 'admin') {
        toast.error('Admin access required')
        router.push('/dashboard')
        return
      }
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const [citiesData, corridorsData, analyticsData] = await Promise.all([
        api.get('/cities'),
        api.get('/corridors'),
        api.get('/admin/analytics'),
      ])
      setCities((citiesData as unknown) as City[])
      setCorridors((corridorsData as unknown) as Corridor[])
      setAnalytics(analyticsData as any)
    } catch (error) {
      toast.error('Failed to load data')
    }
  }

  const toggleCityStatus = async (cityId: number, currentStatus: string) => {
    try {
      await api.put(`/cities/${cityId}/status`, {
        status: currentStatus === 'active' ? 'locked' : 'active',
      })
      toast.success('City status updated')
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update city')
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
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-semibold ${activeTab === 'analytics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`px-4 py-2 font-semibold ${activeTab === 'cities' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Cities
          </button>
          <button
            onClick={() => setActiveTab('corridors')}
            className={`px-4 py-2 font-semibold ${activeTab === 'corridors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            Corridors
          </button>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-gray-600">Total Users</p>
              <p className="text-3xl font-bold">{analytics.total_users}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <Car className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-gray-600">Total Rides</p>
              <p className="text-3xl font-bold">{analytics.total_rides}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <MapPin className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-gray-600">Active Corridors</p>
              <p className="text-3xl font-bold">{analytics.active_corridors}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Completed Rides</p>
              <p className="text-3xl font-bold">{analytics.completed_rides}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold">₹{analytics.total_revenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Total Carbon Credits</p>
              <p className="text-3xl font-bold">{analytics.total_credits}</p>
            </div>
          </div>
        )}

        {/* Cities Tab */}
        {activeTab === 'cities' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Manage Cities</h2>
            <div className="space-y-4">
              {cities.map((city) => (
                <div key={city.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{city.name}</h3>
                    <p className="text-sm text-gray-600">Status: {city.status}</p>
                  </div>
                  <button
                    onClick={() => toggleCityStatus(city.id, city.status)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      city.status === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {city.status === 'active' ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Lock City
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Unlock City
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Corridors Tab */}
        {activeTab === 'corridors' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">All Corridors</h2>
            <div className="space-y-4">
              {corridors.map((corridor) => (
                <div key={corridor.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{corridor.name}</h3>
                      <p className="text-sm text-gray-600">{corridor.city_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      corridor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {corridor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

