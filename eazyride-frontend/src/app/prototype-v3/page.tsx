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
  LineChart, Coffee, BrainCircuit, Network, Umbrella, CloudRain,
  Flame, ShieldHalf, LayoutGrid, Coins, Zap as EVIcon, HeartPulse,
  MonitorCheck, Verified, Glasses, Sparkle, Gauge, LifeBuoy, Split, Scan,
  Box, Terminal, Binary, Search, Menu, Headset
} from 'lucide-react';

export default function PrototypeV3() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-slate-900 overflow-x-hidden font-sans selection:bg-blue-200 bg-slate-50">
      
      {/* Premium Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 flex justify-between items-center ${
        scrolled ? 'bg-slate-50/90 backdrop-blur-3xl border-b border-slate-200 py-3 shadow-xl' : 'bg-transparent'
      }`}>
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform relative">
            <Car className="w-6 h-6 text-slate-900 relative z-10" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-black tracking-tighter leading-none uppercase italic">Pulse</span>
            <span className="text-[8px] font-black tracking-[0.3em] text-blue-600 uppercase">Simple & Shared</span>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
          <Link href="#shift" className="hover:text-slate-900 transition-colors">Approach</Link>
          <Link href="#optimization" className="hover:text-slate-900 transition-colors">Routes</Link>
          <Link href="#hacks" className="hover:text-slate-900 transition-colors">Tips</Link>
          <Link href="#premium" className="hover:text-slate-900 transition-colors">Benefits</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors text-slate-700">Log in</Link>
          <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-600 hover:text-slate-900 px-6 md:px-8 py-2 md:py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">Get Started</Link>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-900 active:scale-90 transition-transform"
          >
            {isMenuOpen ? <XCircle className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Overlay Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-slate-50/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 p-12">
             {[
               { href: '#shift', label: 'Our Approach' },
               { href: '#optimization', label: 'Routes' },
               { href: '#hacks', label: 'Tips' },
               { href: '#premium', label: 'Benefits' },
               { href: '/login', label: 'Log In' }
             ].map((link) => (
               <Link 
                 key={link.href}
                 href={link.href}
                 onClick={() => setIsMenuOpen(false)}
                 className="text-4xl font-black uppercase italic tracking-tighter hover:text-blue-600 transition-colors text-center border-b border-slate-200 w-full pb-4"
               >
                 {link.label}
               </Link>
             ))}
          </div>
        )}
      </nav>

      <main>
        {/* ─── HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-52 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white -z-10" />
          <div className="container max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto text-center relative">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-blue-600 backdrop-blur-md">
                <Car className="w-3.5 h-3.5" /> THE PROFESSIONAL COMMUTE SYNDICATE
              </div>
              <h1 className="text-6xl md:text-[9.5rem] font-black tracking-tighter mb-10 leading-[0.8] uppercase italic text-slate-900 drop-shadow-xl">
                BOOK YOUR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600">DAILY RIDE.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-700 font-bold uppercase tracking-widest mb-12 max-w-3xl mx-auto leading-relaxed">
                Experience the premium way to travel with verified neighbors and fixed fair rates. No stress, just flow.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link href="/register" className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-blue-600/20 active:scale-95">
                  Get Started <ArrowRight className="ml-2 inline w-5 h-5" />
                </Link>
                <Link href="#shift" className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-900/60 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  Our Approach
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── THE CORE PILLARS ────────────────────────── */}
        <section id="shift" className="py-24 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                 
                 {/* SAFETY PROTOCOL (SIDE PANEL) */}
                 <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-[3.5rem] p-12 flex flex-col justify-between backdrop-blur-md shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-40 h-40 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 text-blue-600">
                          <ShieldCheck className="w-3.5 h-3.5" /> SECURITY
                       </div>
                       <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none mb-10">
                          PEACE OF <br /><span className="text-blue-600">MIND.</span>
                       </h2>
                       <div className="space-y-6">
                          {[
                            'Same-Society Verification',
                            'Real-Time Family Tracking',
                            'Vetted Corporate Network',
                            'Secured In-App Comms'
                          ].map((feat, i) => (
                            <div key={i} className="flex items-center gap-4 group/item">
                               <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                               </div>
                               <span className="text-xs font-black text-slate-700 uppercase tracking-widest group-hover/item:text-slate-900 transition-colors">{feat}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* THE SHIFT (INTERACTIVE DUAL PLATE) */}
                 <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CHAOS */}
                    <div className="bg-rose-50 border border-rose-200 rounded-[3.5rem] p-10 relative overflow-hidden group hover:border-red-500/40 transition-all shadow-xl">
                       <div className="absolute inset-0 opacity-[0.15] -z-10 grayscale group-hover:grayscale-0 transition-all duration-700">
                          <img src="/chaos_v2.png" alt="Chaos" className="w-full h-full object-cover" />
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-t from-[#100808] via-[#100808]/80 to-white -z-10" />
                       
                       <h3 className="text-xl font-black uppercase italic text-rose-600 mb-8 tracking-widest flex items-center gap-3">
                         <ZapOff className="w-6 h-6" /> 01. THE CHAOS
                       </h3>
                       <div className="space-y-4 relative z-10">
                          {[
                            { t: 'Unvetted Groups', icon: XCircle, desc: 'Random strangers in chats.' },
                            { t: 'Identity Leaks', icon: EyeOff, desc: 'Privacy exposure risks.' },
                            { t: 'Surge Pricing', icon: TrendingUp, desc: 'Unpredictable costs daily.' },
                            { t: 'Safety Risks', icon: ShieldAlert, desc: 'Lack of verified protocols.' }
                          ].map((item, i) => (
                            <div key={i} className="p-5 bg-rose-100 border border-rose-200 rounded-2xl backdrop-blur-sm group/item hover:bg-red-900/30 transition-all">
                               <div className="flex items-center gap-4">
                                  <item.icon className="w-5 h-5 text-rose-600" />
                                  <div>
                                    <h4 className="text-xs font-black text-rose-600 uppercase tracking-widest">{item.t}</h4>
                                    <p className="text-[10px] text-rose-900/80 font-bold uppercase mt-1">{item.desc}</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    {/* COMMUNITY */}
                    <div className="bg-blue-50 border border-blue-200 rounded-[3.5rem] p-10 relative overflow-hidden group hover:border-blue-500/50 transition-all shadow-xl">
                       <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-white -z-10" />
                       <h3 className="text-xl font-black uppercase italic text-blue-600 mb-8 tracking-widest flex items-center gap-3">
                         <Verified className="w-6 h-6" /> 02. THE COMMUNITY
                       </h3>
                       <div className="space-y-4 relative z-10">
                          {[
                            { t: 'Verified Neighbors', icon: ShieldCheck, color: 'text-blue-600', desc: 'People you actually know.' },
                            { t: 'Privacy Shield', icon: Fingerprint, color: 'text-cyan-600', desc: 'Secure data protection.' },
                            { t: 'Fixed Fair Rates', icon: Coins, color: 'text-green-600', desc: 'No surges, ever.' },
                            { t: 'Live Tracking', icon: Activity, color: 'text-blue-600', desc: 'Total visibility for family.' }
                          ].map((item, i) => (
                            <div key={i} className="p-5 bg-blue-50 border border-blue-500/10 rounded-2xl group/item hover:bg-blue-100 transition-all backdrop-blur-sm">
                               <div className="flex items-center gap-4">
                                  <item.icon className={`w-5 h-5 ${item.color}`} />
                                  <div>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.t}</h4>
                                    <p className="text-[10px] text-blue-600/60 font-bold uppercase mt-1">{item.desc}</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* ─── JOURNEYS ────────────────────────── */}
        <section id="optimization" className="py-24 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                 <div className="text-left">
                    <p className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">OPTIMIZED FLOWS</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
                       POPULAR <span className="text-blue-600">ROUTES.</span>
                    </h2>
                 </div>
                 <div className="flex gap-4">
                    <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900/40 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"><ChevronRight className="rotate-180" /></button>
                    <button className="w-14 h-14 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-900/40 hover:text-slate-900 hover:bg-white transition-all cursor-pointer"><ChevronRight /></button>
                 </div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-10 snap-x no-scrollbar">
                 {[
                    { title: "Casa Rio → RCP", sub: "30+ RIDES DAILY", desc: "Direct society-to-office link.", color: "blue" },
                    { title: "Casa Bella → RCP", sub: "25+ RIDES DAILY", desc: "Smooth neighborly commute.", color: "cyan" },
                    { title: "Kharghar → RCP", sub: "15+ RIDES DAILY", desc: "Connecting corporate hubs.", color: "indigo" },
                    { title: "Any → Any", sub: "FLEXIBLE", desc: "Custom paths everywhere.", color: "rose" }
                 ].map((route, i) => (
                    <div key={i} className="min-w-[320px] bg-slate-50 border border-slate-200 rounded-[3rem] p-10 snap-center hover:bg-slate-100 transition-all group shadow-xl">
                       <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 border border-${route.color}-500/20 bg-${route.color}-500/10`}>
                          <Navigation className={`w-8 h-8 text-${route.color}-400`} />
                       </div>
                       <h3 className="text-2xl font-black uppercase italic mb-3 tracking-tighter">{route.title}</h3>
                       <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-${route.color}-500`}>{route.sub}</p>
                       <p className="text-slate-700 text-sm font-bold leading-tight opacity-60">{route.desc}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ─── RIDE HACKS ────────────────────────── */}
        <section id="hacks" className="py-24 bg-white border-y border-slate-200 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                 <p className="text-purple-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">COMMUNITY ETIQUETTE</p>
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                    RIDE <span className="text-purple-600">HACKS.</span>
                 </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                 {[
                   { title: 'Greet', icon: Smile, color: 'text-blue-600' },
                   { title: 'Silence', icon: VolumeX, color: 'text-purple-600' },
                   { title: 'UPI', icon: Banknote, color: 'text-green-600' },
                   { title: 'Privacy', icon: ShieldCheck, color: 'text-rose-600' },
                   { title: 'Time', icon: Clock, color: 'text-amber-600' },
                   { title: 'No Spam', icon: Radio, color: 'text-cyan-600' }
                 ].map((hack, i) => (
                   <div key={i} className="group bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 hover:bg-purple-600/10 hover:border-purple-500/30 transition-all text-center flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                         <hack.icon className={`w-8 h-8 ${hack.color}`} />
                      </div>
                      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{hack.title}</h4>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ─── EXCLUSIVE PERKS ────────────────────────── */}
        <section id="premium" className="py-24 relative overflow-hidden">
           <div className="absolute inset-0 -z-10">
              <img src="/perks_v2.png" alt="Premium Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-50/85 backdrop-blur-[2px]" />
           </div>

           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="bg-slate-50 backdrop-blur-3xl border border-slate-300 rounded-[4.5rem] p-12 lg:p-24 shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100 blur-[120px] rounded-full -z-10" />
                 
                 <div className="text-center mb-20">
                    <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-8">
                       EXCLUSIVE <span className="text-blue-600">PERKS.</span>
                    </h2>
                    <p className="text-2xl font-black text-blue-600 uppercase tracking-[0.3em] italic bg-blue-500/10 inline-block px-8 py-3 rounded-2xl border border-blue-500/20">WORTH ₹50,000+ IN BENEFITS</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* STANDARD */}
                    <div className="bg-white border border-slate-200 p-12 rounded-[3.5rem] hover:bg-slate-100 hover:-translate-y-2 transition-all group">
                       <h3 className="text-2xl font-black uppercase italic mb-8 text-slate-900/40 group-hover:text-slate-900 tracking-widest">Standard</h3>
                       <ul className="space-y-6 mb-12">
                          {['Public Corridors', 'Standard Verify', 'Core Matching'].map((f, i) => (
                            <li key={i} className="flex items-center gap-4 text-xs font-black text-slate-700 uppercase tracking-widest">
                               <CheckCircle2 className="w-5 h-5 text-blue-600" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/register" className="block w-full py-5 bg-slate-100 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-600 text-white transition-all">Join Free</Link>
                    </div>

                    {/* PREMIUM */}
                    <div className="bg-blue-100 border border-blue-400/40 p-12 rounded-[3.5rem] hover:bg-blue-100 hover:-translate-y-2 transition-all group shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8"><Sparkles className="w-8 h-8 text-blue-600 animate-pulse" /></div>
                       <h3 className="text-2xl font-black uppercase italic mb-8 text-blue-600 tracking-widest">Premium</h3>
                       <ul className="space-y-6 mb-12">
                          {['AI Priority Match', 'Corporate Badge', 'Private Corridors'].map((f, i) => (
                            <li key={i} className="flex items-center gap-4 text-xs font-black text-slate-900 uppercase tracking-widest">
                               <ZapIcon className="w-5 h-5 text-blue-600" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/exclusive-benefits" className="block w-full py-5 bg-blue-600 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/40">Upgrade Now</Link>
                    </div>

                    {/* GOLD */}
                    <div className="bg-amber-50 border border-amber-300 p-12 rounded-[3.5rem] hover:bg-amber-100 hover:-translate-y-2 transition-all group shadow-xl">
                       <h3 className="text-2xl font-black uppercase italic mb-8 text-amber-600 tracking-widest">Gold</h3>
                       <ul className="space-y-6 mb-12">
                          {['Elite Profile Mark', 'Top Queue Access', 'Exec Networking'].map((f, i) => (
                            <li key={i} className="flex items-center gap-4 text-xs font-black text-amber-700 uppercase tracking-widest">
                               <Crown className="w-5 h-5 text-amber-600" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/profile" className="block w-full py-5 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/40">Get Gold</Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────── */}
        <section className="container max-w-7xl mx-auto px-6 py-32">
           <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 border border-blue-200 rounded-[5rem] p-16 lg:p-32 text-center relative overflow-hidden group shadow-xl shadow-blue-100">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-slate-100 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10">
                 <h2 className="text-5xl md:text-[9rem] font-black mb-14 tracking-tighter uppercase italic leading-[0.9] md:leading-[0.8] text-slate-900">
                    THE FUTURE<br className="hidden md:block" /> IS SHARED.
                 </h2>
                 <Link href="/register" className="inline-block bg-blue-600 text-white px-16 py-7 rounded-3xl text-xl font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl active:scale-95 hover:scale-105">
                    Join Now
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <footer className="py-20 border-t border-slate-200 bg-slate-50 backdrop-blur-md">
         <div className="container max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
               <div className="col-span-2 md:col-span-1">
                  <div className="flex items-center gap-3 mb-8">
                     <Car className="w-6 h-6 text-blue-600" />
                     <span className="text-xl font-black tracking-tighter uppercase italic">Pulse</span>
                  </div>
                  <p className="text-slate-700 text-xs font-bold uppercase tracking-widest leading-relaxed">
                     Built for professionals. Dedicated to a sustainable, shared future.
                  </p>
               </div>
               {[
                 { t: 'Product', links: ['Approach', 'Routes', 'Pricing', 'Security'] },
                 { t: 'Company', links: ['About', 'Legal', 'Privacy', 'Support'] },
                 { t: 'Community', links: ['Hacks', 'Guidelines', 'Protocols', 'Impact'] }
               ].map((cat, i) => (
                 <div key={i}>
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8">{cat.t}</h5>
                    <ul className="space-y-4">
                       {cat.links.map((l, j) => (
                         <li key={j}><Link href="#" className="text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-slate-900 transition-colors">{l}</Link></li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-200 gap-8">
               <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">© 2026 PULSE SYNDICATE. ALL RIGHTS RESERVED.</p>
               <div className="flex gap-8">
                  <Share2 className="w-4 h-4 text-slate-700 hover:text-slate-900 cursor-pointer transition-colors" />
                  <Globe className="w-4 h-4 text-slate-700 hover:text-slate-900 cursor-pointer transition-colors" />
               </div>
            </div>
         </div>
      </footer>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
