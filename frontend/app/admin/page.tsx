'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Users, MapPin, Car, BarChart3, Lock, Unlock, 
  CheckCircle, XCircle, Shield, Search, Plus, AlertTriangle,
  ChevronRight, Activity, Leaf, Ban, UserCheck, Clock,
  TrendingUp, Globe, Database, Pencil, Camera, Loader2
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'
import { createClient } from '@/utils/supabase/client'

interface User {
  id: number; name: string; email: string; role: string
  city?: string; carbon_credits: number; created_at: string
  approved?: boolean; blocked?: boolean
}
interface Corridor { id: number; city_id?: number; name: string; city_name?: string; location_from: string; location_to: string; description?: string; is_active: boolean; image_url?: string }
interface City { id: number; name: string; status: string }
interface Analytics { total_users: number; total_rides: number; active_corridors: number; completed_rides: number; total_revenue: number; total_credits: number }
interface RideRequest { id: number; rider_name: string; driver_name: string; pickup_point: string; seats_requested: number; corridor_name: string; ride_date: string; ride_time: string; status: string }

type Tab = 'overview' | 'users' | 'corridors' | 'locations' | 'requests'

const DEMO_ANALYTICS: Analytics = { total_users: 347, total_rides: 1842, active_corridors: 4, completed_rides: 1650, total_revenue: 221040, total_credits: 8250 }
const DEMO_USERS: User[] = [
  { id: 2, name: 'Aayushi Singh', email: 'aayushi@example.com', role: 'user', carbon_credits: 420, created_at: '2026-01-10', approved: true, blocked: false },
  { id: 3, name: 'Rajiv Mehta', email: 'rajiv@example.com', role: 'user', carbon_credits: 280, created_at: '2026-01-15', approved: true, blocked: false },
  { id: 4, name: 'Samiksha Patil', email: 'samiksha@example.com', role: 'user', carbon_credits: 0, created_at: '2026-02-01', approved: false, blocked: false },
  { id: 5, name: 'Priya Nair', email: 'priya@nair.com', role: 'user', carbon_credits: 150, created_at: '2026-02-10', approved: false, blocked: false },
  { id: 6, name: 'Arjun Sharma', email: 'arjun@example.com', role: 'user', carbon_credits: 90, created_at: '2026-03-05', approved: true, blocked: true },
]
const DEMO_CORRIDORS: Corridor[] = [
  { id: 1, city_id: 1, name: 'Casa Rio', location_from: 'Casa Rio', location_to: 'RCP', description: 'Palava City Gate 1 to Reliance Corporate Park', is_active: true },
  { id: 2, city_id: 1, name: 'Casa Bella', location_from: 'Casa Bella', location_to: 'RCP', description: 'Casa Bella Main Gate to Reliance Corporate Park', is_active: true },
  { id: 3, city_id: 1, name: 'Lakeshore', location_from: 'Lakeshore', location_to: 'RCP', description: 'Lakeshore Greens Phase 2 to RCP', is_active: true },
  { id: 4, city_id: 1, name: 'Kharghar', location_from: 'Kharghar', location_to: 'RCP', description: 'Kharghar Sector 20 to RCP via Highway', is_active: false },
]
const DEMO_CITIES: City[] = [
  { id: 1, name: 'Mumbai', status: 'active' },
  { id: 2, name: 'Navi Mumbai', status: 'active' },
  { id: 3, name: 'Thane', status: 'locked' },
]
const DEMO_REQUESTS: RideRequest[] = [
  { id: 1, rider_name: 'Samiksha Patil', driver_name: 'Aayushi Singh', pickup_point: 'Casa Rio Gate 2', seats_requested: 1, corridor_name: 'Casa Rio', ride_date: '2026-04-05', ride_time: '08:30', status: 'pending' },
  { id: 2, rider_name: 'Priya Nair', driver_name: 'Rajiv Mehta', pickup_point: 'Casa Bella Main', seats_requested: 1, corridor_name: 'Casa Bella', ride_date: '2026-04-05', ride_time: '09:00', status: 'pending' },
  { id: 3, rider_name: 'Arjun Sharma', driver_name: 'Aayushi Singh', pickup_point: 'Lakeshore Ph2', seats_requested: 2, corridor_name: 'Lakeshore', ride_date: '2026-04-04', ride_time: '08:00', status: 'accepted' },
]

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: any }) {
  return (
    <div className={`bg-white/5 border border-white/5 rounded-3xl p-8 hover:bg-white/10 transition-all group`}>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black text-white tracking-tighter">{value}</p>
      {sub && <p className="text-xs text-white/20 font-bold mt-2">{sub}</p>}
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [analytics, setAnalytics] = useState<Analytics>(DEMO_ANALYTICS)
  const [users, setUsers] = useState<User[]>(DEMO_USERS)
  const [corridors, setCorridors] = useState<Corridor[]>(DEMO_CORRIDORS)
  const [cities, setCities] = useState<City[]>(DEMO_CITIES)
  const [requests, setRequests] = useState<RideRequest[]>(DEMO_REQUESTS)
  const [searchUser, setSearchUser] = useState('')
  const [showAddCorridor, setShowAddCorridor] = useState(false)
  const [editCorridorMode, setEditCorridorMode] = useState<number | null>(null)
  const [newCorridor, setNewCorridor] = useState({ city_id: 1, name: '', location_from: '', location_to: '', description: '', image_url: '' })
  const [showAddCity, setShowAddCity] = useState(false)
  const [newCity, setNewCity] = useState('')

  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    const usr = localStorage.getItem('user')
    if (usr) {
      const u = JSON.parse(usr)
      setUser(u)
      if (u.role !== 'admin') { toast.error('Admin access required'); router.push('/dashboard'); return }
    }
    fetchAll()
  }, [router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImage(true)
      if (!e.target.files || e.target.files.length === 0) return
      
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `corridor-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      setNewCorridor(prev => ({ ...prev, image_url: publicUrl }))
      toast.success('Corridor image uploaded!')
    } catch (e: any) {
      toast.error(e.message || 'Error uploading image')
    } finally {
      setUploadingImage(false)
    }
  }

  const fetchAll = async () => {
    try {
      const [a, cor, cit] = await Promise.all([
        api.get('/admin/analytics').catch(() => DEMO_ANALYTICS),
        api.get('/corridors').catch(() => DEMO_CORRIDORS),
        api.get('/cities').catch(() => DEMO_CITIES),
      ])
      if (a && typeof a === 'object' && 'total_users' in (a as object)) setAnalytics(a as Analytics)
      if (Array.isArray(cor) && cor.length > 0) setCorridors(cor as Corridor[])
      if (Array.isArray(cit) && cit.length > 0) setCities(cit as City[])
    } catch {}
  }

  const approveUser = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u))
    toast.success('User approved!')
  }
  const denyUser = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: false, blocked: true } : u))
    toast.success('User access denied.')
  }
  const toggleBlock = (userId: number, blocked: boolean) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !blocked } : u))
    toast.success(!blocked ? 'User blacklisted.' : 'User restored.')
  }
  const toggleCorridor = async (id: number, active: boolean) => {
    setCorridors(prev => prev.map(c => c.id === id ? { ...c, is_active: !active } : c))
    try { await api.put(`/corridors/${id}`, { is_active: !active }) } catch {}
    toast.success(`Corridor ${!active ? 'activated' : 'offline'}`)
  }
  const toggleCity = async (id: number, status: string) => {
    const newStatus = status === 'active' ? 'locked' : 'active'
    setCities(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    try { await api.put(`/cities/${id}/status`, { status: newStatus }) } catch {}
    toast.success(`${newStatus === 'active' ? 'Opened' : 'Locked'} city ecosystem.`)
  }
  const addCorridor = async () => {
    if (!newCorridor.name || !newCorridor.location_from || !newCorridor.location_to || !newCorridor.city_id) {
      toast.error('Missing route geometry or city'); return
    }
    const fake: Corridor = { id: Date.now(), ...newCorridor, is_active: true }
    setCorridors(prev => [...prev, fake])
    try { 
      await api.post('/corridors', newCorridor) 
      toast.success('New corridor integrated.')
    } catch (e: any) {
      toast.error(e.message || 'Failed to create corridor (City missing?)')
      fetchAll() // refresh to revert fake
    }
    setNewCorridor({ city_id: 1, name: '', location_from: '', location_to: '', description: '', image_url: '' })
    setShowAddCorridor(false)
  }

  const saveEditCorridor = async () => {
    if (!editCorridorMode) return
    const id = editCorridorMode
    if (!newCorridor.name || !newCorridor.location_from || !newCorridor.location_to) {
      toast.error('Missing route geometry'); return
    }
    setCorridors(prev => prev.map(c => c.id === id ? { ...c, ...newCorridor } : c))
    try { 
      await api.put(`/corridors/${id}`, newCorridor) 
      toast.success('Corridor architecture updated.')
    } catch (e: any) {
      toast.error(e.message || 'Error updating corridor')
      fetchAll() 
    }
    setNewCorridor({ city_id: 1, name: '', location_from: '', location_to: '', description: '', image_url: '' })
    setEditCorridorMode(null)
  }
  const addCity = async () => {
    if (!newCity.trim()) return
    const fake: City = { id: Date.now(), name: newCity, status: 'active' }
    setCities(prev => [...prev, fake])
    try { await api.post('/cities', { name: newCity, status: 'active' }) } catch {}
    setNewCity('')
    setShowAddCity(false)
    toast.success(`${newCity} expanded into network.`)
  }
  const handleRequest = (requestId: number, status: 'accepted' | 'rejected') => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r))
    toast.success(status === 'accepted' ? 'Ride validated.' : 'Ride request rejected.')
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  )
  const pendingUsers = users.filter(u => !u.approved && !u.blocked)
  const pendingRequests = requests.filter(r => r.status === 'pending')

  const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Ecosystem', icon: BarChart3 },
    { id: 'users', label: 'Members', icon: Users, badge: pendingUsers.length || undefined },
    { id: 'corridors', label: 'Corridors', icon: MapPin },
    { id: 'locations', label: 'Cities', icon: Globe },
    { id: 'requests', label: 'Ride Flow', icon: Car, badge: pendingRequests.length || undefined },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-purple-600/5 blur-[150px] -z-10 pointer-events-none" />

      <JoolNav adminMode />

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12">

         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
               SECURE ADMIN PROTOCOL
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white">Ecosystem Command</h1>
            <p className="text-white/40 text-xl mt-2 font-medium">Platform architecture and user integrity management.</p>
          </div>
        </div>

        {/* Tab Interface */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/5 rounded-[2rem] w-max mb-12 overflow-x-auto scrollbar-hide max-w-full">
           {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.5rem] text-sm font-black transition-all relative ${
                    active ? 'bg-white text-black shadow-xl scale-[1.02]' : 'text-white/40 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label.toUpperCase()}
                  {tab.badge ? (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center border-4 border-[#0f172a] shadow-lg">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              )
           })}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
              <StatCard label="Total Members" value={analytics.total_users} icon={Users} color="bg-blue-600" />
              <StatCard label="Total Rides" value={analytics.total_rides.toLocaleString()} icon={TrendingUp} color="bg-indigo-600" />
              <StatCard label="Valid Trips" value={analytics.completed_rides.toLocaleString()} icon={CheckCircle} color="bg-green-600" />
              <StatCard label="Active Corridors" value={analytics.active_corridors} icon={Database} color="bg-purple-600" />
              <StatCard label="Platform Revenue" value={`₹${(analytics.total_revenue / 100000).toFixed(1)}L`} sub="annual projected" icon={Activity} color="bg-orange-600" />
              <StatCard label="CO2 Mitigation" value={`${analytics.total_credits}kg`} icon={Leaf} color="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {pendingUsers.length > 0 && (
                 <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] p-10 flex flex-col justify-between items-start group relative overflow-hidden">
                    <AlertTriangle className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 text-yellow-500 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <div>
                       <h3 className="text-3xl font-black text-yellow-500 mb-2">Member Authentication</h3>
                       <p className="text-yellow-500/60 font-bold">{pendingUsers.length} users are requesting ecosystem entry.</p>
                    </div>
                    <button onClick={() => setActiveTab('users')} className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl">
                       START CLEARANCE
                    </button>
                 </div>
               )}
               {pendingRequests.length > 0 && (
                 <div className="bg-blue-600/10 border border-blue-600/20 rounded-[2.5rem] p-10 flex flex-col justify-between items-start group relative overflow-hidden">
                    <Car className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 text-blue-500 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <div>
                       <h3 className="text-3xl font-black text-blue-400 mb-2">Global Ride Flow</h3>
                       <p className="text-blue-400/60 font-bold">{pendingRequests.length} seat requests awaiting driver matching.</p>
                    </div>
                    <button onClick={() => setActiveTab('requests')} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl">
                       AUDIT TRAFFIC
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                 <h2 className="text-3xl font-black">Member Registry</h2>
                 <p className="text-white/40 font-bold">{users.length} authenticated users in ecosystem.</p>
               </div>
               <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                  <input value={searchUser} onChange={e => setSearchUser(e.target.value)}
                    placeholder="Search by name or email..." className="bg-white/5 border border-white/5 focus:border-blue-600 pl-16 pr-8 py-5 rounded-2xl text-lg font-black focus:outline-none focus:bg-white/10 transition-all w-full md:w-96" />
               </div>
            </div>

            <div className="space-y-4">
               {filteredUsers.map(u => (
                 <div key={u.id} className={`bg-white/5 border rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 transition-all ${u.blocked ? 'border-red-500/20 opacity-50 grayscale' : 'border-white/5 hover:bg-white/[0.08] hover:border-white/10'}`}>
                    <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10">
                       {u.name[0]}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                          <h4 className="text-2xl font-black">{u.name}</h4>
                          {u.role === 'admin' && <span className="text-[9px] bg-red-600 text-white px-3 py-1 rounded-full font-black tracking-widest">SYSTEM ADMIN</span>}
                          {u.approved && !u.blocked && <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-black tracking-widest">VERIFIED</span>}
                       </div>
                       <p className="text-white/40 font-bold">{u.email}</p>
                       <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-[10px] font-black text-white/20 tracking-widest uppercase">
                          <span>Credits: {u.carbon_credits}</span>
                          <div className="w-1 h-1 bg-white/10 rounded-full" />
                          <span>Member since 2026</span>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       {!u.approved && !u.blocked && (
                         <button onClick={() => approveUser(u.id)} className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-lg">
                           GRANT ACCESS
                         </button>
                       )}
                       <button onClick={() => toggleBlock(u.id, u.blocked || false)}
                         className={`px-8 py-4 rounded-2xl font-black text-xs transition-all active:scale-95 ${u.blocked ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white'}`}>
                         {u.blocked ? 'RESTORE ACCOUNT' : 'BLACKLIST USER'}
                       </button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* CORRIDORS */}
        {activeTab === 'corridors' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                 <h2 className="text-3xl font-black">Route Architecture</h2>
                 <p className="text-white/40 font-bold">Configuring commute geometry and active zones.</p>
               </div>
               <button onClick={() => {
                 setNewCorridor({ city_id: 1, name: '', location_from: '', location_to: '', description: '', image_url: '' });
                 setEditCorridorMode(null);
                 setShowAddCorridor(!showAddCorridor);
               }} className="bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-2xl">
                 NEW CORRIDOR
               </button>
            </div>

            {(showAddCorridor || editCorridorMode !== null) && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 mb-12">
                <h3 className="text-2xl font-black mb-8">{editCorridorMode ? 'Edit Corridor Architecture' : 'Define New Corridor'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Display Name</label>
                    <input value={newCorridor.name} onChange={e => setNewCorridor(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Palava Elite" className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Origin Hub</label>
                    <input value={newCorridor.location_from} onChange={e => setNewCorridor(p => ({ ...p, location_from: e.target.value }))}
                      placeholder="Starting Sector" className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Destination Axis</label>
                    <input value={newCorridor.location_to} onChange={e => setNewCorridor(p => ({ ...p, location_to: e.target.value }))}
                      placeholder="Ending Sector" className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all" />
                  </div>
                  <div className="space-y-3 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Detailed Route Description</label>
                    <textarea value={newCorridor.description} onChange={e => setNewCorridor(p => ({ ...p, description: e.target.value }))}
                      rows={2} placeholder="Type exact locations, minimum ride charges, and context for users." className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all resize-none" />
                  </div>
                  <div className="space-y-3 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Special Header Image</label>
                    <div className="flex gap-4">
                      <input value={newCorridor.image_url} onChange={e => setNewCorridor(p => ({ ...p, image_url: e.target.value }))}
                        placeholder="Image URL or upload..." className="flex-1 px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all" />
                      
                      <label className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all">
                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                        <span className="text-[10px] font-black">UPLOAD</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                      </label>
                    </div>
                    {newCorridor.image_url && (
                      <div className="mt-4 w-full h-32 rounded-2xl overflow-hidden border border-white/10">
                         <img src={newCorridor.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={editCorridorMode ? saveEditCorridor : addCorridor} className="bg-blue-600 hover:bg-blue-700 px-12 py-5 rounded-2xl font-black shadow-xl">
                    {editCorridorMode ? 'SAVE CHANGES' : 'PUBLISH TO NETWORK'}
                  </button>
                  <button onClick={() => {
                     setShowAddCorridor(false);
                     setEditCorridorMode(null);
                  }} className="px-12 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-white/40 hover:bg-white/10 transition-all">ABORT</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {corridors.map(c => (
                <div key={c.id} className={`bg-white/5 border rounded-[2.5rem] p-10 transition-all group ${c.is_active ? 'border-white/5 hover:bg-white/[0.08]' : 'border-red-500/10 opacity-40 grayscale'}`}>
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                         <div className={`w-4 h-4 rounded-full ${c.is_active ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-red-600'}`} />
                         <h4 className="text-3xl font-black tracking-tight">{c.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => {
                          setEditCorridorMode(c.id);
                          setNewCorridor({ city_id: c.city_id || 1, name: c.name, location_from: c.location_from, location_to: c.location_to, description: c.description || '', image_url: c.image_url || '' });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} className="p-4 rounded-2xl bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
                           <Pencil className="w-5 h-5" />
                        </button>
                        <button onClick={() => toggleCorridor(c.id, c.is_active)} className={`p-4 rounded-2xl transition-all ${c.is_active ? 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white'}`}>
                           {c.is_active ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                        </button>
                      </div>
                   </div>
                   {c.description && <p className="mb-6 text-sm text-white/60 bg-[#0f172a] p-4 rounded-xl border border-white/5">{c.description}</p>}
                   <div className="flex items-center gap-6 text-lg font-bold text-white/60">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">ORIGIN</span>
                         {c.location_from}
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/10" />
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">AXIS</span>
                         {c.location_to}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOCATIONS */}
        {activeTab === 'locations' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                 <h2 className="text-3xl font-black">City Deployment</h2>
                 <p className="text-white/40 font-bold">Managing regional availability and local node locks.</p>
               </div>
               <button onClick={() => setShowAddCity(!showAddCity)} className="bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl">
                 DEPLOY NEW CITY
               </button>
            </div>

            {showAddCity && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 mb-12">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2 block mb-4">Official City Name</label>
                <div className="flex gap-4">
                  <input value={newCity} onChange={e => setNewCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCity()}
                    placeholder="e.g. Pune Metropolitan Area" className="flex-1 px-8 py-5 bg-[#0f172a] border border-white/5 rounded-2xl text-xl font-black placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all shadow-inner" />
                  <button onClick={addCity} className="bg-blue-600 hover:bg-blue-700 px-12 py-5 rounded-2xl font-black shadow-xl">AUTHENTICATE & DEPLOY</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cities.map(city => (
                <div key={city.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 flex items-center justify-between group">
                   <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border-2 transition-all ${city.status === 'active' ? 'bg-green-600/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500 grayscale'}`}>
                         <Globe className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tighter">{city.name}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${city.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>NODE {city.status.toUpperCase()}</p>
                      </div>
                   </div>
                   <button onClick={() => toggleCity(city.id, city.status)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                      city.status === 'active' ? 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white'
                    }`}>
                    {city.status === 'active' ? <><Lock className="w-4 h-4" /> LOCK NODE</> : <><Unlock className="w-4 h-4" /> ACTIVATE NODE</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIDE FLOW */}
        {activeTab === 'requests' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black mb-12">Global Traffic Audit</h2>
            
            {pendingRequests.length > 0 && (
              <div className="mb-16">
                 <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                   <AlertTriangle className="w-4 h-4" /> AWAITING CLEARANCE ({pendingRequests.length})
                 </p>
                 <div className="space-y-4">
                    {pendingRequests.map(r => (
                      <div key={r.id} className="bg-white/5 border border-yellow-500/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                         <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                               <p className="text-2xl font-black text-white">{r.rider_name}</p>
                               <ChevronRight className="w-6 h-6 text-white/10" />
                               <p className="text-2xl font-black text-blue-400">{r.driver_name}</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Pick Location</span>
                                  <span className="text-xs font-bold text-white/60">{r.pickup_point}</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Geometry</span>
                                  <span className="text-xs font-bold text-white/60">{r.corridor_name}</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Schedule</span>
                                  <span className="text-xs font-bold text-white/60">{r.ride_date} · {r.ride_time}</span>
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Seats</span>
                                   <span className="text-xs font-bold text-white/60">{r.seats_requested} Requested</span>
                                </div>
                             </div>
                         </div>
                         <div className="flex gap-4 w-full md:w-auto">
                            <button onClick={() => handleRequest(r.id, 'accepted')} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">
                               VALIDATE
                            </button>
                            <button onClick={() => handleRequest(r.id, 'rejected')} className="flex-1 bg-white/5 border border-white/5 text-white/40 hover:bg-red-600 hover:text-white px-10 py-5 rounded-2xl font-black transition-all">
                               REJECT
                            </button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">ARCHIVED FLOWS</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {requests.filter(r => r.status !== 'pending').map(r => (
                 <div key={r.id} className={`bg-white/5 border rounded-[2rem] p-8 flex items-center justify-between ${r.status === 'accepted' ? 'border-green-500/5' : 'border-red-500/5 opacity-50'}`}>
                    <div>
                       <p className="text-lg font-black">{r.rider_name} → {r.driver_name}</p>
                       <p className="text-xs font-bold text-white/20 mt-1 uppercase tracking-widest">{r.corridor_name} · {r.ride_date}</p>
                    </div>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.1em] ${r.status === 'accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                       LOG: {r.status}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
