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
  Box, Terminal, Binary, Search, Menu
} from 'lucide-react';
import { api } from '@/lib/api';
import PulseNav from '@/components/PulseNav';

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
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
       } catch {}
    };

    fetchStats();
    checkAuth();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  return (
    <div className={`min-h-screen text-slate-900 overflow-x-hidden font-sans selection:bg-blue-200 bg-white`}>
      
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none -z-10" />

      {/* Premium Navigation */}
      {user ? (
        <PulseNav />
      ) : (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 pt-[env(safe-area-inset-top,1rem)] pb-4 flex justify-between items-center ${
          scrolled ? 'bg-slate-50/80 backdrop-blur-2xl border-b border-slate-200 py-3' : 'bg-transparent'
        }`}>
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform relative">
               <div className="absolute inset-0 bg-blue-400 blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
              <Car className="w-6 h-6 text-slate-900 relative z-10" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tighter leading-none">EazyRide</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-blue-600 uppercase">Simple & Shared</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-700">
            <Link href="#shift" className="hover:text-slate-900 transition-colors">Our Approach</Link>
            <Link href="#optimization" className="hover:text-slate-900 transition-colors">Routes</Link>
            <Link href="#hacks" className="hover:text-slate-900 transition-colors">Tips</Link>
            <Link href="#premium" className="hover:text-slate-900 transition-colors">Benefits</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors text-slate-700">Log in</Link>
            {/* Responsive CTA: Get Started on desktop, Login on mobile */}
            <Link href="/register" className="hidden sm:inline-block bg-blue-600 text-white hover:bg-blue-600 hover:text-slate-900 px-6 md:px-8 py-2 md:py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95">Get Started</Link>
            <Link href="/login" className="sm:hidden bg-blue-600 text-white hover:bg-blue-600 hover:text-slate-900 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95">Login</Link>
            
            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-900 active:scale-90 transition-transform"
            >
              {isMenuOpen ? <XCircle className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Overlay Menu */}
          {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-slate-50/95 backdrop-blur-2xl animate-in fade-in duration-300 flex flex-col items-center justify-center gap-8">
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
                   className="text-3xl font-black uppercase italic tracking-tighter hover:text-blue-600 transition-colors"
                 >
                   {link.label}
                 </Link>
               ))}
            </div>
          )}
        </nav>
      )}

      <main>
        {/* ─── HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-24 pb-12 lg:pt-40 lg:pb-24 overflow-hidden">
          <div className="container max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto text-center relative">
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-8 text-blue-600 backdrop-blur-md">
                <Car className="w-3.5 h-3.5" /> THE PROFESSIONAL COMMUTE SYNDICATE
              </div>
              <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] uppercase italic text-slate-900 drop-shadow-xl">
                BOOK YOUR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600">DAILY RIDE.</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                <Link href="/register" className="group relative px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-slate-900 transition-all shadow-xl active:scale-95 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">Get Started <ArrowRight className="w-5 h-5" /></span>
                </Link>
                <Link href="#shift" className="px-10 py-5 bg-white border border-slate-200 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-900/40 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  Our Approach
                </Link>
              </div>
              <p className="mt-12 text-xs md:text-sm text-slate-900/30 font-black uppercase tracking-[0.2em] animate-pulse">
                Trusted by neighbors • Verified Professionals • Secure Network
              </p>
            </div>
          </div>
        </section>

        {/* ─── THE CORE PILLARS: SAFETY & SHIFT (COMPACTED) ────────────────────────── */}
        <section id="shift" className="py-24 relative overflow-hidden bg-slate-50">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* CARD 1: PEACE OF MIND (PURPLE) */}
                  <div className="bg-white border border-purple-200 rounded-[3rem] p-10 flex flex-col justify-between shadow-[0_20px_40px_rgba(147,51,234,0.05)] hover:shadow-[0_20px_60px_rgba(147,51,234,0.15)] hover:-translate-y-2 transition-all relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 blur-[80px] rounded-full -z-10 group-hover:bg-purple-200 transition-colors" />
                     <div>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-[8px] font-black uppercase tracking-widest mb-8 text-purple-600">
                           <ShieldCheck className="w-3.5 h-3.5" /> SECURITY
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none mb-10 text-slate-900">
                           PEACE OF <span className="text-purple-600">MIND.</span>
                        </h2>
                        <div className="space-y-5 relative z-10">
                           {[
                             'Same-Society Verification',
                             'Real-Time Family Tracking',
                             'Vetted Corporate Network',
                             'Secured In-App Comms'
                           ].map((feat, i) => (
                             <div key={i} className="flex items-center gap-4 group/item">
                                <CheckCircle2 className="w-5 h-5 text-purple-500 shrink-0" />
                                <span className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest group-hover/item:text-slate-900 transition-colors">{feat}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="mt-12 pt-6 border-t border-slate-100 relative z-10">
                        <p className="text-[9px] font-black text-slate-900/40 uppercase tracking-widest leading-relaxed">
                           Our network is built on trust. We ensure every member is a verified professional from your community.
                        </p>
                     </div>
                  </div>

                  {/* CARD 2: THE CHAOS (RED) */}
                  <div className="bg-white border border-rose-200 rounded-[3rem] p-10 flex flex-col shadow-[0_20px_40px_rgba(225,29,72,0.05)] hover:shadow-[0_20px_60px_rgba(225,29,72,0.15)] hover:-translate-y-2 transition-all relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100 blur-[80px] rounded-full -z-10 group-hover:bg-rose-200 transition-colors" />
                     <div className="absolute bottom-10 right-10 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all">
                        <ZapOff className="w-48 h-48 text-rose-600" />
                     </div>
                     <h3 className="text-xl font-black uppercase italic text-rose-500 mb-10 tracking-[0.2em]">01. THE CHAOS</h3>
                     <div className="space-y-4 relative z-10 flex-1">
                        {[
                          { t: 'Unvetted Groups', icon: XCircle },
                          { t: 'Identity Leaks', icon: EyeOff },
                          { t: 'Surge Pricing', icon: TrendingUp },
                          { t: 'Safety Risks', icon: ShieldAlert }
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white border border-rose-100 rounded-2xl shadow-sm hover:border-rose-300 transition-colors">
                             <item.icon className="w-5 h-5 text-rose-500 shrink-0" />
                             <span className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest">{item.t}</span>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* CARD 3: THE COMMUNITY (BLUE) */}
                  <div className="bg-white border border-blue-200 rounded-[3rem] p-10 flex flex-col shadow-[0_20px_40px_rgba(37,99,235,0.05)] hover:shadow-[0_20px_60px_rgba(37,99,235,0.15)] hover:-translate-y-2 transition-all relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 blur-[80px] rounded-full -z-10 group-hover:bg-blue-200 transition-colors" />
                     <div className="absolute bottom-10 right-10 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all">
                        <Binary className="w-48 h-48 text-blue-600" />
                     </div>
                     <h3 className="text-xl font-black uppercase italic text-blue-600 mb-10 tracking-[0.2em]">02. THE COMMUNITY</h3>
                     <div className="space-y-4 relative z-10 flex-1">
                        {[
                          { t: 'Verified Neighbors', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                          { t: 'Privacy Shield', icon: Fingerprint, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-200' },
                          { t: 'Fixed Fair Rates', icon: Coins, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                          { t: 'Live Tracking', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' }
                        ].map((item, i) => (
                          <div key={i} className={`flex items-center gap-4 p-4 border rounded-2xl shadow-sm transition-all hover:shadow-md ${item.bg}`}>
                             <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
                             <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.t}</span>
                          </div>
                        ))}
                     </div>
                  </div>

               </div>
           </div>
        </section>

        {/* ─── POPULAR JOURNEYS: BENTO CAROUSEL (COMPACTED) ────────────────────────── */}
        <section id="optimization" className="py-24 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex items-end justify-between mb-12">
                 <div className="text-left">
                    <p className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] mb-4">OPTIMIZED FLOWS</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                       POPULAR <span className="text-blue-600">ROUTES.</span>
                    </h2>
                 </div>
                 <div className="hidden md:flex gap-2">
                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900/20 hover:text-slate-900 transition-colors cursor-pointer"><ChevronRight className="rotate-180" /></div>
                    <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900/20 hover:text-slate-900 transition-colors cursor-pointer"><ChevronRight /></div>
                 </div>
              </div>

              {/* HORIZONTAL BENTO SCROLL */}
              <div className="flex gap-4 overflow-x-auto pb-8 snap-x no-scrollbar">
                 <OptimizationBentoCard 
                    title="Casa Rio → RCP" 
                    subtitle="30+ RIDES DAILY"
                    desc="Direct society-to-office link."
                    icon={Navigation}
                    color="blue"
                 />
                 <OptimizationBentoCard 
                    title="Casa Bella → RCP" 
                    subtitle="25+ RIDES DAILY"
                    desc="Smooth neighborly commute."
                    icon={Navigation}
                    color="amber"
                 />
                 <OptimizationBentoCard 
                    title="Kharghar → RCP" 
                    subtitle="15+ RIDES DAILY"
                    desc="Connecting corporate hubs."
                    icon={Navigation}
                    color="purple"
                 />
                 <OptimizationBentoCard 
                    title="Any → Any" 
                    subtitle="FLEXIBLE"
                    desc="Custom paths everywhere."
                    icon={Search}
                    color="red"
                 />
                 <OptimizationBentoCard 
                    title="Health Shield" 
                    subtitle="-40% STRESS"
                    desc="Climate controlled motion."
                    icon={ThermometerSun}
                    color="cyan"
                 />
                 <OptimizationBentoCard 
                    title="Zen Corridor" 
                    subtitle="RESTORE"
                    desc="Reclaim your mental space."
                    icon={VolumeX}
                    color="indigo"
                 />
              </div>
           </div>
        </section>

        {/* ─── HAPPY RIDE HACKS: BENTO GRID ────────────────────────── */}
        <section id="hacks" className="py-24 bg-white relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                 <p className="text-purple-600 font-black text-[9px] uppercase tracking-[0.4em] mb-4">COMMUNITY ETIQUETTE</p>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                    RIDE <span className="text-purple-600">HACKS.</span>
                 </h2>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { title: 'Always Greet', desc: 'A simple "Hello" sets the tone for a pleasant commute.', icon: Smile, color: 'blue' },
                   { title: 'Silent Mode', desc: 'Keep phone calls brief and use headphones for media.', icon: VolumeX, color: 'purple' },
                   { title: 'Prompt UPI', desc: 'Settle the ride costs immediately after dropping off.', icon: Banknote, color: 'green' },
                   { title: 'Respect Privacy', desc: 'Professional boundaries make everyone comfortable.', icon: ShieldCheck, color: 'red' },
                   { title: 'Be On Time', desc: 'Your neighbors are professionals. Every minute counts.', icon: Clock, color: 'amber' },
                   { title: 'No Spam', desc: 'Avoid forwarding chain messages or promotional content.', icon: Radio, color: 'cyan' }
                 ].map((hack, i) => (
                   <div key={i} className="group bg-slate-50 border border-slate-200 rounded-[2rem] p-8 hover:bg-white hover:border-slate-300 transition-all text-left shadow-sm hover:shadow-xl hover:-translate-y-1">
                      <div className={`w-14 h-14 bg-${hack.color}-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                         <hack.icon className={`w-7 h-7 text-${hack.color}-500`} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase italic mb-2 tracking-tighter">{hack.title}</h4>
                      <p className="text-slate-600 text-sm font-bold leading-relaxed">{hack.desc}</p>
                   </div>
                 ))}
               </div>
           </div>
        </section>

        {/* ─── EXCLUSIVE PERKS: GLASSMORPHIC TILES ────────────────────────── */}
        <section id="premium" className="py-24 relative overflow-hidden">
           {/* BACKGROUND IMAGE WITH BLUR */}
           <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-slate-100/90 z-10" />
              <img src="/premium_commute_bg_1778790601030.png" alt="Premium Background" className="w-full h-full object-cover" />
           </div>

           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="bg-slate-100 backdrop-blur-2xl border border-slate-300 rounded-[4rem] p-12 lg:p-20 shadow-xl">
                 <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">
                       EXCLUSIVE <span className="text-blue-600">PERKS.</span>
                    </h2>
                    <p className="text-xl font-black text-slate-900/60 uppercase tracking-widest italic">WORTH ₹50,000+ IN BENEFITS</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* STANDARD */}
                    <div className="bg-white border border-slate-200 p-10 rounded-3xl hover:bg-slate-100 transition-all group">
                       <h3 className="text-xl font-black uppercase italic mb-6 text-slate-900/40 group-hover:text-slate-900">Standard</h3>
                       <ul className="space-y-4 mb-10">
                          {['Public Corridors', 'Standard Verify', 'Core Matching'].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-900/60 uppercase">
                               <CheckCircle2 className="w-4 h-4 text-blue-600" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/register" className="block w-full py-4 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-blue-600 text-white transition-all">Join Free</Link>
                    </div>

                    {/* PREMIUM */}
                    <div className="bg-blue-100 border border-blue-400/40 p-10 rounded-3xl hover:bg-blue-200 transition-all group shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4"><Sparkles className="w-5 h-5 text-blue-600 animate-pulse" /></div>
                       <h3 className="text-xl font-black uppercase italic mb-6 text-blue-600">Premium</h3>
                       <ul className="space-y-4 mb-10">
                          {['AI Priority Match', 'Corporate Badge', 'Private Corridors'].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[10px] font-black text-slate-900 uppercase">
                               <ZapIcon className="w-4 h-4 text-blue-600" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/exclusive-benefits" className="block w-full py-4 bg-blue-600 text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-xl">Upgrade Now</Link>
                    </div>

                    {/* GOLD */}
                    <div className="bg-amber-100 border border-amber-300 p-10 rounded-3xl hover:bg-amber-100 transition-all group shadow-xl">
                       <h3 className="text-xl font-black uppercase italic mb-6 text-amber-600">Gold</h3>
                       <ul className="space-y-4 mb-10">
                          {['Elite Profile Mark', 'Top Queue Access', 'Exec Networking'].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[10px] font-black text-amber-700/80 uppercase">
                               <Crown className="w-4 h-4 text-amber-600" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/profile" className="block w-full py-4 bg-amber-500 text-black rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-all shadow-xl">Get Gold</Link>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────── */}
        <section className="container max-w-7xl mx-auto px-6 py-24">
           <div className="relative rounded-[4rem] p-16 lg:p-32 text-center overflow-hidden group shadow-2xl border border-slate-200">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-0" />
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0" />
              
              {/* Glassmorphic Orbs */}
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/30 blur-[100px] rounded-full mix-blend-screen pointer-events-none group-hover:scale-110 transition-transform duration-1000" />

              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 text-white">
                    <Globe className="w-3.5 h-3.5" /> Join The Network
                 </div>
                 <h2 className="text-5xl md:text-[8rem] font-black mb-10 tracking-tighter uppercase italic leading-[0.9] md:leading-[0.8] text-white drop-shadow-2xl">
                    THE FUTURE<br className="hidden md:block" /> IS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">SHARED.</span>
                 </h2>
                 <Link href="/register" className="inline-block bg-white text-slate-900 px-14 py-6 rounded-2xl text-lg font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95">
                    Start Commuting
                 </Link>
              </div>
           </div>
        </section>
      </main>

    </div>
  );
}

/* ─── HELPER COMPONENT: OPTIMIZATION BENTO CARD ────────────────────────── */
function OptimizationBentoCard({ 
  title, subtitle, desc, icon: Icon, color 
}: { 
  title: string, subtitle: string, desc: string, icon: any, color: string 
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-600 bg-amber-50 border-amber-300',
    purple: 'text-purple-600 bg-purple-50 border-purple-300',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    cyan: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  };

  const c = colors[color];

  return (
    <div className="min-w-[280px] bg-slate-50 border border-slate-200 rounded-[2rem] p-8 snap-center hover:bg-slate-100 transition-all group">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${c}`}>
          <Icon className="w-7 h-7" />
       </div>
       <h3 className="text-xl font-black uppercase italic mb-2">{title}</h3>
       <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${c.split(' ')[0]}`}>{subtitle}</p>
       <p className="text-slate-900/40 text-xs font-bold leading-tight">{desc}</p>
    </div>
  );
}

