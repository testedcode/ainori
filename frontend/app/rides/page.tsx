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
  Building2, Home
} from 'lucide-react'
import { api } from '@/lib/api'
import { getVibe, VIBE_THEMES, VibeState } from '@/lib/vibe-utils'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'
import VibeCanvas from '../components/VibeCanvas'

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Ride {
  id: number; user_id: number; user_name: string; corridor_name: string; corridor_id: number;
  corridor_description?: string; ride_date: string; ride_time: string; pickup_point: string;
  drop_point: string; price_per_seat: number; available_seats: number; total_seats: number;
  status: string; vehicle_make?: string; vehicle_model?: string; vehicle_color?: string;
  vehicle_type?: string; vehicle_number?: string;
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
  const initials = ride.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()
  const isMorning = parseInt(ride.ride_time.split(':')[0]) < 12

  return (
    <div className={`relative bg-white/5 border backdrop-blur-md rounded-[2.5rem] overflow-hidden transition-all duration-500 group flex flex-col ${
      isSelected ? 'border-green-500/50 scale-[1.02] shadow-[0_20px_50px_rgba(34,197,94,0.1)]' : isRequested ? 'border-blue-500/50' : 'border-white/10'
    }`}>
      {/* Dynamic Header Glow */}
      <div className={`h-1.5 w-full transition-colors duration-1000 ${isSelected ? 'bg-green-500' : isMorning ? 'bg-amber-400' : 'bg-blue-600'}`} />
      
      {isOwnRide && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg z-10 animate-pulse">
           Your Ride
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
             <span className="text-[36px] font-black text-white leading-none tracking-tighter">
               {ride.ride_time?.slice(0, 5)}
             </span>
             <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">Departure Point</span>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[10px] text-white font-black">4.9</span>
             </div>
             <p className="text-[10px] font-black text-green-400 mt-2 uppercase tracking-tight">₹{ride.price_per_seat} Seat</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 bg-white/5 p-3 rounded-2xl border border-white/5">
           <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg`}>
              {initials}
           </div>
           <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm truncate leading-none mb-1">{ride.user_name}</p>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest truncate">{ride.corridor_name}</p>
           </div>
        </div>

        <div className="space-y-3 mb-8">
           <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <p className="text-white font-bold text-xs truncate flex-1">{ride.pickup_point}</p>
           </div>
           <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1.5" />
              <p className="text-white/40 font-medium text-[11px] truncate flex-1">{ride.drop_point}</p>
           </div>
        </div>

        {/* Action Zone */}
        <div className="mt-auto pt-6 border-t border-white/5">
           {!isRequested ? (
             <>
               <div className="flex items-center justify-between mb-4 px-1">
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Select Capacity</p>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{ride.available_seats} Available</p>
               </div>
               <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4].map(n => {
                    const available = n <= ride.available_seats
                    return (
                      <button
                        key={n}
                        disabled={!available}
                        onClick={() => onSelect(isSelected === n ? null : n)}
                        className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all border ${
                          isSelected === n 
                            ? 'bg-green-600 border-green-400 text-white shadow-lg' 
                            : available 
                            ? 'bg-white/5 text-white/40 border-white/5 hover:border-white/20' 
                            : 'bg-white/5 text-white/10 border-transparent opacity-20 cursor-not-allowed'
                        }`}
                      >
                        {n}
                      </button>
                    )
                  })}
               </div>
               <button 
                 onClick={() => isSelected && onBook(ride.id, isSelected)}
                 disabled={!isSelected}
                 className={`w-full py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                   isSelected 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_15px_30px_rgba(34,197,94,0.3)]' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                 }`}
               >
                 {isSelected ? <>LETS GO <ArrowRight className="w-4 h-4" /></> : 'CHOOSE SEATS'}
               </button>
             </>
           ) : (
             <button 
               onClick={() => onRetract(ride.id)}
               className="w-full py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white transition-all group flex items-center justify-center gap-3"
             >
               <span className="group-hover:hidden flex items-center gap-2"><Check className="w-4 h-4" /> REQUESTED</span>
               <span className="hidden group-hover:flex items-center gap-2 text-white"><X className="w-4 h-4" /> NOT YET</span>
             </button>
           )}
           <Link href={`/rides/${ride.id}`} className="block w-full text-center mt-4 text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors">
              VIEW RIDE DETAILS
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
  const [selectedRideSeats, setSelectedRideSeats] = useState<Record<number, number | null>>({})
  
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
    timeRange: 'all',  // Default to 'all' so newly posted rides are always visible
    direction: 'all'   // Default to 'all' so both directions are shown
  })

  useEffect(() => {
    fetchCorridors()
    fetchUserRequests()
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
    try {
      await api.post(`/rides/${rideId}/requests`, { seats_requested: seats })
      toast.success('Lets Go! Request broadcasted.', { icon: '🚀' })
      setSelectedRideSeats(prev => ({ ...prev, [rideId]: null }))
      fetchUserRequests()
    } catch { toast.error('Launch failed') }
  }

  const handleRetract = async (rideId: number) => {
    try {
      const req = requests.find(r => r.ride_id === rideId && r.status === 'pending')
      if (req) {
         await api.delete(`/rides/${rideId}/requests/${req.id}`)
         toast.success('Retracted. Not yet.', { icon: '🛑' })
         fetchUserRequests()
      }
    } catch { toast.error('Retraction failed') }
  }

  const filtered = rides.filter(r => {
    if (!showFilled && r.available_seats === 0) return false
    if (filter.corridor !== 'all' && r.corridor_id !== parseInt(filter.corridor)) return false
    
    const h = parseInt(r.ride_time.split(':')[0])
    const rideVibe = getVibe(h)
    if (filter.timeRange !== 'all' && filter.timeRange !== rideVibe) return false

    if (filter.direction !== 'all') {
      const isToOffice = OFFICE_KEYWORDS.some(k => r.drop_point.toLowerCase().includes(k))
      const isToHome = OFFICE_KEYWORDS.some(k => r.pickup_point.toLowerCase().includes(k))
      if (filter.direction === 'to_office' && !isToOffice) return false
      if (filter.direction === 'to_home' && !isToHome) return false
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(ride => (
              <CardView 
                key={ride.id} 
                ride={ride} 
                onBook={handleBook}
                onRetract={handleRetract}
                isOwnRide={currentUser?.id === ride.user_id}
                isRequested={requests.some(r => r.ride_id === ride.id && r.status === 'pending')}
                isSelected={selectedRideSeats[ride.id] || null}
                onSelect={(seats) => setSelectedRideSeats(prev => ({ ...prev, [ride.id]: seats }))}
              />
            ))}
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
