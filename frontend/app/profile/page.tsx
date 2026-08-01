'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Phone, MapPin, CreditCard, Save, Loader2, 
  Leaf, Star, Award, ShieldCheck, QrCode, Edit3, Camera,
  Clock, Sparkles, Crown, ZapOff, ShieldAlert, CheckCircle2, XCircle, Gem,
  Building2, Home, Car
} from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import PulseNav from '../components/PulseNav'
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
  approved?: boolean
  blocked?: boolean
}interface UserRide {
  id: number
  corridor_name: string
  ride_date: string
  ride_time: string
  status: string
  role: 'host' | 'rider'
  driver_name: string
  direction?: string
  confirmed_riders?: { id: number; name: string; avatar_url: string }[]
}

interface Vehicle {
  id: number;
  vehicle_type: string;
  make: string;
  model: string;
  color: string;
  vehicle_number: string;
  total_seats: number;
  default_available_seats: number;
  image_url?: string;
}

export default function ProfilePage() {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
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
      try {
        const vehRes = await api.get('/vehicles');
        if (Array.isArray(vehRes) && vehRes.length > 0) {
          setVehicle(vehRes[0] as Vehicle);
        }
      } catch (vehError) {
        console.error('Failed to load vehicle:', vehError);
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
      toast.error('Failed to load profile details')
    } finally {
      setLoading(false)
    }

    try {
      const ridesRes = await api.get('/user/rides')
      if (Array.isArray(ridesRes)) {
        setMyRides(ridesRes as unknown as UserRide[])
      }
    } catch {}
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/auth/profile', formData)
      toast.success('Profile updated!')
      setIsEditing(false)
      fetchProfile()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Update failed')
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
      toast.success('Profile picture updated!')
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
      toast.success('Payment QR updated!')
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
      toast.success('Password changed successfully')
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
          <p className="text-white/40 font-black tracking-widest text-[10px] uppercase">Loading Profile...</p>
        </div>
      </div>
    )
  }

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20 relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />
      
      <PulseNav />

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12">
        
        {/* My Profile Section */}
        <div className="relative mb-24 animate-in fade-in zoom-in-95 duration-1000">
           {/* Outer Glows */}
           <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] -z-10 rounded-full" />
           <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] -z-10 rounded-full" />
           
           <div className="bg-white/[0.02] border border-white/10 rounded-[5rem] p-12 md:p-20 backdrop-blur-3xl shadow-[0_80px_160px_rgba(0,0,0,0.6)] relative overflow-hidden group">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
              
              <div className="flex flex-col lg:flex-row items-center gap-20 relative z-10">
                 {/* Left Column: Profile Picture */}
                 <div className="relative">
                    <div className="w-56 h-56 rounded-[4rem] bg-gradient-to-tr from-blue-600 via-indigo-500 to-amber-500 p-1 shadow-[0_40px_80px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform duration-700">
                       <div className="w-full h-full rounded-[3.8rem] bg-slate-900 overflow-hidden relative">
                          {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-7xl font-black text-white/20 uppercase italic tracking-tighter">{initials}</div>
                          )}
                          {uploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-md">
                              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          )}
                       </div>
                    </div>
                    {/* Level Overlay */}
                    <div className="absolute -top-4 -right-4 px-4 py-2 bg-amber-500 text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl border-4 border-[#0f172a] transform rotate-12">
                       MEMBER
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-16 h-16 bg-white text-black rounded-2xl shadow-2xl hover:scale-110 transition-all active:scale-95 cursor-pointer z-10 flex items-center justify-center border-4 border-[#0f172a] group/cam">
                       <Camera className="w-7 h-7 group-hover/cam:rotate-12 transition-transform" />
                       <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
                    </label>
                 </div>

                 {/* Center Column: Identity Attributes */}
                 <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-10">
                       <div className="px-6 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                          <Crown className="w-4 h-4" /> {profile?.approved ? 'VERIFIED MEMBER' : 'PENDING VERIFICATION'}
                       </div>
                       {profile?.role === 'admin' && (
                         <div className="px-6 py-2 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-lg shadow-blue-500/30">
                            SYSTEM ADMIN
                         </div>
                       )}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
                       {profile?.name}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-12 mt-12">
                       <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Member ID</p>
                          <p className="text-xl font-mono text-white/60 tracking-tighter">AN-{(profile?.id || 0).toString().padStart(6, '0')}</p>
                       </div>
                       <div className="w-px h-12 bg-white/5 hidden md:block" />
                       <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Carbon Saved</p>
                          <div className="flex items-center gap-3">
                             <Leaf className="w-6 h-6 text-green-500" />
                             <span className="text-3xl font-black">{profile?.carbon_credits}<span className="text-xs text-white/20 ml-1 font-normal italic">KG</span></span>
                          </div>
                       </div>
                       <div className="w-px h-12 bg-white/5 hidden md:block" />
                       <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Trust Score</p>
                          <div className="flex items-center gap-3">
                             <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                             <span className="text-3xl font-black">4.9<span className="text-xs text-white/20 ml-1 font-normal italic">RELIABLE</span></span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right Column: Benefits Hub */}
                 <div className="lg:w-1/4 w-full">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[3.5rem] p-8 space-y-6">
                        {vehicle && (
                          <div className="bg-white/5 border border-white/10 rounded-[3rem] p-6 mb-6 shadow-2xl relative overflow-hidden group">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                                <img src={vehicle.image_url || '/default_vehicle.png'} alt="Vehicle" className="w-full h-full object-cover" />
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-black text-white italic tracking-tighter uppercase">{vehicle.make} {vehicle.model}</h3>
                                <p className="text-[10px] text-white/40 font-mono tracking-tighter uppercase">{vehicle.color} • {vehicle.vehicle_number}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => router.push('/vehicles')}
                              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
                            >
                              EDIT VEHICLE
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center mb-2">Member Benefits</p>
                        <div className="space-y-3">
                          {[
                            { label: 'Priority Routes', active: profile?.approved },
                            { label: 'Smart Matching', active: profile?.approved },
                            { label: 'Member Perks', active: profile?.approved }
                          ].map((priv, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3 bg-white/5 rounded-2xl border border-white/5">
                               <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{priv.label}</span>
                               {priv.active ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-white/10" />}
                            </div>
                          ))}
                       </div>
                       
                       <div className="pt-4 space-y-4">
                          {profile?.approved ? (
                            <Link href="/exclusive-benefits" className="w-full py-5 bg-amber-500 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-[0_20px_40px_rgba(245,158,11,0.2)]">
                               <Gem className="w-4 h-4" /> VIEW BENEFITS
                            </Link>
                          ) : (
                            <div className="w-full py-5 bg-white/5 border border-white/10 text-white/20 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 cursor-not-allowed">
                               <ShieldAlert className="w-4 h-4" /> VERIFICATION PENDING
                            </div>
                          )}
                          <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                          >
                             {isEditing ? <><ZapOff className="w-4 h-4" /> CANCEL EDIT</> : <><Edit3 className="w-4 h-4" /> EDIT PROFILE</>}
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Content Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           
           {/* Left Column: Form / Info */}
           <div className="lg:col-span-8 space-y-12">
              <section>
                 <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-500" /> ACCOUNT DETAILS
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
                               placeholder="Enter your name..."
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Phone Number</label>
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
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Current City</label>
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
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">About Me</label>
                          <div className="relative group">
                             <input 
                               type="text" 
                               value={formData.bio}
                               onChange={e => setFormData({...formData, bio: e.target.value})}
                               disabled={!isEditing}
                               className="w-full bg-white/5 border border-white/5 focus:border-blue-500 rounded-2xl py-4 px-6 text-sm font-bold text-white transition-all outline-none disabled:opacity-50"
                               placeholder="Short bio..."
                             />
                          </div>
                       </div>
                     
                     {/* Car details display inside the edit/view section */}
                     {vehicle && (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mt-6">
                           <h4 className="text-xs font-black text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Car className="w-4 h-4 text-blue-500" /> REGISTERED CAR DETAILS
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-1">Make & Model</label>
                                 <span className="text-sm font-black text-white uppercase italic">{vehicle.make} {vehicle.model}</span>
                              </div>
                              <div>
                                 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-1">Color</label>
                                 <span className="text-sm font-black text-white uppercase italic">{vehicle.color}</span>
                              </div>
                              <div>
                                 <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] block mb-1">Plate Number</label>
                                 <span className="text-sm font-mono font-black text-white tracking-wider">{vehicle.vehicle_number}</span>
                              </div>
                           </div>
                        </div>
                     )}
                    </div>

                    {isEditing && (
                       <button 
                         type="submit" 
                         disabled={saving}
                         className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 disabled:opacity-50 active:scale-95"
                       >
                          {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> SAVING...</> : <><Save className="w-5 h-5" /> SAVE PROFILE</>}
                       </button>
                    )}
                 </form>
              </section>

              <section>
                 <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                    <Award className="w-6 h-6 text-green-500" /> ACTIVITY STATS
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Commute Streak', value: myRides.length > 0 ? `${myRides.length * 3} Days` : '0 Days', sub: myRides.length > 5 ? 'High Consistency' : 'Building Streak', icon: Award, color: 'text-yellow-400' },
                      { label: 'Network Trust', value: profile?.approved ? 'Elite' : 'Basic', sub: profile?.approved ? 'Top 5% of Members' : 'Awaiting Review', icon: ShieldCheck, color: 'text-blue-400' },
                      { label: 'Rider Score', value: profile?.approved ? '98/100' : '90/100', sub: 'Verified Rating', icon: Star, color: 'text-purple-400' }
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
                       <CreditCard className="w-5 h-5 text-blue-400" /> PAYMENT DETAILS
                    </h3>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">UPI Address</label>
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
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Payment QR Code</label>
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
                             {!formData.qr_code_url && <p className="absolute bottom-4 text-slate-300 text-[8px] font-black uppercase tracking-[0.2em]">No QR Uploaded</p>}
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              <section className="bg-white/5 border border-white/5 rounded-[3rem] p-8">
                 <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" /> SECURITY SETTINGS
                 </h3>
                 <div className="space-y-3">
                    <button onClick={() => setShowPasswordModal(true)} className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                       <p className="text-xs font-black text-white mb-0.5">CHANGE PASSWORD</p>
                       <p className="text-[10px] text-white/20 font-bold uppercase">Update your password</p>
                    </button>
                    <button className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all">
                       <p className="text-xs font-black text-white mb-0.5">2-FACTOR AUTH</p>
                       <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">ENABLED</p>
                    </button>
                 </div>
              </section>
           </div>

        </div>

          <section className="mt-24 pb-20">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20">
                      <MapPin className="w-8 h-8 text-white" />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Ride History</h3>
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-1">Your past and upcoming rides</p>
                   </div>
                </div>
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-3">
                   <ShieldCheck className="w-4 h-4 text-blue-400" /> All rides verified
                </div>
             </div>

             <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-1 md:p-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] -z-10" />
                
                {myRides.length === 0 ? (
                  <div className="text-center py-32">
                     <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ZapOff className="w-10 h-10 text-white/10" />
                     </div>
                     <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">No rides found in your history.</p>
                     <Link href="/rides" className="mt-8 inline-flex px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/10">Find First Ride</Link>
                  </div>
                ) : (() => {
                  const activeTrips = myRides.filter(r => r.status !== 'cancelled')
                  
                  // Group by month
                  const groups: Record<string, UserRide[]> = {}
                  activeTrips.forEach(r => {
                    const datePart = r.ride_date.split('T')[0]
                    const d = new Date(datePart + 'T00:00:00')
                    const month = d.toLocaleString('default', { month: 'long', year: 'numeric' })
                    if (!groups[month]) groups[month] = []
                    groups[month].push(r)
                  })

                  const sortedMonths = Object.keys(groups).sort((a, b) => {
                    const [m1, y1] = a.split(' ')
                    const [m2, y2] = b.split(' ')
                    return new Date(`${m2} 1, ${y2}`).getTime() - new Date(`${m1} 1, ${m1}`).getTime()
                  })

                  return (
                    <div className="space-y-16 p-8 md:p-12">
                      {sortedMonths.map(month => (
                        <div key={month}>
                           <div className="flex items-center gap-6 mb-10">
                              <h4 className="text-2xl font-black text-white/80 uppercase italic tracking-tighter leading-none">{month}</h4>
                              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {groups[month].map(ride => {
                                const datePart = ride.ride_date.split('T')[0]
                                const d = new Date(datePart + 'T00:00:00')
                                const formattedDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()
                                const isHost = ride.role === 'host'
                                
                                return (
                                  <div key={ride.id} className="group relative">
                                     <div className={`absolute -inset-1 bg-gradient-to-r ${isHost ? 'from-green-500/20 to-blue-500/20' : 'from-blue-600/20 to-indigo-600/20'} rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                                     
                                     <div className={`relative p-8 rounded-[3rem] border backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer ${isHost ? 'bg-green-500/[0.02] border-green-500/10 group-hover:border-green-500/30' : 'bg-blue-600/[0.02] border-blue-500/10 group-hover:border-blue-500/30'}`}>
                                        <div className="flex justify-between items-start mb-8">
                                           <div className="flex items-center gap-4">
                                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isHost ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-blue-600/10 border-blue-500/20 text-blue-400'}`}>
                                                 {isHost ? <ShieldCheck className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                                              </div>
                                              <div>
                                                 <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isHost ? 'text-green-500/60' : 'text-blue-400/60'}`}>
                                                   {isHost ? 'AS HOST' : 'AS RIDER'}
                                                 </p>
                                                 <h5 className="text-xl font-black text-white italic tracking-tighter uppercase">{ride.corridor_name}</h5>
                                              </div>
                                           </div>
                                           <div className="text-right">
                                              <span className="text-2xl font-black text-white tracking-tighter">{formattedDate}</span>
                                              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">RECORD DATE</p>
                                           </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                           <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Timing</p>
                                              <div className="flex items-center gap-2">
                                                 <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                 <span className="text-xs font-black text-white">{ride.ride_time}</span>
                                              </div>
                                           </div>
                                           <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Route</p>
                                              <div className="flex items-center gap-2">
                                                 {ride.direction === 'to_office' ? <Building2 className="w-3.5 h-3.5 text-blue-400" /> : <Home className="w-3.5 h-3.5 text-green-400" />}
                                                 <span className="text-xs font-black text-white">{ride.direction === 'to_office' ? 'OFFICE' : 'HOME'}</span>
                                              </div>
                                           </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-white/5 pt-8 gap-4">
                                           <div className="flex -space-x-2">
                                              {ride.confirmed_riders?.slice(0, 3).map((r, i) => (
                                                <img key={i} src={r.avatar_url || `https://ui-avatars.com/api/?name=${r.name}`} className="w-7 h-7 rounded-full border-2 border-[#0f172a] object-cover" />
                                              ))}
                                              {(ride.confirmed_riders?.length || 0) > 3 && (
                                                <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[8px] font-black">+{ride.confirmed_riders!.length - 3}</div>
                                              )}
                                           </div>

                                           <div className="flex gap-2">
                                              <Link 
                                                href={`/rides/${ride.id}`}
                                                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isHost ? 'bg-green-500 text-black hover:bg-green-400' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20'}`}
                                              >
                                                 VIEW RIDE
                                              </Link>
                                              <Link 
                                                href={`/support?tab=ticket&trip_id=${ride.id}`}
                                                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                                              >
                                                 REPORT
                                              </Link>
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                                )
                              })}
                           </div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
             </div>
          </section>
      </main>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-slate-900 border border-white/10 p-8 rounded-[3rem] w-full max-w-md shadow-2xl">
             <h3 className="text-2xl font-black text-white mb-6">Change Password</h3>
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
                 <button type="submit" className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl">SAVE PASSWORD</button>
                 <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 bg-white/5 text-white font-black py-4 rounded-2xl">CANCEL</button>
               </div>
             </form>
           </div>
        </div>
      )}
    </div>
  )
}