function OptimizationCard({ 
  tag, title, subtitle, desc, icon: Icon, metric, color, badge 
}: { 
  tag: string, title: string, subtitle: string, desc: string, icon: any, metric: string, color: string, badge?: string 
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-500/10 border-blue-500/20 shadow-blue-200/50',
    amber: 'text-amber-600 bg-amber-50 border-amber-300 shadow-amber-200/50',
    purple: 'text-purple-600 bg-purple-50 border-purple-300 shadow-purple-200/50',
    red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-red-200/50',
    cyan: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-200/50',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-200/50',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-pink-500/10',
    green: 'text-green-600 bg-green-500/10 border-green-500/20 shadow-green-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10'
  };

  const c = colors[color];

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-[4.5rem] p-12 relative overflow-hidden group hover:bg-slate-100 transition-all duration-700 flex flex-col justify-between hover:-translate-y-2">
       <div className="absolute top-0 right-0 w-32 h-32 bg-white blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
       
       {badge && (
         <div className={`absolute top-6 right-10 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${c.split(' ')[0]} bg-white border border-slate-200 shadow-xl`}>
           {badge}
         </div>
       )}

       <div>
          <div className="flex items-center gap-6 mb-12">
             <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border shadow-xl ${c}`}>
                <Icon className="w-12 h-12" />
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black text-slate-900/20 uppercase tracking-[0.3em] mb-1">{tag}</p>
                <h3 className="text-3xl font-black uppercase italic leading-none">{title}</h3>
             </div>
          </div>

          <p className={`text-xl font-black leading-tight mb-8 text-left uppercase italic tracking-tighter ${c.split(' ')[0]}`}>
             {subtitle}
          </p>

          <p className="text-slate-700 text-lg font-bold leading-tight mb-12 text-left opacity-60 group-hover:opacity-100 transition-opacity">
             {desc}
          </p>
       </div>

       <div className={`flex items-center justify-between p-5 rounded-[2rem] bg-white border border-slate-200 group-hover:border-slate-200 transition-colors`}>
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full animate-pulse ${c.split(' ')[0].replace('text', 'bg')}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-900/40">{metric}</span>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-900/20 group-hover:translate-x-2 transition-transform ${c.split(' ')[0]}`} />
       </div>
    </div>
  );
}
