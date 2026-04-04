'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Car, Shield, Leaf, Banknote, Clock, ArrowRight, User, Sparkles, MapPin, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Casa Rio');
  const [rides, setRides] = useState<any[]>([]);
  const [stats, setStats] = useState({
    rides_today: 12,
    carbon_saved: '1.2 Tons',
    money_saved: '₹45,000',
    time_saved: '120 Hours'
  });

  const corridors = [
    { name: 'Casa Rio', from: 'Casa Rio', to: 'RCP' },
    { name: 'Casa Bella', from: 'Casa Bella', to: 'RCP' },
    { name: 'Lakeshore', from: 'Lakeshore', to: 'RCP' },
    { name: 'Kharghar', from: 'Kharghar', to: 'RCP' }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats') as any;
        if (res) {
          setStats({
            rides_today: res.rides_today || 12,
            carbon_saved: res.carbon_saved || '1.2 Tons',
            money_saved: res.money_saved || '₹45,000',
            time_saved: res.time_saved || '120 Hours'
          });
        }
      } catch (e) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden font-sans">
      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">JOOL</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#savings" className="hover:text-white transition-colors">Savings</Link>
          <Link href="#showcase" className="hover:text-white transition-colors">Showcase</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2 text-sm font-semibold hover:text-white transition-colors text-slate-400">Log in</Link>
          <Link href="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95">Get Started</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        {/* Animated Hero Section */}
        <section className="container mx-auto px-6 text-center mb-32 relative">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>THE FUTURE OF OFFICE COMMUTE</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] text-white">
            COMMUTE <span className="text-blue-600">SMARTER</span>.<br />
            SAVE <span className="text-indigo-400 italic">TOGETHER</span>.
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
            JOOL connects you with colleagues for premium corridor-based carpooling. 
            Reduce your footprint, reclaim your time, and save thousands every month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/find-ride" className="bg-white text-black px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95">
              Pick a Ride <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/offer-ride" className="bg-slate-800/50 backdrop-blur-md border border-white/10 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-slate-800 transition-all active:scale-95">
              Share a Ride
            </Link>
          </div>
        </section>

        {/* Live Savings Section */}
        <section id="savings" className="container mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-lg hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Carbon Neutral</p>
              <h3 className="text-3xl font-black text-white">{stats.carbon_saved}</h3>
              <p className="text-slate-400 text-xs mt-2">Saved this month</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-lg hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Banknote className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Total Savings</p>
              <h3 className="text-3xl font-black text-white">{stats.money_saved}</h3>
              <p className="text-slate-400 text-xs mt-2">For active users</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-lg hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">Time Reclaimed</p>
              <h3 className="text-3xl font-black text-white">{stats.time_saved}</h3>
              <p className="text-slate-400 text-xs mt-2">Away from traffic</p>
            </div>
            <div className="bg-blue-600 p-8 rounded-3xl shadow-2xl shadow-blue-600/20 flex flex-col justify-between">
              <Car className="w-8 h-8 text-white/50" />
              <div>
                <h3 className="text-4xl font-black text-white">{stats.rides_today}</h3>
                <p className="text-white/80 font-bold uppercase tracking-widest text-xs">Rides Today</p>
              </div>
            </div>
          </div>
        </section>

        {/* Home Ride Showcase UI */}
        <section id="showcase" className="container mx-auto px-6 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">CORRIDOR SHOWCASE</h2>
            <p className="text-slate-500">Live rides between premium societies and office parks</p>
          </div>

          <div className="flex justify-center mb-12 flex-wrap gap-4">
            {corridors.map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveTab(c.name)}
                className={`px-8 py-3 rounded-full text-sm font-bold border transition-all ${
                  activeTab === c.name 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Example Ride Card */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="group bg-white/5 border border-white/10 rounded-[2rem] p-1 overflow-hidden transition-all hover:border-white/20 hover:bg-white/[0.07]">
                <div className="bg-[#0f172a] rounded-[1.8rem] p-8 h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-xl font-bold">
                        {i === 1 ? 'A' : i === 2 ? 'R' : 'S'}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{i === 1 ? 'Alok Singh' : i === 2 ? 'Rajiv Mehta' : 'Samiksha'}</h4>
                        <p className="text-slate-500 text-xs">Premium Member</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase rounded-lg">
                      Confirmed
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-1 bg-blue-500 rounded-full" />
                      <p className="text-sm font-medium text-slate-300">{activeTab}</p>
                    </div>
                    <div className="h-6 w-px bg-white/10 ml-0.5" />
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <p className="text-sm font-medium text-slate-300">Reliance Corporate Park (RCP)</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end border-t border-white/5 pt-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Next Departure</p>
                      <p className="text-lg font-black text-white">{i === 1 ? '08:30 AM' : '09:00 AM'}</p>
                    </div>
                    <Link href="/find-ride" className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-colors">
                      <ArrowRight className="w-5 h-5 text-blue-500" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Attractive UX Section */}
        <section className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">REVOLUTIONIZE YOUR DAILY DRIVE.</h2>
            <p className="text-white/80 text-lg mb-12 max-w-xl mx-auto relative z-10">Join thousands of colleagues who already made the switch. Professional, secure, and smart.</p>
            <Link href="/register" className="bg-white text-black px-12 py-5 rounded-full text-xl font-bold hover:bg-slate-200 transition-all inline-block relative z-10 active:scale-95 shadow-xl">
              Join JOOL Now
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-white/5 text-center text-slate-600 text-xs font-medium">
        <p>© 2026 JOOL CARPOOLING PLATFORM. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
