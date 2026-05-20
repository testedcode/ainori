'use client'

import { 
  ArrowLeft, Clock, MessageSquare, Banknote, ShieldCheck, 
  Smile, UserCheck, Coffee, Zap, MapPin, Sparkles, Star
} from 'lucide-react'
import Link from 'next/link'
import PulseNav from '@/components/PulseNav'

export default function HacksPage() {
  const hacks = [
    {
      title: 'The "Single Seat" Rule',
      desc: 'When requesting a ride, specify exactly which seat you want. Avoid multiple pending requests to different hosts for the same time slot. This prevents confusion and keeps the system efficient.',
      icon: UserCheck,
      color: 'bg-blue-500/20 text-blue-600'
    },
    {
      title: 'In-Commute Settlement',
      desc: 'The best way to travel: pay during the ride. Once you are in the vehicle, settle via UPI. This ensures the host marks it as done instantly and avoids last-minute "did I pay?" confusion.',
      icon: Banknote,
      color: 'bg-green-500/20 text-green-600'
    },
    {
      title: 'The Silent Greet',
      desc: 'A simple "Hello" and a smile goes a long way. Use the ride as a networking hub or a silent sanctuary—just communicate your preference. Punctuality is the highest form of respect in the community.',
      icon: Smile,
      color: 'bg-purple-500/20 text-purple-600'
    },
    {
      title: 'Digital Notes',
      desc: 'Always post a confirmation message in the ride chat: "Hey, I am at the pickup point." This creates a secure record for both parties and helps everyone stay on time.',
      icon: MessageSquare,
      color: 'bg-amber-100 text-amber-600'
    },
    {
      title: 'The Zero-Spam Rule',
      desc: 'Ride chats are for ride coordination only. No promotions, no "Good Morning" spam, no unnecessary messages. Keep the communication clear and useful.',
      icon: Zap,
      color: 'bg-red-500/20 text-red-400'
    },
    {
      title: 'Verified Profiles',
      desc: 'Only trust rides with the Verified Status. This ensures the vehicle registration and host identity have been thoroughly checked by our system.',
      icon: ShieldCheck,
      color: 'bg-indigo-500/20 text-indigo-400'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-200">
      <PulseNav />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Home</span>
        </Link>

        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> BETTER COMMUTING
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-8 text-slate-900">
            HELPFUL RIDE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">TIPS.</span>
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            Our community is built on trust, punctuality, and a smooth experience. 
            Follow these simple tips to ensure every trip is a premium experience for everyone involved.
          </p>
        </div>

        <div className="space-y-6">
          {hacks.map((hack, i) => (
            <div key={i} className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 hover:bg-slate-50 hover:border-slate-300 transition-all hover:shadow-xl">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${hack.color}`}>
                  <hack.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-slate-900">{hack.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {hack.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-white border border-slate-200 rounded-[3rem] text-center shadow-sm">
          <Star className="w-10 h-10 text-yellow-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black mb-4 uppercase text-slate-900">Help the Community</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto font-medium">Have a tip that makes commuting better? Share it with the community and help others travel more comfortably.</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-md active:scale-95">Submit Tip</button>
        </div>
      </main>

      <footer className="py-20 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">© 2026 COMMUNITY • CRAFTED WITH CARE</p>
      </footer>
    </div>
  )
}
