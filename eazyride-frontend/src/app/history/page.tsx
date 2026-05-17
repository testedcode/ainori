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
import PulseNav from '@/components/PulseNav'

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32">
      <PulseNav />

      <main className="max-w-6xl mx-auto px-6 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-black shadow-xl shadow-amber-400/20">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase leading-none">Ride Logs</h1>
              <p className="text-slate-900/20 text-[10px] font-black uppercase tracking-widest mt-1">Your Ride History</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-[2rem] w-full md:w-auto">
            {(['all', 'host', 'rider'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-900/30 hover:text-slate-900'}`}
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
                <h2 className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" /> ACTIVE — YESTERDAY · TODAY · TOMORROW
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {active.map(ride => <HistoryCard key={ride.id} ride={ride} isRecent currentUserId={currentUserId} onRate={handleRate} />)}
                </div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Upcoming
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcoming.map(ride => <HistoryCard key={ride.id} ride={ride} currentUserId={currentUserId} onRate={handleRate} />)}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-[0.2em] mb-6">Archive</h2>
              {archive.length === 0 && active.length === 0 && upcoming.length === 0 ? (
                <div className="py-20 bg-white border border-slate-200 rounded-[2.5rem] border-dashed text-center">
                  <p className="text-slate-900/20 font-black text-[10px] uppercase tracking-widest">No rides yet</p>
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
      <span className="text-[9px] text-slate-900/30 font-black uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n}
            onClick={e => { e.preventDefault(); e.stopPropagation(); onRate(rideId, rateeId, n) }}
            onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
            className="transition-all hover:scale-125 active:scale-95"
          >
            <Star className={`w-4 h-4 transition-colors ${((hover || current || 0) >= n) ? 'fill-amber-400 text-amber-600' : 'text-slate-900/10'}`} />
          </button>
        ))}
        {current && <span className="ml-1 text-[9px] font-black text-amber-600">{current}/5</span>}
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
    <div className={`group flex flex-col bg-white border rounded-[2rem] hover:shadow-[0_10px_40px_rgba(0,0,0,0.05)] transition-all overflow-hidden relative ${
      isRecent ? 'border-amber-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
    }`}>
      {isRecent && <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><Zap className="w-24 h-24 text-amber-500" /></div>}
      
      <Link href={`/rides/${ride.id}`} className="block">
        <div className="p-5 md:p-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
             <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                  isOwner ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}>
                  {isOwner ? 'Hosting' : 'Confirmed'}
                </span>
                {ride.direction && (
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    ride.direction === 'to_home' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                  }`}>
                    {ride.direction === 'to_home' ? '🏠 To Home' : '🏢 To Office'}
                  </span>
                )}
             </div>
             <div className="text-right shrink-0 text-slate-500 group-hover:text-slate-900 transition-colors">
               <span className="text-[9px] font-black uppercase tracking-widest block">{fmtDate(ride.ride_date)}</span>
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
             <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none mb-3 group-hover:text-blue-600 transition-colors uppercase italic truncate">
                   {ride.corridor_name}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                   <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-black text-slate-900">{fmtTime(ride.ride_time)}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-black text-slate-900">₹{ride.price_per_seat} <span className="text-[8px] text-slate-400 uppercase tracking-widest">/ SEAT</span></span>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 pr-4 rounded-full w-max mt-2 md:mt-0 relative z-10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[12px] font-black text-white shadow-inner">
                   {ride.user_name?.[0] || 'U'}
                </div>
                <div className="flex flex-col justify-center">
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{isOwner ? 'Host' : 'Joined'}</span>
                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{ride.user_name || 'Host'}</span>
                </div>
             </div>
          </div>
        </div>
        
        <div className={`px-5 py-3 md:px-6 md:py-4 border-t flex flex-wrap items-center justify-between gap-4 ${isRecent ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/50 border-slate-100'}`}>
           <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full animate-pulse ${ride.status === 'completed' ? 'bg-green-500' : ride.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'}`} />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status: <span className="text-slate-900">{ride.status}</span></span>
           </div>
           
           {isPending && (
             <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-md animate-pulse border border-amber-200 relative z-10">
               <Zap className="w-3 h-3 fill-amber-400" /> SETTLE NOW
             </span>
           )}
        </div>
      </Link>

      <div className="pt-0 space-y-0">
        {isOwner ? (
          <div className="px-5 md:px-6 py-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[10px] font-black text-slate-900/20 uppercase tracking-[0.2em]">Rider Payments</p>
              {payments.filter(p => p.giver_status !== 'received').length > 1 && (
                <button 
                  onClick={handleMarkAll}
                  disabled={marking !== null}
                  className="text-[9px] font-black text-blue-600 hover:text-blue-300 uppercase tracking-tighter underline underline-offset-4 decoration-blue-500/30"
                >
                  {marking === -1 ? 'Updating...' : 'Mark All Received'}
                </button>
              )}
            </div>
            {loadingPayments ? (
              <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-900/10" /></div>
            ) : payments.length === 0 ? (
              <p className="text-[10px] text-slate-900/10 italic">No payments detected for this ride.</p>
            ) : (
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${p.giver_status === 'received' ? 'bg-green-500/5 border-green-500/10 opacity-50' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-[8px] font-black text-blue-600">
                          {p.rider_name?.[0] || 'R'}
                       </div>
                       <span className="text-[11px] font-bold text-slate-900/60">{p.rider_name || 'Rider'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-green-600">₹{p.amount}</span>
                      <button
                        onClick={e => doMark(e, p.rider_id, true, p.rider_name)}
                        disabled={p.giver_status === 'received' || marking !== null}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                          p.giver_status === 'received' ? 'text-green-500 bg-green-500/10' : 'bg-blue-600 text-white hover:bg-blue-600 hover:text-slate-900'
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
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200">
            <div>
              <p className="text-[9px] font-black text-slate-900/20 uppercase tracking-[0.2em] mb-1">Payment Status</p>
              <div className="flex items-center gap-2">
                 <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${giverReceived ? 'bg-green-500/20 text-green-600' : riderPaid ? 'bg-amber-400/20 text-amber-600' : 'bg-slate-100 text-slate-900/40'}`}>
                   {giverReceived ? 'SETTLED ✓' : riderPaid ? 'SENT ✓' : 'UNPAID'}
                 </span>
              </div>
            </div>
            {!riderPaid && !giverReceived ? (
              <button
                onClick={e => doMark(e, Number(currentUserId), false)}
                disabled={marking !== null}
                className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-blue-600 hover:bg-blue-500 text-slate-900 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
              >
                {marking === currentUserId ? <Loader2 className="w-3 h-3 animate-spin" /> : 'I have paid'}
              </button>
            ) : riderPaid && !giverReceived ? (
              <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white/30 border border-slate-200">
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
      <Link href={`/rides/${ride.id}`} className="mt-6 flex items-center justify-end text-[9px] font-black text-slate-900/20 group-hover:text-blue-600 transition-colors uppercase tracking-widest gap-1">
        Ride Details <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
