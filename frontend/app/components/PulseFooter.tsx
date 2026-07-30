'use client'

import Link from 'next/link'
import { Car, Leaf, Github, Twitter, Instagram } from 'lucide-react'

export default function PulseFooter() {
  return (
    <footer className="bg-[#080f1e] border-t border-white/5 text-white font-sans">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-transparent flex items-center justify-center">
                <img src="/pulse_logo.png" alt="Pulse Logo" className="w-10 h-10 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight leading-none uppercase">Pulse</span>
                <span className="text-[8px] font-black text-blue-500 tracking-widest uppercase">Community</span>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Premium corridor-based office carpooling for modern professionals.</p>
            <div className="flex items-center gap-2 mt-4 text-green-400 text-xs font-bold">
              <Leaf className="w-3.5 h-3.5" />
              <span>Carbon-neutral commuting</span>
            </div>
          </div>

          {/* Corridors */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Corridors</p>
            <ul className="space-y-2.5">
              {['Casa Rio → RCP', 'Casa Bella → RCP', 'Lakeshore → RCP', 'Kharghar → RCP'].map(c => (
                <li key={c}>
                  <Link href="/rides" className="text-sm text-slate-400 hover:text-white transition-colors">{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Platform</p>
            <ul className="space-y-2.5">
              {[
                ['Find a Ride', '/rides'],
                ['Offer a Ride', '/offer-ride'],
                ['My Garage', '/vehicles'],
                ['Dashboard', '/dashboard'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Community</p>
            <ul className="space-y-2.5">
              {[['Safety Policy', '/safety'], ['Terms of Service', '/terms'], ['Privacy Policy', '/privacy'], ['Support', '/support']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">© 2026 Pulse Community. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {[Twitter, Instagram, Github].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                <Icon className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
