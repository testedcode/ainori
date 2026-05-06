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
  Box, Terminal, Binary, Search
} from 'lucide-react';
import { api } from '@/lib/api';
import { getVibe, VIBE_THEMES } from '@/lib/vibe-utils';
import VibeCanvas from './components/VibeCanvas';
import PulseNav from './components/PulseNav';

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

  const hour = new Date().getHours();
  const vibe = getVibe(hour);
  const theme = VIBE_THEMES[vibe];

  return (
    <div className={`min-h-screen text-white overflow-x-hidden font-sans selection:bg-blue-600/30 transition-colors duration-1000 ${theme.bg}`}>
      
      <VibeCanvas vibe={vibe} />
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none -z-10" />

      {/* Premium Navigation */}
      {user ? (
        <PulseNav />
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
              <span className="text-xl font-black tracking-tighter leading-none">Pulse</span>
              <span className="text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase">Simple & Shared</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Link href="#shift" className="hover:text-white transition-colors">Our Approach</Link>
            <Link href="#optimization" className="hover:text-white transition-colors">Routes</Link>
            <Link href="#hacks" className="hover:text-white transition-colors">Tips</Link>
            <Link href="#premium" className="hover:text-white transition-colors">Benefits</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors text-slate-400">Log in</Link>
            <Link href="/register" className="bg-white text-black hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95">Get Started</Link>
          </div>
        </nav>
      )}

      <main>
        {/* ─── HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
          <div className="container max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto text-center relative">
              <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <Car className="w-4 h-4" /> SAFE & SIMPLE OFFICE COMMUTE
              </div>
              <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter mb-10 leading-[0.75] uppercase italic text-white">
                BOOK YOUR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400">DAILY RIDE.</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/50 font-black uppercase italic tracking-tighter mb-12">
                Check your Pulse today for your daily office commute.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mt-16">
                <Link href="/register" className="group relative px-16 py-7 bg-white text-black rounded-[3rem] font-black text-lg uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">Get Started <ArrowRight className="w-6 h-6" /></span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── THE FEMALE SAFETY PROTOCOL ────────────────────────── */}
        <section className="py-20 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-transparent border border-purple-500/30 rounded-[5rem] p-12 md:p-24 relative group">
                 <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-96 h-96 text-white" />
                 </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="text-left relative z-10">
                       <div className="inline-flex items-center gap-3 px-8 py-3 bg-purple-500/20 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.6em] mb-12 text-purple-400">
                          <ShieldCheck className="w-5 h-5" /> SAFETY GUIDELINES
                       </div>
                       <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] mb-12">
                          PEACE OF MIND.<br />
                          <span className="text-purple-400">TRUSTED RIDES.</span>
                       </h2>
                       <div className="space-y-6">
                          {[
                            'Same-Society Verification: Match with neighbors you know.',
                            'Real-Time Family Tracking: Your loved ones stay in the loop.',
                            'Vetted Corporate Network: Exclusive access for professionals only.',
                            'Secured In-App Comms: Masked identifiers for total privacy.'
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
                 </div>
              </div>
           </div>
        </section>

        {/* ─── THE SYSTEMIC OVERWRITE: FROM CHAOS TO INFRASTRUCTURE (RE-ENGINEERED) ────────────────────────── */}
        <section id="shift" className="py-60 relative overflow-hidden bg-[#050810]">
           {/* Cinematic Ambient Light */}
           <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-red-600/5 blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
           <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />

           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-40">
                 <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 text-white/40">
                    <Users className="w-4 h-4" /> COMMUNITY-DRIVEN SYSTEM
                 </div>
                 <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8]">
                    THE SHIFT FROM<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-blue-500">CHAOS TO COMMUNITY.</span>
                 </h2>
              </div>

              {/* The "Versatile" Presentation: Dual Plate Shift */}
              <div className="relative flex flex-col lg:flex-row items-stretch gap-4 min-h-[700px] group/shift">
                 
                 {/* LEFT: THE CHAOS (Glitch Style) */}
                 <div className="flex-1 bg-[#0a0505] border border-red-900/30 rounded-[4rem] p-12 relative overflow-hidden transition-all duration-1000 group-hover/shift:flex-[0.8] hover:!flex-[1.2] group">
                    {/* Chaos Noise Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                       <div>
                          <div className="flex items-center gap-4 mb-16">
                             <div className="w-16 h-16 bg-red-600/10 rounded-[2rem] flex items-center justify-center border border-red-500/20 shadow-[0_0_40px_rgba(220,38,38,0.2)]">
                                <ZapOff className="w-8 h-8 text-red-500 animate-pulse" />
                             </div>
                             <div className="text-left">
                                <h3 className="text-4xl font-black uppercase italic leading-none text-white/90">The Chaos</h3>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">UNORGANIZED VULNERABILITY</p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             {[
                               { t: 'Unvetted Chat Groups', d: 'Zero accountability. Zero structure.', icon: XCircle },
                               { t: 'Phone Numbers Leaked', d: 'Identity exposed to unvetted strangers.', icon: EyeOff },
                               { t: 'Unpredictable Pricing', d: 'Surge traps and awkward negotiations.', icon: TrendingUp },
                               { t: 'Safety Hazards', d: 'No tracking. No vetting. No safety net.', icon: ShieldAlert }
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-red-950/20 hover:border-red-500/20 transition-all group/item">
                                  <item.icon className="w-6 h-6 text-red-600 group-hover/item:scale-110 transition-transform" />
                                  <div className="text-left">
                                     <h4 className="text-lg font-black text-white/40 group-hover/item:text-white uppercase italic tracking-tight">{item.t}</h4>
                                     <p className="text-[10px] font-bold text-red-900 uppercase tracking-widest group-hover/item:text-red-500">{item.d}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="pt-12 text-left opacity-20 group-hover:opacity-40 transition-opacity">
                          <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.5em]">STATUS: DEGRADED_SIGNAL</p>
                       </div>
                    </div>
                 </div>

                 {/* CENTER: THE SCANNER OVERLAY (MAGIC ELEMENT) */}
                 <div className="hidden lg:flex absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-x-1/2 z-20 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full blur-md animate-[bounce_4s_infinite]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full blur-md animate-[bounce_3s_infinite]" />
                 </div>

                 {/* RIGHT: THE SYNDICATE (High-Fidelity Structure) */}
                 <div className="flex-1 bg-[#050a15] border border-blue-900/30 rounded-[4rem] p-12 relative overflow-hidden transition-all duration-1000 group-hover/shift:flex-[1.2] hover:!flex-[1.4] group">
                    {/* Infrastructure Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 h-full flex flex-col justify-between">
                       <div>
                          <div className="flex items-center gap-4 mb-16">
                             <div className="w-16 h-16 bg-blue-600/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
                                <Binary className="w-8 h-8 text-blue-500 animate-[spin_8s_linear_infinite]" />
                             </div>
                             <div className="text-left">
                                <h3 className="text-4xl font-black uppercase italic leading-none text-white">The Community App</h3>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">SUPPORTIVE NEIGHBORLY SYSTEM</p>
                             </div>
                          </div>

                          <div className="space-y-4">
                             {[
                               { t: 'Verified Members', d: 'Match with trusted neighbors from your society.', icon: ShieldCheck, color: 'text-blue-400' },
                               { t: 'Privacy Protected', d: 'Secure communication without leaking numbers.', icon: Fingerprint, color: 'text-cyan-400' },
                               { t: 'Fixed Fair Rates', d: 'Predictable pricing. Zero surge pricing.', icon: Coins, color: 'text-green-400' },
                               { t: 'Live Trip Tracking', d: 'Real-time location sharing with family.', icon: Activity, color: 'text-blue-500' }
                             ].map((item, i) => (
                               <div key={i} className="flex items-center gap-6 p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl hover:bg-blue-600/20 hover:border-blue-500/40 transition-all group/item shadow-2xl">
                                  <div className="relative">
                                     <item.icon className={`w-6 h-6 ${item.color} group-hover/item:scale-110 transition-transform relative z-10`} />
                                     <div className={`absolute inset-0 ${item.color.replace('text', 'bg')} blur-lg opacity-40`} />
                                  </div>
                                  <div className="text-left">
                                     <h4 className="text-lg font-black text-white uppercase italic tracking-tight">{item.t}</h4>
                                     <p className="text-[10px] font-black text-blue-400/60 uppercase tracking-widest group-hover/item:text-blue-400">{item.d}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="pt-12 text-left">
                          <div className="flex items-center gap-3">
                             <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]" />
                             <p className="text-[8px] font-black text-blue-400 uppercase tracking-[0.5em]">SYSTEM_STATUS: ACTIVE • SECURITY: TRUSTED</p>
                          </div>
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* ─── URBAN OPTIMIZATION MASTER MATRIX (V10.4) ────────────────────────── */}
        <section id="optimization" className="py-60 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-end justify-between mb-40 gap-10">
                 <div className="text-left">
                    <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">MOST POPULAR JOURNEYS</p>
                    <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8] mb-12">
                       POPULAR<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">ROUTES.</span>
                    </h2>
                    <p className="text-xl md:text-3xl text-slate-500 font-bold max-w-4xl uppercase italic leading-tight">
                       Quick access to the most common <span className="text-white">Professional Flows.</span> Start your journey here.
                    </p>
                 </div>
              </div>

              {/* THE COMMUNITY ROUTES (Curated 10 Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 
                 <OptimizationCard 
                    tag="[TOP ROUTE]" 
                    title="Casa Rio → RCP" 
                    subtitle="CASA RIO TO RCP"
                    desc="Direct ride from Casa Rio society to Reliance Corporate Park. Safe, timely, and shared with neighbors."
                    icon={Navigation}
                    metric="30+ RIDES DAILY"
                    color="blue"
                    badge="POPULAR"
                 />

                 <OptimizationCard 
                    tag="[TOP ROUTE]" 
                    title="Casa Bella → RCP" 
                    subtitle="CASA BELLA TO RCP"
                    desc="Smooth daily ride from Casa Bella to RCP. Avoid the traffic stress and share the journey with your neighbors."
                    icon={Navigation}
                    metric="25+ RIDES DAILY"
                    color="amber"
                    badge="ACTIVE"
                 />

                 <OptimizationCard 
                    tag="[TOP ROUTE]" 
                    title="Kharghar → RCP" 
                    subtitle="KHARGHAR TO RCP"
                    desc="Connecting Kharghar members to RCP. A reliable way to reach office fresh and ready for the day."
                    icon={Navigation}
                    metric="15+ RIDES DAILY"
                    color="purple"
                    badge="GROWING"
                 />

                 <OptimizationCard 
                    tag="[FLEXIBLE]" 
                    title="Any Place → Any Place" 
                    subtitle="CUSTOM OFFICE ROUTES"
                    desc="Can't find your route? Create a custom path or search for any location. We connect you to neighbors everywhere."
                    icon={Search}
                    metric="UNLIMITED"
                    color="red"
                    badge="FLEXIBLE"
                 />

                 <OptimizationCard 
                    tag="[HEALTH SHIELD]" 
                    title="Health Shield" 
                    subtitle="CLIMATE CONTROL"
                    desc="Protection from heat strokes, city dust, and pollution. Arrive at your destination 100% fresh and cognitive-ready."
                    icon={ThermometerSun}
                    metric="-40% STRESS"
                    color="cyan"
                 />

                 <OptimizationCard 
                    tag="[MENTAL HEALTH]" 
                    title="Zen Corridor" 
                    subtitle="THE COMMUTE SABBATICAL"
                    desc="Stop fighting traffic. Use your commute to listen, read, or meditate. Reclaim 2 hours of your life for deep mental restoration."
                    icon={VolumeX}
                    metric="ZEN READY"
                    color="indigo"
                 />

                 <OptimizationCard 
                    tag="[SAFETY PARITY]" 
                    title="Fleet Upgrade" 
                    subtitle="CAR SAFETY, BIKE PRICES"
                    desc="Own a bike but prefer car safety during peak traffic? Travel in premium car corridors at prices equivalent to your bike fuel."
                    icon={Bike}
                    metric="₹ FUEL PARITY"
                    color="orange"
                 />

                 <OptimizationCard 
                    tag="[STAY IN FLOW]" 
                    title="Pulse Sync" 
                    subtitle="STAY IN THE FLOW"
                    desc="No more scrolling through unorganized chat groups. We provide the structured setup that chat groups simply can't offer."
                    icon={LayoutGrid}
                    metric="ZERO SPAM"
                    color="pink"
                 />

                 <OptimizationCard 
                    tag="[NATURE LOVERS]" 
                    title="EV Genesis" 
                    subtitle="SILENT SUSTAINABLE MOTION"
                    desc="Exclusive EV corridors coming soon. Ride in total silence while saving the planet. The greenest way to move in the city."
                    icon={EVIcon}
                    metric="ZERO EMISSION"
                    color="green"
                    badge="COMING SOON"
                 />

                 <OptimizationCard 
                    tag="[SMART SAVINGS]" 
                    title="Smart Savings" 
                    subtitle="SURGE PROTECTION"
                    desc="Avoid unpredictable taxi surge pricing. Keep your commute expenses fixed and simple within the Community Ledger."
                    icon={Coins}
                    metric="NO SURGE"
                    color="emerald"
                 />

              </div>
           </div>
        </section>

        {/* ─── HAPPY RIDE HACKS ────────────────────────── */}
        <section id="hacks" className="py-60 bg-gradient-to-b from-transparent via-purple-600/5 to-transparent relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-left mb-32">
                 <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-12 text-purple-400">
                    <ZapIcon className="w-5 h-5 animate-bounce" /> HELPFUL RIDE TIPS
                 </div>
                 <h2 className="text-7xl md:text-[11rem] font-black tracking-tighter uppercase italic leading-[0.8] mb-12">
                    HAPPY RIDE<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-purple-400">TIPS.</span>
                 </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 {[
                   { title: 'Treat with Greet', d: 'A smile is the best commute start. Be the energy you want to ride with.', icon: Smile, vibe: 'ENERGY', benefit: 'DOPAMINE BOOST', color: 'blue' },
                   { title: 'Silent Commute', d: 'Respect "No Yelling" and low volume. Deep work or total zen.', icon: VolumeX, vibe: 'FOCUS', benefit: 'DEEP WORK', color: 'purple' },
                   { title: 'In-Ride Settle', d: 'Settle via UPI during the ride. Zero friction, zero debt.', icon: Banknote, vibe: 'FLOW', benefit: 'ZERO FRICTION', color: 'green' },
                   { title: 'Privacy First', d: 'Privacy first. Keep all coordination inside the Pulse network.', icon: ShieldCheck, vibe: 'STEALTH', benefit: 'DATA PRIVACY', color: 'red' },
                   { title: 'Time Discipline', d: 'Punctuality is the ultimate respect. Be the one that others rely on.', icon: Clock, vibe: 'TRUST', benefit: 'TIME SAVED', color: 'amber' },
                   { title: 'Zero Spam Signal', d: 'Keep the signals clean. Relevant commute updates only.', icon: Radio, vibe: 'SIGNAL', benefit: 'NO NOISE', color: 'cyan' }
                 ].map((hack, i) => (
                   <div key={i} className="group relative bg-white/[0.02] border border-white/10 rounded-[5rem] p-12 hover:bg-white/[0.08] transition-all duration-700 overflow-hidden text-left flex flex-col">
                      <div className="flex justify-between items-center mb-12">
                         <div className={`w-24 h-24 bg-${hack.color}-500/10 rounded-[2.5rem] flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000 border border-${hack.color}-500/20 relative shadow-2xl shadow-${hack.color}-500/20`}>
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
                    <p className="text-amber-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">COMMUNITY MEMBERSHIP</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
                       CHOOSE YOUR<br /><span className="text-amber-500">PLAN.</span>
                    </h2>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* STANDARD */}
                 <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[4rem] flex flex-col hover:bg-white/[0.04] transition-all group text-left h-full">
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Standard</h3>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {['Access to public corridors', 'Standard profile verification', 'Core ride matching'].map((feat, i) => (
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
                 <div className="bg-blue-600/10 border border-blue-500/30 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.05] transition-all shadow-[0_30px_60px_-15px_rgba(34,197,94,0.2)] text-left h-full">
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Premium</h3>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {['AI-priority matching engine', 'Verified Corporate Badge', 'Unlimited private corridors'].map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-white/80 font-bold">
                            <ZapIcon className="w-4 h-4 text-blue-400 animate-pulse" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/exclusive-benefits" className="mt-12 w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-2xl relative z-10">
                       Upgrade to Premium
                    </Link>
                 </div>

                 {/* PREMIUM (GOLD) */}
                 <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/40 p-12 rounded-[4rem] flex flex-col relative overflow-hidden group hover:scale-[1.05] transition-all shadow-[0_30px_60px_-15px_rgba(245,158,11,0.2)] text-left h-full">
                    <div className="mb-12">
                       <h3 className="text-2xl font-black uppercase italic mb-2">Gold</h3>
                    </div>
                    <ul className="space-y-6 flex-1">
                       {['Elite Gold profile mark', 'Top-of-queue corridor access', 'Executive networking access'].map((feat, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-amber-200/80 font-bold">
                            <Crown className="w-4 h-4 text-amber-500 animate-pulse" /> {feat}
                         </li>
                       ))}
                    </ul>
                    <Link href="/profile" className="mt-12 w-full py-5 bg-amber-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-all shadow-2xl relative z-10">
                       Get Gold Status
                    </Link>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────── */}
        <section className="container max-w-7xl mx-auto px-6 pb-40 pt-40">
           <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-[5rem] p-24 md:p-40 text-center relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(59,130,246,0.4)]">
              <div className="relative z-10">
                 <h2 className="text-6xl md:text-[10rem] font-black mb-12 tracking-tighter uppercase italic leading-[0.8] text-white">
                    THE FUTURE<br />IS SHARED.
                 </h2>
                 <Link href="/register" className="bg-white text-black px-20 py-8 rounded-[3rem] text-xl font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-2xl active:scale-95">
                    Join Now
                 </Link>
              </div>
           </div>
        </section>
      </main>

    </div>
  );
}

/* ─── HELPER COMPONENT: OPTIMIZATION CARD ────────────────────────── */
function OptimizationCard({ 
  tag, title, subtitle, desc, icon: Icon, metric, color, badge 
}: { 
  tag: string, title: string, subtitle: string, desc: string, icon: any, metric: string, color: string, badge?: string 
}) {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
    red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-red-500/10',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-cyan-500/10',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
    pink: 'text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-pink-500/10',
    green: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-green-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10'
  };

  const c = colors[color];

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[4.5rem] p-12 relative overflow-hidden group hover:bg-white/[0.06] transition-all duration-700 flex flex-col justify-between hover:-translate-y-2">
       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
       
       {badge && (
         <div className={`absolute top-6 right-10 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${c.split(' ')[0]} bg-white/5 border border-white/10 shadow-2xl`}>
           {badge}
         </div>
       )}

       <div>
          <div className="flex items-center gap-6 mb-12">
             <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border shadow-2xl ${c}`}>
                <Icon className="w-12 h-12" />
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{tag}</p>
                <h3 className="text-3xl font-black uppercase italic leading-none">{title}</h3>
             </div>
          </div>

          <p className={`text-xl font-black leading-tight mb-8 text-left uppercase italic tracking-tighter ${c.split(' ')[0]}`}>
             {subtitle}
          </p>

          <p className="text-slate-400 text-lg font-bold leading-tight mb-12 text-left opacity-60 group-hover:opacity-100 transition-opacity">
             {desc}
          </p>
       </div>

       <div className={`flex items-center justify-between p-5 rounded-[2rem] bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors`}>
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full animate-pulse ${c.split(' ')[0].replace('text', 'bg')}`} />
             <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{metric}</span>
          </div>
          <ChevronRight className={`w-4 h-4 text-white/20 group-hover:translate-x-2 transition-transform ${c.split(' ')[0]}`} />
       </div>
    </div>
  );
}
