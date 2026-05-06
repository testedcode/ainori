'use client'

import { 
  FileText, ShieldCheck, Scale, Handshake, 
  Users, Zap, Info, ArrowLeft, Clock, Banknote
} from 'lucide-react'
import Link from 'next/link'
import PulseNav from '../components/PulseNav'

export default function TermsPage() {
  const sections = [
    {
      title: 'Respect & Punctuality',
      desc: 'Our community relies on being on time. If you are going to be more than 5 minutes late, please let your ride partners know through the chat.',
      icon: Clock
    },
    {
      title: 'Fair Share Payments',
      desc: 'Ride providers agree to a simple fuel-sharing amount. Asking for extra funds beyond the agreed share is not allowed.',
      icon: Banknote
    },
    {
      title: 'Respectful Commute',
      desc: 'Please respect the personal space of others. If a "Quiet Trip" is requested, please honor it. We have zero tolerance for any form of harassment.',
      icon: Users
    },
    {
      title: 'General Info',
      desc: 'Our app is a community tool that helps people coordinate rides. Members travel together at their own discretion and responsibility.',
      icon: Scale
    }
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-600/30">
      <PulseNav />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back Home</span>
        </Link>

        <div className="mb-20">
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">COMMUNITY AGREEMENT</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none mb-8">
            COMMUNITY<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">TERMS.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl">
            By joining our community, you agree to treat everyone with respect and follow our simple guidelines for a better commute together.
          </p>
        </div>

        <div className="space-y-12">
           {sections.map((s, i) => (
             <section key={i} className="border-l-2 border-white/5 pl-8 md:pl-12 py-4">
                <div className="flex items-center gap-4 mb-6">
                   <s.icon className="w-6 h-6 text-blue-500" />
                   <h2 className="text-2xl font-black uppercase tracking-tight">{s.title}</h2>
                </div>
                <p className="text-slate-500 leading-relaxed font-medium">
                   {s.desc}
                </p>
             </section>
           ))}
        </div>

        <div className="mt-20 p-10 bg-white/[0.02] border border-white/10 rounded-[2rem] text-sm text-slate-500 leading-relaxed font-medium">
           <div className="flex gap-4">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p>These terms are regularly updated to reflect the needs of our members. Your continued use of the platform means you accept the latest community guidelines.</p>
           </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 • COMMUNITY TERMS • CRAFTED IN INDIA</p>
      </footer>
    </div>
  )
}
