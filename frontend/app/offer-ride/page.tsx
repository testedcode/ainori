'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ChevronRight, Car, MapPin, Clock, 
  IndianRupee, Leaf, Sun, Sunset, Check, Loader2, Plus, X,
  Save, Sparkles, ShieldCheck, Info, ArrowRightLeft
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'
import { getVibe, VIBE_THEMES } from '@/lib/vibe-utils'
import VibeCanvas from '../components/VibeCanvas'

interface Corridor { id: number; name: string; location_from: string; location_to: string }
interface Vehicle { id: number; make: string; model: string; vehicle_number: string; total_seats: number; vehicle_type: string; color?: string }

const CORRIDORS_DEFAULT: Corridor[] = [
  { id: 1, name: 'Casa Rio TO RCP', location_from: 'Casa Rio Palava', location_to: 'RCP Reliance Corporate Park' },
  { id: 2, name: 'Casa Bella To RCP', location_from: 'Casa Bella Palava', location_to: 'RCP Reliance Corporate Park' },
  { id: 3, name: 'Kharghar To RCP', location_from: 'Kharghar', location_to: 'RCP' },
  { id: 4, name: 'Any Country', location_from: 'Any City', location_to: 'Any Place' },
]

const DRAFT_KEY = 'jool_ride_draft'

