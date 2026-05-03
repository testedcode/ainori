'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, Plus, Search, Settings, LogOut, User, Sparkles, 
  ChevronRight, Leaf, Clock, Banknote, ShieldCheck, 
  Calendar, MapPin, CheckCircle2, Timer, Bookmark, Users, Zap, AlertCircle,
  Building2, Home, ArrowRight, Crown
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'
import NotificationManager from '../components/NotificationManager'

const fmtTime = (raw: string) => raw ? raw.slice(0, 5) : '--:--'
const fmtDate = (raw: string) => {
  if (!raw) return ''
  const d = new Date(raw.includes('T') ? raw : raw + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const OFFICE_KEYWORDS = ['rcp', 'reliance', 'jio', 'mbp', 'mindspace', 'tc', 'ghansoli', 'office']

interface UserProfile {
  id: number
  email: string
  name: string
  role: string
  carbon_credits: number
  avatar_url?: string
  approved?: boolean
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
  user_approved?: boolean
  user_avatar_url?: string
  confirmed_riders?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number }[]
  pending_requests?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number; created_at: string }[]
  vehicle_make?: string
  vehicle_model?: string
  vehicle_number?: string
  vehicle_image_url?: string
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
  const handleMarkAtSpot = async (rideId: number) => {
    try {
      await api.post(`/rides/${rideId}/messages`, { message: "I'm at the pickup spot! 📍" })
      toast.success("Host notified: You're at the spot!")
      // Refresh to update UI if needed
    } catch { toast.error('Failed to send notification') }
  }

  const handleMarkComplete = async (rideId: number) => {
    try {
      await api.put(`/rides/${rideId}/payments/${user?.id}`, { rider_status: 'done' })
      toast.success("Ride marked as complete!")
      // Refresh
      const ridesRes = await api.get('/user/rides')
      if (Array.isArray(ridesRes)) setMyRides(ridesRes as unknown as Ride[])
    } catch { toast.error('Update failed') }
  }

  const handleMarkPayment = async (rideId: number) => {
    try {
      // For dashboard quick-action, we assume marking rider_status as done is enough
      // or we can redirect to the ride detail page for full payment flow
      router.push(`/rides/${rideId}?action=payment`)
    } catch { }
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
  
  // IST-aware yesterday cutoff — only show access requests for rides from yesterday onwards
  const istYesterday = new Date(Date.now() + 5.5 * 3600 * 1000 - 86400000).toISOString().slice(0, 10)
  const relevantRequests = myRequests.filter(r => {
    if (r.status !== 'pending' && r.status !== 'accepted') return false
    const rideDate = (r.ride_date || '').split('T')[0]
    return rideDate >= istYesterday
  })
  
  // Sort corridors based on time of day (Heuristic: To Office in morning, To Home in evening)
  const sortedCorridors = [...corridors].sort((a, b) => {
    const aToOffice = a.name.toLowerCase().includes('→ rcp') || a.location_to.toLowerCase() === 'rcp'
    const bToOffice = b.name.toLowerCase().includes('→ rcp') || b.location_to.toLowerCase() === 'rcp'
    if (isMorning) return aToOffice ? -1 : 1
    return aToOffice ? 1 : -1
  })
  
  const upcomingRides = myRides.filter(r => r.ride_date >= todayStr && r.status !== 'cancelled')
  const pastRides = myRides.filter(r => r.ride_date < todayStr || r.status === 'cancelled')
  
  const bookedRides = upcomingRides.filter(r => (r.role === 'co-commuter' || r.role === 'rider'))
  const offeredRides = upcomingRides.filter(r => (r.role === 'host' || r.role === 'driver'))

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-20 font-sans overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[800px] bg-blue-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
      
      <JoolNav />

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        <NotificationManager />

        {/* ─── DYNAMIC AUTHORIZATION HERO ────────────────────────────────────────── */}
        {user?.approved ? (
          <section className="relative mb-20 overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
             <div className="bg-gradient-to-br from-blue-600/30 via-white/[0.02] to-transparent border border-white/20 rounded-[4rem] p-12 md:p-20 backdrop-blur-3xl shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Background Visuals */}
                <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                   <ShieldCheck className="w-96 h-96 text-white" />
                </div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
                   {/* Left: Identity Briefing */}
                   <div className="lg:col-span-7">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                         <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                         SYSTEM AUTHORIZED
                      </div>
                      <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 italic uppercase leading-[0.85]">
                         COMMAND<br />THE FLOW.
                      </h1>
                      <div className="flex items-center gap-6 mb-12">
                         <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Clearance Level</p>
                            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">LEVEL 3 EXECUTIVE</p>
                         </div>
                         <div className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl">
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Network Integrity</p>
                            <p className="text-xs font-black text-green-400 uppercase tracking-widest">ENCRYPTED NODE</p>
                         </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 mb-12">
                         <Link href="/offer-ride" className="px-12 py-6 bg-white text-black rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl">
                            INITIALIZE FLEET
                         </Link>
                         <Link href="/rides" className="px-12 py-6 bg-white/5 border border-white/20 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                            SYNC CORRIDORS
                         </Link>
                      </div>

                      {/* Privilege Showcase */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-10 border-t border-white/5">
                         {[
                           { label: 'Priority Match', status: 'Active', icon: Zap, color: 'text-amber-400' },
                           { label: 'Executive Fleet', status: 'Ready', icon: Car, color: 'text-blue-400' },
                           { label: 'Private Sync', status: 'Enabled', icon: ShieldCheck, color: 'text-green-400' }
                         ].map((p, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
                              <div>
                                 <p className="text-[7px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">{p.label}</p>
                                 <p className="text-[9px] font-black text-white uppercase tracking-widest">{p.status}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Right: Holographic Biometric Node */}
                   <div className="lg:col-span-5 relative">
                      <div className="relative">
                         <div className="absolute -inset-10 bg-blue-500/10 blur-[60px] rounded-full animate-pulse" />
                         <div className="bg-white/[0.03] border border-white/10 rounded-[4rem] p-12 backdrop-blur-2xl relative z-10 shadow-2xl">
                            <div className="flex flex-col items-center text-center">
                               <div className="relative mb-8">
                                  <div className="absolute -inset-4 border-2 border-dashed border-blue-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                                  <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl relative overflow-hidden group/avatar">
                                     {user?.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-[2.2rem]" />
                                     ) : (
                                        <div className="w-full h-full rounded-[2.2rem] bg-slate-900 flex items-center justify-center font-black text-4xl text-white/10">
                                           {user?.name?.[0]}
                                        </div>
                                     )}
                                     <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-2xl border-4 border-[#1e293b] flex items-center justify-center shadow-xl">
                                     <ShieldCheck className="w-5 h-5 text-white" />
                                  </div>
                               </div>
                               
                               <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{user?.name}</h4>
                               <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10">Elite Node Identified</p>
                               
                               <div className="w-full grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
                                  <div className="text-left">
                                     <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Priority</p>
                                     <p className="text-xl font-black text-white">98.4%</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                                     <p className="text-xs font-black text-green-400 uppercase tracking-widest">AUTHORIZED</p>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        ) : (
          <section className="relative mb-20 overflow-hidden">
             <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-12 md:p-16 relative overflow-hidden group">
                <div className="max-w-2xl">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                      <Sparkles className="w-3.5 h-3.5" /> AUTHORIZATION PENDING
                   </div>
                   <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6 uppercase italic">
                      Welcome, {user?.name?.split(' ')[0] || 'Member'}.
                   </h1>
                   <p className="text-lg text-white/40 mb-10 leading-relaxed uppercase tracking-widest">
                      Your high-fidelity corridor access is being processed. Complete your profile to unlock elite fleet privileges.
                   </p>
                   <div className="flex items-center gap-4">
                      <Link href="/profile" className="px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
                         COMPLETE PROFILE
                      </Link>
                      <Link href="/rides" className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                         BROWSE RIDES
                      </Link>
                   </div>
                </div>
                <div className="absolute top-0 right-0 p-16 opacity-[0.02] group-hover:scale-105 transition-transform duration-1000">
                   <Car className="w-80 h-80 text-white" />
                </div>
             </div>
          </section>
        )}

        {/* ─── GLOBAL IMPACT & NETWORK STATS ────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
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
        </section>

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
        {relevantRequests.length > 0 && (
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
              {relevantRequests.slice(0, 6).map(req => (

                <Link key={req.id} href={`/rides/${req.ride_id}`}
                  className={`group block border rounded-[2.5rem] p-8 hover:scale-[1.02] transition-all relative overflow-hidden ${
                    req.status === 'accepted' ? 'bg-green-500/5 border-green-500/20 shadow-[0_20px_40px_rgba(34,197,94,0.05)]'
                    : req.status === 'rejected' ? 'bg-white/[0.02] border-white/5 opacity-50'
                    : 'bg-white/[0.03] border-white/10'
                  }`}>
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      req.ride_status === 'cancelled' || req.status === 'cancelled' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                      : req.status === 'accepted' ? 'bg-green-500/20 border-green-500/30 text-green-400'
                      : req.status === 'rejected' ? 'bg-white/5 border-white/10 text-white/30'
                      : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    }`}>
                      {req.ride_status === 'cancelled' || req.status === 'cancelled' ? 'Cancelled' : req.status === 'accepted' ? 'Authorized' : req.status === 'rejected' ? 'Denied' : 'In Progress'}
                    </span>
                    <span className="font-mono text-white/20 text-[10px] font-black uppercase tracking-widest">Node #{req.ride_id}</span>
                  </div>

                  <h4 className="font-black text-white text-xl mb-2 italic uppercase">{req.corridor_name || 'Corridor Node'}</h4>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-[12px] font-black text-white uppercase tracking-widest">{fmtDate(req.ride_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                      <Clock className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span className="text-[12px] font-black text-white tracking-wider">{fmtTime(req.ride_time)}</span>
                    </div>
                    {req.direction && (
                      <span className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        req.direction === 'to_home'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {req.direction === 'to_home' ? '🏠 To Home' : '🏢 To Office'}
                      </span>
                    )}
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
                   <div key={ride.id} className="block bg-white/[0.03] border border-white/10 rounded-[4rem] p-12 hover:bg-white/[0.06] transition-all relative overflow-hidden group shadow-2xl">
                     <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
                        <Bookmark className="w-48 h-48 text-white" />
                     </div>
                     
                     {/* Background Vehicle Glow */}
                     {ride.vehicle_image_url && (
                        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
                           <img src={ride.vehicle_image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                     )}
                     
                     <div className="flex justify-between items-start mb-10 relative z-10">
                        <Link href={`/rides/${ride.id}`} className="flex-1">
                           <h4 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-6 hover:text-blue-400 transition-colors leading-none">{ride.corridor_name}</h4>
                           
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 p-1.5 pr-6 bg-white/5 border border-white/10 rounded-full w-fit">
                                 <div className="w-12 h-12 rounded-full border-2 border-blue-500/50 overflow-hidden bg-slate-900 shadow-xl">
                                    {ride.user_avatar_url ? (
                                       <img src={ride.user_avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-sm font-black">{ride.driver_name?.[0]}</div>
                                    )}
                                 </div>
                                 <div>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] leading-none mb-1">Host Node</p>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{ride.driver_name}</p>
                                 </div>
                              </div>

                              {/* Vehicle Detail Badge */}
                              {(ride.vehicle_make || ride.vehicle_number) && (
                                 <div className="flex items-center gap-3 p-1.5 pr-6 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-green-500/30 flex items-center justify-center text-xl shadow-xl">
                                       {ride.vehicle_image_url ? (
                                          <img src={ride.vehicle_image_url} className="w-full h-full object-cover rounded-full" />
                                       ) : '🚗'}
                                    </div>
                                    <div>
                                       <p className="text-[8px] font-black text-green-400/60 uppercase tracking-[0.3em] leading-none mb-1">Vehicle Signal</p>
                                       <p className="text-xs font-black text-white uppercase tracking-widest">
                                          {ride.vehicle_make} {ride.vehicle_model}
                                          <span className="text-green-400/40 mx-2">|</span>
                                          <span className="text-[10px] font-mono text-green-400">{ride.vehicle_number || 'PRO-NODE'}</span>
                                       </p>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </Link>

                        <div className="flex flex-col items-end gap-4">
                           <div className="px-6 py-2 bg-blue-600 text-white border border-blue-400/30 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                              CONFIRMED
                           </div>
                           <div className="text-6xl font-black text-white italic tracking-tighter drop-shadow-2xl">{fmtTime(ride.ride_time)}</div>
                        </div>
                     </div>

                     <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10 mb-10">
                        <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-lg font-black uppercase tracking-widest text-white border border-white/10 shadow-xl">
                           <Calendar className="w-5 h-5 text-blue-400" /> {fmtDate(ride.ride_date)}
                        </div>
                        <div className={`flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl text-lg font-black uppercase tracking-widest border border-white/10 shadow-xl ${
                           (ride.direction === 'to_home' || (ride.ride_time >= '12:00' && !ride.direction)) ? 'text-green-400' : 'text-blue-400'
                        }`}>
                           {(ride.direction === 'to_home' || (ride.ride_time >= '12:00' && !ride.direction)) ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                           {(ride.direction === 'to_home' || (ride.ride_time >= '12:00' && !ride.direction)) ? 'Return Home' : 'To Office'}
                        </div>
                     </div>

                     {/* QUICK ACTIONS */}
                     <div className="grid grid-cols-3 gap-3 relative z-10 pt-6 border-t border-white/5">
                        <button 
                          onClick={() => handleMarkAtSpot(ride.id)}
                          className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all group/btn"
                        >
                           <MapPin className="w-4 h-4 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
                           <span className="text-[8px] font-black uppercase tracking-widest">At Spot</span>
                        </button>
                        <button 
                          onClick={() => handleMarkComplete(ride.id)}
                          className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-green-500/10 hover:border-green-500/30 transition-all group/btn"
                        >
                           <CheckCircle2 className="w-4 h-4 text-green-400 group-hover/btn:scale-110 transition-transform" />
                           <span className="text-[8px] font-black uppercase tracking-widest">Finish</span>
                        </button>
                        <button 
                          onClick={() => handleMarkPayment(ride.id)}
                          className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group/btn"
                        >
                           <Banknote className="w-4 h-4 text-purple-400 group-hover/btn:scale-110 transition-transform" />
                           <span className="text-[8px] font-black uppercase tracking-widest">Payment</span>
                        </button>
                     </div>
                  </div>
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
                offeredRides.map(ride => {
                  const isToHome = ride.direction === 'to_home' || (ride.ride_time >= '12:00' && !ride.direction)
                  const pendingCount = ride.pending_requests?.length || 0
                  const confirmedRiders = ride.confirmed_riders || []
                  const riderOccupancy = confirmedRiders.reduce((acc, curr) => acc + (curr.seats_requested || 1), 0)
                  const riderSlots = (ride.total_seats || 4) - 1
                  const fillPct = riderSlots > 0 ? Math.round((riderOccupancy / riderSlots) * 100) : 0
                  return (
                    <div key={ride.id} className={`border rounded-[2.5rem] p-8 transition-all relative overflow-hidden group ${
                      pendingCount > 0
                        ? 'bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                    }`}>

                      {/* ROW 1: Time + Pending badge + Direction + Hosting */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-black italic text-white leading-none tracking-tighter">{fmtTime(ride.ride_time)}</span>
                          {pendingCount > 0 && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-xl text-[9px] font-black text-amber-400 uppercase tracking-widest animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              {pendingCount} Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            isToHome
                              ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                              : 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                          }`}>
                            {isToHome ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                            {isToHome ? 'To Home' : 'To Office'}
                          </span>
                          <span className="px-3 py-1.5 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest">Hosting</span>
                        </div>
                      </div>

                      {/* ROW 2: Date */}
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-3 h-3 text-white/30" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{fmtDate(ride.ride_date)}</span>
                      </div>

                      {/* ROW 3: Route pill */}
                      <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-gradient-to-r from-blue-500/10 via-white/[0.02] to-green-500/10 border border-white/12 rounded-2xl">
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_6px_rgba(96,165,250,0.8)]" />
                        <span className="text-[11px] font-black text-white uppercase tracking-wide truncate flex-1">{ride.pickup_point}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-white/25 shrink-0" />
                        <span className="text-[11px] font-black text-white uppercase tracking-wide truncate flex-1 text-right">{ride.drop_point}</span>
                        <span className="w-2 h-2 rounded-full bg-green-400 shrink-0 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                      </div>

                      {/* ROW 4: Seat fill */}
                       <div className="flex items-center gap-4 mb-5">
                         <div className="flex items-center gap-2">
                           {/* Host / Pilot Seat */}
                           <div className="relative group/host">
                              <div className="w-10 h-10 rounded-xl border-2 border-amber-400 bg-slate-900 overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                                {ride.user_avatar_url 
                                  ? <img src={ride.user_avatar_url} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-amber-400">{ride.driver_name?.[0]}</div>}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#0f172a] flex items-center justify-center">
                                 <Crown className="w-2 h-2 text-black" />
                              </div>
                           </div>

                           <div className="w-px h-6 bg-white/10 mx-1" />

                           {/* Rider Seats */}
                           <div className="flex items-center gap-1.5">
                             {confirmedRiders.flatMap((r: any) => Array.from({ length: r.seats_requested || 1 }).map((_, idx) => (
                               <div key={`${r.id}-${idx}`} className="w-10 h-10 rounded-xl border-2 border-green-500/40 bg-slate-800 overflow-hidden shadow-lg transition-transform hover:scale-110">
                                 {r.avatar_url
                                   ? <img src={r.avatar_url} className="w-full h-full object-cover" />
                                   : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-green-400">{r.name?.[0]}</div>}
                               </div>
                             )))}
                             {Array.from({ length: Math.max(0, riderSlots - riderOccupancy) }).map((_, i) => (
                               <div key={`empty-${i}`} className="w-10 h-10 rounded-xl border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center">
                                 <User className="w-4 h-4 text-white/5" />
                               </div>
                             ))}
                           </div>
                         </div>
                         <div className="ml-auto flex flex-col items-end">
                           <div className="text-right">
                             <p className="text-4xl font-black text-white italic tracking-tighter leading-none">
                               {riderOccupancy}
                               <span className="text-[10px] font-black text-white/20 uppercase tracking-widest not-italic ml-2">/ {riderSlots} {riderOccupancy === riderSlots ? 'FULL' : 'FILLED'}</span>
                             </p>
                           </div>
                           <div className="w-full min-w-[8rem] h-2 bg-white/5 rounded-full mt-2 overflow-hidden border border-white/5">
                             <div 
                               className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-1000"
                               style={{ width: `${fillPct}%` }}
                             />
                           </div>
                         </div>
                       </div>

                      {/* ROW 5: Action */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <button 
                          onClick={() => handleMarkAtSpot(ride.id)}
                          className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                          <MapPin className="w-3.5 h-3.5 text-cyan-400" /> At Pickup
                        </button>
                        <button 
                          onClick={() => handleMarkComplete(ride.id)}
                          className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-green-500/10 hover:border-green-500/30 transition-all text-[9px] font-black uppercase tracking-widest"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Finish
                        </button>
                      </div>

                      {pendingCount > 0 ? (
                        <Link href={`/rides/${ride.id}`} className="block w-full py-4 bg-amber-500 text-black rounded-[1.5rem] text-center text-[10px] font-black uppercase tracking-[0.3em] hover:bg-amber-400 transition-all shadow-xl">
                          Process {pendingCount} Clearance{pendingCount > 1 ? 's' : ''}
                        </Link>
                      ) : (
                        <Link href={`/rides/${ride.id}`} className="block w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-[1.5rem] text-center text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                          Command Center ↗
                        </Link>
                      )}
                    </div>
                  )
                })
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
