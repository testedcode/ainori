'use client'

import { 
  ArrowLeft, Clock, MessageSquare, Banknote, ShieldCheck, 
  Smile, UserCheck, Coffee, Zap, MapPin, Sparkles, Star
} from 'lucide-react'
import Link from 'next/link'
import JoolNav from '../components/JoolNav'

export default function HacksPage() {
  const hacks = [
    {
      title: 'The "Single Seat" Protocol',
      desc: 'When requesting a ride, specify exactly which seat you want. Avoid multiple pending requests to different providers for the same time slot. This prevents "Ghost Bookings" and keeps the network efficient.',
      icon: UserCheck,
      color: 'bg-blue-500/20 text-blue-400'
    },
    {
      title: 'In-Commute Settlement',
      desc: 'The gold standard of commuting: pay during the ride. Once you are in the vehicle, settle via UPI. This ensures the host marks it as done instantly and avoids last-minute "did I pay?" confusion.',
      icon: Banknote,
      color: 'bg-green-500/20 text-green-400'
    },
    {
      title: 'The Silent Greet',
      desc: 'A simple "Hello" and a smile goes a long way. Use the ride as a networking hub or a silent sanctuary—just communicate your preference. Punctuality is the highest form of respect in the syndicate.',
      icon: Smile,
      color: 'bg-purple-500/20 text-purple-400'
    },
    {
      title: 'Digital Breadcrumbs',
      desc: 'Always post a confirmation message in the ride chat: "Hey, I am at the pickup point." This creates a secure log for both parties and helps the AI optimize future departure nodes.',
      icon: MessageSquare,
      color: 'bg-amber-500/20 text-amber-400'
    },
    {
      title: 'The Zero-Spam Clause',
      desc: 'Ride chats are for commute orchestration only. No promotions, no "Good Morning" spam, no unnecessary celebrations. Keep the signal high and the noise zero.',
      icon: Zap,
      color: 'bg-red-500/20 text-red-400'
    },
    {
      title: 'Verified Navigation',
      desc: 'Only trust rides with the Syndicate Blue Check. This ensures the vehicle registration and driver identity have been multi-node verified by JOOL.',
      icon: ShieldCheck,
      color: 'bg-indigo-500/20 text-indigo-400'
    }
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-600/30">
      <JoolNav />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Nexus</span>
        </Link>

        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> COMMUTE OPTIMIZATION
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none mb-8">
            HAPPY RIDE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">HACKS.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            The JOOL Syndicate is built on trust, punctuality, and zero-friction orchestration. 
            Follow these protocols to ensure every trip is a premium experience for everyone involved.
          </p>
        </div>

        <div className="space-y-6">
          {hacks.map((hack, i) => (
            <div key={i} className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 hover:bg-white/[0.04] transition-all">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${hack.color}`}>
                  <hack.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{hack.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    {hack.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-gradient-to-br from-blue-600/20 to-transparent border border-white/10 rounded-[3rem] text-center">
          <Star className="w-10 h-10 text-yellow-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black mb-4 uppercase">Contribute to the Syndicate</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Have a hack that makes commuting better? Share it with the community and earn Carbon Credits for your contribution.</p>
          <button className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Submit Hack</button>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 JOOL • CRAFTED IN INDIA FOR THE GLOBE</p>
      </footer>
    </div>
  )
}
