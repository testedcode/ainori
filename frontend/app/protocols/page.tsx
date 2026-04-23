'use client'

import { 
  Shield, Lock, Key, EyeOff, Server, Globe, 
  Cpu, CheckCircle2, Zap, AlertTriangle, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import JoolNav from '../components/JoolNav'

export default function ProtocolsPage() {
  const protocols = [
    {
      title: 'Identity Isolation',
      desc: 'Personal details (phone, email, exact home location) are never shared publicly. Only confirmed ride partners gain access to necessary coordination data.',
      icon: EyeOff,
      color: 'bg-blue-500/10 text-blue-400'
    },
    {
      title: 'Node Verification',
      desc: 'Every participant must undergo multi-factor identity verification. We cross-reference corporate nodes and government IDs to ensure absolute trust.',
      icon: Shield,
      color: 'bg-green-500/10 text-green-400'
    },
    {
      title: 'End-to-End Encryption',
      desc: 'In-app communications and payment coordination are fully encrypted. Your chat history is ephemeral and secured against unauthorized access.',
      icon: Lock,
      color: 'bg-purple-500/10 text-purple-400'
    },
    {
      title: 'Secure Settlement',
      desc: 'We use secure UPI deep-linking. We never store your bank details or transaction history on our servers. You handle the money; we handle the trust.',
      icon: Key,
      color: 'bg-amber-500/10 text-amber-400'
    },
    {
      title: 'Real-time Monitoring',
      desc: 'Active rides are monitored by our AI dispatcher. Any deviation from the corridor route triggers an automatic security check.',
      icon: Server,
      color: 'bg-red-500/10 text-red-400'
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
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">SECURITY INFRASTRUCTURE</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none mb-8">
            SECURITY<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">PROTOCOLS.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl">
            JOOL is built on a foundation of industrial-grade security. We've eliminated the "Open Mesh" risks inherent in chat groups to provide a sanctuary for professional commuters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protocols.map((p, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 hover:bg-white/[0.04] transition-all group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${p.color}`}>
                <p.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{p.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 bg-red-500/5 border border-red-500/10 rounded-[3rem]">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <AlertTriangle className="w-16 h-16 text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-black mb-2 uppercase">Zero Tolerance Policy</h2>
              <p className="text-slate-500 text-sm font-medium">Any attempt to circumvent these protocols or harvest user data will result in immediate and permanent exclusion from the JOOL Syndicate and reporting to relevant corporate partners.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 JOOL • SECURE COMMUTE V4.5</p>
      </footer>
    </div>
  )
}
