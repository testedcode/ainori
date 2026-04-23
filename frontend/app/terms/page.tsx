'use client'

import { 
  FileText, ShieldCheck, Scale, Handshake, 
  Users, Zap, Info, ArrowLeft, Clock, Banknote
} from 'lucide-react'
import Link from 'next/link'
import JoolNav from '../components/JoolNav'

export default function TermsPage() {
  const sections = [
    {
      title: 'The Professional Code',
      desc: 'All participants must be verified professionals. Punctuality is mandatory. A delay of more than 5 minutes without prior notice via secure chat is considered a breach of the commute agreement.',
      icon: Clock
    },
    {
      title: 'Payment Orchestration',
      desc: 'Ride providers agree to the standard corridor pricing. Any request for additional funds outside the agreed-upon fuel share is strictly prohibited.',
      icon: Banknote
    },
    {
      title: 'Social Sanctuary',
      desc: 'Respect the personal space of others. The "Silent Commute" option must be respected. Zero tolerance for harassment, unauthorized recording, or data harvesting.',
      icon: Users
    },
    {
      title: 'Liability Waiver',
      desc: 'JOOL is an orchestration platform. Participants engage in peer-to-peer commuting at their own risk. JOOL does not provide insurance or direct transport services.',
      icon: Scale
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
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">COMMUTE GOVERNANCE</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none mb-8">
            TERMS OF<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">COMMUTE.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl">
            By entering the JOOL Syndicate, you agree to uphold the highest standards of professional conduct and operational discipline.
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
              <p>These terms are dynamic and updated to reflect the evolving needs of the commute corridors. Continuous participation in the network constitutes acceptance of the latest version of these protocols.</p>
           </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 JOOL • TERMS V2.1 • CRAFTED IN INDIA</p>
      </footer>
    </div>
  )
}
