'use client'

import { 
  Shield, Lock, Key, EyeOff, Server, Globe, 
  Cpu, CheckCircle2, Zap, AlertTriangle, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import PulseNav from '@/components/PulseNav'

export default function ProtocolsPage() {
  const protocols = [
    {
      title: 'Privacy First',
      desc: 'Your personal details like phone and exact location are never shared publicly. Only your confirmed ride partners see what they need to coordinate.',
      icon: EyeOff,
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      title: 'Member Verification',
      desc: 'Every person in our community is verified. We check IDs and office affiliations to ensure everyone can travel with peace of mind.',
      icon: Shield,
      color: 'bg-green-500/10 text-green-600'
    },
    {
      title: 'Secure Messages',
      desc: 'All your coordination and chat is private and secure. We keep your conversations safe and temporary.',
      icon: Lock,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Simple Payments',
      desc: 'We use direct UPI links for easy settling. We never store your bank details; you stay in control of your money.',
      icon: Key,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'Trip Support',
      desc: 'We keep a friendly eye on active trips. If anything seems unusual, we reach out to ensure everything is okay.',
      icon: Server,
      color: 'bg-red-500/10 text-red-400'
    }
  ]

  return (
    <div className="min-h-screen bg-blue-600 text-white selection:bg-blue-200">
      <PulseNav />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back Home</span>
        </Link>

        <div className="mb-20">
          <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-6">OUR COMMUNITY SAFETY</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none mb-8">
            TRUST &<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">SAFETY.</span>
          </h1>
          <p className="text-slate-700 text-lg leading-relaxed font-medium max-w-2xl">
            Our community is built on a foundation of mutual respect and safety. We've created a simple, trusted space for professional commuters to travel together comfortably.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protocols.map((p, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-10 hover:bg-slate-50 transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${p.color}`}>
                <p.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{p.title}</h3>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-red-500/5 border border-red-500/10 rounded-[3rem]">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <AlertTriangle className="w-16 h-16 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-black mb-2 uppercase">Our Community Code</h2>
              <p className="text-slate-700 text-sm font-medium">Any attempt to misuse the platform or harvest member data will result in immediate and permanent removal from the community to protect our fellow commuters.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-slate-200 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">© 2026 • SIMPLE OFFICE COMMUTE</p>
      </footer>
    </div>
  )
}
