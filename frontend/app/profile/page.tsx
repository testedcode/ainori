'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Phone, MapPin, CreditCard, Save, Loader2, 
  Leaf, Star, Award, ShieldCheck, QrCode, Edit3, Camera,
  Clock
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../components/JoolNav'
import { createClient } from '@/utils/supabase/client'

interface ProfileData {
  id: number
  email: string
  name: string
  phone?: string
  city?: string
  upi_id?: string
  carbon_credits: number
  role: string
  bio?: string
  avatar_url?: string
  qr_code_url?: string
}

interface UserRide {
  id: number
  corridor_name: string
  ride_date: string
  ride_time: string
  status: string
  role: 'host' | 'rider'
  driver_name: string
  direction?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [myRides, setMyRides] = useState<UserRide[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    upi_id: '',
    bio: '',
    avatar_url: '',
    qr_code_url: ''
  })
  
  const [uploading, setUploading] = useState(false)
  const [uploadingQr, setUploadingQr] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({ old: '', new: '' })
  const supabase = createClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchProfile()
  }, [router])

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile() as unknown as ProfileData
      if (data) {
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          city: data.city || '',
          upi_id: data.upi_id || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          qr_code_url: data.qr_code_url || ''
        })
        localStorage.setItem('user', JSON.stringify(data))
      } else {
        throw new Error('Empty profile response')
      }
    } catch (e: any) {
      const status = e?.response?.status
      if (status === 401 || status === 503) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        toast.error('Session verification failed. Please login again.')
        router.push('/login')
        return
      }
      toast.error('Failed to load profile intelligence')
    } finally {
      setLoading(false)
    }

    try {
      const ridesRes = await api.get('/user/rides')
      if (Array.isArray(ridesRes)) {
        setMyRides(ridesRes as unknown as UserRide[])
      }
    } catch {}
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', formData)
      toast.success('System profile synchronized!')
      setIsEditing(false)
      fetchProfile()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Synchronization failed')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${profile?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      await api.put('/auth/profile', { ...formData, avatar_url: publicUrl })
      toast.success('System Avatar updated!')
      fetchProfile()
    } catch (e: any) {
      toast.error(e.message || 'Error uploading avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingQr(true)
      if (!e.target.files || e.target.files.length === 0) return
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `qr-${profile?.id}-${Math.random()}.${fileExt}`

      const { error } = await supabase.storage.from('avatars').upload(filePath, file)
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      await api.put('/auth/profile', { ...formData, qr_code_url: publicUrl })
      toast.success('Payment QR Matrix Updated!')
      fetchProfile()
    } catch (e: any) {
      toast.error(e.message || 'Error uploading QR code')
    } finally {
      setUploadingQr(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordData.old || !passwordData.new) return toast.error('Fill required fields')
    try {
      await api.put('/auth/password', { old_password: passwordData.old, new_password: passwordData.new })
      toast.success('Security Protocol: Password Reset Successful')
      setShowPasswordModal(false)
      setPasswordData({ old: '', new: '' })
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Password update failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-black tracking-widest text-[10px] uppercase">Accessing Identity Vault...</p>
        </div>
      </div>
    )
  }

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />
      
      <JoolNav />

      <main className="max-w-6xl mx-auto px-6 md:px-12 mt-12">
        
        {/* Profile Header Card */}
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden mb-12">
           <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4">
             <User className="w-96 h-96 text-white" />
           </div>
           
           <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              {/* Avatar Section */}
              <div className="relative group">
                 <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-6xl shadow-[0_20px_50px_rgba(37,99,235,0.3)] border-4 border-white/5 overflow-hidden relative">
                   {profile?.avatar_url ? (
                     <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     initials
                   )}
                   {uploading && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                       <Loader2 className="w-8 h-8 text-white animate-spin" />
                     </div>
                   )}
                 </div>
                 <label className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95 cursor-pointer z-10">
                    <Camera className="w-5 h-5" />
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                 </label>
              </div>

              {/* Identity Section */}
              <div className="flex-1 text-center md:text-left">
                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                    <ShieldCheck className="w-3.5 h-3.5" /> {profile?.role === 'admin' ? 'ELITE ARCHITECT' : 'VERIFIED COMMUTER'}
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{profile?.name}</h1>
                 <p className="text-lg text-white/40 font-medium mb-6 flex items-center justify-center md:justify-start gap-2">
                    <Mail className="w-4 h-4" /> {profile?.email}
                 </p>
                 
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2">
                       <Leaf className="w-4 h-4 text-green-400" />
                       <span className="text-sm font-black text-green-400 uppercase tracking-tighter">{profile?.carbon_credits}g CARBON SAVED</span>
                    </div>
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
                       <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                       <span className="text-sm font-black text-yellow-400 mt-0.5">4.9 RATING</span>
                    </div>
                 </div>
              </div>

              <div className="md:border-l md:border-white/10 md:pl-10 flex flex-col gap-3 min-w-[200px]">
                 <button 
                   onClick={() => setIsEditing(!isEditing)}
                   className="w-full py-4 bg-white text-black rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
                 >
                    {isEditing ? <><Edit3 className="w-4 h-4" /> CANCEL EDIT</> : <><Edit3 className="w-4 h-4" /> MODIFY PROFILE</>}
                 </button>
                 <button className="w-full py-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                    <Award className="w-4 h-4" /> VIEW ACHIEVEMENTS
                 </button>
              </div>
           </div>
        </div>

        {/* Content Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Left Column: Form / Info */}
           <div className="lg:col-span-8 space-y-12">
              <section>
                 <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-500" /> IDENTITY ATTRIBUTES
                 </h3>
                 
                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Full Name</label>
                          <div className="relative group">
                             <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                             <input 
                               type="text" 
                               value={formData.name}
                               onChange={e => setFormData({...formData, name: e.target.value})}
                               disabled={!isEditing}
                               className="w-full bg-white/5 border border-white/5 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white transition-all outline-none disabled:opacity-50"
                               placeholder="Synchronize name..."
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Phone Protocol</label>
                          <div className="relative group">
                             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                             <input 
                               type="text" 
                               value={formData.phone}
                               onChange={e => setFormData({...formData, phone: e.target.value})}
                               disabled={!isEditing}
                               className="w-full bg-white/5 border border-white/5 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white transition-all outline-none disabled:opacity-50"
                               placeholder="+91..."
                             />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Geographical Node (City)</label>
                          <div className="relative group">
                             <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                             <input 
                               type="text" 
                               value={formData.city}
                               onChange={e => setFormData({...formData, city: e.target.value})}
                               disabled={!isEditing}
                               className="w-full bg-white/5 border border-white/5 focus:border-blue-500 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-white transition-all outline-none disabled:opacity-50"
                               placeholder="Enter city..."
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Identity Bio</label>
                          <div className="relative group">
                             <input 
                               type="text" 
                               value={formData.bio}
                               onChange={e => setFormData({...formData, bio: e.target.value})}
                               disabled={!isEditing}
                               className="w-full bg-white/5 border border-white/5 focus:border-blue-500 rounded-2xl py-4 px-6 text-sm font-bold text-white transition-all outline-none disabled:opacity-50"
                               placeholder="Brief identity transmission..."
                             />
                          </div>
                       </div>
                    </div>

                    {isEditing && (
                       <button 
                         type="submit" 
                         disabled={saving}
                         className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                       >
                          {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> SYNCING...</> : <><Save className="w-5 h-5" /> SYNC IDENTITY</>}
                       </button>
                    )}
                 </form>
              </section>

              <section>
                 <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Award className="w-6 h-6 text-green-500" /> REPUTATION & STATS
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Commute Streak', value: '12 Days', sub: 'High Consistency', icon: Award, color: 'text-yellow-400' },
                      { label: 'Network Trust', value: 'Elite', sub: 'Top 5% of JOOL', icon: ShieldCheck, color: 'text-blue-400' },
                      { label: 'Co-Pilot Score', value: '98/100', sub: 'Premium Rating', icon: Star, color: 'text-purple-400' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:bg-white/10 transition-colors group">
                         <stat.icon className={`w-8 h-8 ${stat.color} mb-4 group-hover:scale-110 transition-transform`} />
                         <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{stat.label}</p>
                         <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                         <p className="text-[10px] text-white/20 font-bold mt-1 uppercase">{stat.sub}</p>
                      </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Right Column: Payment & Security */}
           <div className="lg:col-span-4 space-y-12">
              <section className="bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-blue-500/20 rounded-[3rem] p-8 backdrop-blur-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CreditCard className="w-24 h-24 text-white" />
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                       <CreditCard className="w-5 h-5 text-blue-400" /> PAYMENT VAULT
                    </h3>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">UPI Address (Identity)</label>
                          <div className="relative group">
                             <input 
                               type="text" 
                               value={formData.upi_id}
                               onChange={e => setFormData({...formData, upi_id: e.target.value})}
                               disabled={!isEditing}
                               className="w-full bg-[#0f172a]/60 border border-white/10 rounded-2xl py-4 px-5 text-sm font-mono font-black text-white tracking-widest outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                               placeholder="username@upi"
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Payment QR Protocol</label>
                          <div className="aspect-square bg-white rounded-[2rem] p-6 flex flex-col items-center justify-center relative overflow-hidden group/qr">
                             {formData.qr_code_url ? (
                               <img src={formData.qr_code_url} alt="QR Code" className="w-full h-full object-cover rounded-xl" />
                             ) : (
                               <QrCode className="w-full h-full text-slate-100 group-hover/qr:scale-105 transition-transform" />
                             )}
                             <label className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity cursor-pointer">
                                <span className="px-6 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                                   {uploadingQr ? <Loader2 className="w-4 h-4 animate-spin" /> : 'UPLOAD QR'}
                                </span>
                                <input type="file" accept="image/*" onChange={handleQrUpload} disabled={uploadingQr} className="hidden" />
                             </label>
                             {!formData.qr_code_url && <p className="absolute bottom-4 text-slate-300 text-[8px] font-black uppercase tracking-[0.2em]">System Placeholder</p>}
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              <section className="bg-white/5 border border-white/5 rounded-[3rem] p-8">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" /> SECURITY HUB
                 </h3>
                 <div className="space-y-3">
                    <button onClick={() => setShowPasswordModal(true)} className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                       <p className="text-xs font-black text-white mb-0.5">RESET PROTOCOL CODE</p>
                       <p className="text-[10px] text-white/20 font-bold uppercase">Change system password</p>
                    </button>
                    <button className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                       <p className="text-xs font-black text-white mb-0.5">2-FACTOR SHIELD</p>
                       <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">ENABLED</p>
                    </button>
                 </div>
              </section>
           </div>

        </div>

         {/* TRIP HISTORY - NEW SECTION */}
         <section className="mt-16">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
               <MapPin className="w-6 h-6 text-orange-500" /> TRIP HISTORY LEDGER
            </h3>
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] -z-10" />
               
               {myRides.length === 0 ? (
                 <div className="text-center py-20">
                    <MapPin className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 font-bold">No trips recorded in the ledger.</p>
                 </div>
               ) : (() => {
                  const activeTrips = myRides.filter(r => r.status === 'active' || r.status === 'completed' || r.status === 'partially_filled' || r.status === 'open')
                  
                  // Group by month
                  const groups: Record<string, UserRide[]> = {}
                  activeTrips.forEach(r => {
                    const month = new Date(r.ride_date).toLocaleString('default', { month: 'long', year: 'numeric' })
                    if (!groups[month]) groups[month] = []
                    groups[month].push(r)
                  })

                  const sortedMonths = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                  const recentMonths = sortedMonths.slice(0, 3)
                  const archiveMonths = sortedMonths.slice(3)

                  return (
                    <div className="space-y-12">
                      {recentMonths.map(month => (
                        <div key={month}>
                           <div className="flex items-center gap-4 mb-6">
                              <h4 className="text-lg font-black text-white/60 uppercase tracking-widest">{month}</h4>
                              <div className="flex-1 h-px bg-white/10" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {groups[month].map(ride => (
                                <div key={ride.id} className={`p-6 rounded-3xl border transition-all ${ride.role === 'host' ? 'bg-green-500/5 border-green-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                                   <div className="flex justify-between items-start mb-4">
                                      <div>
                                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">
                                           {ride.role === 'host' ? 'Hosted Route' : `Commuted with ${ride.driver_name}`}
                                         </p>
                                         <h5 className="font-bold text-white pr-4">{ride.corridor_name}</h5>
                                      </div>
                                      <div className="text-[10px] font-black text-white/40 border border-white/10 px-2 py-0.5 rounded-md uppercase">
                                         {ride.ride_date}
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase">
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ride.ride_time}</span>
                                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ride.direction === 'to_office' ? 'Office Bound' : 'Home Bound'}</span>
                                      <span className="flex-1 text-right text-green-400">₹{ride.id % 20 + 80} SAVED</span>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}

                      {archiveMonths.length > 0 && (
                        <div className="pt-8 border-t border-white/5">
                           <h4 className="text-xs font-black text-white/20 uppercase tracking-[0.3em] mb-6">History Archive</h4>
                           <div className="space-y-2">
                              {archiveMonths.map(month => (
                                <div key={month} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all">
                                   <span className="text-sm font-bold text-white/40">{month}</span>
                                   <span className="text-xs font-black text-blue-400">{groups[month].length} Trips Recorded</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                    </div>
                  )
               })()}
            </div>
         </section>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] w-full max-w-md shadow-2xl">
             <h3 className="text-2xl font-black text-white mb-6">Security Override</h3>
             <form onSubmit={handlePasswordChange} className="space-y-4">
               <input 
                 type="password" placeholder="Current Password" 
                 value={passwordData.old} onChange={e => setPasswordData({...passwordData, old: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500"
               />
               <input 
                 type="password" placeholder="New Password (min 6)" 
                 value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500"
               />
               <div className="flex gap-4 pt-4">
                 <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl">ENCRYPT NEW</button>
                 <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl">CANCEL</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  )
}
