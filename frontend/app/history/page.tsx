'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Calendar, Clock, IndianRupee,
  ChevronRight, Car, User, Search, History as HistoryIcon,
  CheckCircle2, Loader2, Star, Zap, ExternalLink, Sparkles,
  MapPin, Flag, Check
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import PulseNav from '../components/PulseNav'

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtDate(raw: string) {
  if (!raw) return ''
  const dStr = raw.includes('T') ? raw.split('T')[0] : raw
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dStr === today) return 'Today'
  if (dStr === yesterday) return 'Yesterday'
  const d = new Date(dStr + 'T12:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
function fmtTime(raw: string) {
  if (!raw) return ''
  // HH:MM:SS or HH:MM direct string
  if (!raw.includes('T') && !raw.includes('Z')) return raw.slice(0, 5)
  // ISO datetime string
  return new Date(raw).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtFullDate(raw: string) {
  if (!raw) return ''
  const dStr = raw.includes('T') ? raw.split('T')[0] : raw
  const d = new Date(dStr + 'T12:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

interface RidePaymentInfo { id?: number; rider_status?: string; giver_status?: string }
interface Rider { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number; user_rating?: number }
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
    const usr = localStorage.getItem('user')
    if (usr) {
      const parsed = JSON.parse(usr)
      setCurrentUserId(Number(parsed.id || parsed.userId))
    }
    loadRides()
  }, [])

  const handleMarkPayment = (rideId: number, riderId: number, asGiver: boolean) => {
    // This is handled locally in HistoryCard now
  }

  const handleRate = async (rideId: number, rateeId: number, rating: number) => {
    try {
      await api.post(`/rides/${rideId}/rate`, { ratee_id: rateeId, rating })
      toast.success('Rating saved! ⭐')
      loadRides()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Rating failed')
    }
  }

  const filtered = rides.filter(r => {
    if (activeTab === 'host' && r.role !== 'host') return false
    if (activeTab === 'rider' && r.role !== 'rider') return false
    if (search) {
      const q = search.toLowerCase()
      return r.corridor_name.toLowerCase().includes(q) || r.pickup_point.toLowerCase().includes(q) || r.drop_point.toLowerCase().includes(q)
    }
    return true
  })

  // IST-aware date windows
  const istNow = new Date(Date.now() + 5.5 * 3600 * 1000)
  const istToday = istNow.toISOString().slice(0, 10)
  const istTomorrow = new Date(Date.now() + 5.5 * 3600 * 1000 + 86400000).toISOString().slice(0, 10)
  const istYesterday = new Date(Date.now() + 5.5 * 3600 * 1000 - 86400000).toISOString().slice(0, 10)
  const activeWindow = [istYesterday, istToday, istTomorrow]

  const getDatePart = (r: Ride) => r.ride_date.includes('T') ? r.ride_date.slice(0, 10) : r.ride_date

  const upcoming = filtered.filter(r => getDatePart(r) > istToday)
  const active   = filtered.filter(r => activeWindow.includes(getDatePart(r)))
  const archive  = filtered.filter(r => getDatePart(r) < istYesterday)

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans pb-32">
      <PulseNav />

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-black shadow-2xl shadow-amber-400/20">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Ride Logs</h1>
              <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-1">Your Ride History</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-[2rem] w-full md:w-auto">
            {(['all', 'host', 'rider'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 opacity-20">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Loading History...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {active.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" /> ACTIVE — YESTERDAY · TODAY · TOMORROW
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {active.map(ride => <HistoryCard key={ride.id} ride={ride} isRecent currentUserId={currentUserId} onRate={handleRate} />)}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Upcoming
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map(ride => <HistoryCard key={ride.id} ride={ride} currentUserId={currentUserId} onRate={handleRate} />)}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Archive</h2>
              {archive.length === 0 && active.length === 0 && upcoming.length === 0 ? (
                <div className="py-20 bg-white/5 border border-white/10 rounded-[2.5rem] border-dashed text-center">
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">No rides yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archive.map(ride => <HistoryCard key={ride.id} ride={ride} isPast currentUserId={currentUserId} onRate={handleRate} />)}
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
  ride, isPast, isRecent, currentUserId, onRate
}: {
  ride: Ride; isPast?: boolean; isRecent?: boolean
  currentUserId?: number
  onRate: (rideId: number, rateeId: number, rating: number) => void
}) {
  const [marking, setMarking] = useState<number | null>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [localRiderPaid, setLocalRiderPaid] = useState(false)  // optimistic state for rider

  const isOwner = ride.role === 'host'

  useEffect(() => {
    if (isOwner) {
      setLoadingPayments(true)
      api.get(`/rides/${ride.id}/payments`)
        .then((res: any) => { if (Array.isArray(res)) setPayments(res) })
        .finally(() => setLoadingPayments(false))
    }
  }, [ride.id, isOwner])

  const myPayment = isOwner ? null : ride.payment_info
  const riderPaid = localRiderPaid || myPayment?.rider_status === 'done'
  const giverReceived = myPayment?.giver_status === 'received'
  const isPending = isOwner 
    ? payments.some(p => p.giver_status !== 'received')
    : !giverReceived

  const doMark = async (e: React.MouseEvent, riderId: number, asGiver: boolean, riderName?: string) => {
    e.preventDefault(); e.stopPropagation()
    setMarking(riderId)
    try {
      const payload = asGiver ? { giver_status: 'received' } : { rider_status: 'done' }
      await api.put(`/rides/${ride.id}/payments/${riderId}`, payload)
      
      if (isOwner) {
        setPayments(prev => prev.map(p => p.rider_id === riderId ? { ...p, ...payload } : p))
      } else {
        // Rider marking payment done — update optimistic local state
        setLocalRiderPaid(true)
      }
      
      toast.success(asGiver ? `✅ Received from ${riderName || 'rider'}!` : '✅ Payment marked done!')
    } catch { toast.error('Failed') }
    finally { setMarking(null) }
  }

  const handleMarkAll = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    const pending = payments.filter(p => p.giver_status !== 'received')
    if (pending.length === 0) return
    setMarking(-1)
    try {
      await Promise.all(pending.map(p => api.put(`/rides/${ride.id}/payments/${p.rider_id}`, { giver_status: 'received' })))
      setPayments(prev => prev.map(p => ({ ...p, giver_status: 'received' })))
      toast.success('✅ All payments received!')
    } catch { toast.error('Failed to mark all') }
    finally { setMarking(null) }
  }

  return (
    <div className={`block rounded-[2.5rem] p-6 transition-all group hover:scale-[1.01] hover:shadow-2xl ${
      isRecent ? 'bg-amber-500/5 border border-amber-500/20 shadow-[0_20px_40px_rgba(245,158,11,0.05)]'
      : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.05]'
    }`}>
      <Link href={`/rides/${ride.id}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-white text-xl tracking-tighter uppercase italic truncate">{ride.corridor_name}</h3>
              <ExternalLink className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-400 transition-colors" />
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
              {isOwner ? <Car className="w-3 h-3 text-amber-400" /> : <User className="w-3 h-3 text-blue-400" />}
              {isOwner ? 'Host' : `Joined · ${ride.user_name || 'Host'}`}
            </p>
            {ride.direction && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mt-1.5 border ${
                ride.direction === 'to_home'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {ride.direction === 'to_home' ? '🏠 To Home' : '🏢 To Office'}
              </span>
            )}
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="text-xs font-black text-white leading-none">{fmtDate(ride.ride_date)}</p>
            <p className="text-[10px] font-black text-white/50 mt-0.5">{fmtFullDate(ride.ride_date)}</p>
            <p className="text-sm font-black text-white mt-1 tracking-wide">{fmtTime(ride.ride_time)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-green-400" />
             </div>
             <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">Trip Fare</p>
                <p className="text-lg font-black text-white mt-0.5">₹{ride.price_per_seat}</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            {isPending && (
              <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full animate-pulse border border-amber-400/20">
                <Zap className="w-3 h-3 fill-amber-400" /> Settle Now
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
              ride.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' 
              : ride.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {ride.status}
            </span>
          </div>
        </div>
      </Link>

      <div className="pt-6 border-t border-white/5 space-y-5">
        {isOwner ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Rider Payments</p>
              {payments.filter(p => p.giver_status !== 'received').length > 1 && (
                <button 
                  onClick={handleMarkAll}
                  disabled={marking !== null}
                  className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-tighter underline underline-offset-4 decoration-blue-500/30"
                >
                  {marking === -1 ? 'Updating...' : 'Mark All Received'}
                </button>
              )}
            </div>
            {loadingPayments ? (
              <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/10" /></div>
            ) : payments.length === 0 ? (
              <p className="text-[10px] text-white/10 italic">No payments detected for this ride.</p>
            ) : (
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${p.giver_status === 'received' ? 'bg-green-500/5 border-green-500/10 opacity-50' : 'bg-white/5 border-white/5'}`}>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-blue-600/20 flex items-center justify-center text-[8px] font-black text-blue-400">
                          {p.rider_name?.[0] || 'R'}
                       </div>
                       <span className="text-[11px] font-bold text-white/60">{p.rider_name || 'Rider'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-green-400">₹{p.amount}</span>
                      <button
                        onClick={e => doMark(e, p.rider_id, true, p.rider_name)}
                        disabled={p.giver_status === 'received' || marking !== null}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                          p.giver_status === 'received' ? 'text-green-500 bg-green-500/10' : 'bg-white text-black hover:bg-blue-600 hover:text-white'
                        }`}
                      >
                        {marking === p.rider_id ? <Loader2 className="w-3 h-3 animate-spin" /> : p.giver_status === 'received' ? '✓' : 'MARK'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
            <div>
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Payment Status</p>
              <div className="flex items-center gap-2">
                 <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${giverReceived ? 'bg-green-500/20 text-green-400' : riderPaid ? 'bg-amber-400/20 text-amber-400' : 'bg-white/10 text-white/40'}`}>
                   {giverReceived ? 'SETTLED ✓' : riderPaid ? 'SENT ✓' : 'UNPAID'}
                 </span>
              </div>
            </div>
            {!riderPaid && !giverReceived ? (
              <button
                onClick={e => doMark(e, Number(currentUserId), false)}
                disabled={marking !== null}
                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
              >
                {marking === currentUserId ? <Loader2 className="w-3 h-3 animate-spin" /> : 'I have paid'}
              </button>
            ) : riderPaid && !giverReceived ? (
              <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-white/30 border border-white/10">
                Pending Host
              </span>
            ) : null}
          </div>
        )}

        {/* RATINGS */}
        {(isPast || isRecent) && (
          <div className="space-y-3 pt-2">
             {!isOwner && (
               <StarRating rideId={ride.id} rateeId={ride.user_id!} current={ride.user_rating} label={`Rate ${ride.user_name || 'Host'}`} onRate={onRate} />
             )}
             {isOwner && ride.confirmed_riders?.map(r => (
               <StarRating key={r.user_id} rideId={ride.id} rateeId={r.user_id} current={(r as any).user_rating} label={`Rate ${r.name.split(' ')[0]}`} onRate={onRate} />
             ))}
          </div>
        )}
      </div>
      
      {/* FOOTER */}
      <Link href={`/rides/${ride.id}`} className="mt-6 flex items-center justify-end text-[9px] font-black text-white/20 group-hover:text-blue-400 transition-colors uppercase tracking-widest gap-1">
        Ride Details <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
