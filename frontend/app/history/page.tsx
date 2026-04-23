'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Clock, IndianRupee,
  ChevronRight, Car, User, Search, History as HistoryIcon,
  CheckCircle2, Loader2, Star, Zap, ExternalLink
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'

// ─── helpers ─────────────────────────────────────────────────────────────────
function fmtDate(raw: string) {
  if (!raw) return ''
  const dStr = raw.includes('T') ? raw.split('T')[0] : raw
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dStr === today) return 'Today'
  if (dStr === yesterday) return 'Yesterday'
  // Use a fixed time to avoid timezone shifts showing wrong date
  const d = new Date(dStr + 'T12:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function fmtTime(raw: string) {
  if (!raw) return ''
  // handles "HH:MM:SS" or full ISO
  const t = raw.includes('T') ? new Date(raw).toTimeString() : raw
  return t.slice(0, 5)
}

interface RidePaymentInfo { id?: number; rider_status?: string; giver_status?: string }
interface Rider { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number }
interface Ride {
  id: number; corridor_name: string; ride_date: string; ride_time: string
  pickup_point: string; drop_point: string; price_per_seat: number
  status: string; role: 'host' | 'rider'; user_id?: number; user_name?: string; direction?: string
  payment_info?: RidePaymentInfo; user_rating?: number | null
  confirmed_riders?: Rider[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'host' | 'rider'>('all')
  const [currentUserId, setCurrentUserId] = useState<number | undefined>()

  const loadRides = () => {
    api.get('/user/rides').then(res => {
      if (Array.isArray(res)) setRides(res as Ride[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    const u = localStorage.getItem('user')
    if (u) { try { const p = JSON.parse(u); setCurrentUserId(p.id || p.userId) } catch {} }
    loadRides()
  }, [router])

  const filtered = rides.filter(r => {
    if (activeTab === 'host' && r.role !== 'host') return false
    if (activeTab === 'rider' && r.role !== 'rider') return false
    if (search) {
      const s = search.toLowerCase()
      return r.corridor_name?.toLowerCase().includes(s) || r.pickup_point?.toLowerCase().includes(s)
    }
    return true
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const getDateKey = (raw: string) => (raw.includes('T') ? raw.split('T')[0] : raw)

  const recent = filtered.filter(r => { const d = getDateKey(r.ride_date); return d === todayStr || d === yesterdayStr }).sort((a, b) => b.ride_date.localeCompare(a.ride_date))
  const upcoming = filtered.filter(r => getDateKey(r.ride_date) > todayStr).sort((a, b) => a.ride_date.localeCompare(b.ride_date))
  const past = filtered.filter(r => getDateKey(r.ride_date) < yesterdayStr).sort((a, b) => b.ride_date.localeCompare(a.ride_date))

  const handleMarkPayment = async (rideId: number, riderId: number, asGiver: boolean) => {
    try {
      const payload = asGiver ? { giver_status: 'received' } : { rider_status: 'done' }
      await api.put(`/rides/${rideId}/payments/${riderId}`, payload)
      toast.success(asGiver ? '✅ Marked as received!' : '✅ Payment marked as done!')
      // Optimistic update
      setRides(prev => prev.map(r => {
        if (r.id !== rideId) return r
        return {
          ...r,
          payment_info: {
            ...r.payment_info,
            ...(asGiver ? { giver_status: 'received' } : { rider_status: 'done' })
          }
        }
      }))
    } catch { toast.error('Failed to update payment') }
  }

  const handleRate = async (rideId: number, rateeId: number, rating: number) => {
    if (!rateeId) { toast.error('Could not identify user to rate'); return }
    try {
      await api.post(`/rides/${rideId}/rate`, { rating, ratee_id: rateeId })
      toast.success(`⭐ ${rating}/5 submitted!`)
      // Optimistic update
      setRides(prev => prev.map(r => r.id === rideId ? { ...r, user_rating: rating } : r))
    } catch { toast.error('Rating failed') }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20">
      <JoolNav />
      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest mb-4">
              <ArrowLeft className="w-3 h-3" /> BACK
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <HistoryIcon className="w-8 h-8 text-blue-500" /> Commute History
            </h1>
            <p className="text-white/40 text-sm mt-1">Tap any card to open ride details and manage payments.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-sm text-white focus:outline-none w-40" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 bg-white/5 p-1 rounded-2xl w-max">
          {(['all', 'host', 'rider'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
              {tab === 'rider' ? 'Joined' : tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Loading...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {recent.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" /> RECENT ACTIVITY — TODAY & YESTERDAY
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recent.map(ride => <HistoryCard key={ride.id} ride={ride} isRecent currentUserId={currentUserId} onMarkPayment={handleMarkPayment} onRate={handleRate} />)}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Upcoming
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map(ride => <HistoryCard key={ride.id} ride={ride} currentUserId={currentUserId} onMarkPayment={handleMarkPayment} onRate={handleRate} />)}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Archive</h2>
              {past.length === 0 && recent.length === 0 && upcoming.length === 0 ? (
                <div className="py-20 bg-white/5 border border-white/10 rounded-[2.5rem] border-dashed text-center">
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">No rides yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map(ride => <HistoryCard key={ride.id} ride={ride} isPast currentUserId={currentUserId} onMarkPayment={handleMarkPayment} onRate={handleRate} />)}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

// ─── STAR RATING ─────────────────────────────────────────────────────────────
function StarRating({ rideId, rateeId, current, label, onRate }: {
  rideId: number; rateeId: number; current?: number | null; label: string
  onRate: (rid: number, rateeId: number, r: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-[9px] text-white/30 font-black uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n}
            onClick={e => { e.preventDefault(); e.stopPropagation(); onRate(rideId, rateeId, n) }}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            className="transition-all hover:scale-125 active:scale-95"
          >
            <Star className={`w-4 h-4 transition-colors ${((hover || current || 0) >= n) ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
          </button>
        ))}
        {current && <span className="ml-1 text-[9px] font-black text-amber-400">{current}/5</span>}
      </div>
    </div>
  )
}

// ─── HISTORY CARD ────────────────────────────────────────────────────────────
function HistoryCard({
  ride, isPast, isRecent, currentUserId, onMarkPayment, onRate
}: {
  ride: Ride; isPast?: boolean; isRecent?: boolean
  currentUserId?: number
  onMarkPayment: (rideId: number, riderId: number, asGiver: boolean) => void
  onRate: (rideId: number, rateeId: number, rating: number) => void
}) {
  const [marking, setMarking] = useState(false)
  const [localPayment, setLocalPayment] = useState(ride.payment_info)

  useEffect(() => { setLocalPayment(ride.payment_info) }, [ride.payment_info])

  const riderPaid = localPayment?.rider_status === 'done'
  const giverReceived = localPayment?.giver_status === 'received'
  const myPayDone = ride.role === 'rider' ? riderPaid : giverReceived

  const doMark = async (e: React.MouseEvent, riderId: number, asGiver: boolean) => {
    e.preventDefault(); e.stopPropagation()
    setMarking(true)
    try {
      const payload = asGiver ? { giver_status: 'received' } : { rider_status: 'done' }
      await api.put(`/rides/${ride.id}/payments/${riderId}`, payload)
      setLocalPayment(prev => ({ ...prev, ...(asGiver ? { giver_status: 'received' } : { rider_status: 'done' }) }))
      toast.success(asGiver ? '✅ Marked received!' : '✅ Payment done!')
      onMarkPayment(ride.id, riderId, asGiver)
    } catch { toast.error('Failed') }
    finally { setMarking(false) }
  }

  return (
    <Link href={`/rides/${ride.id}`} className={`block rounded-3xl p-5 transition-all group hover:scale-[1.01] hover:shadow-xl cursor-pointer ${
      isRecent ? 'bg-amber-500/5 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.06)]'
      : isPast ? 'bg-white/[0.02] border border-white/5 hover:bg-white/5'
      : 'bg-white/5 border-l-4 border-l-blue-500 border border-white/10'
    }`}>
      {/* TOP ROW */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-white text-base truncate">{ride.corridor_name}</h3>
            <ExternalLink className="w-3 h-3 text-white/20 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-1.5">
            {ride.role === 'host' ? <Car className="w-3 h-3 text-green-400" /> : <User className="w-3 h-3 text-blue-400" />}
            {ride.role === 'host' ? 'You hosted' : `Joined · ${ride.user_name || 'Host'}`}
          </p>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-xs font-black text-white">{fmtDate(ride.ride_date)}</p>
          <p className="text-[10px] text-white/30 font-bold">{fmtTime(ride.ride_time)}</p>
        </div>
      </div>

      {/* META */}
      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center gap-1 text-[10px] text-green-400 font-black">
          <IndianRupee className="w-3 h-3" />{ride.price_per_seat}/seat
        </span>
        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
          ride.status === 'completed' ? 'bg-green-500/10 text-green-400'
          : ride.status === 'cancelled' ? 'bg-red-500/10 text-red-400'
          : 'bg-blue-500/10 text-blue-400'
        }`}>{ride.status}</span>
        {/* Payment badge */}
        {myPayDone && (
          <span className="flex items-center gap-1 text-[8px] font-black text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        )}
      </div>

      {/* PAYMENT ACTIONS — stop propagation so link doesn't fire */}
      <div className="border-t border-white/5 pt-3 space-y-2" onClick={e => e.preventDefault()}>
        {/* Rider: mark own payment */}
        {ride.role === 'rider' && currentUserId && (
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-black uppercase tracking-widest ${riderPaid ? 'text-green-400' : 'text-white/20'}`}>
              {riderPaid ? '✓ Payment done' : 'Payment pending'}
            </span>
            {!riderPaid && (
              <button
                onClick={e => doMark(e, currentUserId, false)}
                disabled={marking}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-[9px] font-black hover:bg-green-500/30 transition-all"
              >
                {marking ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Mark Done
              </button>
            )}
          </div>
        )}

        {/* Host: mark received per rider */}
        {ride.role === 'host' && ride.confirmed_riders && ride.confirmed_riders.length > 0 && (
          <div className="space-y-1.5">
            {ride.confirmed_riders.map(r => (
              <div key={r.id} className="flex flex-col gap-1.5 p-2.5 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-black overflow-hidden flex-shrink-0">
                      {r.avatar_url ? <img src={r.avatar_url} className="w-full h-full object-cover" alt="" /> : r.name[0]}
                    </div>
                    <span className="text-[10px] font-bold text-white/60">{r.name.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={e => doMark(e, r.user_id, true)}
                    disabled={marking || giverReceived}
                    className={`px-2 py-1 rounded-lg text-[8px] font-black transition-all ${giverReceived ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'}`}
                  >
                    {giverReceived ? '✓ Received' : 'Mark Received'}
                  </button>
                </div>
                {/* Host rates rider */}
                {(isPast || isRecent) && (
                  <div className="pt-1.5 border-t border-white/5">
                    <StarRating rideId={ride.id} rateeId={r.user_id} current={(r as any).user_rating} label="Rate rider" onRate={onRate} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rider rates host */}
        {ride.role === 'rider' && ride.user_id && (isPast || isRecent) && (
          <div className="pt-2 border-t border-white/5">
            <StarRating rideId={ride.id} rateeId={ride.user_id} current={ride.user_rating} label="Rate host" onRate={onRate} />
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-3 flex items-center justify-end text-[9px] font-black text-white/20 group-hover:text-blue-400 transition-colors uppercase tracking-widest gap-1">
        Open Ride <ChevronRight className="w-3 h-3" />
      </div>
    </Link>
  )
}
