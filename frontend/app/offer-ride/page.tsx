'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ChevronRight, Car, MapPin, Clock, 
  IndianRupee, Leaf, Sun, Sunset, Check, Loader2, Plus, X,
  Save, Sparkles, ShieldCheck, Info
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'

interface Corridor { id: number; name: string; location_from: string; location_to: string }
interface Vehicle { id: number; make: string; model: string; vehicle_number: string; total_seats: number; vehicle_type: string; color?: string }

const CORRIDORS_DEFAULT: Corridor[] = [
  { id: 1, name: 'Casa Rio', location_from: 'Casa Rio', location_to: 'RCP' },
  { id: 2, name: 'Casa Bella', location_from: 'Casa Bella', location_to: 'RCP' },
  { id: 3, name: 'Lakeshore', location_from: 'Lakeshore', location_to: 'RCP' },
  { id: 4, name: 'Kharghar', location_from: 'Kharghar', location_to: 'RCP' },
]

const TIME_PRESETS = [
  { label: 'Morning Office', time: '08:30', icon: Sun },
  { label: 'Early Bird', time: '07:30', icon: Sun },
  { label: 'Evening Return', time: '18:30', icon: Sunset },
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

  // 1. Initial Load & Draft Recovery
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    // Recover draft
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
         setForm(prev => ({ ...prev, ...parsed }))
         if (parsed.pickupPoints) setPickupPoints(parsed.pickupPoints)
      } catch (e) {
        console.warn('Failed to parse draft from storage')
      }
    }
    
    // Fetch Data
    Promise.all([
      api.get('/corridors'), 
      api.get('/vehicles'),
      api.get('/user/rides') // To fetch last ride for pre-fill
    ]).then(([c, v, ur]) => {
      if (Array.isArray(c) && c.length > 0) setCorridors(c as Corridor[])
      
      // Pre-fill from last ride if no draft exists
      if (!localStorage.getItem(DRAFT_KEY) && Array.isArray(ur) && ur.length > 0) {
        const lastRide = ur[0] // handleGetUserRides returns sorted by date DESC
        setForm(p => ({
          ...p,
          corridor_id: String(lastRide.corridor_id),
          price_per_seat: String(lastRide.price_per_seat),
          pickup_point: lastRide.pickup_point,
          drop_point: lastRide.drop_point,
          total_seats: String(lastRide.total_seats),
          available_seats: String(lastRide.available_seats)
        }))
        toast.success('Pre-filled from your previous trip', { icon: '✨' })
      }

      if (Array.isArray(v) && v.length > 0) {
        const vehicleList = v as Vehicle[]
        setVehicles(vehicleList)
        // Pre-select first vehicle if not already set by draft/pre-fill
        setForm(p => ({ 
          ...p, 
          vehicle_id: p.vehicle_id || String(vehicleList[0].id)
        }))
      }
    }).catch((e) => {
      console.error('Fetch error:', e)
    })
  }, [router])

  // 2. Continuous Draft Sync
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, pickupPoints }))
    }, 1000)
    return () => clearTimeout(timeout)
  }, [form, pickupPoints])

  const selectedCorridor = corridors.find(c => String(c.id) === form.corridor_id)
  const selectedVehicle = vehicles.find(v => String(v.id) === form.vehicle_id)
  const totalEarnings = parseFloat(form.price_per_seat || '0') * parseInt(form.available_seats || '0')
  const carbonSaved = (parseInt(form.available_seats || '0') * 2.1).toFixed(1)

  const handleCorridorSelect = (c: Corridor) => {
    setForm(p => ({ ...p, corridor_id: String(c.id), pickup_point: c.location_from }))
    toast.success(`Route set: ${c.name}`, { icon: '📍', duration: 1000 })
  }

  const addPickupPoint = () => {
    if (newPickup.trim()) {
      setPickupPoints(prev => [...prev, newPickup.trim()])
      setNewPickup('')
    }
  }

  const handleSubmit = async () => {
    if (!form.corridor_id || !form.vehicle_id || !form.ride_time || !form.pickup_point) {
      toast.error('Missing core details. Please check the route and time.')
      return
    }

    setLoading(true)
    try {
      // 1. Post Primary Ride
      const res = await api.post('/rides', {
        ...form,
        corridor_id: parseInt(form.corridor_id),
        vehicle_id: parseInt(form.vehicle_id),
        price_per_seat: parseFloat(form.price_per_seat),
        available_seats: parseInt(form.available_seats),
        total_seats: parseInt(form.total_seats),
        pickup_points: pickupPoints,
      }) as { id: number }
      
      // 2. Post Return Ride if requested
      if (postRoundTrip) {
        const [h, m] = form.ride_time.split(':').map(Number)
        let returnH = (h + 10) % 24
        const returnTime = `${String(returnH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        
        // Find return corridor (swapped locations)
        const returnCorridor = corridors.find(c => 
          c.location_from.toLowerCase() === form.drop_point.toLowerCase() ||
          c.name.toLowerCase().includes('return') ||
          c.name.toLowerCase().includes('↔')
        )

        await api.post('/rides', {
          ...form,
          corridor_id: returnCorridor?.id || parseInt(form.corridor_id),
          ride_time: returnTime,
          pickup_point: form.drop_point,
          drop_point: form.pickup_point,
          price_per_seat: parseFloat(form.price_per_seat),
          available_seats: parseInt(form.available_seats),
          total_seats: parseInt(form.total_seats),
        })
      }

      localStorage.removeItem(DRAFT_KEY) 
      toast.success(postRoundTrip ? '🎉 Round trip published!' : '🎉 Ride successfully published!', { duration: 4000 })
      router.push('/dashboard')
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'System sync failed'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-32">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />

      <JoolNav />

      <main className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
              <Sparkles className="w-3 h-3" /> DIRECT PUBLISH
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">Create Commute</h1>
            <p className="text-white/40 text-lg mt-1 font-medium">Configure your corridor and invite colleagues instantly.</p>
          </div>
          
          <div className="hidden md:flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-6 py-4">
             <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-400" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">ECO-IMPACT</p>
                <p className="font-bold text-white tracking-tight">{carbonSaved}kg CO₂ saved</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Left Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. ROUTE SECTION */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center">
                   <MapPin className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Corridor Path</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {corridors.map(c => (
                  <button key={c.id} onClick={() => handleCorridorSelect(c)}
                    className={`p-6 rounded-3xl border-2 text-left transition-all relative ${
                      form.corridor_id === String(c.id) 
                      ? 'bg-blue-600/10 border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.1)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}>
                    <p className="font-black text-lg mb-1">{c.name}</p>
                    <p className="text-xs text-white/30 font-bold uppercase tracking-widest">RCP Access Point</p>
                    {form.corridor_id === String(c.id) && (
                      <div className="absolute top-6 right-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-2 block">Primary Pickup Hub</label>
                  <input value={form.pickup_point} onChange={e => setForm(p => ({ ...p, pickup_point: e.target.value }))}
                    placeholder="e.g. Casa Rio Gate 1" className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold focus:outline-none focus:border-blue-600 transition-all placeholder-white/10" />
                </div>

                <div className="bg-[#0f172a] border border-white/5 rounded-3xl p-6">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">OPTIMIZED WAYPOINTS (OPTIONAL)</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {pickupPoints.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 px-3 py-1.5 rounded-xl">
                        <span className="text-xs font-bold text-blue-400">{pt}</span>
                        <X className="w-3 h-3 text-blue-400/40 hover:text-red-400 cursor-pointer" onClick={() => setPickupPoints(p => p.filter((_, idx) => idx !== i))} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newPickup} onChange={e => setNewPickup(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPickupPoint()}
                      placeholder="Add an intermediate stop..." className="flex-1 bg-transparent border-b border-white/10 focus:border-blue-600 px-2 py-2 text-sm font-bold focus:outline-none transition-all placeholder:font-medium placeholder:text-white/15" />
                    <button onClick={addPickupPoint} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                       <Plus className="w-5 h-5 text-white/40" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. FLEET SECTION */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                   <Car className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Active Fleet</h2>
              </div>

              {vehicles.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-white/10 rounded-[2rem] text-center">
                  <p className="text-white/40 font-bold mb-6">No premium fleet registered yet.</p>
                  <Link href="/vehicles" className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 hover:text-white transition-all shadow-xl">REGISTER VEHICLE</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vehicles.map(v => (
                    <button key={v.id} onClick={() => setForm(p => ({ ...p, vehicle_id: String(v.id), total_seats: String(v.total_seats) }))}
                      className={`p-6 rounded-3xl border-2 text-left transition-all relative ${
                        form.vehicle_id === String(v.id) 
                        ? 'bg-indigo-600/10 border-indigo-600' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
                      <p className="font-black text-lg mb-1">{v.make} {v.model}</p>
                      <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest">{v.vehicle_number} · {v.total_seats} SEATS</p>
                      {form.vehicle_id === String(v.id) && (
                        <div className="absolute top-6 right-6 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.8)] animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. PERFORMANCE & PRICING */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center">
                   <IndianRupee className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Economics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-4 block">AVAILABLE SEATS</label>
                   <div className="flex items-center gap-2">
                     {['1', '2', '3', '4'].map(n => (
                       <button key={n} onClick={() => setForm(p => ({ ...p, available_seats: n }))}
                        className={`flex-1 aspect-square rounded-2xl font-black text-xl border-2 transition-all ${
                          form.available_seats === n ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-[#0f172a] border-white/5 text-white/20 hover:border-white/10'
                        }`}>
                        {n}
                       </button>
                     ))}
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 mb-4 block">PRICE / PASSENGER (₹)</label>
                   <div className="relative group">
                      <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-emerald-400 transition-colors" />
                      <input type="number" value={form.price_per_seat} onChange={e => setForm(p => ({ ...p, price_per_seat: e.target.value }))}
                        className="w-full bg-[#0f172a] border border-white/5 focus:border-emerald-600 pl-14 pr-6 py-5 rounded-2xl text-2xl font-black focus:outline-none transition-all shadow-inner" />
                   </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Intelligence */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
            
            {/* SCHEDULING CARD */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                   <Clock className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-xl font-black">Departure</h3>
              </div>
              
              <div className="space-y-6">
                <input type="date" value={form.ride_date} onChange={e => setForm(p => ({ ...p, ride_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#0f172a] border border-white/5 rounded-2xl px-6 py-4 font-bold text-white focus:outline-none focus:border-orange-500 transition-all appearance-none" />
                
                <div className="grid grid-cols-1 gap-2">
                  {TIME_PRESETS.map((t, idx) => {
                    const Icon = t.icon
                    const active = form.ride_time === t.time
                    return (
                      <button key={idx} onClick={() => setForm(p => ({ ...p, ride_time: t.time }))}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${active ? 'bg-orange-600/10 border-orange-500' : 'bg-[#0f172a] border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                        <div className="flex items-center gap-3">
                           <Icon className="w-4 h-4 text-orange-400" />
                           <span className="text-sm font-black">{t.label}</span>
                        </div>
                        <span className="font-black text-sm">{t.time}</span>
                      </button>
                    )
                  })}
                  <div className="relative mt-2">
                    <input type="time" value={form.ride_time} onChange={e => setForm(p => ({ ...p, ride_time: e.target.value }))}
                      className="w-full bg-[#0f172a] border border-white/5 rounded-2xl px-6 py-4 font-bold text-white focus:outline-none focus:border-orange-500 transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE INTELLIGENCE */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
               
               <p className="text-[10px] font-black text-white/60 tracking-[0.3em] mb-8 uppercase">JOOL PREDICTIVE IMPACT</p>
               
               <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-5xl font-black text-white tracking-tighter">₹{totalEarnings || 0}</p>
                    <p className="text-xs font-bold text-white/50 mt-1 uppercase tracking-widest">Total Trip Yield</p>
                  </div>
                  <div className="w-full h-px bg-white/10" />
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-2xl font-black text-white">{carbonSaved}kg</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Net CO₂ Reduction</p>
                     </div>
                     <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Leaf className="w-6 h-6 text-white" />
                     </div>
                  </div>
               </div>
            </div>

            {/* ROUND TRIP & PUBLISH */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 space-y-6">
              <button 
                onClick={() => setPostRoundTrip(!postRoundTrip)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${postRoundTrip ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-white/40'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${postRoundTrip ? 'bg-blue-500' : 'bg-white/10'}`}>
                    {postRoundTrip ? <Check className="w-5 h-5 text-white" /> : <div className="w-3 h-3 border-2 border-white/20 rounded-sm" />}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-tight">Post Return Trip</p>
                    <p className="text-[10px] font-bold opacity-60">Automatic +10hr return ride</p>
                  </div>
                </div>
              </button>

              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-white text-black hover:bg-blue-600 hover:text-white py-5 rounded-[2rem] font-black text-lg transition-all active:scale-[0.97] shadow-xl group flex items-center justify-center gap-4 disabled:opacity-30 disabled:grayscale">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>PUBLISH COMMUTE <ChevronRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" /></>
                )}
              </button>
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 rounded-xl">
                 <Save className="w-3.5 h-3.5 text-white/20" />
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Draft saved automatically</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Warning */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0f172a]/80 backdrop-blur-2xl border-t border-white/5 py-3 px-6 text-center md:text-left z-40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
           <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-blue-400" />
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">JOOL Corridor Rules: Ensure riders are picked from specified points only.</p>
           </div>
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">© 2026 JOOL TECH • SECURE NODE #419</p>
        </div>
      </div>

    </div>
  )
}
