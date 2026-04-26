'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, Shield, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, ChevronRight, CheckCircle2,
  ShieldAlert, Zap, Star, Users, ShieldCheck, Gem, Crown,
  XCircle, AlertCircle, MessageSquare, VolumeX, Handshake, Smile, Heart,
  Fingerprint, Briefcase, Globe, TrendingUp, Layers, Rocket
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
      
      {/* Premium Navigation */}
      {user ? (
        <JoolNav />
      ) : (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 flex justify-between items-center ${
          scrolled ? 'bg-[#0f172a]/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent'
        }`}>
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">JOOL</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase">Premium Commute</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="#problem" className="hover:text-white transition-colors">The Problem</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
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
        {/* ─── DYNAMIC HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
          <div className="container max-w-7xl mx-auto px-6 relative z-10">
            {user ? (
              /* LOGGED IN HERO */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                 <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-amber-500 animate-in fade-in slide-in-from-left-8 duration-1000">
                       <Crown className="w-4 h-4" /> SECURE EXECUTIVE ACCESS
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic">
                       COMMANDING<br />
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 animate-gradient-x">THE FLOW.</span>
                    </h1>
                    <p className="max-w-2xl text-xl text-white/50 font-bold mb-12 uppercase tracking-wide leading-relaxed">
                       Welcome back, {user.name.split(' ')[0]}. Your priority corridors are initialized and the network is standing by for your next move.
                    </p>
                    
                    <div className="flex flex-wrap gap-6">
                       <Link href="/dashboard" className="px-12 py-6 bg-white text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3">
                          Access Dashboard <ArrowRight className="w-5 h-5" />
                       </Link>
                       <Link href="/profile" className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                          <User className="w-5 h-5 text-blue-400" /> Executive Profile
                       </Link>
                    </div>
                 </div>

                 <div className="lg:col-span-5 relative">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl overflow-hidden group relative">
                       <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                          <ShieldCheck className="w-64 h-64" />
                       </div>
                       
                       <div className="flex items-center gap-6 mb-12">
                          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-600 p-1 shadow-2xl">
                             <div className="w-full h-full rounded-[1.8rem] bg-slate-900 overflow-hidden">
                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/20">{user.name[0]}</div>}
                             </div>
                          </div>
                          <div>
                             <h4 className="text-2xl font-black italic uppercase text-white leading-none mb-1">{user.name}</h4>
                             <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                {user.approved ? 'ELITE EXECUTIVE NODE' : 'VERIFIED PROFESSIONAL'}
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
                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                                <p className={`text-xs font-black uppercase tracking-widest ${user.approved ? 'text-blue-400' : 'text-amber-500'}`}>
                                   {user.approved ? 'Approved Elite' : 'Standard'}
                                </p>
                             </div>
                          </div>
                          {vehicles.length > 0 && (
                             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <Car className="w-4 h-4 text-blue-500" />
                                   <div>
                                      <p className="text-[10px] font-black text-white uppercase italic">{vehicles[0].make} {vehicles[0].model}</p>
                                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{vehicles[0].vehicle_number}</p>
                                   </div>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            ) : (
              /* LOGGED OUT HERO */
              <div className="max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-blue-400">
                  <ShieldCheck className="w-4 h-4" /> The Secure Professional Network
                </div>
                
                <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-10 leading-[0.8] uppercase italic">
                  THE FUTURE OF<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-gradient-x">ELITE MOTION.</span>
                </h1>
                
                <p className="text-xl md:text-3xl text-white/50 font-bold mb-16 uppercase tracking-wide leading-relaxed max-w-3xl mx-auto">
                  Private corridors for the modern professional. <br className="hidden md:block" />
                  No chat groups. No unverified strangers. Just pure flow.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  <Link href="/register" className="group relative px-14 py-6 bg-white text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-3">Join the Syndicate <ArrowRight className="w-5 h-5" /></span>
                    <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                  <Link href="/login" className="px-14 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                    Access Portal
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── THE PROBLEM: COMMUTE CHAOS vs SYNDICATE ────────────────────────── */}
        <section id="problem" className="py-40 relative border-t border-white/5">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div>
                    <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE COMMUTE CHAOS</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 italic uppercase leading-tight">
                       PUBLIC GROUPS ARE<br /><span className="text-red-500">SECURITY LEAKS.</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                       Sharing your schedule and phone number in open chat groups isn't carpooling—it's a privacy disaster. Your commute patterns are visible to thousands of unverified eyes.
                    </p>
                    <div className="space-y-4">
                       {[
                         { t: 'Unverified Entries', d: 'Anyone with a link can join and harvest your personal details.' },
                         { t: 'Data Vulnerability', d: 'Your phone number and home location are public property.' },
                         { t: 'Message Fatigue', d: 'Sifting through hundreds of spams to find one relevant ride.' }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-4 p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem]">
                            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <div>
                               <p className="text-xs font-black uppercase text-white">{item.t}</p>
                               <p className="text-[10px] text-white/40 font-medium mt-1">{item.d}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="relative group">
                    <div className="absolute -inset-10 bg-blue-600/10 blur-[120px] rounded-full" />
                    <div className="relative bg-[#080d1b] border border-blue-500/20 rounded-[4rem] p-12 shadow-2xl overflow-hidden">
                       <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-8">THE JOOL SOLUTION</p>
                       <h3 className="text-3xl font-black mb-10 italic uppercase">PRIVATE<br />INFRASTRUCTURE.</h3>
                       <div className="space-y-6">
                          {[
                            { icon: ShieldCheck, t: 'Zero-Leaked Identity', d: 'Your data stays encrypted. Only confirmed partners see your node.' },
                            { icon: Fingerprint, t: 'Professional Verification', d: 'Strict corporate and social verification for every participant.' },
                            { icon: Zap, t: 'AI Orchestration', d: 'Smart corridor matching that understands your routine.' }
                          ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] group-hover:bg-blue-500/10 transition-colors">
                               <item.icon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                               <div>
                                  <p className="text-xs font-black uppercase text-white">{item.t}</p>
                                  <p className="text-[10px] text-white/40 font-medium mt-1">{item.d}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── HOW IT WORKS: THE SYNDICATE PROTOCOL ────────────────────────── */}
        <section id="how-it-works" className="py-40 bg-white/[0.02] border-y border-white/5 relative">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="text-center mb-32">
                 <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE PROTOCOL</p>
                 <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">
                    ENGINEERED FOR<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">PERFORMANCE.</span>
                 </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                 {/* Connecting Line (Desktop) */}
                 <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-1/2 -z-10" />
                 
                 {[
                   { step: '01', icon: Shield, title: 'Verification', desc: 'Secure your corporate identity. We verify your status to keep the network exclusive.' },
                   { step: '02', icon: Layers, title: 'Corridor Sync', desc: 'Define your route nodes. Our AI syncs you with professionals on the same path.' },
                   { step: '03', icon: Rocket, title: 'Secure Launch', desc: 'Confirm your match and launch. Track impact and settle seamlessly.' }
                 ].map((item, idx) => (
                   <div key={idx} className="bg-[#0a0f1e] border border-white/10 p-12 rounded-[4rem] relative group hover:scale-105 transition-all">
                      <div className="absolute -top-6 -left-6 w-16 h-16 bg-blue-600 text-white flex items-center justify-center rounded-3xl font-black italic shadow-2xl group-hover:rotate-12 transition-transform">
                         {item.step}
                      </div>
                      <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center mb-10">
                         <item.icon className="w-10 h-10 text-blue-400" />
                      </div>
                      <h3 className="text-3xl font-black mb-6 uppercase tracking-tight italic">{item.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ─── PREMIUM vs ELITE: THE TIERS ────────────────────────── */}
        <section id="premium" className="py-40 relative">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-32">
                 <div className="max-w-2xl">
                    <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">MEMBERSHIP ARCHITECTURE</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
                       DEFNE YOUR<br /><span className="text-amber-500">STATUS.</span>
                    </h2>
                 </div>
                 <p className="text-slate-500 font-bold max-w-sm">Every tier in JOOL is designed to elevate your professional commute experience.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* STANDARD */}
                 <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[4rem] flex flex-col hover:bg-white/[0.04] transition-all">
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Standard</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Node</p>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {[
                         'Access to public corridors',
                         'Basic profile verification',
                         'Standard ride matching',
                         'Community support access'
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
                 <div className="bg-blue-600/10 border border-blue-500/30 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Zap className="w-24 h-24" />
                    </div>
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Premium</h3>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Advanced Orchestration</p>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {[
                         'AI-driven matching priority',
                         'Verified corporate badge',
                         'Unlimited private corridors',
                         'Impact tracking dashboard',
                         'Luxury vehicle preference'
                       ].map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-white/80 font-bold">
                            <Zap className="w-4 h-4 text-blue-400" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/exclusive-benefits" className="mt-12 w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-2xl">
                       Upgrade to Premium
                    </Link>
                 </div>

                 {/* ELITE */}
                 <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/40 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <Crown className="w-24 h-24" />
                    </div>
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Elite</h3>
                       <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Maximum Prestige</p>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {[
                         'Top-tier "Elite" profile mark',
                         'Priority corridor placement',
                         'Exclusive executive networking',
                         '24/7 dedicated support concierge',
                         'Early access to new nodes'
                       ].map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-amber-200/80 font-bold">
                            <Crown className="w-4 h-4 text-amber-500" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/profile" className="mt-12 w-full py-5 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20">
                       Apply for Elite Status
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── IMPACT SECTION: CARBON & TREES ────────────────────────── */}
        <section id="impact" className="py-40 bg-gradient-to-b from-transparent via-green-600/5 to-transparent border-y border-white/5">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                 <div className="relative group">
                    <div className="absolute -inset-10 bg-green-500/10 blur-[150px] rounded-full animate-pulse" />
                    <div className="relative bg-[#060b18]/60 border border-green-500/20 rounded-[4rem] p-16 text-center">
                       <div className="w-24 h-24 bg-green-500/20 rounded-3xl flex items-center justify-center mx-auto mb-10">
                          <Leaf className="w-12 h-12 text-green-400" />
                       </div>
                       <h4 className="text-7xl font-black text-white mb-4 italic">{stats.carbon_saved}</h4>
                       <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.5em] mb-12">CARBON FOOTPRINT NEUTRALIZED</p>
                       <div className="grid grid-cols-2 gap-8">
                          <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                             <p className="text-3xl font-black text-white mb-1">{stats.trees_saved}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">TREES EQUIVALENT</p>
                          </div>
                          <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                             <p className="text-3xl font-black text-white mb-1">{stats.money_saved}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">FUEL ECONOMY SAVED</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div>
                    <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE ECOLOGICAL NEXUS</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 italic uppercase leading-tight">
                       MOTION WITHOUT<br /><span className="text-green-500">TRACES.</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                       Every ride in the JOOL network is a contribution to a cleaner globe. Our AI optimizes corridors to maximize occupancy and minimize carbon output. Join the movement of responsible mobility.
                    </p>
                    <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-green-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-green-500 transition-all shadow-2xl active:scale-95">
                       Start Your Impact Journey <ArrowRight className="w-5 h-5" />
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── CTA SECTION ────────────────────────── */}
        <section className="container max-w-7xl mx-auto px-6 pb-40 pt-20">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden group shadow-2xl shadow-blue-600/30">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
              
              <h2 className="text-5xl md:text-[7rem] font-black mb-10 relative z-10 tracking-tighter uppercase italic leading-[0.9]">
                 REDEFINE YOUR<br />MOTION.
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                 <Link href="/register" className="bg-white text-black px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-200 transition-all shadow-2xl active:scale-95">
                    Apply for Verification
                 </Link>
                 <Link href="/rides" className="bg-transparent border-2 border-white/30 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                    Explore Corridors
                 </Link>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-20 border-t border-white/5 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-12">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                 <Car className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-black tracking-widest uppercase leading-none">JOOL SYNDICATE</span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Next-Gen Commute</span>
              </div>
           </div>
           <div className="flex flex-wrap justify-center md:justify-start gap-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Protocol</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Syndicate</Link>
              <Link href="/support" className="hover:text-white transition-colors">Support Node</Link>
           </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5 pt-10">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 JOOL TECHNOLOGY SYNDICATE • CRAFTED IN INDIA • V5.0</p>
           <div className="flex gap-4">
              <Globe className="w-4 h-4 text-slate-700" />
              <TrendingUp className="w-4 h-4 text-slate-700" />
           </div>
        </div>
      </footer>
    </div>
  );
}
