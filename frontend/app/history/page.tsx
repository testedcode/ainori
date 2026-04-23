'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Calendar, Clock, IndianRupee, 
  ChevronRight, Car, User, Search, History as HistoryIcon,
  CheckCircle2, Loader2, Star, Zap
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'

interface RidePaymentInfo {
  id?: number
  rider_status?: string
  giver_status?: string
}

interface Ride {
  id: number
  corridor_name: string
  ride_date: string
  ride_time: string
  pickup_point: string
  drop_point: string
  price_per_seat: number
  status: string
  role: 'host' | 'rider'
  user_name?: string
  direction?: string
  payment_info?: RidePaymentInfo
  user_rating?: number | null
  confirmed_riders?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number }[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'host' | 'rider'>('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    api.get('/user/rides').then(res => {
      if (Array.isArray(res)) setRides(res as Ride[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const filtered = rides.filter(r => {
    if (activeTab === 'host' && r.role !== 'host') return false
    if (activeTab === 'rider' && r.role !== 'rider') return false
    if (search) {
      const s = search.toLowerCase()
      return r.corridor_name.toLowerCase().includes(s) || r.pickup_point?.toLowerCase().includes(s)
    }
    return true
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  const recent = filtered.filter(r => r.ride_date === todayStr || r.ride_date === yesterdayStr).sort((a, b) => b.ride_date.localeCompare(a.ride_date))
  const upcoming = filtered.filter(r => r.ride_date > todayStr).sort((a, b) => a.ride_date.localeCompare(b.ride_date))
  const past = filtered.filter(r => r.ride_date < yesterdayStr).sort((a, b) => b.ride_date.localeCompare(a.ride_date))

  const handleMarkPayment = async (rideId: number, riderId: number, asGiver: boolean) => {
    try {
      const payload = asGiver ? { giver_status: 'received' } : { rider_status: 'done' }
      await api.put(`/rides/${rideId}/payments/${riderId}`, payload)
      toast.success(asGiver ? '✅ Marked as received!' : '✅ Payment marked as done!')
      api.get('/user/rides').then(res => { if (Array.isArray(res)) setRides(res as Ride[]) }).catch(() => {})
    } catch { toast.error('Failed to update payment') }
  }

  const handleRate = async (rideId: number, rateeId: number, rating: number) => {
    try {
      await api.post(`/rides/${rideId}/rate`, { rating, ratee_id: rateeId })
      toast.success(`⭐ ${rating}/5 rating submitted!`)
      api.get('/user/rides').then(res => { if (Array.isArray(res)) setRides(res as Ride[]) }).catch(() => {})
    } catch { toast.error('Rating failed') }
  }

  const currentUserId = user?.id || user?.userId

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20">
      <JoolNav />
      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest mb-4">
              <ArrowLeft className="w-3 h-3" /> BACK TO DASHBOARD
            </Link>
            <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <HistoryIcon className="w-8 h-8 text-blue-500" /> Commute History
            </h1>
            <p className="text-white/40 text-sm mt-1">Review your travels and manage payments.</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search history..." className="bg-transparent text-sm text-white focus:outline-none w-32 md:w-48" />
          </div>
        </div>

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
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronizing Logs...</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* RECENT — Today & Yesterday */}
            {recent.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" /> Recent Activity — Settle payments
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recent.map(ride => (
                    <HistoryCard
                      key={ride.id} ride={ride} isRecent
                      currentUserId={currentUserId}
                      onMarkPayment={handleMarkPayment}
                      onRate={handleRate}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* UPCOMING */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Upcoming
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map(ride => (
                    <HistoryCard key={ride.id} ride={ride} currentUserId={currentUserId} onMarkPayment={handleMarkPayment} onRate={handleRate} />
                  ))}
                </div>
              </section>
            )}

            {/* ARCHIVE */}
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Archive</h2>
              {past.length === 0 && recent.length === 0 && upcoming.length === 0 ? (
                <div className="py-20 bg-white/5 border border-white/10 rounded-[2.5rem] border-dashed text-center">
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">No archival data found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map(ride => (
                    <HistoryCard key={ride.id} ride={ride} isPast currentUserId={currentUserId} onMarkPayment={handleMarkPayment} onRate={handleRate} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function StarRating({ rideId, rateeId, current, onRate }: { rideId: number; rateeId: number; current?: number | null; onRate: (rid: number, rateeId: number, r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          onClick={e => { e.preventDefault(); onRate(rideId, rateeId, n) }}
          className={`transition-all hover:scale-125 ${(current || 0) >= n ? 'text-amber-400' : 'text-white/10 hover:text-amber-300'}`}
        >
          <Star className={`w-4 h-4 ${(current || 0) >= n ? 'fill-amber-400' : ''}`} />
        </button>
      ))}
    </div>
  )
}

function HistoryCard({
  ride, isPast, isRecent, currentUserId, onMarkPayment, onRate
}: {
  ride: Ride; isPast?: boolean; isRecent?: boolean;
  currentUserId?: number;
  onMarkPayment: (rideId: number, riderId: number, asGiver: boolean) => void;
  onRate: (rideId: number, rateeId: number, rating: number) => void;
}) {
  const [marking, setMarking] = useState(false)
  const alreadyPaid = ride.role === 'rider'
    ? ride.payment_info?.rider_status === 'done'
    : ride.payment_info?.giver_status === 'received'

  return (
    <div className={`bg-white/5 border rounded-3xl p-6 transition-all group ${
      isRecent ? 'border-amber-500/30 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.08)]' :
      isPast ? 'border-white/5 opacity-70 hover:opacity-100' : 'border-l-4 border-l-blue-500 border-white/10'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-base text-white truncate max-w-[200px]">{ride.corridor_name}</h3>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
            {ride.role === 'host' ? <Car className="w-3 h-3 text-green-400" /> : <User className="w-3 h-3 text-blue-400" />}
            {ride.role === 'host' ? 'You hosted' : `Joined · ${ride.user_name || 'Host'}`}
          </p>
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
          ride.status === 'completed' ? 'bg-green-500/10 text-green-400' :
          ride.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
        }`}>{ride.ride_date}</span>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-white/30 font-bold mb-4">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ride.ride_date}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ride.ride_time}</span>
        <span className="flex items-center gap-1 text-green-400"><IndianRupee className="w-3 h-3" />{ride.price_per_seat}</span>
      </div>

      {/* Payment actions */}
      <div className="space-y-2 border-t border-white/5 pt-3">
        {ride.role === 'rider' && (
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[9px] font-black uppercase tracking-widest ${alreadyPaid ? 'text-green-400' : 'text-white/30'}`}>
              {alreadyPaid ? '✓ Payment marked done' : 'Payment pending'}
            </span>
            {!alreadyPaid && currentUserId && (
              <button
                onClick={async () => { setMarking(true); await onMarkPayment(ride.id, currentUserId, false); setMarking(false) }}
                disabled={marking}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-[9px] font-black hover:bg-green-500/30 transition-all"
              >
                {marking ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                Mark Done
              </button>
            )}
          </div>
        )}

        {/* Rating — rider rates the host */}
        {ride.role === 'rider' && isPast && ride.user_name && (
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Rate host</span>
            <StarRating
              rideId={ride.id}
              rateeId={0}
              current={ride.user_rating}
              onRate={onRate}
            />
          </div>
        )}

        {/* Host: mark received per rider */}
        {ride.role === 'host' && ride.confirmed_riders && ride.confirmed_riders.length > 0 && (
          <div className="space-y-1.5">
            {ride.confirmed_riders.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-black overflow-hidden">
                    {r.avatar_url ? <img src={r.avatar_url} className="w-full h-full object-cover" /> : r.name[0]}
                  </div>
                  <span className="text-[10px] font-bold text-white/60">{r.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={() => onMarkPayment(ride.id, r.user_id, true)}
                  className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-[8px] font-black hover:bg-green-500/20 transition-all"
                >
                  Mark Received ✓
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link href={`/rides/${ride.id}`} className="mt-3 flex items-center justify-end text-[9px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest gap-1">
        View Details <ChevronRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
