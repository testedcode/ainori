'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, Search, Users, IndianRupee, Sun, Sunset, Moon, Zap, 
  LayoutGrid, List, AlignJustify, Star, Shield, ChevronRight,
  Filter, RefreshCw, MapPin, Clock, ChevronLeft, Eye, EyeOff
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'

interface Ride {
  id: number
  user_id: number
  user_name: string
  corridor_name: string
  corridor_id: number
  ride_date: string
  ride_time: string
  pickup_point: string
  drop_point: string
  price_per_seat: number
  available_seats: number
  total_seats: number
  status: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_color?: string
  vehicle_type?: string
  vehicle_number?: string
  pickup_points?: string[]
}

interface Corridor {
  id: number
  name: string
}

const PAGE_SIZE = 12

function getTimeSlot(time: string) {
  if (!time) return 'other'
  const h = parseInt(time.split(':')[0])
  if (h >= 6 && h < 10) return 'morning'
  if (h >= 17 && h < 21) return 'evening'
  if (h >= 21) return 'night'
  return 'other'
}

function SeatDots({ available, total }: { available: number; total: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1.5 rounded-full transition-colors ${i < (total - available) ? 'bg-slate-700 w-3' : 'bg-blue-400 w-3'}`} />
      ))}
    </div>
  )
}

const OFFICE_KEYWORDS = ['rcp', 'reliance', 'corporate park', 'office']

function getTripType(pickup: string, drop: string) {
  const isToOffice = OFFICE_KEYWORDS.some(k => drop.toLowerCase().includes(k))
  const isToHome = OFFICE_KEYWORDS.some(k => pickup.toLowerCase().includes(k))
  if (isToOffice) return { label: 'To Office', icon: '🏢', color: 'text-blue-400', isToOffice: true }
  if (isToHome) return { label: 'To Home', icon: '🏠', color: 'text-orange-400', isToOffice: false }
  return { label: 'General', icon: '📍', color: 'text-slate-400', isToOffice: false }
}

// ─── CARD VIEW ───────────────────────────────────────────────────────────────
function CardView({ ride, onRequest }: { ride: Ride; onRequest: (id: number) => void }) {
  const initials = ride.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()
  const slot = getTimeSlot(ride.ride_time)
  const isEvening = slot === 'evening'
  const isMorning = slot === 'morning'
  const type = getTripType(ride.pickup_point, ride.drop_point)
  const isMorningPeak = isMorning && type.isToOffice

  return (
    <div className={`relative bg-white/5 border rounded-3xl overflow-hidden hover:bg-white/[0.07] transition-all group flex flex-col ${
      isMorningPeak ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/10 hover:border-white/20'
    }`}>
      {isMorningPeak && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-amber-500 text-[8px] font-black text-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
            <Zap className="w-2 h-2 fill-black" /> Morning Peak
          </div>
        </div>
      )}
      <div className={`h-1 w-full ${isEvening ? 'bg-gradient-to-r from-orange-500 to-pink-500' : isMorningPeak ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border border-white/5 bg-white/5 ${type.color}`}>
              {type.icon} {type.label}
            </span>
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${isEvening ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
            {ride.ride_time?.slice(0, 5)}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 relative ${isMorningPeak ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-600 to-indigo-600'}`}>
                {initials}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f172a]" />
             </div>
             <div className="flex-1 min-w-0">
               <p className="font-bold text-white text-sm truncate">{ride.user_name}</p>
               <div className="flex items-center gap-1.5">
                 <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                 <span className="text-[10px] text-slate-500">4.9</span>
                 <Shield className="w-3 h-3 text-blue-400" />
               </div>
             </div>
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${isEvening ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
            {ride.ride_time?.slice(0, 5)}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3 text-sm">
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div className="w-px h-4 bg-white/10" />
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <span className="text-slate-300 font-medium truncate text-xs">{ride.pickup_point}</span>
            <span className="text-slate-400 truncate text-xs">{ride.drop_point}</span>
          </div>
        </div>

        {ride.vehicle_make && (
           <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl mb-3">
             <Car className="w-3 h-3 text-slate-500" />
             <span className="text-[10px] font-medium text-slate-400 truncate">{ride.vehicle_color} {ride.vehicle_make} {ride.vehicle_model}</span>
           </div>
        )}

        <div className="mt-auto">
          <SeatDots available={ride.available_seats} total={ride.total_seats} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-500">{ride.available_seats}/{ride.total_seats} seats</span>
            <span className="text-sm font-black text-green-400">₹{ride.price_per_seat}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Link href={`/rides/${ride.id}`} className="flex-1 text-center py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">Details</Link>
          {ride.available_seats > 0 && (
            <button onClick={() => onRequest(ride.id)} className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 transition-colors">Request</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── LIST VIEW ───────────────────────────────────────────────────────────────
function ListView({ ride, onRequest }: { ride: Ride; onRequest: (id: number) => void }) {
  const initials = ride.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 hover:bg-white/[0.07] hover:border-white/20 transition-all">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">{initials}</div>
      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <p className="font-bold text-white text-sm truncate">{ride.user_name}</p>
          <p className="text-[10px] text-slate-500">{ride.corridor_name}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          {ride.ride_time?.slice(0, 5)} · {new Date(ride.ride_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
        <div className="flex flex-col gap-0.5">
          <SeatDots available={ride.available_seats} total={ride.total_seats} />
          <span className="text-[10px] text-slate-500">{ride.available_seats} left</span>
        </div>
        <div className="flex items-center gap-1 text-green-400 font-black">
          <IndianRupee className="w-3.5 h-3.5" />{ride.price_per_seat}
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <Link href={`/rides/${ride.id}`} className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">View</Link>
        {ride.available_seats > 0 && (
          <button onClick={() => onRequest(ride.id)} className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 transition-colors">Request</button>
        )}
      </div>
    </div>
  )
}

// ─── COMPACT VIEW ────────────────────────────────────────────────────────────
function CompactView({ ride, onRequest }: { ride: Ride; onRequest: (id: number) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group">
      <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${ride.available_seats === 0 ? 'bg-slate-700' : getTimeSlot(ride.ride_time) === 'evening' ? 'bg-orange-500' : 'bg-blue-500'}`} />
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
        {ride.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{ride.user_name} <span className="text-slate-500 font-normal text-xs">· {ride.pickup_point}</span></p>
        <p className="text-[10px] text-slate-600">{ride.corridor_name} · {ride.ride_time?.slice(0, 5)}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={`text-xs font-black ${ride.available_seats > 1 ? 'text-green-400' : ride.available_seats === 1 ? 'text-yellow-400' : 'text-red-400'}`}>
          {ride.available_seats} seats
        </span>
        <span className="text-xs font-black text-white">₹{ride.price_per_seat}</span>
        <Link href={`/rides/${ride.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  )
}

function RidesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const corridorParam = searchParams.get('corridor')

  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [filter, setFilter] = useState({
    city: '',
    corridor: corridorParam || '',
    date: new Date().toISOString().split('T')[0],
    timeRange: 'all', // all, morning, midday, evening, night
    direction: 'all' // all, to_office, to_home
  })
  const [corridors, setCorridors] = useState<Corridor[]>([])

  useEffect(() => {
    const fetchCorridors = async () => {
      try {
        const res = await api.get('/corridors?active=true') as unknown as Corridor[]
        if (Array.isArray(res)) setCorridors(res)
      } catch (err) {
        console.error('Failed to fetch corridors')
      }
    }
    fetchCorridors()
  }, [])
  const [showFilled, setShowFilled] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchRides()
  }, [filter.date])

  const fetchRides = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get(`/rides?date=${filter.date}`)
      if (Array.isArray(data)) setRides(data as Ride[])
    } catch { toast.error('Check network or login status') }
    finally { setLoading(false) }
  }, [filter.date])

  const handleRequest = async (rideId: number) => {
    try {
      await api.post(`/rides/${rideId}/requests`, { seats_requested: 1 })
      toast.success('Seat request sent!')
    } catch { toast.error('Could not send request') }
  }

  // Frontend filtering logic
  const filtered = rides.filter(r => {
    if (!showFilled && r.available_seats === 0) return false
    if (filter.corridor && r.corridor_id !== parseInt(filter.corridor)) return false
    
    if (filter.timeRange !== 'all') {
      const h = parseInt(r.ride_time.split(':')[0])
      if (filter.timeRange === 'morning' && (h < 6 || h >= 10)) return false
      if (filter.timeRange === 'midday' && (h < 10 || h >= 15)) return false
      if (filter.timeRange === 'evening' && (h < 15 || h >= 21)) return false
      if (filter.timeRange === 'night' && h < 21 && h >= 6) return false
    }

    if (search) {
      const s = search.toLowerCase()
      if (!(r.user_name.toLowerCase().includes(s) || r.pickup_point.toLowerCase().includes(s) || r.corridor_name.toLowerCase().includes(s))) return false
    }

    if (filter.direction !== 'all') {
      const isToOffice = OFFICE_KEYWORDS.some(k => r.drop_point.toLowerCase().includes(k))
      const isToHome = OFFICE_KEYWORDS.some(k => r.pickup_point.toLowerCase().includes(k))
      if (filter.direction === 'to_office' && !isToOffice) return false
      if (filter.direction === 'to_home' && !isToHome) return false
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20">
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/8 blur-[120px] -z-10 pointer-events-none" />
      <JoolNav />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Active Commutes</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Found {filtered.length} premium routes for your selection.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5">
               <Search className="w-4 h-4 text-slate-500" />
               <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Search host or point..." className="bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none w-32 md:w-48" />
             </div>
             <button onClick={fetchRides} className="p-2.5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             </button>
             <div className="flex items-center bg-white/5 border border-white/5 rounded-2xl p-1">
               {([['grid', LayoutGrid], ['list', List], ['compact', AlignJustify]] as [ViewMode, any][]).map(([v, Icon]) => (
                 <button key={v} onClick={() => setView(v)}
                   className={`p-1.5 rounded-xl transition-all ${view === v ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                   <Icon className="w-4 h-4" />
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-4">
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Date Focus</label>
                <div className="flex gap-2">
                  {[
                    { label: 'Today', date: new Date().toISOString().split('T')[0] },
                    { label: 'Tomorrow', date: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
                  ].map((d) => (
                    <button
                      key={d.label}
                      onClick={() => setFilter({ ...filter, date: d.date })}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filter.date === d.date ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    >
                      {d.label}
                    </button>
                  ))}
                  <input type="date" value={filter.date} onChange={e => setFilter({...filter, date: e.target.value})} className="flex-1 bg-white/5 border border-white/5 text-xs text-white p-2 rounded-xl" />
                </div>
             </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-4 text-xs font-black">
             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest px-1">Route & Time</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={filter.direction} onChange={e => setFilter({...filter, direction: e.target.value})} className="bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors appearance-none">
                    <option value="all">Any Direction</option>
                    <option value="to_office">🏢 To Office</option>
                    <option value="to_home">🏠 To Home</option>
                  </select>
                  <select value={filter.timeRange} onChange={e => setFilter({...filter, timeRange: e.target.value})} className="bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors appearance-none">
                    <option value="all">Any Time</option>
                    <option value="morning">Morning (6-10AM)</option>
                    <option value="midday">Mid-day (10-3PM)</option>
                    <option value="evening">Evening (3-9PM)</option>
                    <option value="night">Night (9PM+)</option>
                  </select>
                </div>
                <select value={filter.corridor} onChange={e => setFilter({...filter, corridor: e.target.value})} className="w-full bg-[#0f172a] border border-white/10 text-white p-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors appearance-none mt-1">
                  <option value="">All Corridors</option>
                  {corridors.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="bg-blue-600/5 border border-blue-500/10 rounded-3xl p-5 flex items-center justify-between">
             <div>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status</p>
               <p className="text-sm font-bold text-white">{showFilled ? 'Showing All' : 'Hiding Full Rides'}</p>
             </div>
             <button onClick={() => setShowFilled(!showFilled)} className={`w-12 h-6 rounded-full p-1 transition-colors ${showFilled ? 'bg-blue-600' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showFilled ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[3rem]">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🚗</div>
            <h3 className="text-xl font-black text-white mb-2">No matches found for this setup.</h3>
            <p className="text-slate-500 text-sm mb-8 px-10">Adjust your filters or be the first to post a new route on this date.</p>
            <Link href="/offer-ride" className="bg-white text-black px-8 py-3 rounded-2xl font-black hover:bg-slate-200 transition-all">Publish Commute</Link>
          </div>
        ) : (
          <>
            {view === 'compact' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 grid grid-cols-4 text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/[0.02]">
                  <span>Host & Route</span><span>Corridor</span><span>Seats</span><span>Price</span>
                </div>
                {paginated.map(ride => <CompactView key={ride.id} ride={ride} onRequest={handleRequest} />)}
              </div>
            )}
            {view === 'list' && <div className="space-y-3">{paginated.map(ride => <ListView key={ride.id} ride={ride} onRequest={handleRequest} />)}</div>}
            {view === 'grid' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{paginated.map(ride => <CardView key={ride.id} ride={ride} onRequest={handleRequest} />)}</div>}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} className="p-3 bg-white/5 border border-white/5 rounded-2xl disabled:opacity-30 hover:bg-white/10 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                <div className="flex gap-2 text-sm font-black text-white/20">Page <span className="text-white">{page}</span> of {totalPages}</div>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="p-3 bg-white/5 border border-white/5 rounded-2xl disabled:opacity-30 hover:bg-white/10 transition-all"><ChevronRight className="w-5 h-5" /></button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

type ViewMode = 'grid' | 'list' | 'compact'

export default function RidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white/20 font-black animate-pulse">LOADING JOOL GRID...</div>}>
      <RidesContent />
    </Suspense>
  )
}
