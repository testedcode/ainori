'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, Clock, MapPin, CheckCircle2, Bookmark, 
  ChevronRight, Car, User, Zap, ArrowLeft, Loader2,
  Home, Building2, Timer, IndianRupee, MessageSquare, AlertCircle,
  ShieldCheck, Crown, Sparkles, Navigation2, Flag, Share2
} from 'lucide-react'
import { api } from '@/lib/api'
import PulseNav from '@/components/PulseNav'
import toast from 'react-hot-toast'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmtTime = (raw: string) => {
  if (!raw) return '--:--'
  if (raw.includes(':')) return raw.slice(0, 5)
  return raw
}

const fmtDate = (raw: string) => {
  if (!raw) return ''
  const date = raw.includes('T') ? raw.split('T')[0] : raw
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
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
  role?: 'host' | 'rider' | 'driver' | 'co-commuter'
  direction?: 'to_office' | 'to_home'
  user_approved?: boolean
}

interface Request {
  id: number
  ride_id: number
  corridor_name: string
  ride_date: string
  ride_time: string
  status: string
  direction?: string
}

export default function MyRidesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rides, setRides] = useState<Ride[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [selectedDate, setSelectedDate] = useState<'yesterday' | 'today' | 'tomorrow'>('today')
  const [user, setUser] = useState<any>(null)

  const istNow = new Date(Date.now() + 5.5 * 3600 * 1000)
  const istToday = istNow.toISOString().slice(0, 10)
  const istTomorrow = new Date(Date.now() + 5.5 * 3600 * 1000 + 86400000).toISOString().slice(0, 10)
  const istYesterday = new Date(Date.now() + 5.5 * 3600 * 1000 - 86400000).toISOString().slice(0, 10)

  const dateMap = {
    yesterday: istYesterday,
    today: istToday,
    tomorrow: istTomorrow
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    const usr = localStorage.getItem('user')
    if (usr) setUser(JSON.parse(usr))

    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ridesRes, reqRes] = await Promise.all([
        api.get('/user/rides'),
        api.get('/user/requests')
      ])
      if (Array.isArray(ridesRes)) setRides(ridesRes as Ride[])
      if (Array.isArray(reqRes)) setRequests(reqRes as Request[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = (e: React.MouseEvent, ride: Ride) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/rides/${ride.id}`
    const text = `Join my ride on Pulse: ${ride.corridor_name} at ${fmtTime(ride.ride_time)}! 🚀`
    
    if (navigator.share) {
      navigator.share({ title: 'Pulse Ride', text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const getTargetDate = dateMap[selectedDate]
  
  const filteredRides = rides.filter(r => (r.ride_date || '').split('T')[0] === getTargetDate && r.status !== 'cancelled')
  const filteredRequests = requests.filter(r => (r.ride_date || '').split('T')[0] === getTargetDate && r.status === 'pending')

  const totalActive = filteredRides.length + filteredRequests.length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32 overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-100/50 blur-[150px] -z-10 pointer-events-none" />
      
      <PulseNav />

      <main className="max-w-4xl mx-auto px-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-blue-500/20">
              <Bookmark className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">My Commutes</h1>
              <p className="text-slate-900/20 text-[10px] font-black uppercase tracking-widest mt-1">Active & Requested Trips</p>
            </div>
          </div>
          <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all active:scale-95">
             <Timer className={`w-5 h-5 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Glossy Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-[2.5rem] mb-12 backdrop-blur-xl">
           {(['yesterday', 'today', 'tomorrow'] as const).map(d => (
             <button
               key={d}
               onClick={() => setSelectedDate(d)}
               className={`flex-1 py-3.5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                 selectedDate === d 
                   ? 'bg-blue-600 text-white shadow-[0_10px_20px_rgba(255,255,255,0.1)] scale-100' 
                   : 'text-slate-900/20 hover:text-slate-900/40'
               }`}
             >
               {d}
             </button>
           ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing Rides...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {totalActive === 0 && (
              <div className="py-24 bg-white border border-slate-200 border-dashed rounded-[3.5rem] text-center">
                 <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <Car className="w-10 h-10 text-slate-900/10" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900/30 uppercase italic">No commutes found</h3>
                 <p className="text-[10px] text-slate-900/10 font-black uppercase tracking-widest mt-2">Check another date or book a new ride</p>
                 <Link href="/rides" className="inline-block mt-8 px-10 py-4 bg-blue-600 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl">Find Rides</Link>
              </div>
            )}

            {/* Confirmed / Active Rides */}
            {filteredRides.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                   <h2 className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em]">Confirmed & Active</h2>
                </div>
                <div className="grid gap-6">
                  {filteredRides.map(ride => (
                    <Link 
                      key={ride.id} 
                      href={`/rides/${ride.id}`}
                      className="group flex flex-col bg-white border border-slate-200 rounded-[2rem] hover:border-slate-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.05)] transition-all overflow-hidden relative"
                    >
                       <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:scale-110 group-hover:opacity-5 transition-all pointer-events-none">
                          <Zap className="w-32 h-32 text-slate-900" />
                       </div>
                       
                       <div className="p-5 md:p-6 pb-4">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                             <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                  ride.role === 'host' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                                }`}>
                                  {ride.role === 'host' ? 'Hosting' : 'Confirmed'}
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                  ride.direction === 'to_home' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                                }`}>
                                  {ride.direction === 'to_home' ? '🏠 To Home' : '🏢 To Office'}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-slate-900/30 group-hover:text-slate-900 transition-colors">
                                <span className="text-[9px] font-black uppercase tracking-widest">Manage Trip</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                             </div>
                          </div>

                          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                             <div>
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3 group-hover:text-blue-600 transition-colors uppercase italic">
                                   {ride.corridor_name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                                   <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="text-xs font-black text-slate-900">{fmtTime(ride.ride_time)}</span>
                                   </div>
                                   <div className="flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{ride.pickup_point}</span>
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 pr-4 rounded-full w-max mt-2 md:mt-0 relative z-10">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[12px] font-black text-white shadow-inner">
                                   {ride.driver_name?.[0] || 'U'}
                                </div>
                                <div className="flex flex-col justify-center">
                                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{ride.role === 'host' ? 'Riders' : 'Host'}</span>
                                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{ride.driver_name || 'Verified Member'}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <div className="px-5 py-3 md:px-6 md:py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full animate-pulse ${ride.status === 'completed' ? 'bg-green-500' : ride.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'}`} />
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: <span className="text-slate-900">{ride.status}</span></span>
                          </div>
                          <button 
                            onClick={(e) => handleShare(e, ride)}
                            className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors relative z-10"
                          >
                             <Share2 className="w-3.5 h-3.5" /> Share
                          </button>
                       </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Pending Requests */}
            {filteredRequests.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                   <h2 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">Requested (Pending)</h2>
                </div>
                <div className="grid gap-6">
                  {filteredRequests.map(req => (
                    <Link 
                      key={req.id} 
                      href={`/rides/${req.ride_id}`}
                      className="block group bg-white border border-slate-200 border-dashed rounded-3xl p-6 hover:bg-slate-50 transition-all relative overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                             <span className="px-4 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-600 text-[9px] font-black uppercase tracking-widest">
                               Waitlist
                             </span>
                             <span className="text-[9px] font-black text-slate-900/20 uppercase tracking-widest">#{req.ride_id}</span>
                          </div>
                          <h3 className="text-3xl font-black text-slate-900/40 italic uppercase tracking-tighter leading-none mb-4 group-hover:text-slate-900 transition-colors">
                             {req.corridor_name}
                          </h3>
                          <div className="flex items-center gap-4 text-slate-900/20">
                             <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-[12px] font-black">{fmtTime(req.ride_time)}</span>
                             </div>
                             <div className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600/30" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Authorization</span>
                             </div>
                          </div>
                        </div>

                        <div className="w-full md:w-auto px-8 py-3 bg-white rounded-2xl text-center md:text-right">
                           <p className="text-[8px] font-black text-slate-900/20 uppercase tracking-widest mb-1">Status</p>
                           <p className="text-xs font-black text-amber-600 uppercase tracking-widest">PENDING</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Guard Info */}
            <div className="mt-12 bg-blue-50 border border-blue-500/10 rounded-[2.5rem] p-8 flex items-start gap-5">
               <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0 mt-1" />
               <div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-2">Commute Guard Active</h4>
                  <p className="text-xs text-slate-900/40 leading-relaxed uppercase tracking-wide">
                     To ensure platform integrity, you can only have <span className="text-blue-600 font-black">one confirmed trip per direction</span> (To Office & To Home) for the same corridor on any single day.
                  </p>
               </div>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
