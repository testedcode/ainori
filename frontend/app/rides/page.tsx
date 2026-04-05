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

const CORRIDORS = [
  { id: 1, name: 'Casa Rio' }, { id: 2, name: 'Casa Bella' },
  { id: 3, name: 'Lakeshore' }, { id: 4, name: 'Kharghar' },
]
const TIME_SLOTS = [
  { label: 'All', value: '', icon: Zap },
  { label: 'Morning', value: 'morning', range: '6–10AM', icon: Sun },
  { label: 'Evening', value: 'evening', range: '5–9PM', icon: Sunset },
  { label: 'Night', value: 'night', range: '9PM+', icon: Moon },
]

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
        <div key={i} className={`h-1.5 rounded-full transition-colors ${i < (total - available) ? 'bg-slate-700 w-3' : 'bg-green-400 w-3'}`} />
      ))}
    </div>
  )
}

// ─── CARD VIEW ───────────────────────────────────────────────────────────────
function CardView({ ride, onRequest }: { ride: Ride; onRequest: (id: number) => void }) {
  const initials = ride.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()
  const isEvening = getTimeSlot(ride.ride_time) === 'evening'

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 hover:bg-white/[0.07] transition-all group flex flex-col">
      {/* Color bar */}
      <div className={`h-1 w-full ${isEvening ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`} />
      <div className="p-5 flex flex-col flex-1">
        {/* Driver row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0 relative">
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
          <span className={`text-[10px] font-black px-2 py-1 rounded-lg border ${isEvening ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
            {ride.ride_time?.slice(0, 5)}
          </span>
        </div>

        {/* Route */}
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

        {/* Vehicle */}
        {ride.vehicle_make && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl mb-3">
            <Car className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] font-medium text-slate-400 truncate">{ride.vehicle_color} {ride.vehicle_make} {ride.vehicle_model}</span>
          </div>
        )}

        {/* Seats */}
        <div className="mt-auto">
          <SeatDots available={ride.available_seats} total={ride.total_seats} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-slate-500">{ride.available_seats}/{ride.total_seats} seats</span>
            <span className="text-sm font-black text-green-400">₹{ride.price_per_seat}</span>
          </div>
        </div>

        {/* CTA */}
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

// DEMO DATA
const DEMO_RIDES: Ride[] = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  user_id: i + 2,
  user_name: ['Aayushi Singh', 'Rajiv Mehta', 'Samiksha Patil', 'Priya Nair', 'Arjun Sharma', 'Divya Kumar', 'Rohit Joshi', 'Meena Iyer', 'Sanjay Gupta', 'Anjali Rao'][i % 10],
  corridor_name: ['Casa Rio', 'Casa Bella', 'Lakeshore', 'Kharghar'][i % 4],
  corridor_id: (i % 4) + 1,
  ride_date: new Date().toISOString().split('T')[0],
  ride_time: ['08:00:00', '08:30:00', '09:00:00', '09:30:00', '17:30:00', '18:00:00', '18:30:00', '07:30:00'][i % 8],
  pickup_point: ['Gate 1', 'Gate 2', 'Main Gate', 'Phase 2', 'Sector 20'][i % 5] + ' - ' + ['Casa Rio', 'Casa Bella', 'Lakeshore', 'Kharghar'][i % 4],
  drop_point: 'Reliance Corporate Park (RCP)',
  price_per_seat: [80, 100, 120, 150][i % 4],
  available_seats: i === 2 ? 0 : i === 7 ? 0 : (i % 3) + 1,
  total_seats: (i % 2 === 0) ? 4 : 3,
  status: 'active',
  vehicle_make: ['Honda', 'Hyundai', 'Tata', 'Maruti', 'Mahindra'][i % 5],
  vehicle_model: ['City', 'Creta', 'Nexon', 'Swift', 'Scorpio'][i % 5],
  vehicle_color: ['White', 'Silver', 'Blue', 'Black', 'Red'][i % 5],
  vehicle_type: ['Sedan', 'SUV', 'SUV', 'Hatchback', 'SUV'][i % 5],
  vehicle_number: `MH04 ${String.fromCharCode(65 + i)}${String.fromCharCode(65 + i)} ${1000 + i}`,
}))

type ViewMode = 'grid' | 'list' | 'compact'

function RidesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const corridorParam = searchParams.get('corridor')

  const [rides, setRides] = useState<Ride[]>(DEMO_RIDES)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [activeCorridorId, setActiveCorridorId] = useState<number | null>(corridorParam ? parseInt(corridorParam) : null)
  const [activeTimeSlot, setActiveTimeSlot] = useState('')
  const [showFilled, setShowFilled] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [myBookedIds] = useState<number[]>([]) // IDs of rides user has booked

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchRides()
  }, [])

  const fetchRides = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/rides?date=' + new Date().toISOString().split('T')[0])
      if (Array.isArray(data) && data.length > 0) setRides(data as Ride[])
      else setRides(DEMO_RIDES)
    } catch { setRides(DEMO_RIDES) }
    finally { setLoading(false) }
  }, [])

  const handleRequest = async (rideId: number) => {
    try {
      await api.post(`/rides/${rideId}/requests`, { seats_requested: 1 })
      toast.success('Seat request sent!')
    } catch { toast.error('Could not send request') }
  }

  // Apply all filters
  const filtered = rides.filter(r => {
    const corridorOk = activeCorridorId ? r.corridor_id === activeCorridorId : true
    const timeOk = activeTimeSlot ? getTimeSlot(r.ride_time) === activeTimeSlot : true
    const filledOk = showFilled ? true : r.available_seats > 0
    const searchOk = !search || r.user_name.toLowerCase().includes(search.toLowerCase()) || r.pickup_point.toLowerCase().includes(search.toLowerCase()) || r.corridor_name.toLowerCase().includes(search.toLowerCase())
    return corridorOk && timeOk && filledOk && searchOk
  })

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const morningCount = rides.filter(r => getTimeSlot(r.ride_time) === 'morning' && r.available_seats > 0).length
  const eveningCount = rides.filter(r => getTimeSlot(r.ride_time) === 'evening' && r.available_seats > 0).length

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [activeCorridorId, activeTimeSlot, showFilled, search])

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20">
      <div className="absolute top-0 left-0 w-full h-96 bg-blue-600/8 blur-[120px] -z-10 pointer-events-none" />
      <JoolNav />

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Available Rides</h1>
            <p className="text-slate-500 mt-1">
              <span className="text-white font-bold">{filtered.length}</span> ride{filtered.length !== 1 ? 's' : ''} available today
              {!showFilled && rides.filter(r => r.available_seats === 0).length > 0 && (
                <span className="text-slate-600"> · {rides.filter(r => r.available_seats === 0).length} full (hidden)</span>
              )}
            </p>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
              <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search host, route..." className="bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none w-36" />
            </div>

            {/* Show filled toggle */}
            <button onClick={() => setShowFilled(!showFilled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${showFilled ? 'bg-slate-600/30 border-slate-500/30 text-slate-300' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}>
              {showFilled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {showFilled ? 'Showing full' : 'Hiding full'}
            </button>

            {/* Refresh */}
            <button onClick={fetchRides} className="p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* View toggle */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
              {([['grid', LayoutGrid], ['list', List], ['compact', AlignJustify]] as [ViewMode, any][]).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-1.5 rounded-xl transition-all ${view === v ? 'bg-white/15 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Car className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-lg font-black text-white">{filtered.filter(r => r.available_seats > 0).length}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Available</p>
            </div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Sun className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-lg font-black text-amber-400">{morningCount}</p>
              <p className="text-[10px] text-amber-700 uppercase font-bold tracking-widest">Morning</p>
            </div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Sunset className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div>
              <p className="text-lg font-black text-orange-400">{eveningCount}</p>
              <p className="text-[10px] text-orange-700 uppercase font-bold tracking-widest">Evening</p>
            </div>
          </div>
        </div>

        {/* Corridor Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => setActiveCorridorId(null)}
            className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${activeCorridorId === null ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}>
            All Corridors
          </button>
          {CORRIDORS.map(c => (
            <button key={c.id} onClick={() => setActiveCorridorId(c.id)}
              className={`px-5 py-2 rounded-full text-sm font-bold border transition-all ${activeCorridorId === c.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Time Slot Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TIME_SLOTS.map(slot => {
            const Icon = slot.icon
            return (
              <button key={slot.value} onClick={() => setActiveTimeSlot(slot.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${activeTimeSlot === slot.value ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5" />
                {slot.label}
                {slot.range && <span className="text-[10px] opacity-60">{slot.range}</span>}
              </button>
            )
          })}
        </div>

        {/* Rides */}
        {paginated.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-xl font-black text-white mb-2">No rides found</p>
            <p className="text-slate-500 text-sm mb-6">Try adjusting filters or check back soon</p>
            <Link href="/offer-ride" className="inline-block bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-2xl font-black transition-colors">
              Be the first to offer →
            </Link>
          </div>
        ) : (
          <>
            {/* COMPACT — full width table */}
            {view === 'compact' && (
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 grid grid-cols-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  <span>Host & Route</span><span>Corridor</span><span>Seats</span><span>Price</span>
                </div>
                {paginated.map(ride => <CompactView key={ride.id} ride={ride} onRequest={handleRequest} />)}
              </div>
            )}

            {/* LIST — one per row */}
            {view === 'list' && (
              <div className="space-y-3">
                {paginated.map(ride => <ListView key={ride.id} ride={ride} onRequest={handleRequest} />)}
              </div>
            )}

            {/* GRID — responsive cards */}
            {view === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {paginated.map(ride => <CardView key={ride.id} ride={ride} onRequest={handleRequest} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-2xl disabled:opacity-30 hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-2xl text-sm font-black transition-all ${p === page ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10'}`}>
                    {p}
                  </button>
                ))}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-2xl disabled:opacity-30 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            <p className="text-center text-xs text-slate-600 mt-4">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} rides
            </p>
          </>
        )}
      </main>
    </div>
  )
}

export default function RidesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <RidesContent />
    </Suspense>
  )
}
