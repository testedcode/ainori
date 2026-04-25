'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, Plus, Search, Settings, LogOut, User, Sparkles, 
  ChevronRight, Leaf, Clock, Banknote, ShieldCheck, 
  Calendar, MapPin, CheckCircle2, Timer, Bookmark, Users, Zap, AlertCircle
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'

const OFFICE_KEYWORDS = ['rcp', 'reliance', 'jio', 'mbp', 'mindspace', 'tc', 'ghansoli', 'office']

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
  direction?: 'to_office' | 'to_home'
  confirmed_riders?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number }[]
  pending_requests?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number; created_at: string }[]
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
  const [myRides, setMyRides] = useState<Ride[]>([])
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [stats, setStats] = useState({ rides_today: 0, live_users: 0, carbon_saved: '0', money_saved: '0', time_saved: '0' })

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
      } catch (e: any) {
        const status = e?.response?.status
        if (status === 401 || status === 503) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          toast.error('Session validation failed. Please login again.')
          router.push('/login')
          return
        }
        console.warn('Profile API unavailable, using cached data')
      }

      try {
        const corridorsRes = await api.get('/corridors?active=true')
        if (Array.isArray(corridorsRes)) {
          setCorridors(corridorsRes as unknown as Corridor[])
        }
      } catch {}

      try {
        const s = await api.get('/stats') as any
        if (s) setStats(s)
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

      try {
        const reqRes = await api.get('/user/requests')
        if (Array.isArray(reqRes)) setMyRequests(reqRes as any[])
      } catch {}

      setLoading(false)
    }

    fetchData()
  }, [router])

  const handleUpdateStatus = async (rideId: number, requestId: number, status: 'accepted' | 'rejected') => {
    try {
      await api.put(`/rides/${rideId}/requests/${requestId}`, { status })
      toast.success(status === 'accepted' ? 'Rider confirmed!' : 'Request declined.')
      // Refresh data
      const ridesRes = await api.get('/user/rides')
      if (Array.isArray(ridesRes)) setMyRides(ridesRes as unknown as Ride[])
    } catch { toast.error('Update failed') }
  }

  const handleRejectAll = async (rideId: number) => {
    try {
      await api.post(`/rides/${rideId}/reject-all`)
      toast.success('All pending requests cleared.')
      const ridesRes = await api.get('/user/rides')
      if (Array.isArray(ridesRes)) setMyRides(ridesRes as unknown as Ride[])
    } catch { toast.error('Action failed') }
  }

  const handleClearAllRequests = async () => {
    try {
      await api.post('/user/requests/cancel-all')
      toast.success('All your pending requests retracted.')
      const reqRes = await api.get('/user/requests')
      if (Array.isArray(reqRes)) setMyRequests(reqRes as any[])
    } catch { toast.error('Action failed') }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const currentHour = new Date().getHours()
  const isMorning = currentHour >= 5 && currentHour < 14
  
  // Sort corridors based on time of day (Heuristic: To Office in morning, To Home in evening)
  const sortedCorridors = [...corridors].sort((a, b) => {
    const aToOffice = a.name.toLowerCase().includes('→ rcp') || a.location_to.toLowerCase() === 'rcp'
    const bToOffice = b.name.toLowerCase().includes('→ rcp') || b.location_to.toLowerCase() === 'rcp'
    if (isMorning) return aToOffice ? -1 : 1
    return aToOffice ? 1 : -1
  })
  
  const upcomingRides = myRides.filter(r => r.ride_date >= todayStr)
  const pastRides = myRides.filter(r => r.ride_date < todayStr)
  
  const bookedRides = upcomingRides.filter(r => r.role === 'co-commuter' || r.role === 'rider')
  const offeredRides = upcomingRides.filter(r => r.role === 'host' || r.role === 'driver')

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20 font-sans overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-blue-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
      
      <JoolNav />

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* ─── EXECUTIVE COMMAND HERO ────────────────────────────────────────── */}
        <section className="relative mb-16 overflow-hidden">
           <div className="bg-gradient-to-br from-blue-600/20 via-white/[0.02] to-transparent border border-white/10 rounded-[4rem] p-12 md:p-20 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
              {/* Animated Accents */}
              <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                 <ShieldCheck className="w-96 h-96 text-white" />
              </div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
                 {/* Left: Identity Briefing */}
                 <div className="lg:col-span-7 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                       <ShieldCheck className="w-3.5 h-3.5" /> SYSTEM BRIEFING
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 italic uppercase leading-none">
                       EXECUTIVE<br />COMMAND.
                    </h1>
                    <p className="text-lg text-white/40 font-bold mb-10 uppercase tracking-widest">
                       Active Corridor Authorization: <span className="text-blue-400">FULL SECTOR ACCESS</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                       <Link href="/offer-ride" className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl">
                          Share Premium Ride
                       </Link>
                       <Link href="/find-ride" className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                          Locate Corridors
                       </Link>
                    </div>
                 </div>

                 {/* Right: Holographic Status Node */}
                 <div className="lg:col-span-5 relative">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-10 space-y-8">
                       <div className="flex items-center gap-6 pb-6 border-b border-white/5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-2xl">
                             <div className="w-full h-full rounded-[1.1rem] bg-slate-900 overflow-hidden flex items-center justify-center font-black text-xl text-white/20">
                                {user?.name?.[0]}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-xl font-black text-white uppercase italic">{user?.name}</h4>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ELITE EXECUTIVE NODE L3</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6">
                          <div>
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Network Priority</p>
                             <p className="text-2xl font-black text-blue-400">98.4%</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Status</p>
                             <p className="text-xs font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">Authorized</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Global Impact Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            { icon: Leaf, label: 'Carbon Neutrality', val: `${user?.carbon_credits || 450}g`, color: 'bg-green-500', glow: 'shadow-green-500/20' },
            { icon: Zap, label: 'Commute Velocity', val: '12 Days', color: 'bg-amber-500', glow: 'shadow-amber-500/20' },
            { icon: Banknote, label: 'Network Savings', val: '₹3,420', color: 'bg-purple-500', glow: 'shadow-purple-500/20' },
            { icon: Users, label: 'Syndicate Nodes', val: `${stats.live_users} Active`, color: 'bg-blue-600', glow: 'shadow-blue-600/20' }
          ].map((card, i) => (
            <div key={i} className={`bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/5 transition-all group relative overflow-hidden`}>
              <div className={`w-12 h-12 ${card.color}/20 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')}`} />
              </div>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em] mb-2">{card.label}</p>
              <h3 className="text-3xl font-black text-white italic">{card.val}</h3>
              <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                 <card.icon className="w-24 h-24" />
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights Node */}
        <div className="mb-20 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-white/10 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden group">
           <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg mb-8">
                 <Sparkles className="w-4 h-4" /> AI PREDICTIVE NODE
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6 uppercase italic">
                 {isMorning ? 'Optimize your morning departure.' : 'Plan your evening corridor return.'}
              </h2>
              <p className="text-xl text-white/50 font-medium leading-relaxed mb-10 italic">
                 {isMorning 
                   ? <>Exiting at <span className="text-white font-black underline decoration-blue-500 underline-offset-8">08:15 AM</span> today yields a <span className="text-green-400 font-black">12-minute</span> synchronization gain.</>
                   : <>The 06:15 PM slot is currently peaking. Confirming now secures a <span className="text-green-400 font-black">20%</span> node contribution bonus.</>
                 }
              </p>
              <button className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-xl">
                 Initialize Smart Sync
              </button>
           </div>
           <div className="absolute top-0 right-0 p-16 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-1000 group-hover:scale-110">
              <Zap className="w-96 h-96 text-white" />
           </div>
        </div>

        {/* ─── EXECUTIVE ACCESS REQUESTS (PENDING) ────────────────────────── */}
        {myRequests.length > 0 && (
          <section className="mb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Access Requests.</h2>
                {myRequests.filter(r => r.status === 'pending').length > 0 && (
                  <div className="px-3 py-1 bg-amber-500 text-black text-[10px] font-black rounded-lg uppercase tracking-widest animate-pulse">
                    {myRequests.filter(r => r.status === 'pending').length} Syncing
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6">
                <button 
                  onClick={handleClearAllRequests}
                  className="text-[10px] font-black text-red-500/50 hover:text-red-500 transition-colors uppercase tracking-[0.3em]"
                >
                  Retract All Nodes
                </button>
                <Link href="/rides" className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                   Locate More
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRequests.slice(0, 6).map(req => (
                <Link key={req.id} href={`/rides/${req.ride_id}`}
                  className={`group block border rounded-[2.5rem] p-8 hover:scale-[1.02] transition-all relative overflow-hidden ${
                    req.status === 'accepted' ? 'bg-green-500/5 border-green-500/20 shadow-[0_20px_40px_rgba(34,197,94,0.05)]'
                    : req.status === 'rejected' ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/[0.03] border-white/10'
                  }`}>
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      req.status === 'accepted' ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : req.status === 'rejected' ? 'bg-white/5 border-white/10 text-white/30'
                      : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    }`}>
                      {req.status === 'accepted' ? 'Authorized' : req.status === 'rejected' ? 'Denied' : 'In Progress'}
                    </span>
                    <span className="font-mono text-white/20 text-[10px] font-black uppercase tracking-widest">Node #{req.ride_id}</span>
                  </div>

                  <h4 className="font-black text-white text-xl mb-2 italic uppercase">{req.corridor_name || 'Corridor Node'}</h4>
                  
                  <div className="flex items-center gap-6 text-[10px] text-white/40 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{req.ride_date}</span>
                    <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />{req.ride_time}</span>
                  </div>

                  {req.status === 'accepted' && (
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Clearance Active</span>
                       <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── ACTIVE CORRIDOR ENGAGEMENTS ────────────────────────────────── */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Active Engagements.</h2>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Upcoming synchronization cycles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Booked Sections */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <Bookmark className="w-4 h-4 text-blue-500" />
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Inbound Missions</h3>
              </div>
              
              {bookedRides.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem] p-16 text-center group hover:bg-white/[0.04] transition-all">
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-widest mb-6">No inbound nodes found</p>
                  <Link href="/rides" className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Explore Corridors</Link>
                </div>
              ) : (
                bookedRides.map(ride => (
                  <Link key={ride.id} href={`/rides/${ride.id}`} className="block bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 hover:bg-white/[0.06] transition-all relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                        <Bookmark className="w-32 h-32 text-white" />
                     </div>
                     
                     <div className="flex justify-between items-start mb-8 relative z-10">
                        <div>
                           <h4 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">{ride.corridor_name}</h4>
                           <div className="flex items-center gap-3 text-[10px] font-black text-white/40 uppercase tracking-widest">
                              <User className="w-3.5 h-3.5 text-blue-500" />
                              Host Node: <span className="text-white/60">{ride.driver_name}</span>
                           </div>
                        </div>
                        <div className="px-4 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                           Confirmed
                        </div>
                     </div>

                     <div className="flex items-center gap-10 relative z-10">
                        <div className="flex items-center gap-3 text-sm font-black italic">
                           <Calendar className="w-4 h-4 text-white/20" /> {ride.ride_date}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-black italic">
                           <Timer className="w-4 h-4 text-white/20" /> {ride.ride_time}
                        </div>
                     </div>
                  </Link>
                ))
              )}
            </div>

            {/* Offered Sections */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <Car className="w-4 h-4 text-green-500" />
                 <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Outbound Fleet</h3>
              </div>

              {offeredRides.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem] p-16 text-center group hover:bg-white/[0.04] transition-all">
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-widest mb-6">No outbound nodes active</p>
                  <Link href="/offer-ride" className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-green-400 uppercase tracking-widest hover:bg-green-600 hover:text-white transition-all">Initialize Fleet</Link>
                </div>
              ) : (
                offeredRides.map(ride => (
                  <div key={ride.id} className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 hover:bg-white/[0.06] transition-all relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-10">
                        <div>
                           <h4 className="text-2xl font-black text-white italic uppercase tracking-tight mb-2">{ride.corridor_name}</h4>
                           <div className="flex items-center gap-4 text-[10px] font-black text-white/30 uppercase tracking-widest italic">
                              <span>{ride.ride_date}</span>
                              <span className="w-1 h-1 bg-white/10 rounded-full" />
                              <span>{ride.ride_time}</span>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div className="px-4 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                              Hosting
                           </div>
                           {ride.available_seats === 1 && (
                             <div className="px-3 py-1 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">
                                Critical Capacity
                             </div>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-3 mb-10">
                        {ride.confirmed_riders?.map(rider => (
                           <div key={rider.id} className="w-12 h-12 rounded-2xl border-2 border-green-500/30 bg-slate-800 overflow-hidden shadow-2xl transition-transform hover:scale-110">
                              {rider.avatar_url ? <img src={rider.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-black">{rider.name[0]}</div>}
                           </div>
                        ))}
                        {Array.from({ length: ride.available_seats }).map((_, i) => (
                           <div key={i} className="w-12 h-12 rounded-2xl border-2 border-white/5 border-dashed bg-white/5 flex items-center justify-center">
                              <User className="w-4 h-4 text-white/10" />
                           </div>
                        ))}
                     </div>

                     {ride.pending_requests && ride.pending_requests.length > 0 ? (
                        <Link href={`/rides/${ride.id}`} className="block w-full py-5 bg-amber-500 text-black rounded-[2rem] text-center text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-400 transition-all shadow-2xl">
                           Process {ride.pending_requests.length} Clearances
                        </Link>
                     ) : (
                        <Link href={`/rides/${ride.id}`} className="block w-full py-5 bg-white/5 border border-white/10 text-white/40 rounded-[2rem] text-center text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                           Command Center ↗
                        </Link>
                     )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ─── EXPLORE LIVE CORRIDORS ────────────────────────────────────── */}
        {corridors.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Live Corridors.</h3>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">High-velocity professional routes</p>
              </div>
              <Link href="/rides" className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] hover:text-white transition-all">
                Full Network View →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {sortedCorridors.slice(0, 4).map((c, idx) => {
                const matchScore = Math.floor(Math.random() * 15) + 85; 
                return (
                  <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 hover:bg-white/[0.05] transition-all relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MapPin className="w-6 h-6 text-blue-500" />
                       </div>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">AI Match</p>
                          <p className="text-lg font-black italic">{matchScore}%</p>
                       </div>
                    </div>
                    
                    <h4 className="text-xl font-black text-white mb-6 italic uppercase leading-tight line-clamp-1">{c.name}</h4>
                    
                    <div className="space-y-4 mb-10">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest truncate">{c.location_from}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest truncate">{c.location_to}</span>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => router.push(`/rides?corridor=${c.id}`)}
                      className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Sync Node
                    </button>
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
