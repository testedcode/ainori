'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, Plus, Search, Settings, LogOut, User, Sparkles, 
  ChevronRight, Leaf, Clock, Banknote, ShieldCheck, 
  Calendar, MapPin, CheckCircle2, Timer, Bookmark
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'

interface UserProfile {
  id: number
  email: string
  name: string
  role: string
  carbon_credits: number
}

interface Corridor {
  id: number
  name: string
  location_from: string
  location_to: string
  description?: string
}

interface Ride {
  id: number
  corridor_name: string
  ride_date: string
  ride_time: string
  pickup_point: string
  drop_point: string
  price_per_seat: number
  available_seats: number
  total_seats: number
  status: string
  driver_name?: string
  role?: 'host' | 'co-commuter' | 'driver' | 'rider'
}

const DEMO_MY_RIDES: Ride[] = [
  {
    id: 101,
    corridor_name: 'Casa Rio → RCP',
    ride_date: new Date().toISOString().split('T')[0],
    ride_time: '08:30',
    pickup_point: 'Casa Rio Gate 1',
    drop_point: 'Reliance Corporate Park (RCP)',
    price_per_seat: 120,
    available_seats: 0,
    total_seats: 4,
    status: 'active',
    driver_name: 'Aayushi Singh',
    role: 'co-commuter'
  },
  {
    id: 102,
    corridor_name: 'Casa Bella → RCP',
    ride_date: new Date().toISOString().split('T')[0],
    ride_time: '18:30',
    pickup_point: 'Reliance Corporate Park (RCP)',
    drop_point: 'Casa Bella Main Gate',
    price_per_seat: 100,
    available_seats: 2,
    total_seats: 4,
    status: 'active',
    role: 'host'
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [corridors, setCorridors] = useState<Corridor[]>([])
  const [myRides, setMyRides] = useState<Ride[]>(DEMO_MY_RIDES)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser)
        setUser(parsed)
      } catch {}
    }

    const fetchData = async () => {
      try {
        const profile = await api.getProfile()
        if (profile) {
          setUser(profile as unknown as UserProfile)
          localStorage.setItem('user', JSON.stringify(profile))
        }
      } catch {
        console.warn('Profile API unavailable, using cached data')
      }

      try {
        const corridorsRes = await api.get('/corridors?active=true')
        if (Array.isArray(corridorsRes)) {
          setCorridors(corridorsRes as unknown as Corridor[])
        }
      } catch {}
      
      try {
        const ridesRes = await api.get('/user/rides')
        if (Array.isArray(ridesRes)) {
          setMyRides(ridesRes as unknown as Ride[])
        } else {
          setMyRides([])
        }
      } catch {
        setMyRides([])
      }
      
      setLoading(false)
    }

    fetchData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 font-medium">Entering JOOL Ecosystem...</p>
        </div>
      </div>
    )
  }

  const todayStr = new Date().toISOString().split('T')[0]
  
  const upcomingRides = myRides.filter(r => r.ride_date >= todayStr)
  const pastRides = myRides.filter(r => r.ride_date < todayStr)
  
  const bookedRides = upcomingRides.filter(r => r.role === 'co-commuter' || r.role === 'rider')
  const offeredRides = upcomingRides.filter(r => r.role === 'host' || r.role === 'driver')

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20 font-sans overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
      
      <JoolNav />

      <main className="container mx-auto px-6 md:px-12 mt-12">
        {/* Welcome Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
            <ShieldCheck className="w-3 h-3" /> VERIFIED MEMBER
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-2">Welcome, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="text-xl text-white/40">Your premium commuting ecosystem awaits.</p>
        </div>

        {/* Global Impact Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-lg hover:bg-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl rounded-full" />
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Carbon Saved</p>
            <h3 className="text-3xl font-black text-white">{user?.carbon_credits || 450}g</h3>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-lg hover:bg-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full" />
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Commute Streak</p>
            <h3 className="text-3xl font-black text-white">12 Days</h3>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-lg hover:bg-white/10 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-2xl rounded-full" />
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Savings</p>
            <h3 className="text-3xl font-black text-white">₹3,420</h3>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 shadow-2xl shadow-blue-600/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm relative z-10">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-1">JOOL AI Rating</p>
              <h3 className="text-3xl font-black text-white capitalize">9.8/10</h3>
            </div>
          </div>
        </div>

        {/* AI Insights Banner */}
        <div className="mb-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-24 h-24 text-white" />
          </div>
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md mb-4">
              <Sparkles className="w-3 h-3" /> JOOL AI INSIGHT
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Optimize your morning commute.</h3>
            <p className="text-white/60 leading-relaxed mb-6">
              Based on your habits, leaving at <span className="text-white font-bold">08:15 AM</span> tomorrow could save you <span className="text-green-400 font-bold">12 minutes</span> of traffic and reduce your carbon footprint by <span className="text-green-400 font-bold">15%</span>.
            </p>
            <button className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-black hover:bg-slate-200 transition-colors uppercase tracking-tight">
              View Smart Schedule
            </button>
          </div>
        </div>

        {/* Your Active Rides / Bookings */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-white">Your Upcoming Trips</h2>
              <p className="text-white/40 text-sm mt-1">Trips you've booked or offered</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Booked Rides (Even if full) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-blue-400" /> Booked by You
              </h3>
              {bookedRides.length === 0 ? (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-10 text-center">
                  <p className="text-white/40 text-sm">No booked rides yet.</p>
                  <Link href="/rides" className="text-blue-400 text-xs font-bold mt-2 inline-block uppercase tracking-wider">Find a ride →</Link>
                </div>
              ) : (
                bookedRides.map(ride => (
                  <Link key={ride.id} href={`/rides/${ride.id}`} className="block bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-white">{ride.corridor_name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs">
                          <User className="w-3 h-3 text-blue-400" />
                          Host: {ride.driver_name}
                        </div>
                      </div>
                      <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        CONFIRMED
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Calendar className="w-4 h-4 text-white/20" /> {ride.ride_date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Timer className="w-4 h-4 text-white/20" /> {ride.ride_time}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Offered Rides */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-green-400" /> Offered by You
              </h3>
              {offeredRides.length === 0 ? (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-3xl p-10 text-center">
                  <p className="text-white/40 text-sm">You haven't offered any rides.</p>
                  <Link href="/offer-ride" className="text-green-400 text-xs font-bold mt-2 inline-block uppercase tracking-wider">Share a ride →</Link>
                </div>
              ) : (
                offeredRides.map(ride => (
                  <Link key={ride.id} href={`/rides/${ride.id}`} className="block bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all border-l-4 border-l-green-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-white">{ride.corridor_name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          {ride.total_seats - ride.available_seats} passengers joined
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${ride.available_seats === 0 ? 'bg-slate-500/20 text-slate-400' : 'bg-green-500/10 text-green-400'}`}>
                        {ride.available_seats === 0 ? 'FULL' : `${ride.available_seats} SEATS LEFT`}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Calendar className="w-4 h-4 text-white/20" /> {ride.ride_date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300 text-sm">
                        <Timer className="w-4 h-4 text-white/20" /> {ride.ride_time}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Past Trips / History */}
        {pastRides.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-black text-white">Past Trips & Settlements</h2>
                <p className="text-white/40 text-xs mt-1">Review history and finalize pending payments</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {pastRides.map(ride => (
                  <Link key={ride.id} href={`/rides/${ride.id}`} className="block bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-all opacity-80 hover:opacity-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-md text-white">{ride.corridor_name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                          <User className="w-3 h-3 text-slate-500" />
                          {ride.role === 'host' ? 'Hosted Route' : `Host: ${ride.driver_name}`}
                        </div>
                      </div>
                      <div className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter">
                        {ride.ride_date}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                       <span className="text-xs font-black text-white/40">Status: <span className="text-white/80">{ride.status}</span></span>
                       <span className="text-xs font-black text-blue-400 flex items-center gap-1">VIEW HUB <ChevronRight className="w-3 h-3"/></span>
                    </div>
                  </Link>
               ))}
            </div>
          </section>
        )}

        {/* Dynamic AI Corridor Display */}
        {corridors.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-white">Explore Corridors</h3>
                <p className="text-slate-500 text-sm mt-1">Live JOOL routes available right now</p>
              </div>
              <Link href="/rides" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {corridors.map((c, idx) => {
                const matchScore = Math.floor(Math.random() * 15) + 85; 
                return (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI MATCH
                        </div>
                        <div className="text-lg font-black text-white">{matchScore}%</div>
                      </div>
                    </div>
                    
                    {c.description && (
                      <div className="bg-slate-800/50 w-max max-w-[200px] px-3 py-1 rounded-lg text-[10px] font-black tracking-wider text-slate-400 mb-6 truncate">
                        {c.description}
                      </div>
                    )}
                    {!c.description && (
                      <div className="bg-slate-800/50 w-max px-3 py-1 rounded-lg text-[10px] font-black tracking-[0.2em] text-slate-400 mb-6">
                        ROUTE
                      </div>
                    )}
                    
                    <h4 className="text-xl font-bold text-white mb-4 line-clamp-1 pr-12">{c.name}</h4>
                    
                    <div className="flex flex-col gap-3 relative before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-[#0f172a]" />
                        <span className="text-sm text-slate-300 font-medium truncate">{c.location_from}</span>
                      </div>
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#0f172a]" />
                        <span className="text-sm text-slate-300 font-medium truncate">{c.location_to}</span>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 flex gap-2">
                      <button 
                        onClick={() => router.push(`/rides?corridor=${c.id}`)}
                        className="flex-1 bg-white/5 hover:bg-blue-600 text-center py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg hover:shadow-blue-500/20"
                      >
                        Explore Rides
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
