'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShieldCheck, Gem, Zap, Star, Users, MapPin, 
  ArrowRight, CheckCircle2, Crown, Sparkles, 
  Shield, Lock, ZapOff, Heart, Brain, Headset,
  Fingerprint, Search, Bell, ShieldEllipsis,
  CircleUser, Briefcase, Car, Coffee, Music,
  Wifi, SlidersHorizontal, UserPlus, HeartPulse, Loader2
} from 'lucide-react'
import { api } from '@/lib/api'
import PulseNav from '@/components/PulseNav'
import Link from 'next/link'

export default function ExclusiveBenefitsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile()
      setProfile(data)
    } catch (e) {
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-600 text-white font-sans selection:bg-amber-100 pb-20 overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-amber-500/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-blue-100 blur-[180px] -z-10 rounded-full animate-pulse" />
      
      <PulseNav />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        
        {/* HERO SECTION - THE KING FEEL */}
        <section className="text-center mb-40 relative">
           <div className="inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-300 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
              <Crown className="w-5 h-5 animate-pulse" /> COMMUNITY BENEFITS
           </div>
           
           <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-tight uppercase italic animate-in fade-in slide-in-from-bottom-8 duration-1000">
              YOUR COMMUTE,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 animate-gradient-x">SIMPLIFIED.</span>
           </h1>
           
           <p className="max-w-3xl mx-auto text-slate-900/50 text-lg md:text-2xl font-medium leading-relaxed mb-16 px-4">
              Step into a better way to travel. Smart matching, neighborly networking, and simple safety guidelines tailored for your daily office trip.
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link href="/find-ride" className="group relative px-14 py-6 bg-amber-500 text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-all shadow-[0_20px_60px_rgba(245,158,11,0.4)] active:scale-95">
                 <span className="relative z-10">FIND A RIDE</span>
                 <div className="absolute inset-0 bg-slate-200 rounded-[2.5rem] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
              <button className="px-14 py-6 bg-white border border-slate-200 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all hover:border-slate-300">
                 OUR PRIVACY PROMISE
              </button>
           </div>
        </section>

        {/* AI ORCHESTRATION - THE BRAIN */}
        <section className="mb-48">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="relative">
                 <div className="absolute -inset-10 bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
                 <div className="relative bg-slate-50 border border-slate-200 p-12 rounded-[4rem] backdrop-blur-3xl overflow-hidden group">
                    <div className="flex items-center gap-6 mb-12">
                       <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                          <Brain className="w-10 h-10 text-slate-900" />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black italic uppercase">SMART MATCHING</h3>
                          <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Active Matching Engine</p>
                       </div>
                    </div>
                    
                    <div className="space-y-8">
                       <div className="flex gap-6 items-start">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 mt-1">
                             <Zap className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900/80 uppercase mb-2">Smart Suggestions</h4>
                             <p className="text-sm text-slate-900/40 leading-relaxed">Our system learns your schedule and preferences to suggest the perfect match before you even open the app.</p>
                          </div>
                       </div>
                       <div className="flex gap-6 items-start">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 mt-1">
                             <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900/80 uppercase mb-2">Route Optimization</h4>
                             <p className="text-sm text-slate-900/40 leading-relaxed">Adjustments to routes based on traffic data, ensuring you're never caught in stagnant flow.</p>
                          </div>
                       </div>
                       <div className="flex gap-6 items-start">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 mt-1">
                             <Headset className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900/80 uppercase mb-2">Helpful Community Support</h4>
                             <p className="text-sm text-slate-900/40 leading-relaxed">We monitor every premium ride. If anything feels off, our helpful support team is alerted instantly.</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="lg:pl-10">
                 <h2 className="text-5xl md:text-7xl font-black mb-8 italic uppercase leading-tight">MATCHING THAT<br /><span className="text-blue-600">WORKS FOR YOU.</span></h2>
                 <p className="text-xl text-slate-900/50 leading-relaxed mb-12">
                    Premium membership unlocks the full power of our matching system. It's not just carpooling; it's a living community that evolves with you.
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl group hover:bg-slate-100 transition-all">
                       <h4 className="text-3xl font-black mb-1">98%</h4>
                       <p className="text-[10px] font-black text-slate-900/20 uppercase tracking-widest group-hover:text-amber-600 transition-colors">Member Satisfaction</p>
                    </div>
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl group hover:bg-slate-100 transition-all">
                       <h4 className="text-3xl font-black mb-1">0.4s</h4>
                       <p className="text-[10px] font-black text-slate-900/20 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Matching Speed</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ROADMAP - THE DISTINCTION */}
        <section className="mb-48 relative">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-purple-600/5 blur-[150px] -z-10" />
           <div className="text-center mb-24">
              <h2 className="text-5xl md:text-7xl font-black italic uppercase mb-6">UPCOMING FEATURES</h2>
              <p className="text-slate-900/40 max-w-2xl mx-auto font-medium">Coming soon to your dashboard: Helpful ways to choose your trip details.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Music, title: "Trip Vibe", desc: "Choose your ride atmosphere - Jazz, Lo-fi, or a Quiet Trip for deep focus." },
                { icon: Coffee, title: "Daily Rituals", desc: "Matches with partners who stop for morning coffee or news." },
                { icon: Wifi, title: "Work Ready", desc: "Ensure your ride has connectivity and a comfortable space to work." }
              ].map((item, i) => (
                <div key={i} className="p-10 bg-white border border-slate-200 rounded-[3rem] hover:bg-slate-100 transition-all group">
                   <item.icon className="w-12 h-12 text-purple-600 mb-8 group-hover:scale-110 transition-transform" />
                   <h3 className="text-2xl font-black uppercase italic mb-4">{item.title}</h3>
                   <p className="text-slate-900/40 text-sm leading-relaxed">{item.desc}</p>
                   <div className="mt-8 text-[8px] font-black text-purple-500 uppercase tracking-[0.3em]">IN DEVELOPMENT</div>
                </div>
              ))}
           </div>
        </section>

        {/* FEMALE EXCELLENCE - SAFETY & TRUST */}
        <section className="mb-48">
           <div className="bg-gradient-to-br from-pink-500/10 via-white/[0.02] to-white border border-pink-500/20 rounded-[5rem] p-12 md:p-24 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-24 opacity-5 group-hover:scale-105 transition-transform duration-1000">
                 <Heart className="w-96 h-96 text-pink-500" />
              </div>
              <div className="max-w-3xl relative z-10">
                 <div className="inline-flex items-center gap-2 px-6 py-2 bg-pink-500/20 text-pink-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
                    <HeartPulse className="w-4 h-4" /> SAFETY & TRUST
                 </div>
                 <h2 className="text-6xl font-black mb-10 italic uppercase leading-tight">SAFE &<br />TRUSTED.</h2>
                 <p className="text-xl text-slate-900/50 leading-relaxed mb-12">
                    We are creating a secure environment for all our members. Premium membership includes access to verified rides and our safety guidelines.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="flex gap-5 items-start">
                       <UserPlus className="w-8 h-8 text-pink-400 flex-shrink-0" />
                       <div>
                          <h4 className="font-black text-slate-900 italic uppercase mb-1">Female-Only Trips</h4>
                          <p className="text-sm text-slate-900/30">Explicit filter to match only with vetted female ride partners.</p>
                       </div>
                    </div>
                    <div className="flex gap-5 items-start">
                       <ShieldEllipsis className="w-8 h-8 text-pink-400 flex-shrink-0" />
                       <div>
                          <h4 className="font-black text-slate-900 italic uppercase mb-1">Live Safety Share</h4>
                          <p className="text-sm text-slate-900/30">Share your live trip details with up to 3 emergency contacts automatically.</p>
                       </div>
                    </div>
                 </div>
                 <button className="px-12 py-5 bg-pink-600 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-500 transition-all shadow-[0_0_40px_rgba(219,39,119,0.3)]">
                    LEARN ABOUT SAFETY
                 </button>
              </div>
           </div>
        </section>

        {/* CTA BOTTOM */}
        <section className="text-center pb-40">
           <div className="w-32 h-32 bg-amber-500 rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(245,158,11,0.5)] rotate-12 group hover:rotate-0 transition-transform duration-500">
              <Gem className="w-16 h-16 text-black group-hover:scale-110 transition-transform" />
           </div>
           <h2 className="text-5xl font-black mb-8 uppercase italic leading-tight">READY TO<br />START?</h2>
           <p className="text-slate-900/40 max-w-xl mx-auto mb-16 text-lg">Join our community today for a better daily commute.</p>
           <Link href="/find-ride" className="inline-block px-20 py-8 bg-blue-600 text-white rounded-[3rem] font-black text-xl uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl active:scale-95">
              JOIN OUR COMMUNITY
           </Link>
        </section>

      </main>
      
      {/* Footer Branding */}
      <footer className="border-t border-slate-200 py-20 text-center">
         <div className="opacity-10 text-[10vw] font-black tracking-tighter uppercase italic pointer-events-none select-none">
            AINORI COMMUNITY
         </div>
      </footer>
    </div>
  )
}

