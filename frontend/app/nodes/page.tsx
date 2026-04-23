'use client'

import { 
  Network, Cpu, Globe, Zap, Server, 
  MapPin, Radio, Activity, ArrowLeft, Sparkles
} from 'lucide-react'
import Link from 'next/link'
import JoolNav from '../components/JoolNav'

export default function NodesPage() {
  const nodes = [
    {
      title: 'Corridor Optimization',
      desc: 'Each city is divided into high-density professional corridors. Our AI optimizes "Departure Nodes"—fixed, safe pickup points that minimize detour time for ride providers.',
      icon: MapPin
    },
    {
      title: 'Distributed Trust',
      desc: 'Verification is not centralized. We use a multi-node verification system that cross-references corporate affiliations and social reputation across the syndicate.',
      icon: Network
    },
    {
      title: 'Real-time Sync',
      desc: 'The Syndicate network processes thousands of telemetry points per second to ensure real-time synchronization between riders and providers.',
      icon: Zap
    },
    {
      title: 'India-Global Backbone',
      desc: 'Engineered in Mumbai for the global professional elite. Our architecture is designed to scale across mega-cities worldwide, maintaining the same precision.',
      icon: Globe
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
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">NETWORK ARCHITECTURE</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none mb-8">
            SYNDICATE<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">NODES.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl">
            The backbone of JOOL is a distributed network of professional corridors. We've mapped the commute mesh into a series of predictable, safe, and efficient nodes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           {nodes.map((node, i) => (
             <div key={i} className="relative group">
                <div className="absolute inset-0 bg-blue-600/5 blur-[50px] -z-10 group-hover:bg-blue-600/10 transition-colors" />
                <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] h-full flex flex-col items-center text-center group-hover:border-blue-500/30 transition-all">
                   <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8">
                      <node.icon className="w-7 h-7 text-blue-500" />
                   </div>
                   <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{node.title}</h3>
                   <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {node.desc}
                   </p>
                </div>
             </div>
           ))}
        </div>

        <div className="mt-20 flex flex-col items-center">
           <div className="w-px h-20 bg-gradient-to-b from-blue-600 to-transparent mb-12" />
           <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
              <Activity className="w-4 h-4 text-green-500" />
              99.9% Node Uptime
           </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 JOOL • ARCHITECTURE V1.0 • CRAFTED IN INDIA</p>
      </footer>
    </div>
  )
}
