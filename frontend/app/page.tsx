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
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 pt-[env(safe-area-inset-top,1rem)] pb-4 flex justify-between items-center ${
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
            <Link href="/login" className="hidden sm:block px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors text-slate-400">Log in</Link>
            {/* Responsive CTA: Get Started on desktop, Login on mobile */}
            <Link href="/register" className="hidden sm:inline-block bg-white text-black hover:bg-blue-600 hover:text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95">Get Started</Link>
            <Link href="/login" className="sm:hidden bg-white text-black hover:bg-blue-600 hover:text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95">Login</Link>
            
            {/* Mobile Menu Trigger */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-white active:scale-90 transition-transform"
            >
              {isMenuOpen ? <XCircle className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Overlay Menu */}
          {isMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-40 bg-[#0a0f1e]/95 backdrop-blur-2xl animate-in fade-in duration-300 flex flex-col items-center justify-center gap-8">
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
                   className="text-3xl font-black uppercase italic tracking-tighter hover:text-blue-500 transition-colors"
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
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-8 text-blue-400 backdrop-blur-md">
                <Car className="w-3.5 h-3.5" /> THE PROFESSIONAL COMMUTE SYNDICATE
              </div>
              <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] uppercase italic text-white drop-shadow-2xl">
                BOOK YOUR<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400">DAILY RIDE.</span>
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                <Link href="/register" className="group relative px-12 py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">Get Started <ArrowRight className="w-5 h-5" /></span>
                </Link>
                <Link href="#shift" className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  Our Approach
                </Link>
              </div>
              <p className="mt-12 text-xs md:text-sm text-white/30 font-black uppercase tracking-[0.2em] animate-pulse">
                Trusted by neighbors • Verified Professionals • Secure Network
              </p>
            </div>
          </div>
        </section>

        {/* ─── THE CORE PILLARS: SAFETY & SHIFT (COMPACTED & SPACE OPTIMIZED) ────────────────────────── */}
        <section id="shift" className="py-24 relative overflow-hidden bg-[#050810]/50">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                 
                 {/* SAFETY PROTOCOL (PURPLE) */}
                 <div className="relative overflow-hidden bg-[#0c0d14] border border-purple-500/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-500 group shadow-[0_0_50px_rgba(168,85,247,0.05)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div>
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[8px] font-black uppercase tracking-widest mb-6 text-purple-400">
                          <ShieldCheck className="w-3 h-3" /> SECURITY
                       </div>
                       <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-6">
                          PEACE OF <span className="text-purple-400">MIND.</span>
                       </h3>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            'Same-Society Verification',
                            'Real-Time Family Tracking',
                            'Vetted Corporate Network',
                            'Secured In-App Comms'
                          ].map((feat, i) => (
                             <div key={i} className="flex items-center gap-2 p-2 bg-purple-950/20 border border-purple-500/10 rounded-xl hover:bg-purple-950/30 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span className="text-[8px] font-black text-white/70 uppercase tracking-wider">${feat}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5">
                       <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest leading-relaxed">
                          Our network is built on trust. We ensure every member is a verified professional from your community.
                       </p>
                    </div>
                 </div>

                 {/* CHAOS (RED) */}
                 <div className="relative overflow-hidden bg-[#140a0c] border border-red-900/30 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:border-red-500/30 transition-all duration-500 group shadow-[0_0_50px_rgba(244,63,94,0.05)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div>
                       <h3 className="text-xl font-black uppercase italic text-red-500/50 mb-6 tracking-widest">01. THE CHAOS</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            { t: 'Unvetted Groups', icon: XCircle },
                            { t: 'Identity Leaks', icon: EyeOff },
                            { t: 'Surge Pricing', icon: TrendingUp },
                            { t: 'Safety Risks', icon: ShieldAlert }
                          ].map((item, i) => (
                             <div key={i} className="flex items-center gap-2 p-2 bg-red-950/20 border border-red-900/20 rounded-xl hover:bg-red-950/30 transition-colors">
                                <item.icon className="w-3.5 h-3.5 text-red-500/60 shrink-0" />
                                <span className="text-[8px] font-black text-white/50 uppercase tracking-wider">${item.t}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5">
                       <p className="text-[9px] font-medium text-white/30 uppercase tracking-widest leading-relaxed">
                          Fragile coordinates with strangers, unverified profiles, high-friction chats, and uncontrolled surge fares.
                       </p>
                    </div>
                 </div>

                 {/* COMMUNITY (BLUE) */}
                 <div className="relative overflow-hidden bg-[#0a0f1a] border border-blue-900/30 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-500 group shadow-[0_0_50px_rgba(59,130,246,0.05)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div>
                       <h3 className="text-xl font-black uppercase italic text-blue-400 mb-6 tracking-widest">02. THE COMMUNITY</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            { t: 'Verified Neighbors', icon: ShieldCheck, color: 'text-blue-400' },
                            { t: 'Privacy Shield', icon: Fingerprint, color: 'text-cyan-400' },
                            { t: 'Fixed Fair Rates', icon: Coins, color: 'text-green-400' },
                            { t: 'Live Tracking', icon: Activity, color: 'text-blue-500' }
                          ].map((item, i) => (
                             <div key={i} className="flex items-center gap-2 p-2 bg-blue-950/20 border border-blue-900/20 rounded-xl hover:bg-blue-950/30 transition-colors">
                                <item.icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                                <span className="text-[8px] font-black text-white uppercase tracking-wider">${item.t}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5">
                       <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest leading-relaxed">
                          Sleek neighbor-to-neighbor rides with full safety protocols, encrypted communications, and flat fair prices.
                       </p>
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
                    <p className="text-blue-500 font-black text-[9px] uppercase tracking-[0.4em] mb-4">OPTIMIZED FLOWS</p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                       POPULAR <span className="text-blue-400">ROUTES.</span>
                    </h2>
                 </div>
                 <div className="hidden md:flex gap-2">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer"><ChevronRight className="rotate-180" /></div>
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-white transition-colors cursor-pointer"><ChevronRight /></div>
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

        {/* ─── HAPPY RIDE HACKS: MASONRY GRID (COMPACTED) ────────────────────────── */}
        <section id="hacks" className="py-24 bg-white/5 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                 <p className="text-purple-400 font-black text-[9px] uppercase tracking-[0.4em] mb-4">COMMUNITY ETIQUETTE</p>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                    RIDE <span className="text-purple-400">HACKS.</span>
                 </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                 {[
                   { title: 'Greet', icon: Smile, color: 'blue' },
                   { title: 'Silence', icon: VolumeX, color: 'purple' },
                   { title: 'UPI', icon: Banknote, color: 'green' },
                   { title: 'Privacy', icon: ShieldCheck, color: 'red' },
                   { title: 'Time', icon: Clock, color: 'amber' },
                   { title: 'No Spam', icon: Radio, color: 'cyan' }
                 ].map((hack, i) => (
                   <Link key={i} href="/hacks" className="group bg-black/40 border border-white/5 rounded-3xl p-6 hover:bg-purple-600/10 hover:border-purple-500/20 transition-all text-center block cursor-pointer">
                      <div className={`w-12 h-12 mx-auto bg-${hack.color}-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                         <hack.icon className={`w-6 h-6 text-${hack.color}-400`} />
                      </div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{hack.title}</h4>
                   </Link>
                 ))}
              </div>
           </div>
        </section>

        {/* ─── EXCLUSIVE PERKS: GLASSMORPHIC TILES ────────────────────────── */}
        <section id="premium" className="py-24 relative overflow-hidden">
           {/* BACKGROUND IMAGE WITH BLUR */}
           <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-black/60 z-10" />
              <img src="/premium_commute_bg_1778790601030.png" alt="Premium Background" className="w-full h-full object-cover" />
           </div>

           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[4rem] p-12 lg:p-20 shadow-2xl">
                 <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
                       EXCLUSIVE <span className="text-blue-400">PERKS.</span>
                    </h2>
                    <p className="text-xl font-black text-white/60 uppercase tracking-widest italic">WORTH ₹50,000+ IN BENEFITS</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* STANDARD */}
                    <div className="bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-all group">
                       <h3 className="text-xl font-black uppercase italic mb-6 text-white/40 group-hover:text-white">Standard</h3>
                       <ul className="space-y-4 mb-10">
                          {['Public Corridors', 'Standard Verify', 'Core Matching'].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[10px] font-black text-white/60 uppercase">
                               <CheckCircle2 className="w-4 h-4 text-blue-500" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/register" className="block w-full py-4 bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-white text-black transition-all">Join Free</Link>
                    </div>

                    {/* PREMIUM */}
                    <div className="bg-blue-600/20 border border-blue-400/40 p-10 rounded-3xl hover:bg-blue-600/30 transition-all group shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4"><Sparkles className="w-5 h-5 text-blue-400 animate-pulse" /></div>
                       <h3 className="text-xl font-black uppercase italic mb-6 text-blue-400">Premium</h3>
                       <ul className="space-y-4 mb-10">
                          {['AI Priority Match', 'Corporate Badge', 'Private Corridors'].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[10px] font-black text-white uppercase">
                               <ZapIcon className="w-4 h-4 text-blue-400" /> {f}
                            </li>
                          ))}
                       </ul>
                       <Link href="/exclusive-benefits" className="block w-full py-4 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-xl">Upgrade Now</Link>
                    </div>

                    {/* GOLD */}
                    <div className="bg-amber-500/20 border border-amber-400/40 p-10 rounded-3xl hover:bg-amber-500/30 transition-all group shadow-2xl">
                       <h3 className="text-xl font-black uppercase italic mb-6 text-amber-400">Gold</h3>
                       <ul className="space-y-4 mb-10">
                          {['Elite Profile Mark', 'Top Queue Access', 'Exec Networking'].map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-[10px] font-black text-amber-200/60 uppercase">
                               <Crown className="w-4 h-4 text-amber-500" /> {f}
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
           <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-[3rem] p-16 lg:p-32 text-center relative overflow-hidden group shadow-2xl">
              <div className="relative z-10">
                 <h2 className="text-4xl md:text-[8rem] font-black mb-10 tracking-tighter uppercase italic leading-[0.9] md:leading-[0.8] text-white">
                    THE FUTURE<br className="hidden md:block" /> IS SHARED.
                 </h2>
                 <Link href="/register" className="inline-block bg-white text-black px-12 py-6 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl active:scale-95">
                    Join Now
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
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
  };

  const c = colors[color];

  return (
    <div className="min-w-[280px] bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 snap-center hover:bg-white/[0.06] transition-all group">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${c}`}>
          <Icon className="w-7 h-7" />
       </div>
       <h3 className="text-xl font-black uppercase italic mb-2">{title}</h3>
       <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${c.split(' ')[0]}`}>{subtitle}</p>
       <p className="text-white/40 text-xs font-bold leading-tight">{desc}</p>
    </div>
  );
}

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
