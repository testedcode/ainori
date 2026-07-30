'use client'

import { useEffect, useState, useCallback, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, Search, IndianRupee, Zap, 
  LayoutGrid, List, AlignJustify, Star, 
  ChevronRight, MapPin, Clock, RefreshCw,
  EyeOff, ChevronLeft, Info, Calendar,
  ArrowRight, Check, X, ShieldCheck, Crown,
  Building2, Home, Users, Sun, Sunrise,
  Navigation2, CheckCircle2, Timer, Moon, Share2
} from 'lucide-react'
import { api } from '@/lib/api'
import { getVibe, VIBE_THEMES, VibeState } from '@/lib/vibe-utils'
import toast from 'react-hot-toast'
import PulseNav from '@/components/PulseNav'

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmtTime = (raw: string) => raw ? raw.slice(0, 5) : ''
const fmtDate = (raw: string) => {
  if (!raw) return ''
  const d = new Date(raw.includes('T') ? raw : raw + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ─── HIGH-FIDELITY CONFIG ──────────────────────────────────────────────────
const VIBE_CONFIG: Record<string, { label: string, icon: any, sub: string, classes: string, glow: string }> = {
  'all': { label: 'All Rides', icon: <Zap />, sub: 'Full Grid', classes: 'bg-blue-600 text-white border-slate-300', glow: 'shadow-white/20' },
  '6-7': { label: 'Early Birds', icon: <Sun />, sub: '6-7 AM', classes: 'border-cyan-400 text-cyan-600', glow: 'shadow-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]' },
  '7-8': { label: 'Morning Route', icon: <Sunrise />, sub: '7-8 AM', classes: 'border-amber-400 text-amber-600', glow: 'shadow-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.3)]' },
  '8-9': { label: 'Rush Hour', icon: <Navigation2 />, sub: '8-9 AM', classes: 'border-red-400 text-red-400', glow: 'shadow-red-400/30 shadow-[0_0_15px_rgba(248,113,113,0.3)]' },
  '9-10': { label: 'Pick Perfect', icon: <CheckCircle2 />, sub: '9-10 AM', classes: 'border-green-400 text-green-600', glow: 'shadow-green-400/30 shadow-[0_0_15px_rgba(74,222,128,0.3)]' },
  '10-11': { label: 'Still Looking', icon: <Search />, sub: '10-11 AM', classes: 'border-slate-300/40 text-slate-900/40', glow: 'shadow-white/10' },
  '12-24': { label: 'Late Join', icon: <Timer />, sub: '12+ PM', classes: 'border-indigo-400 text-indigo-400', glow: 'shadow-indigo-400/30 shadow-[0_0_15px_rgba(129,140,248,0.3)]' },
  '16-18': { label: 'On Time', icon: <Clock />, sub: '4-6 PM', classes: 'border-emerald-400 text-emerald-400', glow: 'shadow-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.3)]' },
  '18-20': { label: 'Traffic Fighters', icon: <Zap />, sub: '6-8 PM', classes: 'border-orange-400 text-orange-400', glow: 'shadow-orange-400/30 shadow-[0_0_15px_rgba(251,146,60,0.3)]' },
  '20-22': { label: 'Late Comers', icon: <Moon />, sub: '8-10 PM', classes: 'border-blue-400 text-blue-600', glow: 'shadow-blue-400/30 shadow-[0_0_15px_rgba(96,165,250,0.3)]' },
  '22-24': { label: 'Homebound', icon: <Home />, sub: '10+ PM', classes: 'border-purple-400 text-purple-600', glow: 'shadow-purple-400/30 shadow-[0_0_15px_rgba(192,132,252,0.3)]' }
}

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Ride {
  id: number; user_id: number; user_name: string; corridor_name: string; corridor_id: number;
  corridor_description?: string; ride_date: string; ride_time: string; pickup_point: string;
  drop_point: string; price_per_seat: number; available_seats: number; total_seats: number;
  status: string; vehicle_make?: string; vehicle_model?: string; vehicle_color?: string;
  vehicle_type?: string; vehicle_number?: string; vehicle_image_url?: string;
  direction?: string; pending_count?: number;
  user_approved?: boolean; user_avatar_url?: string;
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
                <div className={`relative w-10 h-10 rounded-full bg-slate-900 border-2 shadow-[0_0_15px_rgba(251,191,36,0.5)] overflow-hidden ${ride.user_approved ? 'border-amber-400' : 'border-blue-400'}`}>
                   {ride.user_avatar_url ? (
                      <img src={ride.user_avatar_url} className="w-full h-full object-cover" alt={ride.user_name} />
                   ) : (
                      <div className={`w-full h-full flex items-center justify-center text-[10px] font-black uppercase tracking-tighter ${ride.user_approved ? 'text-amber-600' : 'text-blue-600'}`}>
                        {ride.user_name[0]}
                      </div>
                   )}
                </div>
            </div>
            <span className="text-[7px] font-black text-amber-600 uppercase tracking-widest">HOST</span>
         </div>

         {/* Confirmed Rider Seats */}
         {confirmed.map((r, i) => (
           <div key={i} className="flex flex-col items-center gap-2">
              <div className="relative w-14 h-20 flex items-center justify-center">
                 <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full stroke-white/10 fill-white/5">
                   <path d="M20,45 Q20,35 50,35 Q80,35 80,45 L85,90 Q85,110 50,110 Q15,110 15,90 Z" strokeWidth="2" />
                 </svg>
                 <div className="relative w-10 h-10 rounded-full bg-slate-900 border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] overflow-hidden">
                    {r.avatar_url ? <img src={r.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-blue-600">{r.name[0]}</div>}
                 </div>
              </div>
              <span className="text-[7px] font-black text-blue-600/60 uppercase tracking-widest truncate w-12 text-center">{r.name.split(' ')[0]}</span>
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
                <div className="relative w-14 h-20 flex items-center justify-center bg-white/40 border border-white/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] rounded-xl backdrop-blur-sm transition-all overflow-hidden hover:bg-white/60">
                   {/* Car Seat Silhouette */}
                   <svg viewBox="0 0 24 24" className={`absolute w-8 h-8 transition-all duration-300 ${active ? 'text-green-500 scale-110' : 'text-slate-300'}`} fill="currentColor">
                     <path d="M6 3h12a2 2 0 0 1 2 2v6a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-6a2 2 0 0 1 2-2zm0 14h12v2a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2z" />
                   </svg>
                   {active && <div className="absolute inset-0 bg-green-500/10 animate-pulse" />}
                </div>
                <span className={`text-[7px] font-black uppercase tracking-widest transition-colors ${active ? 'text-green-600' : 'text-slate-400'}`}>{active ? 'READY' : 'SELECT'}</span>
             </button>
           )
         })}
      </div>
    )
  }

  const handleShare = (e: React.MouseEvent) => {
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

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className={`relative backdrop-blur-3xl rounded-[3.5rem] overflow-hidden transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,1),_0_20px_40px_rgba(0,0,0,0.05)] border-2 ${
        isSelected ? 'bg-gradient-to-br from-[#f8f9f2] to-white scale-[1.01] border-green-400' : 
        ride.user_approved ? 'bg-gradient-to-br from-[#f8f9f2] via-white to-[#f4f7eb] border-[#eaf0d8]' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-white/40'
      }`}>
         {/* Premium Badge Overlay */}
         {ride.user_approved && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-white opacity-50" />
         )}
         
         {/* Vehicle image as faint background covering the whole card */}
         {ride.vehicle_image_url && (
            <div className="absolute inset-0 pointer-events-none rounded-[3.5rem] overflow-hidden">
              <img src={ride.vehicle_image_url} alt="" className="w-full h-full object-cover opacity-15 saturate-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9f2]/60 via-[#f8f9f2]/80 to-[#f8f9f2]/95" />
            </div>
         )}
         {/* HEADER - MOCKUP STYLE */}
         <div className="p-8 pb-4 flex justify-between items-start relative z-10">
            <div className="space-y-3">
               <div>
                  <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic leading-none mb-2">{fmtTime(ride.ride_time)}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                     <div className="px-2.5 py-1 bg-white/60 border border-slate-200/50 rounded flex items-center gap-1.5 backdrop-blur-sm">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">{fmtDate(ride.ride_date)}</span>
                     </div>
                     <div className={`px-2.5 py-1 bg-white/60 border border-slate-200/50 rounded flex items-center gap-1.5 backdrop-blur-sm ${
                        (ride.direction === 'to_home' || (parseInt(ride.ride_time) >= 13)) ? 'text-green-600' : 'text-blue-600'
                     }`}>
                        {(ride.direction === 'to_home' || (parseInt(ride.ride_time) >= 13)) ? <Home className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">
                           {(ride.direction === 'to_home' || (parseInt(ride.ride_time) >= 13)) ? 'To Home' : 'To Office'}
                        </span>
                     </div>
                     {/* Locations */}
                     <div className="w-full flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest truncate max-w-[200px]">{ride.pickup_point}</span>
                        <span className="text-slate-400 text-xs">→</span>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-widest truncate max-w-[200px]">{ride.drop_point}</span>
                     </div>
                  </div>
               </div>

               {/* Host Profile Showcase */}
               <div className={`flex items-center gap-3 p-1.5 pr-4 rounded-full transition-all cursor-pointer group/host w-max ${
                  ride.user_approved ? 'bg-amber-400/10 border border-amber-400/30' : 'bg-white/50 border border-slate-200 backdrop-blur-sm'
               }`}>
                  <div className="relative">
                     <div className={`w-9 h-9 rounded-full border-2 overflow-hidden bg-slate-900 shadow-md flex items-center justify-center ${
                        ride.user_approved ? 'border-amber-400' : 'border-blue-400'
                     }`}>
                        {ride.user_avatar_url ? (
                           <img src={ride.user_avatar_url} className="w-full h-full object-cover" alt={ride.user_name} />
                        ) : (
                           <span className={`text-xs font-black ${ride.user_approved ? 'text-amber-600' : 'text-blue-600'}`}>{ride.user_name[0]}</span>
                        )}
                     </div>
                     {ride.user_approved && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                           <ShieldCheck className="w-2.5 h-2.5 text-black" />
                        </div>
                     )}
                  </div>
                  <div>
                     <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{ride.user_name}</span>
                        {ride.user_approved && <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />}
                     </div>
                     <span className={`text-[6px] font-black uppercase tracking-[0.2em] mt-0.5 block ${ride.user_approved ? 'text-amber-600/80' : 'text-slate-500'}`}>
                        {ride.user_approved ? 'VERIFIED HOST' : 'MEMBER'}
                     </span>
                  </div>
               </div>
            </div>

             <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                   {ride.status === 'starting' && (
                      <span className="px-3 py-1 bg-cyan-500 text-slate-900 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse shadow-lg shadow-cyan-500/20">
                         Starting...
                      </span>
                   )}
                   {ride.status === 'at_pickup' && (
                      <span className="px-3 py-1 bg-green-500 text-slate-900 rounded-lg text-[8px] font-black uppercase tracking-widest animate-bounce shadow-lg shadow-green-500/20">
                         At Spot
                      </span>
                   )}
                </div>
                {isOwnRide && (
                   <div className="px-3 py-1 bg-amber-400 text-black rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl">
                      YOUR RIDE
                   </div>
                )}
               {ride.user_approved && !isOwnRide && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-100 border border-blue-500/30 rounded-lg shadow-lg">
                     <Crown className="w-3 h-3 text-blue-600" />
                     <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">ELITE</span>
                  </div>
               )}

               <div className="flex flex-col items-end mt-2">
                  <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-2xl border border-slate-200 min-w-[100px] justify-end">
                     <IndianRupee className="w-4 h-4 text-green-600" />
                     <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none whitespace-nowrap">
                        {Math.floor(ride.price_per_seat)}
                     </span>
                  </div>
                  <span className="text-[7px] font-black text-slate-900/20 uppercase tracking-[0.2em] mt-1 mr-2">Ride Rate</span>
               </div>
            </div>
         </div>

         {/* STATS STRIP / BE THE FIRST TO JOIN */}
         <div className="px-8 mb-4">
             <div className="flex items-center justify-between gap-2 bg-amber-500/5 border border-amber-500/10 rounded-[1.5rem] p-2">
                <span className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest pl-2">
                   {(ride.confirmed_riders?.length || 0) > 0
                     ? `${ride.confirmed_riders?.length} RIDER${(ride.confirmed_riders?.length || 0) > 1 ? 'S' : ''} CONFIRMED`
                     : 'BE THE FIRST TO JOIN!'}
                </span>
                {(ride.vehicle_make || ride.vehicle_model) && (
                   <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-white">
                      <span className="text-xs leading-none">{ride.vehicle_type === 'bike' ? '🏍️' : ride.vehicle_type === 'suv' ? '🚙' : ride.vehicle_type === 'muv' ? '🚐' : '🚗'}</span>
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{[ride.vehicle_make, ride.vehicle_model].filter(Boolean).join(' ')}</span>
                   </div>
                )}
             </div>
         </div>

         {/* SEAT VISUALIZATION SECTION */}
         <div className="px-6 mb-4">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] relative overflow-hidden group/viz">
               <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white pointer-events-none" />
               <SeatPlot />
            </div>
         </div>

         {/* VEHICLE CHIP MOVED TO THE 'BE THE FIRST TO JOIN' BAR ABOVE */}
         <div className="px-8 pb-4">

            {/* ACTION SECTION */}
               {isOwnRide ? (
                  <Link 
                    href={`/rides/${ride.id}`}
                    className="w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] bg-[#0f172a] hover:bg-[#1e293b] border border-[#0f172a] text-white shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-105"
                  >
                     MANAGE RIDE <ArrowRight className="w-4 h-4 text-white" />
                  </Link>
               ) : !isRequested ? (
                  <button 
                     onClick={() => isSelected && onBook(ride.id, isSelected)}
                     disabled={!isSelected}
                     className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                       isSelected 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg active:scale-95' 
                        : 'bg-blue-50 border border-blue-200 text-blue-600 cursor-not-allowed'
                     }`}
                  >
                     {isSelected && <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-white/40 to-green-400/10 animate-pulse pointer-events-none" />}
                     {isSelected ? <>REQUEST SEAT <ArrowRight className="w-4 h-4 text-white" /></> : 'CHOOSE SEATS'}
                  </button>
               ) : (
               <button 
                onClick={() => onRetract(ride.id)}
                 className="w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-all group flex items-center justify-center gap-3"
              >
                <Check className="w-4 h-4" /> SENDING...
              </button>
            )}

            <div className="flex items-center gap-3 mt-6 mb-2">
               <Link 
                 href={`/rides/${ride.id}`} 
                 className="flex-1 text-center py-3.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#0f172a] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
               >
                  VIEW DETAILS
               </Link>
               <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const url = `${window.location.origin}/rides/${ride.id}`
                    const summary = `
🚙 Pulse Commute Summary
---------------------------
📍 Route: ${ride.pickup_point} ➔ ${ride.drop_point}
⏰ Time: ${fmtTime(ride.ride_time)} (${fmtDate(ride.ride_date)})
💵 Fare: ₹${Math.floor(ride.price_per_seat)}
👥 Seats Available: ${ride.available_seats}/${ride.total_seats}
👤 Host: ${ride.user_name} ${ride.user_approved ? '✓ (Verified)' : ''}

Join now: ${url}
                    `.trim()
                    
                    if (navigator.share) {
                      navigator.share({ title: 'Pulse Ride Summary', text: summary, url }).catch(() => {})
                    } else {
                      navigator.clipboard.writeText(summary)
                      toast.success('Beautiful ride summary copied to clipboard!')
                    }
                  }}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2"
                  title="Share Ride"
               >
                  <Share2 className="w-4 h-4 text-white" />
                  SHARE RIDE
               </button>
            </div>
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
  const [liveOnly, setLiveOnly] = useState(false) // Default to showing all for the day
  // IST timezone offset offset helper: UTC + 5.5 hours
  const getISTDateString = () => {
    const istOffset = 5.5 * 60 * 60 * 1000
    const istDate = new Date(Date.now() + istOffset)
    return istDate.toISOString().split('T')[0]
  }

  const [filter, setFilter] = useState({
    corridor: corridorParam || 'all',
    date: getISTDateString(),
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
    if (r.status === 'cancelled' || r.status === 'finished') return false
    if (filter.corridor !== 'all' && r.corridor_id !== parseInt(filter.corridor)) return false
    
    const h = parseInt(r.ride_time.split(':')[0])
    const m = parseInt(r.ride_time.split(':')[1])

    // ⏱️ High-Precision Expiry & Window Filter
    const isToday = filter.date === new Date().toISOString().split('T')[0]
    if (isToday && liveOnly) {
      // Always show active journeys regardless of time
      const isActiveStatus = ['starting', 'at_pickup', 'at_dropoff'].includes(r.status)
      if (!isActiveStatus) {
        const now = new Date()
        const rideDate = new Date()
        // Handle ISO string or date-only string
        const datePart = r.ride_date.split('T')[0]
        const [rh, rm] = r.ride_time.split(':').map(Number)
        rideDate.setHours(rh, rm, 0, 0)
        
        const diffMins = (now.getTime() - rideDate.getTime()) / 60000
        
        // Rules for "Live Only":
        // 1. Hide if it happened > 30 mins ago (Restoring original stable behavior)
        if (diffMins > 30) return false
        
        // 2. Hide if it is > 24 hours in the future
        if (diffMins < -1440) return false
      }
    }
    
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
    <div className={`min-h-screen text-slate-900 font-sans pb-32 transition-all duration-1000 bg-slate-50`}>
      <PulseNav />

      {/* ROUTE HUB - CIRCULAR ORBS */}
      <div className="w-full pt-32 pb-8 overflow-x-auto scrollbar-hide">
         <div className="flex items-center justify-start gap-10 px-12 min-w-max">
            <button 
              onClick={() => setFilter({ ...filter, corridor: 'all', direction: 'all' })}
              className="group flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
               <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${filter.corridor === 'all' ? `bg-white ${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <Zap className={`w-8 h-8 ${filter.corridor === 'all' ? 'text-black' : 'text-slate-900/40 group-hover:text-slate-900'}`} />
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${filter.corridor === 'all' ? 'text-slate-900' : 'text-slate-900/20 group-hover:text-slate-900/40'}`}>All Routes</span>
            </button>

            <button 
              onClick={() => setFilter({ ...filter, direction: filter.direction === 'to_office' ? 'all' : 'to_office' })}
              className="group flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
               <div className={`w-20 h-20 rounded-full overflow-hidden transition-all duration-500 border-2 relative ${filter.direction === 'to_office' ? `bg-white ${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <img src="/To_Office.png" alt="To Office" className={`w-full h-full object-cover transition-all duration-700 ${filter.direction === 'to_office' ? 'scale-110 opacity-100' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'}`} />
                  {filter.direction === 'to_office' && <div className="absolute inset-0 bg-slate-100 pointer-events-none" />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${filter.direction === 'to_office' ? 'text-slate-900' : 'text-slate-900/20 group-hover:text-slate-900/40'}`}>To Office</span>
            </button>

            <button 
              onClick={() => setFilter({ ...filter, direction: filter.direction === 'to_home' ? 'all' : 'to_home' })}
              className="group flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
               <div className={`w-20 h-20 rounded-full overflow-hidden transition-all duration-500 border-2 relative ${filter.direction === 'to_home' ? `bg-white ${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                  <img src="/To_Home.png" alt="To Home" className={`w-full h-full object-cover transition-all duration-700 ${filter.direction === 'to_home' ? 'scale-110 opacity-100' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'}`} />
                  {filter.direction === 'to_home' && <div className="absolute inset-0 bg-slate-100 pointer-events-none" />}
               </div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${filter.direction === 'to_home' ? 'text-slate-900' : 'text-slate-900/20 group-hover:text-slate-900/40'}`}>To Home</span>
            </button>

            {Array.isArray(corridors) && corridors.map(c => {
               const active = filter.corridor === String(c.id)
               const initials = c.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??'
               return (
                 <button 
                   key={c.id}
                   onClick={() => setFilter({ ...filter, corridor: String(c.id) })}
                   className="group flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                 >
                    <div className={`w-20 h-20 rounded-full overflow-hidden transition-all duration-500 border-2 relative ${active ? `${theme.accent.replace('text-', 'border-')} scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]` : 'border-slate-200 hover:border-slate-300'}`}>
                       {c.image_url ? (
                         <img src={c.image_url} alt={c.name} className={`w-full h-full object-cover transition-transform duration-700 ${active ? 'scale-110' : 'group-hover:scale-110 opacity-60 group-hover:opacity-100'}`} />
                       ) : (
                         <div className={`w-full h-full flex items-center justify-center text-2xl font-black bg-gradient-to-br from-slate-800 to-slate-950 ${active ? 'text-slate-900' : 'text-slate-900/20'}`}>
                            {initials}
                         </div>
                       )}
                       {active && <div className="absolute inset-0 bg-slate-100 pointer-events-none" />}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-slate-900' : 'text-slate-900/20 group-hover:text-slate-900/40'}`}>{c.name}</span>
                 </button>
               )
            })}
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16">
          <div>
             <div className="flex flex-col relative pl-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white absolute -left-2 top-2 shadow-xl z-10">
                   <Search className="w-5 h-5" />
                </div>
                <h1 className="text-7xl md:text-[7rem] font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85] relative z-0">
                  <span className="block text-slate-800">FIND</span>
                  <span className="block text-slate-900">RIDE</span>
                </h1>
                <p className="text-slate-900/40 text-[10px] mt-4 font-black uppercase tracking-widest pl-2">{filtered.length} ACTIVE RIDE{filtered.length !== 1 ? 'S' : ''} DETECTED</p>
             </div>
          </div>

          {/* COOL TOGGLES */}
          <div className="flex flex-wrap items-center gap-4">
             {/* Mission Direction */}
             <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-1">
                {[
                  { id: 'to_office', label: 'Office', icon: '🏢' },
                  { id: 'to_home', label: 'Home', icon: '🏠' }
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => setFilter({ ...filter, direction: d.id })}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 ${filter.direction === d.id ? 'bg-blue-600 text-slate-900 shadow-lg' : 'text-slate-900/30 hover:text-slate-900'}`}
                  >
                    {d.icon} {d.label}
                  </button>
                ))}
             </div>

             {/* Travel Date */}
             <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex items-center gap-1">
                {[
                  { label: 'Today', date: getISTDateString() },
                  { label: 'Tomorrow', date: (() => {
                    const istOffset = 5.5 * 60 * 60 * 1000
                    const tomorrow = new Date(Date.now() + istOffset + 86400000)
                    return tomorrow.toISOString().split('T')[0]
                  })() }
                ].map(dt => (
                  <button
                   key={dt.label}
                   onClick={() => setFilter({ ...filter, date: dt.date })}
                   className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all ${filter.date === dt.date ? 'bg-amber-400 text-black shadow-lg' : 'text-slate-900/30 hover:text-slate-900'}`}
                  >
                    {dt.label}
                  </button>
                ))}
                <div className="w-[1px] h-4 bg-slate-100 mx-1" />
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-900/40 pointer-events-none" />
                  <input 
                    type="date" 
                    value={filter.date}
                    min={getISTDateString()}
                    max={(() => {
                      const istOffset = 5.5 * 60 * 60 * 1000
                      const maxDate = new Date(Date.now() + istOffset + 5 * 86400000)
                      return maxDate.toISOString().split('T')[0]
                    })()}
                    onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                    className="bg-transparent border-none text-[10px] font-black text-slate-900 px-8 py-2 rounded-xl focus:outline-none focus:bg-white transition-all w-32 cursor-pointer [color-scheme:dark]"
                  />
                </div>
             </div>

             <div className="bg-white border border-slate-200 p-1.5 rounded-2xl flex gap-1 ml-auto md:ml-0">
                <button onClick={() => setView('grid')} className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-900/20 hover:text-slate-900'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setView('list')} className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-900/20 hover:text-slate-900'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>

             <button 
                onClick={() => setShowFilled(!showFilled)} 
                className={`px-6 py-2 border rounded-2xl transition-all flex items-center gap-3 ${showFilled ? 'bg-blue-600 text-white border-slate-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-blue-600 text-white/30 border-slate-200 hover:border-slate-300'}`}
              >
                 {showFilled ? <EyeOff className="w-4 h-4" /> : <AlignJustify className="w-4 h-4" />}
                 <span className="text-[10px] font-black uppercase tracking-widest">{showFilled ? 'HIDE FULL' : 'SHOW FULL'}</span>
             </button>

             <button 
                onClick={() => setLiveOnly(!liveOnly)} 
                className={`px-6 py-2 border rounded-2xl transition-all flex items-center gap-3 ${liveOnly ? 'bg-green-500 text-slate-900 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-blue-600 text-white/30 border-slate-200 hover:border-slate-300'}`}
              >
                <Timer className={`w-4 h-4 ${liveOnly ? 'animate-pulse' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{liveOnly ? 'LIVE ONLY' : 'ALL RIDES'}</span>
              </button>

             <button onClick={fetchRides} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-100 transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
          </div>
        </div>

               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-16">
                  {Object.entries(VIBE_CONFIG).map(([id, v]) => {
                     const active = filter.vibeTag === id
                     const h = new Date().getHours() // Re-fetch current hour for visibility check
                     const isTodayNode = filter.date === new Date().toISOString().split('T')[0]
                     const isVisible = id === 'all' || !isTodayNode || 
                                      (h < 14 && ['6-7','7-8','8-9','9-10','10-11','12-24'].includes(id)) ||
                                      (h >= 12 && ['16-18','18-20','20-22','22-24'].includes(id))
                     
                     if (!isVisible) return null

                     return (
                       <button 
                         key={id}
                         onClick={() => setFilter(p => ({ ...p, vibeTag: id }))}
                         className={`p-3 rounded-2xl border transition-all flex items-center justify-center gap-3 relative group ${active ? `bg-blue-600 text-white border-blue-500 shadow-[0_5px_15px_rgba(37,99,235,0.3)] scale-105` : `bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-slate-50`}`}
                       >
                          <div className={`transition-all duration-300 ${active ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>
                             {v.icon}
                          </div>
                          <div className="flex flex-col items-start leading-none transition-all duration-300">
                             <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-700'}`}>{v.label}</span>
                             <span className={`text-[8px] font-bold mt-1 ${active ? 'text-blue-100' : 'text-slate-400'}`}>{v.sub}</span>
                          </div>
                       </button>
                     )
                  })}
               </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
             <div className="w-12 h-12 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-[10px] font-black uppercase tracking-[0.5em]">Loading Rides...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 bg-white border border-slate-200 rounded-[3rem] backdrop-blur-xl">
            <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tighter">Negative Signal</h3>
            <p className="text-slate-900/20 text-[10px] font-black uppercase tracking-widest leading-relaxed">Adjust your ride coordinates<br/>or publish a new route</p>
          </div>
        ) : view === 'grid' ? (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
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
              <div key={ride.id} className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-100 transition-all">
                <div className="flex items-center gap-6 flex-1">
                   <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-200 relative">
                      <Car className="w-8 h-8 text-slate-900/20" />
                      {currentUser?.id === ride.user_id && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-slate-200" title="Your Ride" />}
                   </div>
                   <div>
                      <h4 className="text-xl font-black tracking-tight">{ride.corridor_name}</h4>
                      <p className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest">Driver: {ride.user_name}</p>
                   </div>
                   <div className="hidden md:block h-8 w-px bg-slate-100 mx-4" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-900/20 uppercase tracking-widest">Departure</span>
                       <span className="font-black flex items-center gap-2"><Clock className="w-3 h-3 text-amber-600" /> {fmtTime(ride.ride_time)}</span>
                   </div>
                </div>
                
                <div className="flex items-center gap-8">
                   <div className="text-right">
                      <span className="text-[10px] font-black text-slate-900/20 uppercase tracking-widest">Fare</span>
                      <p className="text-xl font-black text-green-600">₹{ride.price_per_seat}</p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <Link href={`/rides/${ride.id}`} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">Details</Link>
                      {requests.some(r => r.ride_id === ride.id && r.status === 'pending') ? (
                        <button onClick={() => handleRetract(ride.id)} className="px-6 py-3 bg-blue-600 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Requested</button>
                      ) : (
                        <button 
                          disabled={ride.available_seats === 0}
                          onClick={() => handleBook(ride.id, 1)} 
                          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${ride.available_seats === 0 ? 'bg-blue-600 text-slate-300' : 'bg-blue-600 text-white hover:bg-amber-400'}`}
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
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-900/20 animate-pulse">Loading Pulse...</div>}>
      <RidesContent />
    </Suspense>
  )
}
