'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Shield, MapPin, Calendar, Star, Leaf, 
  CheckCircle2, Info, Loader2, User, Award, Zap,
  Briefcase, Activity, Clock
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import PulseNav from '../../components/PulseNav'

interface UserProfile {
  id: number
  name: string
  city: string
  role: string
  carbon_credits: number
  avatar_url?: string
  last_seen?: string
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { id } = useParams()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get(`/users/${id}`) as unknown as UserProfile
        setProfile(data)
      } catch {
        toast.error('Profile not found or access restricted')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!profile) return null

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'year' } as any)
  const isActive = profile.last_seen && (Date.now() - new Date(profile.last_seen).getTime() < 300000)

  return (
    <div className="min-h-screen bg-[#060b18] text-white font-sans pb-20">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <PulseNav />

      <main className="max-w-4xl mx-auto px-6 mt-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-10 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Commute</span>
        </button>

        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -z-10" />
          
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
             <div className="relative">
                <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-5xl md:text-7xl shadow-[0_20px_50px_rgba(37,99,235,0.4)] relative z-10">
                   {initials}
                </div>
                {isActive && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 px-4 py-1.5 rounded-full border-4 border-[#060b18] text-[8px] font-black uppercase tracking-widest z-20 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
                  </div>
                )}
             </div>

             <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                   <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">{profile.name}</h1>
                   {profile.role === 'admin' && (
                     <div className="inline-flex bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest items-center gap-1.5 mx-auto md:mx-0">
                        <Award className="w-3 h-3" /> System Admin
                     </div>
                   )}
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400">
                   <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold uppercase tracking-wide">{profile.city || 'Mumbai Network'}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold uppercase tracking-wide">Member since {memberSince}</span>
                   </div>
                </div>

                <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Impact</p>
                      <p className="text-xl font-black text-blue-400">{profile.carbon_credits || 0}<span className="text-[10px] ml-1">kg</span></p>
                   </div>
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Trust Score</p>
                      <p className="text-xl font-black text-amber-500">4.9</p>
                   </div>
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Reputation</p>
                      <p className="text-xl font-black text-green-400">Elite</p>
                   </div>
                   <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Verification</p>
                      <CheckCircle2 className="w-6 h-6 text-blue-500 mx-auto" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
           <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-400" />
                 </div>
                 <h3 className="text-xl font-black">Identity Verification</h3>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Corporate ID', status: 'Linked', icon: Briefcase },
                   { label: 'KYC Verified', status: 'Verified', icon: User },
                   { label: 'Social Graph', status: 'Connected', icon: Activity }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all cursor-default">
                      <div className="flex items-center gap-3">
                         <item.icon className="w-4 h-4 text-white/20" />
                         <span className="text-xs font-black uppercase tracking-widest text-white/60">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-2 py-1 bg-blue-400/10 rounded-lg">{item.status}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-between">
              <div>
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                       <Zap className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-black">Member Level</h3>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    As an Elite member, {profile.name} contributes to the Ainori community by maintaining high punctuality and zero cancellation rates.
                 </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-[#060b18] flex items-center justify-center text-[10px] font-black">
                         ⭐️
                      </div>
                    ))}
                 </div>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">4 Reputation Badges</p>
              </div>
           </div>
        </div>
      </main>
    </div>
  )
}
