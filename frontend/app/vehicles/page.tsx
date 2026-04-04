'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Car, Plus, Trash2, Settings, Star, Shield,
  Fuel, Palette, ChevronRight, CheckCircle2
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'

interface Vehicle {
  id: number
  vehicle_type: string
  make: string
  model: string
  color: string
  vehicle_number: string
  total_seats: number
  default_available_seats: number
}

const POPULAR_MAKES = ['Maruti', 'Honda', 'Hyundai', 'Tata', 'Toyota', 'Mahindra', 'Ford', 'Kia', 'MG', 'Renault']
const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', emoji: '🚗' },
  { value: 'suv', label: 'SUV', emoji: '🚙' },
  { value: 'hatchback', label: 'Hatchback', emoji: '🚘' },
  { value: 'muv', label: 'MUV/MPV', emoji: '🚐' },
  { value: 'bike', label: 'Bike', emoji: '🏍️' },
]
const COLORS = [
  { name: 'White', hex: '#f8fafc' },
  { name: 'Black', hex: '#0f172a' },
  { name: 'Silver', hex: '#94a3b8' },
  { name: 'Grey', hex: '#64748b' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Maroon', hex: '#7f1d1d' },
  { name: 'Gold', hex: '#d97706' },
  { name: 'Green', hex: '#22c55e' },
]

const DEMO_VEHICLES: Vehicle[] = [
  { id: 1, vehicle_type: 'sedan', make: 'Honda', model: 'City', color: 'White', vehicle_number: 'MH04 AB 1234', total_seats: 4, default_available_seats: 3 },
]

function VehicleTypeCard({ type, selected, onClick }: { type: typeof VEHICLE_TYPES[0], selected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
        selected 
          ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/5 scale-105' 
          : 'border-white/5 bg-white/5 text-white/30 hover:border-white/10'
      }`}
    >
      <span className="text-2xl">{type.emoji}</span>
      <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
    </button>
  )
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    vehicle_type: 'sedan',
    make: '',
    model: '',
    color: 'White',
    vehicle_number: '',
    total_seats: '4',
    default_available_seats: '3',
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetchVehicles()
  }, [router])

  const fetchVehicles = async () => {
    try {
      const data = await api.get('/vehicles')
      if (Array.isArray(data) && data.length > 0) setVehicles(data as Vehicle[])
      else setVehicles(DEMO_VEHICLES)
    } catch { setVehicles(DEMO_VEHICLES) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/vehicles', {
        ...form,
        total_seats: parseInt(form.total_seats),
        default_available_seats: parseInt(form.default_available_seats),
      })
      toast.success('Vehicle registered! Your garage is growing.')
      setShowForm(false)
      setForm({ vehicle_type: 'sedan', make: '', model: '', color: 'White', vehicle_number: '', total_seats: '4', default_available_seats: '3' })
      fetchVehicles()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Registration failed')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this vehicle from your premium garage?')) return
    try {
      await api.delete(`/vehicles/${id}`)
      setVehicles(prev => prev.filter(v => v.id !== id))
      toast.success('Vehicle removed successfully.')
    } catch { toast.error('Failed to remove vehicle.') }
  }

  const setMake = (make: string) => setForm(prev => ({ ...prev, make }))

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />

      <JoolNav />

      <main className="max-w-6xl mx-auto px-6 md:px-12 mt-12">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
               PREMIUM FLEET
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white">My Garage</h1>
            <p className="text-white/40 text-lg mt-2">Manage your vehicles for sharing rides.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-[0_15px_30px_rgba(37,99,235,0.2)]"
          >
            {showForm ? 'CLOSE FORM' : <><Plus className="w-6 h-6" /> ADD VEHICLE</>}
          </button>
        </div>

        {/* Add Vehicle Sheet */}
        {showForm && (
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 mb-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <h2 className="text-3xl font-black mb-10 tracking-tight">Register New Vehicle</h2>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Type Selector */}
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Vehicle Category</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {VEHICLE_TYPES.map(t => (
                    <VehicleTypeCard
                      key={t.value}
                      type={t}
                      selected={form.vehicle_type === t.value}
                      onClick={() => setForm(prev => ({ ...prev, vehicle_type: t.value }))}
                    />
                  ))}
                </div>
              </div>

              {/* Make Quick Fill */}
              <div>
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Manufacturer Brand</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {POPULAR_MAKES.map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMake(m)}
                      className={`px-4 py-2 text-xs font-black rounded-xl border transition-all ${
                        form.make === m ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={form.make}
                  onChange={e => setForm(prev => ({ ...prev, make: e.target.value }))}
                  placeholder="Or enter brand name manually..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 focus:bg-white/10 transition-all text-lg"
                />
              </div>

              {/* Model + Plate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Model Name</label>
                  <input required value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                    placeholder="e.g. City, NEXON, Fortuner" className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all text-lg" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">Registration Number</label>
                  <input required value={form.vehicle_number} onChange={e => setForm(p => ({ ...p, vehicle_number: e.target.value.toUpperCase() }))}
                    placeholder="MH-04-AB-1234" className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-black placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all font-mono tracking-widest text-xl" />
                </div>
              </div>

              {/* Color Swatches */}
              <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" /> SELECT FINISH COLOR
                </label>
                <div className="flex flex-wrap gap-4">
                  {COLORS.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, color: c.name }))}
                      className={`w-12 h-12 rounded-2xl border-4 transition-all relative ${form.color === c.name ? 'border-blue-600 scale-110 shadow-lg' : 'border-white/10'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {form.color === c.name && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-blue-600 invert" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/40 font-black uppercase tracking-widest mt-6">Selected Shade: <span className="text-white">{form.color}</span></p>
              </div>

              {/* Seats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Total Seats available</label>
                  <div className="flex gap-2">
                    {['2', '4', '5', '6', '7'].map(n => (
                      <button key={n} type="button" onClick={() => setForm(p => ({ ...p, total_seats: n, default_available_seats: String(Math.max(1, parseInt(n) - 1)) }))}
                        className={`flex-1 aspect-square rounded-2xl font-black text-xl border-2 transition-all flex items-center justify-center ${form.total_seats === n ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Offer By Default</label>
                  <input type="number" min="1" max={form.total_seats} required
                    value={form.default_available_seats} onChange={e => setForm(p => ({ ...p, default_available_seats: e.target.value }))}
                    className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white text-center text-3xl font-black focus:outline-none focus:border-blue-600 transition-all" />
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-4 text-center">Typically excluding driver seat</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-white hover:bg-blue-600 hover:text-white text-black py-5 rounded-[2rem] font-black text-xl disabled:opacity-50 transition-all active:scale-95 shadow-2xl group">
                  {submitting ? 'PROCESSING...' : <><Plus className="inline w-6 h-6 mr-2 group-hover:rotate-90 transition-transform" /> ADD TO GARAGE</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-12 py-5 bg-white/5 border border-white/10 rounded-[2rem] font-black text-lg hover:bg-white/10 transition-all text-white/40">
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Vehicles Grid */}
        {vehicles.length === 0 && !showForm ? (
          <div className="text-center py-32 bg-white/5 border border-white/5 border-dashed rounded-[3rem]">
            <div className="w-24 h-24 bg-blue-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
              <Car className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-4xl font-black mb-4 tracking-tight">Your Garage is Empty</h3>
            <p className="text-white/40 text-lg mb-12 max-w-md mx-auto font-medium">Add your vehicle to our ecosystem to start sharing the journey and earning credits.</p>
            <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 px-12 py-5 rounded-[2rem] font-black text-xl transition-all active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.25)]">
              REGISTER FIRST VEHICLE
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map(v => (
              <div key={v.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/[0.08] hover:border-white/10 transition-all group relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-colors pointer-events-none" />
                
                {/* Header */}
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#0f172a] shadow-inner rounded-3xl flex items-center justify-center text-4xl border border-white/5">
                      {VEHICLE_TYPES.find(t => t.value === v.vehicle_type)?.emoji || '🚗'}
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-white leading-tight">{v.make}</h3>
                      <p className="text-sm font-bold text-white/40 tracking-tight">{v.model}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(v.id)} className="p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Plate */}
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl px-6 py-3 font-mono text-yellow-500 font-black tracking-[0.2em] text-center mb-8 text-xl shadow-inner">
                  {v.vehicle_number}
                </div>

                {/* Details */}
                <div className="space-y-4 relative z-10 flex-1">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2"><Palette className="w-3 h-3" /> Color Finish</span>
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                       {v.color} <div className="w-4 h-4 rounded-full border-2 border-white/20" style={{ backgroundColor: COLORS.find(c => c.name === v.color)?.hex || '#64748b' }} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2"><Settings className="w-3 h-3" /> Vehicle Payload</span>
                    <span className="text-sm font-bold text-white uppercase tracking-tighter">{v.total_seats} SEATER {v.vehicle_type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2"><Star className="w-3 h-3" /> Auto-Offer</span>
                    <span className="text-sm font-black text-green-400 uppercase tracking-tighter">{v.default_available_seats} SEATS</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                  <Link href="/offer-ride" className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl text-sm font-black transition-all group-hover:scale-[1.02]">
                    START RIDE SHARING <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
