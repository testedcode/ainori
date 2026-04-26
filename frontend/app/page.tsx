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
  ZapOff, Headphones, DollarSign, Timer, BarChart3, Radio, Wind, Ghost,
  Lock, EyeOff, Navigation, HeartHandshake, UserPlus, TrafficCone,
  Anchor, Zap as ZapIcon, ThermometerSun, Stethoscope, Bike, TrendingDown,
  LineChart, Coffee, BrainCircuit, Network
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
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tighter leading-none">JOOL</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase">AI-Orchestrated</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="#shift" className="hover:text-white transition-colors">The Nexus</Link>
            <Link href="#optimization" className="hover:text-white transition-colors">Optimization</Link>
            <Link href="#hacks" className="hover:text-white transition-colors">Hacks & Vibe</Link>
            <Link href="#premium" className="hover:text-white transition-colors">Tiers</Link>
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
              /* LOGGED IN HERO */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                 <div className="lg:col-span-7 text-left">
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
                       
                       <div className="flex items-center gap-6 mb-12 text-left">
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
                    </div>
                 </div>
              </div>
            ) : (
              /* LOGGED OUT HERO */
              <div className="max-w-6xl mx-auto text-center relative">
                <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                  <Cpu className="w-4 h-4" /> The Intelligence Node for Every Commute
                </div>
                
                <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter mb-10 leading-[0.75] uppercase italic">
                  MOVE WITH<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-gradient-x">PURE INTENT.</span>
                </h1>
                
                <p className="text-xl md:text-4xl text-white/60 font-bold mb-16 uppercase tracking-tight leading-tight max-w-4xl mx-auto">
                  AI-Orchestrated Private Corridors. <br className="hidden md:block" />
                  Skip the noise. Reclaim your time. Move better.
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
              </div>
            )}
          </div>
        </section>

        {/* ─── THE FEMALE SAFETY PROTOCOL (HIGH IMPACT HIGHLIGHT) ────────────────────────── */}
        <section className="py-20 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-transparent border border-purple-500/30 rounded-[5rem] p-12 md:p-24 relative group">
                 <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-96 h-96 text-white" />
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="text-left relative z-10">
                       <div className="inline-flex items-center gap-3 px-8 py-3 bg-purple-500/20 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.6em] mb-12 text-purple-400">
                          <ShieldCheck className="w-5 h-5" /> THE FEMALE SAFETY PROTOCOL
                       </div>
                       <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] mb-12">
                          PEACE OF MIND.<br />
                          <span className="text-purple-400">ENGINEERED.</span>
                       </h2>
                       <p className="text-xl md:text-3xl text-slate-300 font-bold max-w-2xl leading-tight mb-12 italic">
                          No more anxiety. No more unvetted strangers. Just a secure, peer-verified corridor within your <span className="text-white">trusted community.</span>
                       </p>
                       <div className="space-y-6">
                          {[
                            'Same-Society Verification: Match with neighbors you know.',
                            'Real-Time Family Tracking: Your loved ones stay in the loop.',
                            'Vetted Corporate Network: Exclusive access for professionals only.',
                            'Emergency SOS Node: Direct link to Syndicate Support.'
                          ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-4 group/item">
                               <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center group-hover/item:bg-purple-500 transition-colors">
                                  <CheckCircle2 className="w-4 h-4 text-purple-400 group-hover/item:text-black" />
                               </div>
                               <span className="text-sm md:text-lg font-black text-white/80 uppercase italic tracking-tight">{feat}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="relative">
                       <div className="bg-[#0a0f1e] border border-purple-500/20 rounded-[4rem] p-12 shadow-2xl">
                          <div className="w-full aspect-square bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-[3rem] flex items-center justify-center relative overflow-hidden group/viz">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                             <div className="relative z-10 text-center">
                                <ShieldCheck className="w-32 h-32 text-purple-400 mx-auto mb-8 animate-pulse" />
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">SYNDICATE TRUST SCORE</p>
                                <p className="text-6xl font-black text-white">99.9%</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── URBAN OPTIMIZATION: THE BENEFITS MATRIX (RE-ENGINEERED) ────────────────────────── */}
        <section id="optimization" className="py-60 relative">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="text-left mb-40">
                 <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">MACRO URBAN EFFICIENCY</p>
                 <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8] mb-12">
                    URBAN<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">OPTIMIZATION.</span>
                 </h2>
                 <p className="text-xl md:text-3xl text-slate-500 font-bold max-w-4xl uppercase italic leading-tight">
                    Beyond carpooling—this is a <span className="text-white">Health, Wealth, and Productivity</span> engine designed for the high-performance professional.
                 </p>
              </div>

              {/* The Optimization Matrix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                 
                 {/* HEALTH & CLIMATE */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ThermometerSun className="w-8 h-8 text-blue-400" />
                       </div>
                       <div className="text-left">
                          <h3 className="text-2xl font-black uppercase italic leading-none mb-1">Health Shield</h3>
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">CLIMATE CONTROL</p>
                       </div>
                    </div>
                    <p className="text-slate-400 font-bold leading-tight mb-10 text-left">
                       Protect yourself from heat strokes, dust, and pollution. Travel in a climate-controlled environment that keeps your energy levels peak for the office.
                    </p>
                    <div className="flex items-center gap-3 text-blue-400">
                       <Stethoscope className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Prevents Health Hazards</span>
                    </div>
                 </div>

                 {/* BIKE TO CAR UPGRADE */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Bike className="w-8 h-8 text-amber-500" />
                       </div>
                       <div className="text-left">
                          <h3 className="text-2xl font-black uppercase italic leading-none mb-1">Fleet Parity</h3>
                          <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">SAFETY UPGRADE</p>
                       </div>
                    </div>
                    <p className="text-slate-400 font-bold leading-tight mb-10 text-left">
                       Own a bike but prefer car safety? Travel in a premium car at prices equivalent to your bike's fuel. Maximum safety without the financial burden.
                    </p>
                    <div className="flex items-center gap-3 text-amber-400">
                       <Shield className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Zero Exposure Risk</span>
                    </div>
                 </div>

                 {/* FINANCIAL TRACKER */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-16 h-16 bg-green-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LineChart className="w-8 h-8 text-green-400" />
                       </div>
                       <div className="text-left">
                          <h3 className="text-2xl font-black uppercase italic leading-none mb-1">Expense Ledger</h3>
                          <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">WEALTH OPTIMIZATION</p>
                       </div>
                    </div>
                    <p className="text-slate-400 font-bold leading-tight mb-10 text-left">
                       Avoid unpredictable Ola/Uber surge pricing. Keep your monthly commute budget fixed and tracked with the Syndicate ledger. Predictable wealth.
                    </p>
                    <div className="flex items-center gap-3 text-green-400">
                       <TrendingDown className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Zero Surge Surcharges</span>
                    </div>
                 </div>

                 {/* PRODUCTIVITY NODE */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-16 h-16 bg-purple-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <BrainCircuit className="w-8 h-8 text-purple-400" />
                       </div>
                       <div className="text-left">
                          <h3 className="text-2xl font-black uppercase italic leading-none mb-1">Intel Node</h3>
                          <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">DEEP WORK HUB</p>
                       </div>
                    </div>
                    <p className="text-slate-400 font-bold leading-tight mb-10 text-left">
                       Don't just commute—execute. Use the "Silent Node" to finish reports, clear emails, or meditate. Arrive at the office "Zen-ready" and ahead of the day.
                    </p>
                    <div className="flex items-center gap-3 text-purple-400">
                       <Coffee className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Mental Health Dividend</span>
                    </div>
                 </div>

                 {/* SYNDICATE NETWORKING */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-16 h-16 bg-cyan-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Network className="w-8 h-8 text-cyan-400" />
                       </div>
                       <div className="text-left">
                          <h3 className="text-2xl font-black uppercase italic leading-none mb-1">Social Capital</h3>
                          <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">PEER SYNERGY</p>
                       </div>
                    </div>
                    <p className="text-slate-400 font-bold leading-tight mb-10 text-left">
                       Match with senior professionals from your own society and office hub. Commute-time networking is the ultimate hack for career acceleration.
                    </p>
                    <div className="flex items-center gap-3 text-cyan-400">
                       <Handshake className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Professional Proximity</span>
                    </div>
                 </div>

                 {/* ASSET LONGEVITY */}
                 <div className="bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-4 mb-12">
                       <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TrafficCone className="w-8 h-8 text-red-500" />
                       </div>
                       <div className="text-left">
                          <h3 className="text-2xl font-black uppercase italic leading-none mb-1">Asset Armor</h3>
                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">VEHICLE LONGEVITY</p>
                       </div>
                    </div>
                    <p className="text-slate-400 font-bold leading-tight mb-10 text-left">
                       Reduce the wear and tear on your own vehicle. By riding with the syndicate, you extend your car/bike's life and maintain its resale value.
                    </p>
                    <div className="flex items-center gap-3 text-red-400">
                       <Layers className="w-4 h-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Micro-Traffic Reduction</span>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* ─── THE SHIFT: FROM CHAOS TO INFRASTRUCTURE ────────────────────────── */}
        <section id="shift" className="py-20 relative border-t border-white/5">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="text-left mb-40">
                 <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE SYSTEMIC NEXUS</p>
                 <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8] mb-12">
                    THE COMMUTE<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">ARCHITECTURE.</span>
                 </h2>
              </div>

              {/* Problem/Solution Nexus Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                 
                 {/* PRIVACY & SECURITY BLOCK */}
                 <div className="relative group">
                    <div className="bg-white/[0.02] border border-white/5 rounded-[5rem] p-12 relative overflow-hidden h-full">
                       <div className="flex items-center gap-4 mb-12">
                          <div className="w-16 h-16 bg-red-500/10 rounded-3xl flex items-center justify-center">
                             <ShieldAlert className="w-8 h-8 text-red-500" />
                          </div>
                          <div>
                             <h3 className="text-3xl font-black uppercase italic text-white">Privacy Node</h3>
                             <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">THREAT: DATA EXPOSURE</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[3rem] opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                             <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-4">THE CHAOS</p>
                             <p className="text-sm font-bold text-white mb-2 italic">Phone Numbers Leaked</p>
                             <p className="text-[10px] text-slate-500 leading-relaxed">Solo travelers and chat group members expose personal contact data to unvetted strangers daily.</p>
                          </div>
                          <div className="p-8 bg-blue-600/10 border border-blue-500/30 rounded-[3rem] shadow-2xl">
                             <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-4">THE JOOL SYNDICATE</p>
                             <p className="text-sm font-bold text-white mb-2 italic">End-to-End Encryption</p>
                             <p className="text-[10px] text-slate-300 leading-relaxed">Identity remains a ghost until you confirm a node match. No phone numbers. No public profiles.</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* SOCIAL & NEW JOINERS BLOCK */}
                 <div className="relative group">
                    <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[5rem] p-12 relative overflow-hidden h-full flex flex-col justify-center">
                       <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform">
                          <UserPlus className="w-64 h-64 text-white" />
                       </div>
                       
                       <div className="text-left relative z-10">
                          <div className="inline-flex items-center gap-3 px-6 py-2 bg-blue-600/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 mb-8">
                             <Users className="w-4 h-4" /> THE SOCIAL HIVE
                          </div>
                          <h3 className="text-5xl font-black uppercase italic text-white leading-tight mb-8">
                             NEW IN THE CITY?<br />
                             <span className="text-blue-400">FIND YOUR CORNER.</span>
                          </h3>
                          <p className="text-lg text-slate-300 font-bold max-w-2xl leading-relaxed">
                             Relocating is hard. Commuting shouldn't be. JOOL matches new joiners with established professionals in their office hubs.
                          </p>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* ─── HAPPY RIDE HACKS ────────────────────────── */}
        <section id="hacks" className="py-60 bg-gradient-to-b from-transparent via-purple-600/5 to-transparent relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center mb-32">
                 <div className="lg:col-span-8 text-left">
                    <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.6em] mb-12 text-purple-400">
                       <ZapIcon className="w-5 h-5 animate-bounce" /> MAXIMIZE YOUR MOTION
                    </div>
                    <h2 className="text-7xl md:text-[11rem] font-black tracking-tighter uppercase italic leading-[0.8] mb-12">
                       HAPPY RIDE<br />
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-400 animate-gradient-x">HACKS.</span>
                    </h2>
                    <p className="text-xl md:text-3xl text-slate-400 font-bold max-w-2xl mb-16 uppercase italic leading-tight">
                       Not just rules—these are <span className="text-white underline decoration-purple-500 underline-offset-8">Enhancement Protocols</span> that transform your commute into a high-vibe ritual.
                    </p>
                 </div>
                 <div className="lg:col-span-4 flex justify-end">
                    <Link href="/hacks" className="group relative px-16 py-10 bg-[#0a0f1e] border-2 border-purple-500/30 text-white rounded-[3rem] font-black text-xl uppercase tracking-widest hover:border-purple-500 transition-all shadow-[0_0_80px_rgba(147,51,234,0.2)] overflow-hidden flex flex-col items-center gap-4">
                       <div className="relative z-10 flex flex-col items-center">
                          <span className="text-[10px] text-purple-400 mb-2">ACCESS HUB</span>
                          <span className="flex items-center gap-4">VIEW FULL PLAYBOOK <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform" /></span>
                       </div>
                       <div className="absolute inset-0 bg-purple-600/10 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-500" />
                    </Link>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {[
                   { title: 'Treat with Greet', d: 'A smile is the best commute start. Be the energy you want to ride with.', icon: Smile, vibe: 'ENERGY', benefit: 'DOPAMINE BOOST', color: 'blue' },
                   { title: 'The Silent Node', d: 'Respect "No Yelling" and low volume. Deep work or total zen.', icon: VolumeX, vibe: 'FOCUS', benefit: 'DEEP WORK', color: 'purple' },
                   { title: 'In-Ride Settle', d: 'Settle via UPI during the ride. Zero friction, zero debt.', icon: Banknote, vibe: 'FLOW', benefit: 'ZERO FRICTION', color: 'green' },
                   { title: 'Nexus Integrity', d: 'Privacy first. Keep all coordination inside the JOOL network.', icon: ShieldCheck, vibe: 'STEALTH', benefit: 'DATA PRIVACY', color: 'red' },
                   { title: 'Time Discipline', d: 'Punctuality is the ultimate respect. Be the node that others rely on.', icon: Clock, vibe: 'TRUST', benefit: 'TIME SAVED', color: 'amber' },
                   { title: 'Zero Spam Signal', d: 'Keep the signals clean. Relevant commute updates only.', icon: Radio, vibe: 'SIGNAL', benefit: 'NO NOISE', color: 'cyan' }
                 ].map((hack, i) => (
                   <div key={i} className="group relative bg-white/[0.02] border border-white/10 rounded-[5rem] p-12 hover:bg-white/[0.08] transition-all duration-700 overflow-hidden text-left flex flex-col">
                      <div className="absolute top-0 right-0 h-full w-1 bg-white/5 overflow-hidden">
                         <div className={`h-full w-full bg-${hack.color}-500 transition-all duration-1000 origin-bottom scale-y-0 group-hover:scale-y-100`} />
                      </div>
                      <div className="flex justify-between items-center mb-12">
                         <div className={`w-24 h-24 bg-${hack.color}-500/10 rounded-[2.5rem] flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000 border border-${hack.color}-500/20 relative shadow-2xl shadow-${hack.color}-500/20`}>
                            <div className={`absolute inset-0 bg-${hack.color}-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                            <hack.icon className={`w-12 h-12 text-${hack.color}-400 relative z-10`} />
                         </div>
                         <div className="text-right">
                            <p className={`text-[12px] font-black text-${hack.color}-500 uppercase tracking-widest mb-1 italic`}>{hack.vibe}</p>
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{hack.benefit}</span>
                         </div>
                      </div>
                      <h4 className="text-4xl font-black text-white uppercase italic mb-8 tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-500 transition-all">
                         {hack.title}
                      </h4>
                      <p className="text-lg text-slate-400 font-bold leading-tight mb-12 opacity-60 group-hover:opacity-100 transition-opacity flex-1">
                         {hack.d}
                      </p>
                      <div className="flex items-center gap-3">
                         <div className={`flex-1 h-1 bg-white/10 rounded-full overflow-hidden`}>
                            <div className={`h-full w-full bg-${hack.color}-500 transition-all duration-1000 origin-left scale-x-0 group-hover:scale-x-100`} />
                         </div>
                         <span className={`text-[10px] font-black text-${hack.color}-400`}>ENHANCED</span>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ─── DEFINE YOUR STATUS ────────────────────────── */}
        <section id="premium" className="py-40 relative">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-32">
                 <div className="max-w-2xl text-left">
                    <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">MEMBERSHIP ARCHITECTURE</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
                       DEFINE YOUR<br /><span className="text-amber-500">STATUS.</span>
                    </h2>
                 </div>
                 <p className="text-slate-500 font-bold max-w-sm text-left">Elevate your node. Choose the architecture that matches your motion.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* STANDARD */}
                 <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[4rem] flex flex-col hover:bg-white/[0.04] transition-all group text-left">
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Standard</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Essential Node</p>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {[
                         'Access to public corridors',
                         'Standard profile verification',
                         'Core ride matching',
                         'Community support'
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
                 <div className="bg-blue-600/10 border border-blue-500/30 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.05] transition-all shadow-[0_30px_60px_-15px_rgba(59,130,246,0.2)] text-left">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                       <ZapIcon className="w-24 h-24 text-blue-400" />
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
                            <ZapIcon className="w-4 h-4 text-blue-400 animate-pulse" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/exclusive-benefits" className="mt-12 w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-2xl relative z-10">
                       Upgrade to Premium
                    </Link>
                 </div>

                 {/* ELITE */}
                 <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/40 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.05] transition-all shadow-[0_30px_60px_-15px_rgba(245,158,11,0.2)] text-left">
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

        {/* ─── THE IMPACT NODE ────────────────────────── */}
        <section id="impact" className="py-40 bg-gradient-to-b from-transparent via-green-600/5 to-transparent border-y border-white/5 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div className="text-left">
                    <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">GLOBAL IMPACT NODE</p>
                    <h2 className="text-5xl md:text-[10rem] font-black tracking-tighter mb-10 italic uppercase leading-[0.85]">
                       SAVING FOR YOU.<br />
                       <span className="text-green-500">SOLVING FOR ALL.</span>
                    </h2>
                 </div>
                 
                 <div className="relative group">
                    <div className="absolute -inset-20 bg-green-500/10 blur-[150px] rounded-full animate-pulse" />
                    <div className="relative bg-[#060b18]/60 border border-green-500/20 rounded-[5rem] p-12 md:p-20 text-center overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
                       <div className="relative z-10">
                          <div className="w-32 h-32 bg-green-500 rounded-[3rem] flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(34,197,94,0.4)] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                             <Leaf className="w-16 h-16 text-black" />
                          </div>
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] mb-4">REAL-TIME IMPACT DATA</p>
                          <h3 className="text-4xl md:text-6xl font-black text-white mb-8 italic uppercase tracking-tighter">AI-OPTIMIZED<br />EFFICIENCY.</h3>
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
              <div className="relative z-10">
                 <h2 className="text-6xl md:text-[10rem] font-black mb-12 tracking-tighter uppercase italic leading-[0.8]">
                    THE FUTURE<br />IS SHARED.
                 </h2>
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
           <div className="md:col-span-2 text-left">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Car className="w-7 h-7 text-white" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-2xl font-black tracking-widest uppercase leading-none">JOOL SYNDICATE</span>
                   <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Autonomous Intelligence Commute</span>
                 </div>
              </div>
           </div>
           
           <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-white">Infrastructure</h4>
              <div className="flex flex-col gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <Link href="/privacy" className="hover:text-white transition-colors">Privacy Protocol</Link>
                 <Link href="/terms" className="hover:text-white transition-colors">Terms of Syndicate</Link>
                 <Link href="/support" className="hover:text-white transition-colors">Support Node</Link>
              </div>
           </div>

           <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-10 text-white">Community</h4>
              <div className="flex flex-col gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                 <Link href="/hacks" className="hover:text-white transition-colors">Efficiency Hacks</Link>
                 <Link href="/exclusive-benefits" className="hover:text-white transition-colors">Elite Tiers</Link>
                 <Link href="/safety" className="hover:text-white transition-colors">Safety Nets</Link>
              </div>
           </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5 pt-12">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2026 JOOL TECHNOLOGY SYNDICATE • CRAFTED FOR THE GLOBE • V10.0</p>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
           </div>
        </div>
      </footer>
    </div>
  );
}
