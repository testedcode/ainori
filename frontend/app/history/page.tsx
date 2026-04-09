'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Calendar, Clock, MapPin, IndianRupee, 
  ChevronRight, Car, User, Search, Filter, History as HistoryIcon,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react'
import { api } from '@/lib/api'
import JoolNav from '../components/JoolNav'

interface Ride {
  id: number
  corridor_name: string
  ride_date: string
  ride_time: string
  pickup_point: string
  drop_point: string
  price_per_seat: number
  status: string
  role: 'host' | 'co-commuter'
  driver_name?: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'host' | 'rider'>('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    
    api.get('/user/rides').then(res => {
      if (Array.isArray(res)) setRides(res as Ride[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  const filtered = rides.filter(r => {
    if (activeTab === 'host' && r.role !== 'host') return false
    if (activeTab === 'rider' && r.role !== 'co-commuter') return false
    if (search) {
      const s = search.toLowerCase()
      return r.corridor_name.toLowerCase().includes(s) || r.pickup_point.toLowerCase().includes(s) || (r.driver_name?.toLowerCase().includes(s))
    }
    return true
  })

  // Separate into Upcoming and Past
  const today = new Date().toISOString().split('T')[0]
  const upcoming = filtered.filter(r => r.ride_date >= today).sort((a, b) => a.ride_date.localeCompare(b.ride_date))
  const past = filtered.filter(r => r.ride_date < today).sort((a, b) => b.ride_date.localeCompare(a.ride_date))

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
            <p className="text-white/40 text-sm mt-1">Review your past travels and upcoming schedules.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/5 rounded-2xl px-4 py-2.5">
              <Search className="w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search history..." className="bg-transparent text-sm text-white focus:outline-none w-32 md:w-48" />
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
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
            
            {/* Upcoming Rides */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Upcoming Journeys
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map(ride => <HistoryCard key={ride.id} ride={ride} />)}
                </div>
              </section>
            )}

            {/* Past Rides */}
            <section>
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Archive</h2>
              {past.length === 0 ? (
                <div className="py-20 bg-white/5 border border-white/10 rounded-[2.5rem] border-dashed text-center">
                  <p className="text-white/20 font-black text-[10px] uppercase tracking-widest">No archival data found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {past.map(ride => <HistoryCard key={ride.id} ride={ride} isPast />)}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function HistoryCard({ ride, isPast }: { ride: Ride; isPast?: boolean }) {
  const pStr = ride.ride_date
  return (
    <Link href={`/rides/${ride.id}`} className={`block bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group ${isPast ? 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0' : 'border-l-4 border-l-blue-500'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors truncate max-w-[200px]">{ride.corridor_name}</h3>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1 flex items-center gap-2">
            {ride.role === 'host' ? <Car className="w-3 h-3 text-green-400" /> : <User className="w-3 h-3 text-blue-400" />}
            {ride.role === 'host' ? 'Host' : `Rider (Host: ${ride.driver_name})`}
          </p>
        </div>
        <div className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
          ride.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
          ride.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 
          'bg-blue-500/10 text-blue-400'
        }`}>
          {ride.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Calendar className="w-3.5 h-3.5" /> {pStr}
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Clock className="w-3.5 h-3.5" /> {ride.ride_time}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-1 text-green-400 font-bold text-sm">
            <IndianRupee className="w-3.5 h-3.5" /> {ride.price_per_seat}
         </div>
         <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 group-hover:text-white transition-all" />
      </div>
    </Link>
  )
}