export default function OfferRidePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [corridors, setCorridors] = useState<Corridor[]>(CORRIDORS_DEFAULT)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [pickupPoints, setPickupPoints] = useState<string[]>([])
  const [newPickup, setNewPickup] = useState('')
  const [postRoundTrip, setPostRoundTrip] = useState(false)
  const [direction, setDirection] = useState<'to_office' | 'to_home'>('to_office')
  
  const [form, setForm] = useState({
    corridor_id: '',
    vehicle_id: '',
    ride_date: new Date().toISOString().split('T')[0],
    ride_time: '08:30',
    pickup_point: '',
    drop_point: 'Reliance Corporate Park (RCP)',
    route_description: '',
    price_per_seat: '120',
    available_seats: '3',
    total_seats: '4',
  })

  const vibe = getVibe(new Date().getHours())

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setForm(prev => ({ ...prev, ...parsed }))
        if (parsed.pickupPoints) setPickupPoints(parsed.pickupPoints)
        if (parsed.direction) setDirection(parsed.direction)
      } catch (e) {}
    }
    
    Promise.all([
      api.get('/corridors?active=true') as unknown as Promise<Corridor[]>, 
      api.get('/vehicles') as unknown as Promise<Vehicle[]>,
      api.get('/user/rides') as unknown as Promise<any[]>
    ]).then(([c, v, ur]) => {
      if (Array.isArray(c) && c.length > 0) {
        setCorridors(c)
      } else {
        setCorridors(CORRIDORS_DEFAULT)
      }
      
      if (!localStorage.getItem(DRAFT_KEY) && Array.isArray(ur) && ur.length > 0) {
        const lastRide = ur[0]
        setForm(p => ({
          ...p,
          corridor_id: String(lastRide.corridor_id),
          price_per_seat: String(lastRide.price_per_seat),
          pickup_point: lastRide.pickup_point,
          drop_point: lastRide.drop_point,
          total_seats: String(lastRide.total_seats),
          available_seats: String(lastRide.available_seats)
        }))
      }

      if (Array.isArray(v) && v.length > 0) {
        setVehicles(v)
        setForm(p => ({ ...p, vehicle_id: p.vehicle_id || String(v[0].id) }))
      }
    }).catch(() => {})
  }, [router])

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, pickupPoints, direction }))
    }, 1000)
    return () => clearTimeout(timeout)
  }, [form, pickupPoints, direction])

  const handleDirectionToggle = (newDir: 'to_office' | 'to_home') => {
    setDirection(newDir)
    const selectedC = corridors.find(c => String(c.id) === form.corridor_id)
    if (selectedC) {
       if (newDir === 'to_office') {
          setForm(p => ({ ...p, pickup_point: selectedC.location_from, drop_point: selectedC.location_to }))
       } else {
          setForm(p => ({ ...p, pickup_point: selectedC.location_to, drop_point: selectedC.location_from }))
       }
    }
  }

  const handleCorridorSelect = (c: Corridor) => {
    const p = direction === 'to_office' ? c.location_from : c.location_to
    const d = direction === 'to_office' ? c.location_to : c.location_from
    setForm(prev => ({ ...prev, corridor_id: String(c.id), pickup_point: p, drop_point: d }))
    toast.success(`${c.name}`, { icon: '📍', duration: 1000 })
  }

  const handleSubmit = async () => {
    if (!form.corridor_id || !form.vehicle_id || !form.ride_time || !form.pickup_point) {
      toast.error('Ride data incomplete.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        corridor_id: parseInt(form.corridor_id),
        vehicle_id: parseInt(form.vehicle_id),
        price_per_seat: parseFloat(form.price_per_seat),
        available_seats: parseInt(form.available_seats),
        total_seats: parseInt(form.total_seats),
        pickup_points: pickupPoints,
        direction: direction,
      }

      await api.post('/rides', payload)
      
      if (postRoundTrip) {
        const [h, m] = form.ride_time.split(':').map(Number)
        const returnTime = `${String((h + 10) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        const returnDir = direction === 'to_office' ? 'to_home' : 'to_office'
        await api.post('/rides', {
          ...payload,
          ride_time: returnTime,
          pickup_point: form.drop_point,
          drop_point: form.pickup_point,
          direction: returnDir,
        })
      }

      localStorage.removeItem(DRAFT_KEY) 
      toast.success('🎉 Ride Published!')
      router.push('/dashboard')
    } catch (e: any) {
      const serverError = e.response?.data?.error || e.message || 'Publish failed'
      toast.error(serverError)
    } finally { setLoading(false) }
  }

  const carbonSaved = (parseInt(form.available_seats || '0') * 2.1).toFixed(1)

  const theme = VIBE_THEMES[vibe]

  return (
    <div className={`min-h-screen font-sans pb-20 transition-all duration-1000 ${theme.bg}`}>
      <VibeCanvas vibe={vibe} />
      <div className="relative z-50">
        <JoolNav />
      </div>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-8">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
                <Sparkles className="w-3 h-3" /> RIDE CONTROL
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Share Ride</h1>
              <p className="text-white/30 text-[10px] mt-1 font-black uppercase tracking-widest leading-none">Publish your commute corridor</p>
           </div>
           
           <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-3xl px-6 py-4 backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <div>
                 <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">ECO IMPACT</p>
                 <p className="font-black text-white leading-none">{carbonSaved}kg CO₂ saved</p>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           {/* DIRECTION TOGGLE */}
           <div className="bg-white/5 border border-white/10 p-2 rounded-[2rem] flex gap-2">
              <button 
                onClick={() => handleDirectionToggle('to_office')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all ${direction === 'to_office' ? 'bg-blue-600 text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
              >
                 <Sun className="w-5 h-5" /> TO OFFICE
              </button>
              <button 
                onClick={() => handleDirectionToggle('to_home')}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-black transition-all ${direction === 'to_home' ? 'bg-orange-600 text-white shadow-xl' : 'text-white/20 hover:text-white/40'}`}
              >
                 <Sunset className="w-5 h-5" /> TO HOME
              </button>
           </div>

           {/* CORRIDOR SELECTION */}
           <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
              <h3 className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Select Active Corridor</h3>
              <div className="grid grid-cols-4 gap-2">
                 {corridors.map(c => (
                   <button 
                    key={c.id} 
                    onClick={() => handleCorridorSelect(c)}
                    className={`py-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 ${form.corridor_id === String(c.id) ? 'bg-blue-600/10 border-blue-600' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                   >
                     <MapPin className={`w-4 h-4 ${form.corridor_id === String(c.id) ? 'text-blue-400' : 'text-white/20'}`} />
                     <span className="text-[9px] font-black tracking-tighter uppercase truncate w-full px-1 text-center">{c.name}</span>
                   </button>
                 ))}
              </div>
           </div>

           {/* COMPRESSED GRID */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {/* ROUTE INFO */}
               <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 space-y-4">
                  <div>
                     <label className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1 mb-2 block">Origin Point</label>
                     <input value={form.pickup_point} onChange={e => setForm(p => ({ ...p, pickup_point: e.target.value }))}
                       className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all uppercase" />
                  </div>
                  <div>
                     <label className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1 mb-2 block">Destination Point</label>
                     <input value={form.drop_point} onChange={e => setForm(p => ({ ...p, drop_point: e.target.value }))}
                       className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all uppercase" />
                  </div>
               </div>

               {/* SCHEDULING */}
               <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 space-y-4">
                  <div>
                     <label className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1 mb-2 block">Ride Date</label>
                     <input type="date" value={form.ride_date} onChange={e => setForm(p => ({ ...p, ride_date: e.target.value }))}
                       className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-blue-600 transition-all text-white font-black" />
                  </div>
                  <div>
                     <label className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1 mb-2 block">Departure Time</label>
                     <input type="time" value={form.ride_time} onChange={e => setForm(p => ({ ...p, ride_time: e.target.value }))}
                       className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xl font-black focus:outline-none focus:border-blue-600 transition-all" />
                     {form.ride_time && (() => {
                        const h = parseInt(form.ride_time.split(':')[0])
                        let label = 'Custom Slot'
                        let color = 'text-white/20'
                        if (direction === 'to_office') {
                          if (h >= 6 && h < 7) { label = 'Early Birds'; color = 'text-amber-400' }
                          else if (h >= 7 && h < 8) { label = 'GM Route'; color = 'text-amber-400' }
                          else if (h >= 8 && h < 9) { label = 'Rush Hour'; color = 'text-amber-400' }
                          else if (h >= 9 && h < 10) { label = 'Pick Perfect'; color = 'text-amber-400' }
                          else if (h >= 10 && h < 11) { label = 'Still Looking'; color = 'text-amber-400' }
                          else if (h >= 11 || h < 2) { label = 'Late Join'; color = 'text-amber-400' }
                        } else {
                          if (h >= 16 && h < 18) { label = 'On Time'; color = 'text-blue-400' }
                          else if (h >= 18 && h < 20) { label = 'Traffic Fighters'; color = 'text-blue-400' }
                          else if (h >= 20 && h < 22) { label = 'Late Comers'; color = 'text-blue-400' }
                          else if (h >= 22 || h < 4) { label = 'Homebound'; color = 'text-blue-400' }
                        }
                        return <p className={`mt-2 text-[10px] font-black uppercase tracking-widest ${color}`}>{label} Signaling</p>
                     })()}
                  </div>
               </div>

               {/* SLOTS */}
               <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1 mb-4 block">Available Slots</label>
                  <div className="grid grid-cols-2 gap-2">
                     {['1','2','3','4'].map(n => (
                       <button key={n} onClick={() => setForm(p => ({ ...p, available_seats: n }))}
                         className={`py-3 rounded-xl border-2 font-black text-sm transition-all ${form.available_seats === n ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/20'}`}>
                          {n}
                       </button>
                     ))}
                  </div>
               </div>

               {/* PER SEAT COST */}
               <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1 mb-4 block">Per Seat (₹)</label>
                  <div className="relative mt-2">
                     <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                     <input type="number" value={form.price_per_seat} onChange={e => setForm(p => ({ ...p, price_per_seat: e.target.value }))}
                       className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-4 text-2xl font-black focus:outline-none focus:border-green-600 transition-all" />
                  </div>
               </div>
           </div>

           {/* SUBMIT SECTION */}
           <div className="bg-white/5 border border-white/10 rounded-[2rem] p-4 flex flex-col md:flex-row items-center gap-4">
              <button 
                onClick={() => setPostRoundTrip(!postRoundTrip)}
                className={`w-full md:w-auto px-8 py-5 rounded-[1.5rem] font-black text-[10px] uppercase transition-all flex items-center gap-3 ${postRoundTrip ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-white/5 text-white/20 border border-white/5'}`}
              >
                 <div className={`w-4 h-4 rounded-full border-2 border-current flex items-center justify-center`}>
                    {postRoundTrip && <div className="w-2 h-2 bg-current rounded-full" />}
                 </div>
                 ROUND TRIP (+10hr)
              </button>
              
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 w-full bg-white text-black hover:bg-blue-600 hover:text-white py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
              >
                 {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>PUBLISH RIDE <ChevronRight className="w-6 h-6" /></>}
              </button>
           </div>
        </div>
      </main>
    </div>
  )
}
