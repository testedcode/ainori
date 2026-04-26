'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, Shield, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, ChevronRight, CheckCircle2,
  ShieldAlert, Zap, Star, Users, ShieldCheck, Gem, Crown,
  XCircle, AlertCircle, MessageSquare, VolumeX, Handshake, Smile, Heart,
  Fingerprint, Briefcase, Globe, TrendingUp, Layers, Rocket,
  Cpu, MousePointer2, Share2, ShieldQuestion, Workflow, Activity,
  ZapOff, Headphones, DollarSign, Timer
} from 'lucide-react';
import { api } from '@/lib/api';
import { getVibe, VIBE_THEMES } from '@/lib/vibe-utils';
import VibeCanvas from './components/VibeCanvas';
import JoolNav from './components/JoolNav';

export default function HomePage() {
  const [stats, setStats] = useState({
    rides_today: 0,
    live_users: 0,
    carbon_saved: '0 Tons',
    money_saved: '₹0',
    time_saved: '0 Hours',
    trees_saved: 0
  });

  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats') as any;
        if (res) setStats(prev => ({ ...prev, ...res }));
      } catch (e) {}
    };

    const checkAuth = async () => {
       try {
          const u = await api.getProfile();
          setUser(u);
          if (u) {
             const v = await api.get('/vehicles');
             if (Array.isArray(v)) setVehicles(v);
          }
       } catch {}
    };

    fetchStats();
    checkAuth();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hour = new Date().getHours();
  const vibe = getVibe(hour);
  const theme = VIBE_THEMES[vibe];

  return (
    <div className={`min-h-screen text-white overflow-x-hidden font-sans selection:bg-blue-600/30 transition-colors duration-1000 ${theme.bg}`}>
      
      {/* Dynamic Vibe Background Layer */}
      <VibeCanvas vibe={vibe} />
      
      {/* Futuristic Grid Overlay */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none -z-10" />

      {/* Premium Navigation */}
      {user ? (
        <JoolNav />
      ) : (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 flex justify-between items-center ${
          scrolled ? 'bg-[#0f172a]/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent'
        }`}>
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform relative">
               <div className="absolute inset-0 bg-blue-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
              <Car className="w-6 h-6 text-white relative z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">JOOL</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase">AI-Orchestrated</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="#problem" className="hover:text-white transition-colors">The Shift</Link>
            <Link href="#hacks" className="hover:text-white transition-colors">Efficiency Hacks</Link>
            <Link href="#premium" className="hover:text-white transition-colors">Tiers</Link>
            <Link href="#impact" className="hover:text-white transition-colors">Impact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors text-slate-400">Log in</Link>
            <Link href="/register" className="bg-white text-black hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95">Get Started</Link>
          </div>
        </nav>
      )}

      <main>
        {/* ─── FUTURISTIC HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
          <div className="container max-w-7xl mx-auto px-6 relative z-10">
            {user ? (
              /* LOGGED IN HERO - EXECUTIVE AI MODE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                 <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-blue-400 animate-in fade-in slide-in-from-left-8 duration-1000">
                       <Cpu className="w-4 h-4 animate-pulse" /> AI-ORCHESTRATION ACTIVE
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic">
                       COMMANDING<br />
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-300 animate-gradient-x">THE FLOW.</span>
                    </h1>
                    <p className="max-w-2xl text-xl text-white/50 font-bold mb-12 uppercase tracking-wide leading-relaxed">
                       Welcome back, {user.name.split(' ')[0]}. Your AI-optimized corridors are standing by. Ready to move?
                    </p>
                    
                    <div className="flex flex-wrap gap-6">
                       <Link href="/dashboard" className="px-12 py-6 bg-white text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3">
                          Access Dashboard <ArrowRight className="w-5 h-5" />
                       </Link>
                       <Link href="/profile" className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-400" /> My Node
                       </Link>
                    </div>
                 </div>

                 <div className="lg:col-span-5 relative">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl overflow-hidden group relative">
                       <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                          <Workflow className="w-64 h-64 text-blue-500" />
                       </div>
                       
                       <div className="flex items-center gap-6 mb-12">
                          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl relative">
                             <div className="absolute inset-0 bg-blue-400 blur-xl opacity-20" />
                             <div className="w-full h-full rounded-[1.8rem] bg-slate-900 overflow-hidden relative z-10">
                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/20">{user.name[0]}</div>}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-2xl font-black italic uppercase text-white leading-none mb-1">{user.name}</h4>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3" /> NODE ACTIVE
                             </p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="flex justify-between items-end border-b border-white/5 pb-6">
                             <div>
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Impact score</p>
                                <p className="text-2xl font-black text-green-400">{stats.carbon_saved}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Verification</p>
                                <p className={`text-xs font-black uppercase tracking-widest ${user.approved ? 'text-blue-400' : 'text-amber-500'}`}>
                                   {user.approved ? 'Elite Verified' : 'Standard'}
                                </p>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Rides Today</p>
                                <p className="text-xl font-black text-white">{stats.rides_today}</p>
                             </div>
                             <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                                <p className="text-xl font-black text-blue-400 italic">SYNCED</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              /* LOGGED OUT HERO - FUTURISTIC & INCLUSIVE */
              <div className="max-w-6xl mx-auto text-center relative">
                {/* Floating AI Elements */}
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-600/10 blur-3xl animate-pulse" />
                <div className="absolute top-40 -right-20 w-60 h-60 bg-purple-600/10 blur-3xl animate-pulse delay-1000" />
                
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                  <Cpu className="w-4 h-4" /> The Intelligence Node for Every Commute
                </div>
                
                <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter mb-10 leading-[0.75] uppercase italic">
                  MOVE WITH<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-gradient-x">PURE INTENT.</span>
                </h1>
                
                <p className="text-xl md:text-4xl text-white/60 font-bold mb-16 uppercase tracking-tight leading-tight max-w-4xl mx-auto">
                  The AI-Orchestrated Private Corridor. <br className="hidden md:block" />
                  Effortless. Private. For everyone who values their time.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                  <Link href="/register" className="group relative px-16 py-7 bg-white text-black rounded-[3rem] font-black text-lg uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3">Join the Syndicate <ArrowRight className="w-6 h-6" /></span>
                    <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                  <Link href="/login" className="px-16 py-7 bg-white/5 border border-white/10 rounded-[3rem] font-black text-lg uppercase tracking-widest hover:bg-white/10 transition-all border-white/20">
                    Access Portal
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-24 flex flex-wrap justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                   <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-widest">End-to-End Private</span></div>
                   <div className="flex items-center gap-3"><Users className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-widest">10k+ Vetted Nodes</span></div>
                   <div className="flex items-center gap-3"><Leaf className="w-6 h-6" /><span className="text-[10px] font-black uppercase tracking-widest">Carbon Neutral</span></div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── THE SHIFT: EFFICIENCY VISUALIZED ────────────────────────── */}
        <section id="problem" className="py-40 relative border-t border-white/5">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="text-center mb-32">
                 <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE SYSTEMIC SHIFT</p>
                 <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
                    FROM CHAOS TO<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">INFRASTRUCTURE.</span>
                 </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {/* The Old Way */}
                 <div className="bg-red-500/5 border border-red-500/10 rounded-[4rem] p-12 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <ZapOff className="w-64 h-64" />
                    </div>
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                          <ShieldAlert className="w-6 h-6 text-red-500" />
                       </div>
                       <h3 className="text-2xl font-black uppercase italic">Public Chat Groups</h3>
                    </div>
                    <div className="space-y-8">
                       {[
                         { t: 'Security Leak', d: 'Your number and location are public data.', icon: XCircle },
                         { t: 'Noise Pollution', d: 'Endless spam notifications to find one ride.', icon: VolumeX },
                         { t: 'Zero Accountability', d: 'No way to verify who is actually behind the wheel.', icon: ShieldQuestion }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-6 items-start opacity-60">
                            <item.icon className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                            <div>
                               <p className="text-sm font-black uppercase text-white">{item.t}</p>
                               <p className="text-xs text-white/40 mt-1">{item.d}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="mt-12 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
                       <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">EFFICIENCY: 12% | SAFETY: LOW</p>
                    </div>
                 </div>

                 {/* The JOOL Way */}
                 <div className="bg-blue-600/10 border border-blue-500/30 rounded-[4rem] p-12 relative overflow-hidden group shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                    <div className="absolute -top-10 -right-10 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                       <Workflow className="w-64 h-64 text-blue-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-10">
                       <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                          <Car className="w-6 h-6 text-white" />
                       </div>
                       <h3 className="text-2xl font-black uppercase italic">JOOL Infrastructure</h3>
                    </div>
                    <div className="space-y-8">
                       {[
                         { t: 'Private Nodes', d: 'Encrypted profile nodes. Identity shared only on confirm.', icon: ShieldCheck },
                         { t: 'AI Orchestration', d: 'Smart matching. No spam, just relevant connections.', icon: Cpu },
                         { t: 'Multi-Node Trust', d: 'Verified professional networks with real accountability.', icon: Star }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-6 items-start">
                            <item.icon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                            <div>
                               <p className="text-sm font-black uppercase text-white">{item.t}</p>
                               <p className="text-xs text-white/40 mt-1">{item.d}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="mt-12 p-6 bg-blue-600/20 border border-blue-500/30 rounded-3xl text-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">EFFICIENCY: 98.4% | SAFETY: ELITE</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── HAPPY RIDE HACKS: THE PLAYBOOK ────────────────────────── */}
        <section id="hacks" className="py-40 bg-white/[0.01] border-y border-white/5 relative">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-24">
                 <div className="md:w-2/3">
                    <p className="text-purple-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">OPTIMIZATION PROTOCOLS</p>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                       HAPPY RIDE<br /><span className="text-purple-500 italic">HACKS.</span>
                    </h2>
                 </div>
                 <Link href="/hacks" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-3 group bg-white/5 px-8 py-4 rounded-full border border-white/10">
                    View Full Playbook <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { title: 'Treat with Greet', d: 'A smile is the best commute start. Be the energy you want to ride with.', icon: Smile, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                   { title: 'The Silent Node', d: 'Respect "No Yelling" and low volume. Use headphones for calls.', icon: VolumeX, color: 'text-purple-400', bg: 'bg-purple-500/5' },
                   { title: 'In-Ride Settle', d: 'Settle via UPI during the ride. Zero debt, zero friction.', icon: Banknote, color: 'text-green-400', bg: 'bg-green-500/5' },
                   { title: 'Nexus Integrity', d: 'Never share personal numbers in groups. Keep it secure in JOOL.', icon: ShieldCheck, color: 'text-red-400', bg: 'bg-red-500/5' },
                   { title: 'Time Discipline', d: 'Departure nodes are strict. Follow time or update via chat.', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                   { title: 'Social Respect', d: 'Respect personal space. No unauthorized recordings or photos.', icon: ShieldAlert, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                   { title: 'Zero Spam Signal', d: 'Signal only. No promotions or unnecessary group celebrations.', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/5' },
                   { title: 'The Punctual Shake', d: 'Early is on time. Respect the ride provider\'s corridor schedule.', icon: Handshake, color: 'text-cyan-400', bg: 'bg-cyan-500/5' }
                 ].map((hack, i) => (
                   <div key={i} className={`group ${hack.bg} border border-white/5 p-10 rounded-[3rem] hover:bg-white/[0.05] transition-all relative overflow-hidden`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform bg-white/5 ${hack.color}`}>
                         <hack.icon className="w-7 h-7" />
                      </div>
                      <h4 className="font-black text-white text-lg uppercase tracking-tight mb-4">{hack.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{hack.d}</p>
                      <div className="absolute -bottom-4 -right-4 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                         <hack.icon className="w-24 h-24" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ─── DEFINE YOUR STATUS: THE TIERS ────────────────────────── */}
        <section id="premium" className="py-40 relative">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-32">
                 <div className="max-w-2xl">
                    <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">MEMBERSHIP ARCHITECTURE</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
                       DEFINE YOUR<br /><span className="text-amber-500">STATUS.</span>
                    </h2>
                 </div>
                 <p className="text-slate-500 font-bold max-w-sm">Every tier in JOOL is designed to elevate your commute experience. Choose the node that fits your life.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* STANDARD */}
                 <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[4rem] flex flex-col hover:bg-white/[0.04] transition-all group">
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Standard</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Essential Node</p>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {[
                         'Access to public corridors',
                         'Standard profile verification',
                         'Core ride matching',
                         'Community help desk'
                       ].map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-slate-400 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/register" className="mt-12 w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-white/10 transition-all">
                       Join Free
                    </Link>
                 </div>

                 {/* PREMIUM */}
                 <div className="bg-blue-600/10 border border-blue-500/30 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.05] transition-all shadow-[0_30px_60px_-15px_rgba(59,130,246,0.2)]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                       <Zap className="w-24 h-24 text-blue-400" />
                    </div>
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Premium</h3>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Enhanced Intelligence</p>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {[
                         'AI-priority matching engine',
                         'Verified Corporate Badge',
                         'Unlimited private corridors',
                         'Impact & savings analytics',
                         'Luxury environment preference'
                       ].map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-white/80 font-bold">
                            <Zap className="w-4 h-4 text-blue-400 animate-pulse" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/exclusive-benefits" className="mt-12 w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-2xl relative z-10">
                       Upgrade to Premium
                    </Link>
                 </div>

                 {/* ELITE */}
                 <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/40 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.05] transition-all shadow-[0_30px_60px_-15px_rgba(245,158,11,0.2)]">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                       <Crown className="w-24 h-24 text-amber-500" />
                    </div>
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Elite</h3>
                       <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Network Prestige</p>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {[
                         'Elite Gold profile mark',
                         'Top-of-queue corridor access',
                         'Executive networking access',
                         '24/7 Priority Support Node',
                         'Zero booking fee limit'
                       ].map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-amber-200/80 font-bold">
                            <Crown className="w-4 h-4 text-amber-500 animate-pulse" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/profile" className="mt-12 w-full py-5 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-all shadow-2xl relative z-10">
                       Claim Elite Status
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── THE IMPACT NODE: SOLVING FOR ALL ────────────────────────── */}
        <section id="impact" className="py-40 bg-gradient-to-b from-transparent via-green-600/5 to-transparent border-y border-white/5 relative overflow-hidden">
           {/* Abstract Floating Elements */}
           <div className="absolute top-1/4 left-10 w-64 h-64 bg-green-500/5 blur-[100px] animate-pulse" />
           <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/5 blur-[120px] animate-pulse delay-1000" />

           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div className="order-2 lg:order-1">
                    <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">GLOBAL IMPACT NODE</p>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 italic uppercase leading-[0.85]">
                       SAVING FOR YOU.<br />
                       <span className="text-green-500">SOLVING FOR ALL.</span>
                    </h2>
                    <p className="text-slate-400 text-xl leading-relaxed mb-12 max-w-xl">
                       Every ride matched is a victory for the planet and your wallet. We're not just moving people; we're optimizing the world's motion.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                             <Leaf className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                             <p className="text-2xl font-black text-white">{stats.trees_saved}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Trees Equivalent</p>
                          </div>
                       </div>
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                             <DollarSign className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                             <p className="text-2xl font-black text-white">{stats.money_saved}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Fuel Economy Saved</p>
                          </div>
                       </div>
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                             <Timer className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                             <p className="text-2xl font-black text-white">{stats.time_saved}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Commute Hours Saved</p>
                          </div>
                       </div>
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                             <Globe className="w-6 h-6 text-amber-500" />
                          </div>
                          <div>
                             <p className="text-2xl font-black text-white">{stats.carbon_saved}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Carbon Neutralized</p>
                          </div>
                       </div>
                    </div>

                    <Link href="/register" className="inline-flex items-center gap-4 px-12 py-6 bg-green-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-green-500 transition-all shadow-[0_20px_50px_rgba(22,163,74,0.3)] active:scale-95">
                       Start Your Impact <ArrowRight className="w-5 h-5" />
                    </Link>
                 </div>
                 
                 <div className="order-1 lg:order-2 relative group">
                    <div className="absolute -inset-20 bg-green-500/10 blur-[150px] rounded-full animate-pulse" />
                    <div className="relative bg-[#060b18]/60 border border-green-500/20 rounded-[5rem] p-12 md:p-20 text-center overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
                       <div className="relative z-10">
                          <div className="w-32 h-32 bg-green-500 rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(34,197,94,0.4)] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                             <Leaf className="w-16 h-16 text-black" />
                          </div>
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] mb-4">REAL-TIME IMPACT DATA</p>
                          <h3 className="text-4xl md:text-6xl font-black text-white mb-8 italic uppercase tracking-tighter">AI-OPTIMIZED<br />EFFICIENCY.</h3>
                          <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                             <Share2 className="w-4 h-4 text-blue-400" /> ACTIVE NETWORK SYNC
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── FINAL CTA SECTION ────────────────────────── */}
        <section className="container max-w-7xl mx-auto px-6 pb-40 pt-20">
           <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(59,130,246,0.4)]">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] group-hover:scale-125 transition-transform duration-[2000ms]" />
              <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-[2000ms]" />
              
              <div className="relative z-10">
                 <h2 className="text-6xl md:text-[10rem] font-black mb-12 tracking-tighter uppercase italic leading-[0.8]">
                    THE FUTURE<br />IS SHARED.
                 </h2>
                 <p className="text-white/60 text-xl md:text-3xl font-bold mb-16 uppercase tracking-tight max-w-2xl mx-auto italic">
                    Stop searching. Start moving. Join the private corridor.
                 </p>
                 <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    <Link href="/register" className="bg-white text-black px-16 py-7 rounded-[3rem] text-xl font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-2xl active:scale-95">
                       Claim Your Node
                    </Link>
                    <Link href="/rides" className="bg-transparent border-2 border-white/30 text-white px-16 py-7 rounded-[3rem] text-xl font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                       Explore Corridors
                    </Link>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* Futuristic Footer */}
      <footer className="container mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
           <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Car className="w-7 h-7 text-white" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-2xl font-black tracking-widest uppercase leading-none">JOOL SYNDICATE</span>
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Autonomous Intelligence Commute</span>
                 </div>
              </div>
              <p className="text-slate-500 font-bold max-w-sm leading-relaxed mb-8">
                 Redefining urban motion through AI-orchestrated private corridors. Secure, efficient, and solving for all.
              </p>
              <div className="flex gap-6">
                 <Link href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"><Globe className="w-5 h-5 text-slate-400" /></Link>
                 <Link href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"><TrendingUp className="w-5 h-5 text-slate-400" /></Link>
              </div>
           </div>
           
           <div>
              <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-white">Infrastructure</h4>
              <div className="flex flex-col gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <Link href="/privacy" className="hover:text-white transition-colors">Privacy Protocol</Link>
                 <Link href="/terms" className="hover:text-white transition-colors">Terms of Syndicate</Link>
                 <Link href="/support" className="hover:text-white transition-colors">Support Node</Link>
                 <Link href="/nodes" className="hover:text-white transition-colors">Network Map</Link>
              </div>
           </div>

           <div>
              <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-white">Community</h4>
              <div className="flex flex-col gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <Link href="/hacks" className="hover:text-white transition-colors">Efficiency Hacks</Link>
                 <Link href="/exclusive-benefits" className="hover:text-white transition-colors">Elite Tiers</Link>
                 <Link href="/safety" className="hover:text-white transition-colors">Safety Nets</Link>
                 <Link href="/protocols" className="hover:text-white transition-colors">User Ethics</Link>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-12">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2026 JOOL TECHNOLOGY SYNDICATE • CRAFTED FOR THE GLOBE • V6.0</p>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
