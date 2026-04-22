'use client'

import { useEffect, useState, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, Search, IndianRupee, Zap, 
  LayoutGrid, List, AlignJustify, Star, 
  ChevronRight, MapPin, Clock, RefreshCw,
  EyeOff, ChevronLeft, Info, Calendar,
  ArrowRight, Check, X, ShieldCheck,
  Building2, Home, Users, Sun, Sunrise,
  Navigation2, CheckCircle2, Timer, Moon
} from 'lucide-react'
import { api } from '@/lib/api'
import { getVibe, VIBE_THEMES, VibeState } from '@/lib/vibe-utils'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'
import VibeCanvas from '../components/VibeCanvas'

// ─── HIGH-FIDELITY CONFIG ──────────────────────────────────────────────────
const VIBE_CONFIG: Record<string, { label: string, icon: any, sub: string, classes: string, glow: string }> = {
  'all': { label: 'All Signals', icon: <Zap />, sub: 'Full Grid', classes: 'bg-white text-black border-white', glow: 'shadow-white/20' },
  '6-7': { label: 'Early Birds', icon: <Sun />, sub: '6-7 AM', classes: 'border-cyan-400 text-cyan-400', glow: 'shadow-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]' },
  '7-8': { label: 'GM Route', icon: <Sunrise />, sub: '7-8 AM', classes: 'border-amber-400 text-amber-400', glow: 'shadow-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]' },
  '8-9': { label: 'Rush Hour', icon: <Navigation2 />, sub: '8-9 AM', classes: 'border-red-400 text-red-400', glow: 'shadow-red-400/30 shadow-[0_0_15px_rgba(248,113,113,0.3)]' },
  '9-10': { label: 'Pick Perfect', icon: <CheckCircle2 />, sub: '9-10 AM', classes: 'border-green-400 text-green-400', glow: 'shadow-green-400/30 shadow-[0_0_15px_rgba(74,222,128,0.3)]' },
  '10-11': { label: 'Still Looking', icon: <Search />, sub: '10-11 AM', classes: 'border-white/40 text-white/40', glow: 'shadow-white/10' },
  '12-24': { label: 'Late Join', icon: <Timer />, sub: '12+ PM', classes: 'border-indigo-400 text-indigo-400', glow: 'shadow-indigo-400/30 shadow-[0_0_15px_rgba(129,140,248,0.3)]' },
  '16-18': { label: 'On Time', icon: <Clock />, sub: '4-6 PM', classes: 'border-emerald-400 text-emerald-400', glow: 'shadow-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
  '18-20': { label: 'Traffic Fighters', icon: <Zap />, sub: '6-8 PM', classes: 'border-orange-400 text-orange-400', glow: 'shadow-orange-400/30 shadow-[0_0_15px_rgba(251,146,60,0.3)]' },
  '20-22': { label: 'Late Comers', icon: <Moon />, sub: '8-10 PM', classes: 'border-blue-400 text-blue-400', glow: 'shadow-blue-400/30 shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
  '22-24': { label: 'Homebound', icon: <Home />, sub: '10+ PM', classes: 'border-purple-400 text-purple-400', glow: 'shadow-purple-400/30 shadow-[0_0_15px_rgba(192,132,252,0.3)]' }
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Ride {
  id: number; user_id: number; user_name: string; corridor_name: string; corridor_id: number;
  corridor_description?: string; ride_date: string; ride_time: string; pickup_point: string;
  drop_point: string; price_per_seat: number; available_seats: number; total_seats: number;
  status: string; vehicle_make?: string; vehicle_model?: string; vehicle_color?: string;
  vehicle_type?: string; vehicle_number?: string;
  direction?: string; pending_count?: number;
  confirmed_riders?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number }[];
}

interface Corridor { id: number; name: string; image_url?: string }
type ViewMode = 'grid' | 'list' | 'compact'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const OFFICE_KEYWORDS = ['rcp', 'reliance', 'corporate park', 'office']

// ─── CARD VIEW ───────────────────────────────────────────────────────────────
function CardView({ 
  ride, 
  onBook, 
  onRetract, 
  isRequested, 
  isSelected, 
  onSelect,
  isOwnRide
}: { 
  ride: Ride; 
  onBook: (id: number, seats: number) => void;
  onRetract: (id: number) => void;
  isRequested: boolean;
  isSelected: number | null;
  onSelect: (seats: number | null) => void;
  isOwnRide?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  // High-Fidelity SeatPlot Component inside Card
  const SeatPlot = () => {
    const total = ride.total_seats || 4
    const confirmed = ride.confirmed_riders || []
    const available = ride.available_seats
    
    return (
      <div className="grid grid-cols-4 gap-3 py-6 px-2">
         {/* Host Seat (Always 1st) */}
         <div className="flex flex-col items-center gap-2">
            <div className="relative w-14 h-20 flex items-center justify-center">
               <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full stroke-white/10 fill-white/5">
                 <path d="M20,45 Q20,35 50,35 Q80,35 80,45 L85,90 Q85,110 50,110 Q15,110 15,90 Z" strokeWidth="2" />
               </svg>
               <div className="relative w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)] overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-amber-400 uppercase tracking-tighter">{ride.user_name[0]}</div>
               </div>
            </div>
            <span className="text-[7px] font-black text-amber-400 uppercase tracking-widest">HOST</span>
         </div>

         {/* Confirmed Rider Seats */}
         {confirmed.map((r, i) => (
           <div key={i} className="flex flex-col items-center gap-2">
              <div className="relative w-14 h-20 flex items-center justify-center">
                 <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full stroke-white/10 fill-white/5">
                   <path d="M20,45 Q20,35 50,35 Q80,35 80,45 L85,90 Q85,110 50,110 Q15,110 15,90 Z" strokeWidth="2" />
                 </svg>
                 <div className="relative w-10 h-10 rounded-full bg-slate-900 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] overflow-hidden">
                    {r.avatar_url ? <img src={r.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-blue-400">{r.name[0]}</div>}
                 </div>
              </div>
              <span className="text-[7px] font-black text-blue-400/60 uppercase tracking-widest truncate w-12 text-center">{r.name.split(' ')[0]}</span>
           </div>
         ))}

         {/* Vacant/Selected Seats */}
         {Array.from({ length: available }).map((_, i) => {
           const seatNum = i + 1
           const active = isSelected !== null && seatNum <= isSelected
           return (
             <button 
               key={`empty-${i}`} 
               onClick={() => onSelect(active ? (i === 0 ? null : i) : seatNum)}
               className="flex flex-col items-center gap-2 group/seat"
             >
                <div className="relative w-14 h-20 flex items-center justify-center">
                   <svg viewBox="0 0 100 140" className={`absolute inset-0 w-full h-full transition-all duration-300 ${active ? 'stroke-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'stroke-blue-500/30'}`}>
                      <path d="M20,45 Q20,35 50,35 Q80,35 80,45 L85,90 Q85,110 50,110 Q15,110 15,90 Z" strokeWidth="3" strokeDasharray={active ? "0" : "6,4"} />
                   </svg>
                   <span className={`text-[9px] font-black tracking-widest transition-all ${active ? 'text-green-400 animate-pulse' : 'text-blue-500/20 group-hover/seat:text-blue-400/40'}`}>
                      {active ? 'READY' : 'VACANT'}
                   </span>
                </div>
                <span className={`text-[7px] font-black uppercase tracking-widest transition-colors ${active ? 'text-green-400' : 'text-white/10'}`}>SELECT</span>
             </button>
           )
         })}
      </div>
    )
  }

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className={`relative bg-[#0f172a]/80 backdrop-blur-3xl border rounded-[3rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isSelected ? 'border-green-500/50 scale-[1.02]' : 'border-white/10 hover:border-white/20'}`}>
         {/* HEADER - MOCKUP STYLE */}
         <div className="p-8 pb-4 flex justify-between items-start">
            <div>
               <h2 className="text-5xl font-black text-white tracking-tighter italic mb-1">{ride.ride_time}</h2>
               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-1">Departure Point</p>
            </div>
            <div className="flex flex-col items-end gap-2">
               <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isOwnRide ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'}`}>
                  {isOwnRide ? 'YOUR RIDE' : 'HOSTED UNIT'}
                  {!isOwnRide && <span className="flex items-center gap-0.5 ml-1 opacity-60"><Star className="w-2.5 h-2.5 fill-current" /> 4.9</span>}
               </div>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full">
                  <IndianRupee className="w-3 h-3 text-green-400" />
                  <span className="text-lg font-black text-white tracking-widest">{ride.price_per_seat}</span>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">SEAT</span>
               </div>
            </div>
         </div>

         {/* STATS STRIP */}
         <div className="px-8 mb-4">
            <div className="flex items-center gap-3 py-3 px-5 bg-amber-400/5 border border-amber-400/20 rounded-2xl">
               <div className="flex -space-x-1">
                  {ride.confirmed_riders?.slice(0, 3).map((r, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[6px] font-black overflow-hidden">
                       {r.avatar_url ? <img src={r.avatar_url} className="w-full h-full object-cover" /> : r.name[0]}
                    </div>
                  ))}
               </div>
               <span className="text-[9px] font-extrabold text-amber-400 uppercase tracking-widest underline decoration-amber-400/30 underline-offset-4">
                  {ride.confirmed_riders?.length || 0} COMPETITORS WAITING
               </span>
            </div>
         </div>

         {/* SEAT VISUALIZATION SECTION */}
         <div className="px-6 mb-4">
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] relative overflow-hidden group/viz">
               <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
               <SeatPlot />
            </div>
         </div>

         {/* ROUTE INFO */}
         <div className="px-8 pb-4">
            <div className="flex items-center gap-4 text-white/40 mb-6">
                <div className="flex items-center gap-2 group/pin">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 group-hover/pin:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[100px]">{ride.pickup_point}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-white/5" />
                <div className="flex items-center gap-2 group/pin">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 group-hover/pin:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[100px]">{ride.drop_point}</span>
                </div>
            </div>

            {/* ACTION SECTION */}
               {isOwnRide ? (
                  <Link 
                    href={`/rides/${ride.id}`}
                    className="w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] bg-amber-400 text-black shadow-[0_20px_40px_rgba(251,191,36,0.2)] flex items-center justify-center gap-3 transition-all hover:scale-105"
                  >
                     MANAGE ROSTER <ArrowRight className="w-4 h-4" />
                  </Link>
               ) : !isRequested ? (
                  <button 
                     onClick={() => isSelected && onBook(ride.id, isSelected)}
                     disabled={!isSelected}
                     className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                       isSelected 
                        ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.2)] scale-102' 
                        : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                     }`}
                  >
                     {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-400/20 animate-pulse pointer-events-none" />}
                     {isSelected ? <>REQUEST SEAT <ArrowRight className="w-4 h-4" /></> : 'CHOOSE SEATS'}
                  </button>
               ) : (
               <button 
                onClick={() => onRetract(ride.id)}
                className="w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-all group flex items-center justify-center gap-3"
              >
                <Check className="w-4 h-4" /> BROADCASTING...
              </button>
            )}

            <Link href={`/rides/${ride.id}`} className="block w-full text-center mt-4 text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors mb-2">
               VIEW ROSTER DETAILS
            </Link>
         </div>
      </div>
    </div>
  )
}

// ─── MAIN CONTENT ────────────────────────────────────────────────────────────
function RidesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const corridorParam = searchParams.get('corridor')

  const [rides, setRides] = useState<Ride[]>([])
  const [corridors, setCorridors] = useState<Corridor[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  // Single active selection — {rideId, seats} — selecting on one clears others
  const [activeSelection, setActiveSelection] = useState<{ rideId: number; seats: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  
  const hour = new Date().getHours()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const vibe = getVibe(hour)
  const theme = VIBE_THEMES[vibe]

  useEffect(() => {
    const usr = localStorage.getItem('user')
    if (usr) setCurrentUser(JSON.parse(usr))
  }, [])

  const [showFilled, setShowFilled] = useState(false)
  const [filter, setFilter] = useState({
    corridor: corridorParam || 'all',
    date: new Date().toISOString().split('T')[0],
    timeRange: 'all',  
    direction: 'all',
    vibeTag: 'all'
  })

  useEffect(() => {
    fetchCorridors()
    fetchUserRequests()
  }, [])

  // Click outside grid → clear selection
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (gridRef.current && !gridRef.current.contains(e.target as Node)) {
        setActiveSelection(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchRides()
  }, [filter.date, filter.corridor])

  const fetchCorridors = async () => {
     try {
       const res = await api.get('/corridors?active=true')
       if (Array.isArray(res)) {
         setCorridors(res)
       } else if (res && typeof res === 'object' && (res as any).data) {
         // Emergency fallback handle
         setCorridors((res as any).data)
         console.warn('API running in emergency mode:', (res as any).debug_error)
       }
     } catch {}
  }

  const fetchUserRequests = async () => {
    try {
      const res = await api.get('/user/requests') as unknown as any[]
      if (Array.isArray(res)) setRequests(res)
    } catch {}
  }

  const fetchRides = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ date: filter.date, _t: Date.now().toString() })
      if (filter.corridor && filter.corridor !== 'all') params.set('corridor_id', filter.corridor)
      const data = await api.get(`/rides?${params.toString()}`)
      if (Array.isArray(data)) setRides(data as Ride[])
    } catch { toast.error('Check network status') }
    finally { setLoading(false) }
  }, [filter.date, filter.corridor])

  const handleBook = async (rideId: number, seats: number) => {
    const isOwnRide = rides.find(r => r.id === rideId)?.user_id === Number(currentUser?.id || currentUser?.userId)
    
    if (isOwnRide) {
       toast.error('Error: You are the host of this ride. Manage it from the dashboard.', { icon: '🛡️' })
       return
    }

    try {
      await api.post(`/rides/${rideId}/requests`, { seats_requested: seats })
      toast.success('Launch successful! Request broadcasted.', { icon: '🚀' })
      setActiveSelection(null)
      fetchUserRequests()
      fetchRides()
    } catch (e: any) { 
      const serverError = e.response?.data?.error || e.message || 'Launch failed'
      toast.error(serverError, { duration: 5000 })
    }
  }

  const handleRetract = async (rideId: number) => {
    try {
      const currentUserId = Number(currentUser?.id || currentUser?.userId)
      const req = requests.find(r => Number(r.user_id) === currentUserId && r.ride_id === rideId && r.status === 'pending')
      if (req) {
         await api.delete(`/rides/${rideId}/requests/${req.id}`)
         toast.success('Retracted. Not yet.', { icon: '🛑' })
         fetchUserRequests()
         fetchRides()
      }
    } catch { toast.error('Retraction failed') }
  }

  const filtered = rides.filter(r => {
    if (!showFilled && r.available_seats === 0) return false
    if (filter.corridor !== 'all' && r.corridor_id !== parseInt(filter.corridor)) return false
    
    const h = parseInt(r.ride_time.split(':')[0])
    
    if (filter.vibeTag !== 'all') {
      const [start, end] = filter.vibeTag.split('-').map(Number)
      if (end === 24) { // 12+ or 10+ cases
        if (h < start) return false
      } else {
        if (h < start || h >= end) return false
      }
    } else if (filter.timeRange !== 'all') {
      const rideVibe = getVibe(h)
      if (filter.timeRange !== rideVibe) return false
    }

    if (filter.direction !== 'all' && r.direction) {
      if (r.direction !== filter.direction) return false
    }
    return true
  })

  return (
    <div className={`min-h-screen text-white font-sans pb-32 transition-all duration-1000 ${theme.bg}`}>
      <VibeCanvas vibe={vibe} />
      <JoolNav />

      {/* ROUTE HUB - CIRCULAR ORBS */}
      <div className="w-full py-8 overflow-x-auto scrollbar-hide">
         <div className="flex items-center justify-start gap-10 px-12 min-w-max">
            <button 
              onClick={() => setFilter({ ...filter, corridor: 'all', direction: 'all' })}
              className="group flex flex-col items-center gap-4 transition-all"
            >
               <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${filter.corridor === 'all' ? `bg-white ${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                  <Zap className={`w-8 h-8 ${filter.corridor === 'all' ? 'text-black' : 'text-white/40 group-hover:text-white'}`} />
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${filter.corridor === 'all' ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`}>All Routes</span>
            </button>

            <button 
              onClick={() => setFilter({ ...filter, direction: filter.direction === 'to_office' ? 'all' : 'to_office' })}
              className="group flex flex-col items-center gap-4 transition-all"
            >
               <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${filter.direction === 'to_office' ? `bg-white ${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                  <Building2 className={`w-8 h-8 ${filter.direction === 'to_office' ? 'text-black' : 'text-white/40 group-hover:text-white'}`} />
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${filter.direction === 'to_office' ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`}>To Office</span>
            </button>

            <button 
              onClick={() => setFilter({ ...filter, direction: filter.direction === 'to_home' ? 'all' : 'to_home' })}
              className="group flex flex-col items-center gap-4 transition-all"
            >
               <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${filter.direction === 'to_home' ? `bg-white ${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                  <Home className={`w-8 h-8 ${filter.direction === 'to_home' ? 'text-black' : 'text-white/40 group-hover:text-white'}`} />
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${filter.direction === 'to_home' ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`}>To Home</span>
            </button>

            {Array.isArray(corridors) && corridors.map(c => {
               const active = filter.corridor === String(c.id)
               const initials = c.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'
               return (
                 <button 
                   key={c.id}
                   onClick={() => setFilter({ ...filter, corridor: String(c.id) })}
                   className="group flex flex-col items-center gap-4 transition-all"
                 >
                    <div className={`w-20 h-20 rounded-full overflow-hidden transition-all duration-500 border-2 relative ${active ? `${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'border-white/10 hover:border-white/30'}`}>
                       {c.image_url ? (
                         <img src={c.image_url} alt={c.name} className={`w-full h-full object-cover transition-transform duration-700 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-60 group-hover:opacity-100'}`} />
                       ) : (
                         <div className={`w-full h-full flex items-center justify-center text-2xl font-black bg-gradient-to-br from-slate-800 to-slate-950 ${active ? 'text-white' : 'text-white/20'}`}>
                            {initials}
                         </div>
                       )}
                       {active && <div className="absolute inset-0 bg-white/10 pointer-events-none" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-white/20 group-hover:text-white/40'}`}>{c.name}</span>
                 </button>
               )
            })}
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/20">
                  <Search className="w-6 h-6" />
               </div>
               <div>
                 <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Find Ride</h1>
                 <p className="text-white/30 text-[10px] mt-1 font-black uppercase tracking-widest">{filtered.length} Active Ride{filtered.length !== 1 ? 's' : ''} detected</p>
               </div>
            </div>
          </div>

          {/* COOL TOGGLES */}
          <div className="flex flex-wrap items-center gap-4">
             {/* Mission Direction */}
             <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex gap-1">
                {[
                  { id: 'to_office', label: 'Office', icon: '🏢' },
                  { id: 'to_home', label: 'Home', icon: '🏠' }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setFilter({ ...filter, direction: d.id })}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${filter.direction === d.id ? 'bg-blue-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
                  >
                    {d.icon} {d.label}
                  </button>
                ))}
             </div>

             {/* Temporal Node (Date) */}
             <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex items-center gap-1">
                {[
                  { label: 'Today', date: new Date().toISOString().split('T')[0] },
                  { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] }
                ].map(dt => (
                  <button
                   key={dt.label}
                   onClick={() => setFilter({ ...filter, date: dt.date })}
                   className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${filter.date === dt.date ? 'bg-amber-400 text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
                  >
                    {dt.label}
                  </button>
                ))}
                <div className="w-[1px] h-4 bg-white/10 mx-1" />
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                  <input 
                    type="date" 
                    value={filter.date}
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]}
                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                    className="bg-transparent border-none text-[10px] font-black text-white px-8 py-2 rounded-xl focus:outline-none focus:bg-white/5 transition-all w-32 cursor-pointer [color-scheme:dark]"
                  />
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex gap-1 ml-auto md:ml-0">
                <button onClick={() => setView('grid')} className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-white text-black' : 'text-white/20 hover:text-white'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')} className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-white text-black' : 'text-white/20 hover:text-white'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>

             <button 
                onClick={() => setShowFilled(!showFilled)} 
                className={`px-6 py-2 border rounded-2xl transition-all flex items-center gap-3 ${showFilled ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 border-white/10 hover:border-white/30'}`}
              >
                 {showFilled ? <EyeOff className="w-4 h-4" /> : <AlignJustify className="w-4 h-4" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">{showFilled ? 'HIDE FULL' : 'SHOW FULL'}</span>
             </button>

             <button onClick={fetchRides} className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>

               <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
                  {Object.entries(VIBE_CONFIG).map(([id, v]) => {
                     const active = filter.vibeTag === id
                     const h = new Date().getHours() // Re-fetch current hour for visibility check
                     const isVisible = id === 'all' || 
                                      (h < 14 && ['6-7','7-8','8-9','9-10','10-11','12-24'].includes(id)) ||
                                      (h >= 12 && ['16-18','18-20','20-22','22-24'].includes(id))
                     
                     if (!isVisible) return null

                     return (
                       <button 
                         key={id}
                         onClick={() => setFilter(p => ({ ...p, vibeTag: id }))}
                         className={`px-8 py-5 rounded-[2.5rem] border-2 transition-all flex items-center gap-4 relative group ${active ? `bg-white/10 ${v.classes} ${v.glow} scale-105 shadow-[0_0_20px_currentColor]` : `bg-white/[0.03] border-white/5 text-white/30 hover:border-white/20 hover:bg-white/[0.07] ${v.classes.replace('border-', 'border-').split(' ').filter(c => c.startsWith('border-')).map(c => c+'/20').join(' ')}`}`}
                       >
                          <div className={`transition-all duration-300 ${active ? 'opacity-100 scale-110' : 'opacity-40 group-hover:opacity-100'}`}>
                             {v.icon}
                          </div>
                          <div className="flex flex-col items-start leading-none transition-all duration-300">
                             <span className={`text-[11px] font-black uppercase tracking-widest ${active ? '' : 'text-white/40 group-hover:text-white'}`}>{v.label}</span>
                             <span className={`text-[9px] font-bold mt-1 ${active ? 'opacity-60' : 'opacity-20 group-hover:opacity-40'}`}>{v.sub}</span>
                          </div>
                       </button>
                     )
                  })}
               </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
             <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing_Grid...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white/5 border border-white/5 rounded-[3rem] backdrop-blur-xl">
            <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">Negative Signal</h3>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest leading-relaxed">Adjust your ride coordinates<br/>or publish a new route</p>
          </div>
        ) : view === 'grid' ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(ride => {
               const currentUserId = Number(currentUser?.id || currentUser?.userId)
               return (
                 <CardView
                   key={ride.id}
                   ride={ride}
                   onBook={handleBook}
                   onRetract={handleRetract}
                   isOwnRide={currentUserId === Number(ride.user_id)}
                   isRequested={requests.some(r => Number(r.user_id) === currentUserId && r.ride_id === ride.id && r.status === 'pending')}
                   isSelected={activeSelection?.rideId === ride.id ? activeSelection.seats : null}
                   onSelect={(seats) => setActiveSelection(seats === null ? null : { rideId: ride.id, seats })}
                 />
               )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ride => (
              <div key={ride.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-6 flex-1">
                   <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 relative">
                      <Car className="w-8 h-8 text-white/20" />
                      {currentUser?.id === ride.user_id && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[#0f172a]" title="Your Ride" />}
                   </div>
                   <div>
                      <h4 className="text-xl font-black tracking-tight">{ride.corridor_name}</h4>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Driver: {ride.user_name}</p>
                   </div>
                   <div className="hidden md:block h-8 w-px bg-white/10 mx-4" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Departure</span>
                      <span className="font-black flex items-center gap-2"><Clock className="w-3 h-3 text-amber-400" /> {ride.ride_time}</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-8">
                   <div className="text-right">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Fare</span>
                      <p className="text-xl font-black text-green-400">₹{ride.price_per_seat}</p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <Link href={`/rides/${ride.id}`} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Details</Link>
                      {requests.some(r => r.ride_id === ride.id && r.status === 'pending') ? (
                        <button onClick={() => handleRetract(ride.id)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Requested</button>
                      ) : (
                        <button 
                          disabled={ride.available_seats === 0}
                          onClick={() => handleBook(ride.id, 1)} 
                          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${ride.available_seats === 0 ? 'bg-white/5 text-white/10' : 'bg-white text-black hover:bg-amber-400'}`}
                        >
                           {ride.available_seats === 0 ? 'Full' : 'Reserve'}
                        </button>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default function RidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.5em] text-white/20 animate-pulse">Initializing_Jool_Core...</div>}>
      <RidesContent />
    </Suspense>
  )
}
