'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Car, Users, MapPin, TrendingUp, Lock, CheckCircle, Sparkles } from 'lucide-react'
import { api } from '@/lib/api'

export default function HomePage() {
  const [stats, setStats] = useState({
    ridesToday: 0,
    ridesTakenToday: 0,
    usersOnline: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch live stats
    const fetchStats = async () => {
      try {
        const data = await api.get('/stats')
        setStats(data as any)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">cpool.ai</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <h2 className="text-4xl font-bold text-gray-900">AI-Powered Car Pooling</h2>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with commuters in your corridor. Save money, reduce carbon footprint, and make your daily commute smarter.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/offer-ride" className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Offer a Ride
          </Link>
          <Link href="/find-ride" className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
            Find a Ride
          </Link>
        </div>
      </section>

      {/* Live Stats */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.ridesToday}</div>
            <div className="text-gray-600">Rides Today</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.ridesTakenToday}</div>
            <div className="text-gray-600">Rides Taken Today</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.usersOnline}</div>
            <div className="text-gray-600">Users Online</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Register & Choose Corridor</h3>
            <p className="text-gray-600">Sign up and get assigned to corridors in your city. Register your vehicle to offer rides.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Offer or Request</h3>
            <p className="text-gray-600">Offer a ride in your corridor or request a seat in an available ride. Connect with commuters.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ride & Earn Credits</h3>
            <p className="text-gray-600">Complete your ride, make payments, and earn carbon credits for sustainable commuting.</p>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Available Cities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Mumbai</h3>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-gray-600 mb-4">Active - Start pooling now!</p>
            <Link href="/corridors?city=mumbai" className="text-blue-600 hover:underline">
              View Corridors →
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300 opacity-75">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Pune</h3>
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Coming Soon</p>
            <span className="text-gray-400">Locked</span>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-300 opacity-75">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Bangalore</h3>
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-4">Coming Soon</p>
            <span className="text-gray-400">Locked</span>
          </div>
        </div>
      </section>

      {/* Mumbai Corridors Showcase */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Popular Mumbai Corridors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Powai → BKC', 'Andheri → Bandra', 'Thane → Powai', 'Goregaon → Andheri', 'Borivali → Andheri', 'Navi Mumbai → BKC'].map((corridor) => (
            <div key={corridor} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">{corridor}</h3>
              </div>
              <p className="text-sm text-gray-600">Active corridor</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-6 h-6" />
            <h3 className="text-xl font-bold">cpool.ai</h3>
          </div>
          <p className="text-center text-gray-400">Sustainable commuting made easy</p>
        </div>
      </footer>
    </div>
  )
}

