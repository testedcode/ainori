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
      title: 'Route Planning',
      desc: 'Our cities are organized into popular professional routes. We optimize "Meeting Hubs"—fixed, safe pickup points that make it easy for everyone to coordinate without delays.',
      icon: MapPin
    },
    {
      title: 'Trusted Members',
      desc: 'Our community is built on trust. We verify everyone through their workplace and social reputation to ensure a safe and respectful environment.',
      icon: Network
    },
    {
      title: 'Live Updates',
      desc: 'Our community network keeps everyone in sync with real-time updates between riders and providers.',
      icon: Zap
    },
    {
      title: 'Built with Care',
      desc: 'Designed for the modern professional. Our platform is built to make daily commuting simple, reliable, and comfortable for everyone.',
      icon: Globe
    }
  ]

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-600/30">
      <JoolNav />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back Home</span>
        </Link>

        <div className="mb-20">
          <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">OUR COMMUNITY NETWORK</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none mb-8">
            COMMUNITY<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">HUBS.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl">
            Our platform is built around a network of popular commute routes. We've mapped out the best meeting points to make traveling together simple, safe, and efficient.
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
              Always Reliable
           </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 • BUILT FOR OUR COMMUNITY • CRAFTED IN INDIA</p>
      </footer>
    </div>
  )
}
