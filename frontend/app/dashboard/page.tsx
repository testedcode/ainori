'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Plus, Search, Settings, LogOut, User, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  name: string
  role: string
  carbon_credits: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const profile = await api.getProfile()
        setUser(profile as unknown as User)
      } catch (error) {
        toast.error('Failed to load profile')
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">cpool.ai</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/offer-ride" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Offer Ride
            </Link>
            <Link href="/find-ride" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Find Ride
            </Link>
            <Link href="/vehicles" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Vehicles
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="px-4 py-2 text-gray-700 hover:text-blue-600">
                Admin
              </Link>
            )}
            <div className="flex items-center gap-2 px-4 py-2">
              <User className="w-5 h-5" />
              <span>{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-red-600 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600">Manage your rides and connect with commuters</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Carbon Credits</p>
                <p className="text-3xl font-bold text-green-600">{user?.carbon_credits || 0}</p>
              </div>
              <Sparkles className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">My Rides</p>
                <p className="text-3xl font-bold text-blue-600">-</p>
              </div>
              <Car className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Role</p>
                <p className="text-xl font-bold text-purple-600 capitalize">{user?.role}</p>
              </div>
              <Settings className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/offer-ride" className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Offer a Ride</h3>
                <p className="text-gray-600">Share your ride and earn carbon credits</p>
              </div>
            </div>
          </Link>

          <Link href="/find-ride" className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Find a Ride</h3>
                <p className="text-gray-600">Browse available rides in your corridors</p>
              </div>
            </div>
          </Link>
        </div>

        {/* AI Features Showcase */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h3 className="text-2xl font-bold">AI-Powered Features</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Smart Matching</h4>
              <p className="text-sm opacity-90">AI matches you with the best ride options based on your preferences</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Route Optimization</h4>
              <p className="text-sm opacity-90">Get optimized routes that save time and reduce emissions</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Predictive Analytics</h4>
              <p className="text-sm opacity-90">AI predicts ride availability and suggests best times to travel</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

