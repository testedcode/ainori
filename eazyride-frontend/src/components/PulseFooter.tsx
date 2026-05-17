'use client'

import Link from 'next/link'
import { Car, Leaf, Globe } from 'lucide-react'

export default function PulseFooter() {
  return (
    <footer className="bg-white/80 backdrop-blur-2xl border-t border-slate-200 text-slate-900 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight leading-none uppercase">Pulse</span>
                <span className="text-[8px] font-black text-blue-600 tracking-widest uppercase">Community</span>
              </div>
            </div>
            <p className="text-slate-600 text-xs font-bold leading-relaxed mb-6">Premium corridor-based office carpooling for modern professionals.</p>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg w-max">
              <Leaf className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600 text-[9px] font-black uppercase tracking-widest">Carbon-neutral</span>
            </div>
          </div>

          {/* Corridors */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Corridors</p>
            <ul className="space-y-4">
              {['Casa Rio → RCP', 'Casa Bella → RCP', 'Lakeshore → RCP', 'Kharghar → RCP'].map(c => (
                <li key={c}>
                  <Link href="/rides" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Platform</p>
            <ul className="space-y-4">
              {[
                ['Find a Ride', '/rides'],
                ['Offer a Ride', '/offer-ride'],
                ['My Garage', '/vehicles'],
                ['Dashboard', '/dashboard'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Community</p>
            <ul className="space-y-4">
              {[['Safety Policy', '/safety'], ['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Support', '/support']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">© 2026 Pulse Community. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Globe, Leaf, Car].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-lg hover:border-slate-300 transition-all text-slate-500 hover:text-blue-600">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

