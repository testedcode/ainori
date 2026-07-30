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
            <div className="w-10 h-10 bg-transparent flex items-center justify-center group-hover:rotate-12 transition-transform relative">
              <img src="/pulse_logo.png" alt="Pulse Logo" className="w-10 h-10 object-contain relative z-10" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tighter leading-none">Pulse</span>
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
                {/* Desktop: Get Started */}
                <Link href="/register" className="hidden sm:inline-block group relative px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-slate-900 transition-all shadow-xl active:scale-95 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">Get Started <ArrowRight className="w-5 h-5" /></span>
                </Link>
                {/* Mobile: Login */}
                <Link href="/login" className="sm:hidden group relative px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-slate-900 transition-all shadow-xl active:scale-95 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">Login <ArrowRight className="w-5 h-5" /></span>
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

        {/* ─── THE CORE PILLARS: BENTO GRID (LIGHT) ────────────────────────── */}
        <section id="shift" className="py-24 relative overflow-hidden bg-slate-50">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none text-slate-900">
                    A NEW <span className="text-blue-600">STANDARD.</span>
                 </h2>
                 <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mt-4">LEAVE THE CHAOS BEHIND</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                 
                 {/* PEACE OF MIND (Wide Bento) */}
                 <div className="md:col-span-8 relative overflow-hidden bg-white border border-blue-200 rounded-[2.5rem] p-10 group shadow-[0_20px_40px_rgba(59,130,246,0.05)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.15)] transition-all">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-100 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-200 transition-all" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                       <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 text-blue-600">
                             <ShieldCheck className="w-3.5 h-3.5" /> SECURITY PROTOCOLS
                          </div>
                          <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none mb-8 text-slate-900">
                             PEACE OF <span className="text-blue-600">MIND.</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {[
                               { title: 'Verified Corporate Network', desc: 'Every user is vetted' },
                               { title: 'Same-Society Matching', desc: 'Commute with neighbors' },
                               { title: 'Live Family Tracking', desc: 'Share your exact coordinates' },
                               { title: 'Encrypted Comms', desc: 'No personal numbers shared' }
                             ].map((feat, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-blue-50/50 transition-all">
                                   <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
                                   <div>
                                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">{feat.title}</h4>
                                      <p className="text-[10px] text-slate-500">{feat.desc}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* THE CHAOS (Tall Bento) */}
                 <div className="md:col-span-4 relative overflow-hidden bg-rose-50/50 border border-rose-200 rounded-[2.5rem] p-10 flex flex-col group shadow-[0_20px_40px_rgba(225,29,72,0.05)] hover:shadow-[0_20px_60px_rgba(225,29,72,0.15)] transition-all">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none">
                       <ZapOff className="w-64 h-64 text-rose-500" />
                    </div>
                    <div className="relative z-10 flex-1">
                       <h3 className="text-xl font-black uppercase italic text-rose-600 mb-6 tracking-widest flex items-center gap-3">
                          <XCircle className="w-5 h-5" /> THE CHAOS
                       </h3>
                       <p className="text-sm font-medium text-slate-600 mb-8 leading-relaxed">
                          Say goodbye to fragile coordinates, unverified profiles, high-friction chats, and uncontrolled surge fares.
                       </p>
                       <div className="space-y-3">
                          {[
                            'Strangers in groups',
                            'Identity privacy leaks',
                            'Unpredictable pricing'
                          ].map((item, i) => (
                             <div key={i} className="flex items-center gap-3 p-3 bg-white border border-rose-100 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{item}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* ─── POPULAR JOURNEYS: REDESIGNED CAROUSEL (LIGHT) ────────────────────────── */}
        <section id="optimization" className="py-24 relative overflow-hidden bg-white">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                 <div>
                    <p className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5" /> ROUTE INTELLIGENCE
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase leading-none text-slate-900">
                       POPULAR <span className="text-blue-600">CORRIDORS.</span>
                    </h2>
                 </div>
                 <div className="hidden md:flex gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"><ChevronRight className="rotate-180" /></div>
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"><ChevronRight /></div>
                 </div>
              </div>

              <div className="flex gap-6 overflow-x-auto pb-12 snap-x no-scrollbar">
                 <OptimizationBentoCard 
                    title="Casa Rio → RCP" 
                    subtitle="30+ RIDES DAILY"
                    desc="Direct society-to-office link for corporate professionals."
                    icon={Navigation}
                    color="blue"
                 />
                 <OptimizationBentoCard 
                    title="Casa Bella → RCP" 
                    subtitle="25+ RIDES DAILY"
                    desc="Smooth neighborly commute with verified peers."
                    icon={Workflow}
                    color="amber"
                 />
                 <OptimizationBentoCard 
                    title="Kharghar → RCP" 
                    subtitle="15+ RIDES DAILY"
                    desc="Connecting major corporate hubs effortlessly."
                    icon={Activity}
                    color="purple"
                 />
                 <OptimizationBentoCard 
                    title="Custom Route" 
                    subtitle="FLEXIBLE MATCHING"
                    desc="Set your own origin and destination to find peers."
                    icon={Search}
                    color="cyan"
                 />
              </div>
           </div>
        </section>

        {/* ─── COMMUNITY ETIQUETTE: INTERACTIVE CARDS (LIGHT) ────────────────────────── */}
        <section id="hacks" className="py-32 bg-slate-50 relative overflow-hidden">
           {/* Background glow */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-200/40 blur-[120px] rounded-full pointer-events-none" />
           
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-20">
                 <p className="text-purple-600 font-black text-[9px] uppercase tracking-[0.4em] mb-4">THE PULSE CULTURE</p>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-slate-900">
                    RIDE <span className="text-purple-600">ETIQUETTE.</span>
                 </h2>
                 <p className="mt-6 text-slate-600 text-sm max-w-2xl mx-auto font-medium">Simple rules that make every commute enjoyable. A respectful community is a thriving community.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { title: 'The Greeting', desc: 'A simple "Hello" sets the perfect tone for the trip.', icon: Smile, color: 'blue' },
                   { title: 'Silent Zones', desc: 'Use headphones for media. Keep calls extremely brief.', icon: VolumeX, color: 'purple' },
                   { title: 'Instant UPI', desc: 'Settle the ride costs immediately. Zero friction.', icon: Banknote, color: 'green' },
                   { title: 'Boundaries', desc: 'Respect privacy. No unsolicited corporate pitching.', icon: ShieldCheck, color: 'red' },
                   { title: 'Punctuality', desc: 'Your peers are professionals. Every minute counts.', icon: Clock, color: 'amber' },
                   { title: 'No Spam', desc: 'Never forward promotional content to ride partners.', icon: Radio, color: 'cyan' }
                 ].map((hack, i) => (
                   <div key={i} className="group relative bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 hover:bg-white transition-all overflow-hidden cursor-default shadow-sm hover:shadow-xl hover:-translate-y-1">
                      {/* Hover Gradient Border Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                      
                      <div className={`w-14 h-14 bg-${hack.color}-50 border border-${hack.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                         <hack.icon className={`w-7 h-7 text-${hack.color}-500`} />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-3">{hack.title}</h4>
                      <p className="text-slate-600 text-xs leading-relaxed font-medium">{hack.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* ─── EXCLUSIVE PERKS: REDESIGNED TIERS (LIGHT) ────────────────────────── */}
        <section id="premium" className="py-32 relative overflow-hidden bg-white">
           {/* High fidelity background */}
           <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white/80 to-slate-50 z-10" />
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-[0.15] mix-blend-luminosity grayscale" />
           </div>

           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-24">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-600 backdrop-blur-md mb-8 shadow-sm">
                    <Gem className="w-3.5 h-3.5 text-blue-600" /> UNLOCK MORE
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6 drop-shadow-xl">
                    EXCLUSIVE <span className="text-blue-600">PERKS.</span>
                 </h2>
                 <p className="text-lg font-black text-blue-600 uppercase tracking-widest italic drop-shadow-sm">WORTH ₹50,000+ IN ADDED VALUE</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                 {/* STANDARD TIER */}
                 <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 p-10 rounded-[2.5rem] hover:bg-white transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg">
                    <div>
                       <h3 className="text-2xl font-black uppercase italic mb-2 text-slate-500 group-hover:text-slate-900 transition-colors">Standard</h3>
                       <p className="text-xs text-slate-400 mb-8 font-medium">For the everyday commuter.</p>
                       <ul className="space-y-4 mb-10">
                          {['Access to Public Corridors', 'Standard Verification', 'Core AI Matching'].map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-700 uppercase">
                               <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> {f}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <Link href="/register" className="block w-full py-5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-slate-100 text-slate-700 transition-all">Join Free</Link>
                 </div>

                 {/* PREMIUM TIER (Highlighted) */}
                 <div className="bg-gradient-to-b from-blue-50 to-white backdrop-blur-2xl border border-blue-200 p-10 rounded-[2.5rem] relative overflow-hidden group shadow-[0_20px_60px_rgba(59,130,246,0.15)] transform md:-translate-y-4">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    <div className="absolute top-0 right-0 p-6"><Sparkles className="w-6 h-6 text-blue-500 animate-pulse" /></div>
                    
                    <div className="h-full flex flex-col justify-between relative z-10">
                       <div>
                          <h3 className="text-3xl font-black uppercase italic mb-2 text-blue-600">Premium</h3>
                          <p className="text-xs text-blue-600/70 mb-8 font-medium">The ultimate corporate commute.</p>
                          <ul className="space-y-4 mb-10">
                             {['Priority AI Match Routing', 'Verified Corporate Badge', 'Private Society Corridors', 'Dedicated Support'].map((f, i) => (
                               <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-900 uppercase">
                                  <ZapIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> {f}
                               </li>
                             ))}
                          </ul>
                       </div>
                       <Link href="/exclusive-benefits" className="block w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-blue-500 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)] hover:shadow-[0_10px_40px_rgba(37,99,235,0.3)]">Upgrade Now</Link>
                    </div>
                 </div>

                 {/* GOLD TIER */}
                 <div className="bg-gradient-to-b from-amber-50 to-white backdrop-blur-2xl border border-amber-200 p-10 rounded-[2.5rem] hover:shadow-xl transition-all flex flex-col justify-between group shadow-sm">
                    <div>
                       <h3 className="text-2xl font-black uppercase italic mb-2 text-amber-600/80 group-hover:text-amber-600 transition-colors">Gold</h3>
                       <p className="text-xs text-amber-600/60 mb-8 font-medium">For executives & founders.</p>
                       <ul className="space-y-4 mb-10">
                          {['Elite Profile Distinction', 'Top Queue Matching', 'Executive Networking', 'Lifestyle Perks'].map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs font-bold text-amber-900/80 uppercase">
                               <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> {f}
                            </li>
                          ))}
                       </ul>
                    </div>
                    <Link href="/profile" className="block w-full py-5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)]">Explore Gold</Link>
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
    <div className="min-w-[320px] bg-white border border-slate-200 rounded-[2rem] p-8 snap-center hover:bg-slate-50 hover:shadow-lg transition-all group shadow-sm">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${c} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
          <Icon className="w-7 h-7" />
       </div>
       <h3 className="text-2xl font-black uppercase italic mb-2 text-slate-900">{title}</h3>
       <p className={`text-[10px] font-black uppercase tracking-widest mb-4 ${c.split(' ')[0]}`}>{subtitle}</p>
       <p className="text-slate-600 text-xs font-medium leading-relaxed">{desc}</p>
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
