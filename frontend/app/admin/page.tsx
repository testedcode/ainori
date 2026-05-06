'use client'
// ADMIN MODULE V1.2 - REGRESSION FIX REBUILD

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, ArrowRight, Users, MapPin, Car, BarChart3, Lock, Unlock, 
  CheckCircle, XCircle, Shield, Search, Plus, AlertTriangle,
  ChevronRight, Activity, Leaf, Ban, UserCheck, Clock,
  TrendingUp, Globe, Database, Pencil, Camera, Loader2,
  Inbox, MessageSquare, Ticket, Send, RefreshCw
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

type Tab = 'overview' | 'users' | 'corridors' | 'locations' | 'requests' | 'inbox'

interface SupportTicket { id: number; ref: string; name?: string; email: string; trip_id?: string; issue_type: string; urgency: string; description: string; status: string; admin_reply?: string; replied_at?: string; created_at: string }
interface Feedback { id: number; name?: string; email: string; rating: number; type: string; message: string; status: string; admin_reply?: string; replied_at?: string; created_at: string }

interface SubTicket { id: number; ref: string; name?: string; email: string; trip_id?: string; issue_type: string; urgency: string; description: string; status: string; admin_reply?: string; replied_at?: string; created_at: string }

const DEMO_ANALYTICS: Analytics = { total_users: 347, total_rides: 1842, active_corridors: 4, completed_rides: 1650, total_revenue: 221040, total_credits: 8250 }

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
  const [users, setUsers] = useState<User[]>([])
  const [corridors, setCorridors] = useState<Corridor[]>(DEMO_CORRIDORS)
  const [cities, setCities] = useState<City[]>(DEMO_CITIES)
  const [adminRides, setAdminRides] = useState<any[]>([])
  const [searchUser, setSearchUser] = useState('')
  const [showAddCorridor, setShowAddCorridor] = useState(false)
  const [editCorridorMode, setEditCorridorMode] = useState<number | null>(null)
  const [newCorridor, setNewCorridor] = useState({ city_id: 1, name: '', location_from: '', location_to: '', description: '', image_url: '' })
  const [showAddCity, setShowAddCity] = useState(false)
  const [newCity, setNewCity] = useState('')
  const [corridorToDelete, setCorridorToDelete] = useState<number | null>(null)
  const [isPermanentDelete, setIsPermanentDelete] = useState(false)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [inboxTab, setInboxTab] = useState<'tickets' | 'feedback'>('tickets')
  const [replyText, setReplyText] = useState<Record<number, string>>({})
  const [replyLoading, setReplyLoading] = useState<number | null>(null)

  const [adminPasswordModalUser, setAdminPasswordModalUser] = useState<number | null>(null)
  const [adminPasswordInput, setAdminPasswordInput] = useState('')

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

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    setUploadingImage(true)
    try {
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `admin_${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file)
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path)
      
      await api.put('/auth/profile', { avatar_url: publicUrl })
      setUser((prev: any) => ({ ...prev, avatar_url: publicUrl }))
      const stored = localStorage.getItem('user')
      if (stored) {
        const u = JSON.parse(stored)
        localStorage.setItem('user', JSON.stringify({ ...u, avatar_url: publicUrl }))
      }
      toast.success('Admin profile updated')
    } catch { toast.error('Upload failed') }
    finally { setUploadingImage(false) }
  }

  const fetchAll = async () => {
    try {
      const [a, cor, cit, usrs, rds] = await Promise.all([
        api.get('/admin/analytics').catch(() => DEMO_ANALYTICS),
        api.get('/corridors').catch(() => DEMO_CORRIDORS),
        api.get('/cities').catch(() => DEMO_CITIES),
        api.get('/admin/users').catch(() => []),
        api.get('/rides?status=all').catch(() => [])
      ])
      if (a && typeof a === 'object' && 'total_users' in (a as object)) setAnalytics(a as Analytics)
      if (Array.isArray(cor) && cor.length > 0) setCorridors(cor as Corridor[])
      if (Array.isArray(cit) && cit.length > 0) setCities(cit as City[])
      if (Array.isArray(usrs)) setUsers(usrs as User[])
      if (Array.isArray(rds)) setAdminRides(rds)
    } catch {}
    // Fetch inbox
    try {
      const [t, f] = await Promise.all([
        api.get('/admin/tickets').catch(() => []),
        api.get('/admin/feedback').catch(() => []),
      ])
      if (Array.isArray(t)) setTickets(t as SupportTicket[])
      if (Array.isArray(f)) setFeedback(f as Feedback[])
    } catch {}
  }

  const approveUser = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}`, { approved: true, blocked: false })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true, blocked: false } : u))
      toast.success('User approved!')
    } catch { toast.error('Approval failed') }
  }
  const denyUser = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}`, { approved: false, blocked: true })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: false, blocked: true } : u))
      toast.success('User access denied.')
    } catch { toast.error('Action failed') }
  }
  const toggleBlock = async (userId: number, blocked: boolean) => {
    try {
      await api.put(`/admin/users/${userId}`, { blocked: !blocked })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, blocked: !blocked } : u))
      toast.success(!blocked ? 'User blacklisted.' : 'User restored.')
    } catch { toast.error('Status update failed') }
  }
  const revokeApproval = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}`, { approved: false })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: false } : u))
      toast.success('Approval revoked.')
    } catch { toast.error('Failed to revoke approval') }
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
    toast.success(`${newStatus === 'active' ? 'Opened' : 'Locked'} city network.`)
  }
  const deleteCorridor = async (isPermanent = false) => {
    if (!corridorToDelete) return
    const id = corridorToDelete
    try {
      const url = isPermanent ? `/corridors/${id}?permanent=true` : `/corridors/${id}`
      await api.delete(url)
      setCorridors(prev => prev.filter(c => c.id !== id))
      toast.success(isPermanent ? 'Corridor permanently deleted' : 'Corridor archived. History preserved.')
    } catch {
      toast.error(isPermanent ? 'Failed to delete corridor' : 'Failed to archive corridor')
    } finally {
      setCorridorToDelete(null)
      setIsPermanentDelete(false)
    }
  }
  const addCorridor = async () => {
    if (!newCorridor.name || !newCorridor.location_from || !newCorridor.location_to || !newCorridor.city_id) {
      toast.error('Missing route details or city'); return
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
      toast.error('Missing route details'); return
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
    // Legacy function, replaced.
  }

  const sendTicketReply = async (id: number) => {
    const reply = replyText[id]
    if (!reply?.trim()) return
    setReplyLoading(id)
    try {
      await api.put(`/admin/tickets/${id}`, { admin_reply: reply, status: 'replied' })
      setTickets(prev => prev.map(t => t.id === id ? { ...t, admin_reply: reply, status: 'replied' } : t))
      setReplyText(prev => ({ ...prev, [id]: '' }))
      toast.success('Reply sent!')
    } catch { toast.error('Failed to send reply') }
    finally { setReplyLoading(null) }
  }

  const sendFeedbackReply = async (id: number) => {
    const reply = replyText[`f${id}` as any]
    await api.put(`/admin/feedback/${id}`, { admin_reply: reply || null, status: 'read' })
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, status: 'read', admin_reply: reply || f.admin_reply } : f))
    toast.success('Marked as read')
  }

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminPasswordModalUser) return
    if (!adminPasswordInput || adminPasswordInput.length < 6) return toast.error('Min 6 chars required')
    try {
      await api.put(`/admin/users/${adminPasswordModalUser}/password`, { new_password: adminPasswordInput })
      toast.success('System override: User password reset.')
      setAdminPasswordModalUser(null)
      setAdminPasswordInput('')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Password override failed')
    }
  }

  const openTicketCount = tickets.filter(t => t.status === 'open').length
  const unreadFeedbackCount = feedback.filter(f => f.status === 'unread').length

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  )
  const pendingUsers = users.filter(u => !u.approved && !u.blocked)
  const liveRides = adminRides.filter(r => ['open', 'partially_filled', 'full'].includes(r.status))
  const archivedRides = adminRides.filter(r => ['completed', 'cancelled'].includes(r.status))

  const TABS: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users, badge: pendingUsers.length || undefined },
    { id: 'corridors', label: 'Routes', icon: MapPin },
    { id: 'locations', label: 'Cities', icon: Globe },
    { id: 'requests', label: 'Activity', icon: Car, badge: liveRides.length || undefined },
    { id: 'inbox', label: 'Inbox', icon: Inbox, badge: (openTicketCount + unreadFeedbackCount) || undefined },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-purple-600/5 blur-[150px] -z-10 pointer-events-none" />

      <JoolNav adminMode />

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12">

         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
               ADMIN ACCESS
            </div>
            <h1 className="text-6xl font-black tracking-tighter text-white">Platform Management</h1>
            <p className="text-white/40 text-xl mt-2 font-medium">Manage users, routes, and platform activity.</p>
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
              <StatCard label="Total Users" value={analytics.total_users} icon={Users} color="bg-blue-600" />
              <StatCard label="Total Rides" value={analytics.total_rides.toLocaleString()} icon={TrendingUp} color="bg-indigo-600" />
              <StatCard label="Valid Trips" value={analytics.completed_rides.toLocaleString()} icon={CheckCircle} color="bg-green-600" />
              <StatCard label="Active Routes" value={analytics.active_corridors} icon={Database} color="bg-purple-600" />
              <StatCard label="Platform Revenue" value={`₹${(analytics.total_revenue / 100000).toFixed(1)}L`} sub="annual projected" icon={Activity} color="bg-orange-600" />
              <StatCard label="CO2 Mitigation" value={`${analytics.total_credits}kg`} icon={Leaf} color="bg-emerald-600" />
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 mb-12 flex flex-col md:flex-row items-center gap-10">
               <div className="relative group flex-shrink-0">
                  <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/10 group-hover:border-blue-500 transition-all shadow-2xl bg-slate-800 flex items-center justify-center">
                     {user?.avatar_url ? (
                       <img src={user.avatar_url} alt="Admin" className="w-full h-full object-cover" />
                     ) : (
                       <Shield className="w-12 h-12 text-white/20" />
                     )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-xl">
                     {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                     <input type="file" accept="image/*" onChange={handleProfileImageUpload} disabled={uploadingImage} className="hidden" />
                  </label>
               </div>
                <div>
                  <h3 className="text-3xl font-black mb-2">Admin Profile</h3>
                  <p className="text-white/40 font-bold mb-4 italic uppercase tracking-widest text-xs">Access Level: ADMIN</p>
                  <p className="text-white/60 font-medium">Manage your profile and security settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {pendingUsers.length > 0 && (
                 <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[2.5rem] p-10 flex flex-col justify-between items-start group relative overflow-hidden">
                    <AlertTriangle className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 text-yellow-500 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <div>
                       <h3 className="text-3xl font-black text-yellow-500 mb-2">User Approval</h3>
                       <p className="text-yellow-500/60 font-bold">{pendingUsers.length} users are requesting community entry.</p>
                    </div>
                    <button onClick={() => setActiveTab('users')} className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl">
                       REVIEW REQUESTS
                    </button>
                 </div>
               )}
               {liveRides.length > 0 && (
                 <div className="bg-blue-600/10 border border-blue-600/20 rounded-[2.5rem] p-10 flex flex-col justify-between items-start group relative overflow-hidden">
                    <Car className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 text-blue-500 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    <div>
                       <h3 className="text-3xl font-black text-blue-400 mb-2">Trip Activity</h3>
                       <p className="text-blue-400/60 font-bold">{liveRides.length} active rides in the network.</p>
                    </div>
                    <button onClick={() => setActiveTab('requests')} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl">
                       VIEW ACTIVITY
                    </button>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div>
                 <h2 className="text-3xl font-black">User Registry</h2>
                 <p className="text-white/40 font-bold">{users.length} registered users in the app.</p>
               </div>
               <div className="flex items-center gap-4">
                  <button 
                    onClick={async () => {
                      const toastId = toast.loading('Syncing database...')
                      try {
                        await api.post('/admin/schema-fix')
                        toast.success('Database Synced!', { id: toastId })
                        fetchAll()
                      } catch { toast.error('Sync failed. Please check server logs.', { id: toastId }) }
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(217,119,6,0.4)] border border-amber-400/30 animate-pulse"
                  >
                    <Database className="w-5 h-5" /> SYNC DATABASE SCHEMA
                  </button>
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                    <input value={searchUser} onChange={e => setSearchUser(e.target.value)}
                      placeholder="Search..." className="bg-white/5 border border-white/5 focus:border-blue-600 pl-16 pr-8 py-5 rounded-2xl text-lg font-black focus:outline-none focus:bg-white/10 transition-all w-64" />
                  </div>
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
                          {u.approved === true && u.blocked !== true && <span className="text-[9px] bg-amber-500 text-black px-3 py-1 rounded-full font-black tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.4)]">PREMIUM MEMBER</span>}
                          {u.approved === true && u.blocked !== true && <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full font-black tracking-widest">VERIFIED</span>}
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
                       <button onClick={() => setAdminPasswordModalUser(u.id)} className="bg-yellow-600/10 text-yellow-500 hover:bg-yellow-600 hover:text-white px-8 py-4 rounded-2xl font-black text-xs transition-all active:scale-95">
                         RESET PW
                       </button>
                       {u.approved && (
                         <button onClick={() => revokeApproval(u.id)} className="bg-orange-600/10 text-orange-500 hover:bg-orange-600 hover:text-white px-8 py-4 rounded-2xl font-black text-xs transition-all active:scale-95">
                           REVOKE APPROVAL
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

        {/* ROUTES */}
        {activeTab === 'corridors' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                 <h2 className="text-3xl font-black">Route Management</h2>
                 <p className="text-white/40 font-bold">Configure active routes and pickup hubs.</p>
               </div>
               <button onClick={() => {
                 setNewCorridor({ city_id: 1, name: '', location_from: '', location_to: '', description: '', image_url: '' });
                 setEditCorridorMode(null);
                 setShowAddCorridor(!showAddCorridor);
               }} className="bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-2xl">
                 NEW ROUTE
               </button>
            </div>

            {(showAddCorridor || editCorridorMode !== null) && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 mb-12">
                <h3 className="text-2xl font-black mb-8">{editCorridorMode ? 'Edit Route Details' : 'Create New Route'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Display Name</label>
                    <input value={newCorridor.name} onChange={e => setNewCorridor(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Palava Elite" className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Starting Point</label>
                    <input value={newCorridor.location_from} onChange={e => setNewCorridor(p => ({ ...p, location_from: e.target.value }))}
                      placeholder="Starting Sector" className="w-full px-6 py-4 bg-[#0f172a] border border-white/5 rounded-2xl text-white font-bold placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2">Ending Point</label>
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
                    {editCorridorMode ? 'SAVE CHANGES' : 'PUBLISH ROUTE'}
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
                        <button onClick={() => setCorridorToDelete(c.id)} className="p-4 rounded-2xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all">
                           <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                   </div>
                   {c.description && <p className="mb-6 text-sm text-white/60 bg-[#0f172a] p-4 rounded-xl border border-white/5">{c.description}</p>}
                   <div className="flex items-center gap-6 text-lg font-bold text-white/60">
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">START</span>
                         {c.location_from}
                      </div>
                      <ChevronRight className="w-6 h-6 text-white/10" />
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">END</span>
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
                 <h2 className="text-3xl font-black">Location Settings</h2>
                 <p className="text-white/40 font-bold">Managing regional availability and local hubs.</p>
               </div>
               <button onClick={() => setShowAddCity(!showAddCity)} className="bg-white text-black hover:bg-blue-600 hover:text-white px-10 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl">
                 ADD NEW LOCATION
               </button>
            </div>

            {showAddCity && (
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 mb-12">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-2 block mb-4">Location Name</label>
                <div className="flex gap-4">
                  <input value={newCity} onChange={e => setNewCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCity()}
                    placeholder="e.g. Pune Metropolitan Area" className="flex-1 px-8 py-5 bg-[#0f172a] border border-white/5 rounded-2xl text-xl font-black placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all shadow-inner" />
                  <button onClick={addCity} className="bg-blue-600 hover:bg-blue-700 px-12 py-5 rounded-2xl font-black shadow-xl">SAVE & ADD</button>
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
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${city.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>LOCATION {city.status.toUpperCase()}</p>
                      </div>
                   </div>
                   <button onClick={() => toggleCity(city.id, city.status)}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                      city.status === 'active' ? 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white' : 'bg-green-600/10 text-green-500 hover:bg-green-600 hover:text-white'
                    }`}>
                    {city.status === 'active' ? <><Lock className="w-4 h-4" /> LOCK LOCATION</> : <><Unlock className="w-4 h-4" /> ACTIVATE LOCATION</>}
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
            
            {liveRides.length > 0 && (
              <div className="mb-16">
                 <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                   <Activity className="w-4 h-4" /> LIVE RIDES ({liveRides.length})
                 </p>
                 <div className="space-y-4">
                    {liveRides.map(r => {
                      const hasTicket = tickets.some(t => t.trip_id === String(r.id) && t.status !== 'closed');
                      return (
                      <div key={r.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                         <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                               <p className="text-2xl font-black text-white">{r.user_name}</p>
                               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${r.status === 'full' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                  {r.status.replace('_', ' ')}
                               </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Pick Location</span>
                                  <span className="text-xs font-bold text-white/60">{r.pickup_point}</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Route</span>
                                  <span className="text-xs font-bold text-white/60">{r.corridor_name}</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Schedule</span>
                                  <span className="text-xs font-bold text-white/60">{new Date(r.ride_date).toLocaleDateString()} · {r.ride_time?.slice(0,5)}</span>
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-[9px] font-black text-white/20 tracking-widest uppercase mb-1">Capacity</span>
                                  <span className="text-xs font-bold text-white/60">{r.available_seats} / {r.total_seats} Seats</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col gap-4 w-full md:w-auto items-end">
                            {hasTicket && (
                              <div className="flex items-center gap-1.5 min-w-max bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                                <Ticket className="w-3.5 h-3.5" /> FLAG
                              </div>
                            )}
                            <Link href={`/rides/${r.id}`} className="min-w-max bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest inline-flex items-center gap-2">
                               VIEW DETAILS <ArrowRight className="w-4 h-4" />
                            </Link>
                         </div>
                      </div>
                    )})}
                 </div>
              </div>
            )}

            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">ARCHIVED RIDES</p>
            <div className="grid grid-cols-1 gap-4">
               {archivedRides.length === 0 && <p className="text-xs font-bold text-white/20 py-4">No archived rides</p>}
               {archivedRides.map(r => (
                 <div key={r.id} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 flex items-center justify-between opacity-60">
                    <div>
                       <p className="text-lg font-black">{r.user_name}</p>
                       <p className="text-xs font-bold text-white/30 mt-1 uppercase tracking-widest">{r.corridor_name} · {new Date(r.ride_date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.1em] ${r.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                         LOG: {r.status}
                      </span>
                      <Link href={`/rides/${r.id}`} className="p-2 border border-white/10 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all"><ArrowRight className="w-4 h-4" /></Link>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* INBOX */}
        {activeTab === 'inbox' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-black">Support Inbox</h2>
                <p className="text-white/40 font-bold">Tickets and feedback from users — reply directly from here.</p>
              </div>
              <button onClick={fetchAll} className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-black hover:bg-white/10 transition-colors">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-2 mb-8">
              <button onClick={() => setInboxTab('tickets')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                  inboxTab === 'tickets' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'
                }`}>
                <Ticket className="w-4 h-4" /> Support Tickets
                {openTicketCount > 0 && <span className="bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-black">{openTicketCount} open</span>}
              </button>
              <button onClick={() => setInboxTab('feedback')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                  inboxTab === 'feedback' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white'
                }`}>
                <MessageSquare className="w-4 h-4" /> Feedback
                {unreadFeedbackCount > 0 && <span className="bg-blue-500 text-white text-[10px] rounded-full px-2 py-0.5 font-black">{unreadFeedbackCount} new</span>}
              </button>
            </div>

            {/* TICKETS */}
            {inboxTab === 'tickets' && (
              <div className="space-y-4">
                {tickets.length === 0 && <div className="text-center py-16 text-white/20 font-bold">No tickets yet</div>}
                {tickets.map(t => (
                  <div key={t.id} className={`border rounded-[2rem] p-8 transition-all ${
                    t.status === 'open' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/[0.03] border-white/5'
                  }`}>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-blue-400 font-black text-sm">{t.ref}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          t.status === 'replied' ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : t.status === 'closed' ? 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>{t.status}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          t.urgency === 'urgent' ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : t.urgency === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                          : 'bg-white/5 border-white/10 text-white/30'
                        }`}>{t.urgency}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{t.name || 'Anonymous'}</p>
                        <p className="text-xs text-white/40">{t.email}</p>
                        <p className="text-xs text-white/20 mt-1">{new Date(t.created_at).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-black text-white/40 uppercase">{t.issue_type}</span>
                      {t.trip_id && <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase">Trip #{t.trip_id}</span>}
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4">
                      <p className="text-sm text-slate-300 leading-relaxed">{t.description}</p>
                    </div>

                    {t.admin_reply && (
                      <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4 mb-4">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Your Reply ({t.replied_at ? new Date(t.replied_at).toLocaleDateString('en-IN') : ''})</p>
                        <p className="text-sm text-white">{t.admin_reply}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <textarea
                        rows={2}
                        value={replyText[t.id] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [t.id]: e.target.value }))}
                        placeholder={t.admin_reply ? 'Send another reply...' : 'Type your reply to this user...'}
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => sendTicketReply(t.id)}
                          disabled={replyLoading === t.id || !replyText[t.id]?.trim()}
                          className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-500 transition-colors disabled:opacity-40 flex items-center gap-2"
                        >
                          {replyLoading === t.id ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Reply</>}
                        </button>
                        {t.status !== 'closed' && (
                          <button
                            onClick={() => sendTicketReply(t.id)}
                            className="px-5 py-2 bg-white/5 border border-white/10 text-white/30 rounded-2xl text-xs font-black hover:bg-white/10 transition-colors"
                          >Close</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FEEDBACK */}
            {inboxTab === 'feedback' && (
              <div className="space-y-4">
                {feedback.length === 0 && <div className="text-center py-16 text-white/20 font-bold">No feedback yet</div>}
                {feedback.map(f => (
                  <div key={f.id} className={`border rounded-[2rem] p-8 transition-all ${
                    f.status === 'unread' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-white/[0.03] border-white/5'
                  }`}>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[1,2,3,4,5].map(n => (
                            <span key={n} className={`text-lg ${n <= f.rating ? 'text-amber-400' : 'text-white/10'}`}>★</span>
                          ))}
                        </div>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase">{f.type}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          f.status === 'unread' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10 text-white/20'
                        }`}>{f.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{f.name || 'Anonymous'}</p>
                        <p className="text-xs text-white/40">{f.email}</p>
                        <p className="text-xs text-white/20 mt-1">{new Date(f.created_at).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 mb-4">
                      <p className="text-sm text-slate-300 leading-relaxed">{f.message}</p>
                    </div>

                    {f.admin_reply && (
                      <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-3 mb-4">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Note Added</p>
                        <p className="text-sm text-white">{f.admin_reply}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={replyText[`f${f.id}` as any] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [`f${f.id}`]: e.target.value }))}
                        placeholder="Add an internal note (optional)..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <button
                        onClick={() => sendFeedbackReply(f.id)}
                        className="px-5 py-3 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-sm font-black hover:bg-white/10 transition-colors"
                      >
                        Mark Read
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {adminPasswordModalUser && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-slate-900 border border-red-500/20 p-8 rounded-[3rem] w-full max-w-md shadow-2xl relative overflow-hidden">
             <AlertTriangle className="absolute -top-10 -right-10 w-48 h-48 opacity-[0.03] text-red-500 pointer-events-none" />
             <h3 className="text-2xl font-black text-white mb-2 relative">Reset User Password</h3>
             <p className="text-sm font-bold text-red-400 mb-6 relative">Warning: Replacing user authentication.</p>
             <form onSubmit={handleAdminResetPassword} className="space-y-4 relative">
               <input 
                 type="password" placeholder="Type new password (min 6)" 
                 value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)}
                 className="w-full bg-black/40 border border-red-500/30 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-500 transition-all"
                 autoFocus
               />
               <div className="flex gap-4 pt-4">
                 <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95">OVERRIDE</button>
                 <button type="button" onClick={() => {setAdminPasswordModalUser(null); setAdminPasswordInput('')}} className="flex-1 bg-white/5 text-white/60 hover:text-white font-black py-4 rounded-2xl transition-all border border-white/5 relative z-10">ABORT</button>
               </div>
             </form>
           </div>
        </div>
      )}

        {/* DELETE CONFIRMATION MODAL */}
        {corridorToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60">
            <div className={`bg-slate-900/90 border rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300 ${isPermanentDelete ? 'border-red-500/50 shadow-red-500/20' : 'border-white/10'}`}>
               <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 ${isPermanentDelete ? 'bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : 'bg-red-500/20'}`}>
                  <AlertTriangle className={`w-10 h-10 ${isPermanentDelete ? 'text-white' : 'text-red-500'}`} />
               </div>
               
               <h3 className="text-2xl font-black text-center mb-4">
                 {isPermanentDelete ? 'Permanent Delete?' : 'Archive Corridor?'}
               </h3>
               
               <p className="text-white/40 text-center font-medium mb-8 leading-relaxed">
                 {isPermanentDelete 
                   ? <>This will <span className="text-red-500 font-bold uppercase underline">permanently remove</span> the route and all its metadata from the system. This cannot be undone.</>
                   : <>Archiving will hide this route from new rides. Previous rides and history will be <span className="text-white font-bold">preserved</span> for analytics.</>
                 }
               </p>
               
               <div className="flex flex-col gap-3">
                  {!isPermanentDelete ? (
                    <>
                      <button onClick={() => deleteCorridor(false)} className="w-full py-4 bg-white text-black hover:bg-red-600 hover:text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl">
                         CONFIRM ARCHIVE
                      </button>
                      <button onClick={() => setIsPermanentDelete(true)} className="w-full py-4 bg-red-600/10 border border-red-600/20 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl text-xs font-black transition-all">
                         SKIP ARCHIVE & DELETE PERMANENTLY
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => deleteCorridor(true)} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black transition-all active:scale-95 shadow-2xl shadow-red-600/30">
                         YES, DELETE FOREVER
                      </button>
                      <button onClick={() => setIsPermanentDelete(false)} className="w-full py-4 bg-white/5 text-white/40 hover:bg-white/10 rounded-2xl font-black transition-all uppercase text-[10px] tracking-widest">
                         Back to Archive
                      </button>
                    </>
                  )}
                  <button onClick={() => { setCorridorToDelete(null); setIsPermanentDelete(false); }} className="w-full py-2 text-white/20 hover:text-white/40 text-[10px] font-black uppercase tracking-widest mt-2 transition-all">
                     Abort Action
                  </button>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
