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
  MonitorCheck, Verified, Glasses, Sparkle, Gauge, LifeBuoy
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
        {/* ─── HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
          <div className="container max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto text-center relative">
              <div className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                <Cpu className="w-4 h-4" /> The Intelligence Node for Every Commute
              </div>
              <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter mb-10 leading-[0.75] uppercase italic">
                MOVE WITH<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-gradient-x">PURE INTENT.</span>
              </h1>
              <p className="text-xl md:text-3xl text-white/50 font-bold mb-16 uppercase tracking-tight max-w-4xl mx-auto">
                 AI-Orchestrated Private Corridors. <br /> Structured. Secure. Superior.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                <Link href="/register" className="group relative px-16 py-7 bg-white text-black rounded-[3rem] font-black text-lg uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl active:scale-95 overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">Join the Syndicate <ArrowRight className="w-6 h-6" /></span>
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
                          <ShieldCheck className="w-5 h-5" /> THE FEMALE SAFETY PROTOCOL
                       </div>
                       <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] mb-12">
                          PEACE OF MIND.<br />
                          <span className="text-purple-400">ENGINEERED.</span>
                       </h2>
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

        {/* ─── URBAN OPTIMIZATION MASTER MATRIX (V10.3) ────────────────────────── */}
        <section id="optimization" className="py-60 relative overflow-hidden">
           <div className="container max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-end justify-between mb-40 gap-10">
                 <div className="text-left">
                    <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">MACRO URBAN EFFICIENCY</p>
                    <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8] mb-12">
                       URBAN<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">OPTIMIZATION.</span>
                    </h2>
                    <p className="text-xl md:text-3xl text-slate-500 font-bold max-w-4xl uppercase italic leading-tight">
                       High-performance infrastructure for the <span className="text-white">Modern Professional.</span> Every node is a multiplier.
                    </p>
                 </div>
              </div>

              {/* THE MASTER GRID (Curated 10 Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                 
                 {/* 1. MONSOON SHIELD */}
                 <OptimizationCard 
                    tag="[SEASONAL SHIELD]" 
                    title="Monsoon Node" 
                    subtitle="STORM-READY COMMUTE"
                    desc="Skip the mud, the splashes, and the auto-rickshaw hunt. Travel in a climate-controlled car corridor while the city stalls."
                    icon={Umbrella}
                    metric="ZERO CANCELLATIONS"
                    color="blue"
                    badge="ACTIVE"
                 />

                 {/* 2. EXECUTIVE SYNERGY (Re-worded "Elite Growth") */}
                 <OptimizationCard 
                    tag="[ELITE NETWORK]" 
                    title="Peer Synergy" 
                    subtitle="PROFESSIONAL PROXIMITY"
                    desc="Match with senior architects, VPs, and founders from your own society. Turn dead commute time into high-value networking."
                    icon={Network}
                    metric="98% PEER MATCH"
                    color="amber"
                    badge="PREMIUM"
                 />

                 {/* 3. FEMALE SAFETY (Re-integrated) */}
                 <OptimizationCard 
                    tag="[SAFETY PROTOCOL]" 
                    title="Guardian Node" 
                    subtitle="COMMUNITY VERIFIED"
                    desc="Match exclusively within your verified corporate network and society. Real-time family tracking included for total peace of mind."
                    icon={ShieldCheck}
                    metric="100% VETTED"
                    color="purple"
                    badge="SECURE"
                 />

                 {/* 4. SENIOR MOBILITY (NEW) */}
                 <OptimizationCard 
                    tag="[EASY ACCESS]" 
                    title="Silver Corridor" 
                    subtitle="ELDER MOBILITY NODE"
                    desc="Helping seniors reclaim independence without the stress of driving. Door-to-door car corridors with vetted, respectful hosts."
                    icon={HeartPulse}
                    metric="STRESS FREE"
                    color="red"
                    badge="NEW"
                 />

                 {/* 5. HEALTH & CLIMATE */}
                 <OptimizationCard 
                    tag="[HEALTH SHIELD]" 
                    title="Biotic Node" 
                    subtitle="CLIMATE CONTROL"
                    desc="Protection from heat strokes, city dust, and pollution. Arrive at your destination 100% fresh and cognitive-ready."
                    icon={ThermometerSun}
                    metric="-40% STRESS"
                    color="cyan"
                 />

                 {/* 6. ZEN SABBATICAL */}
                 <OptimizationCard 
                    tag="[MENTAL HEALTH]" 
                    title="Zen Corridor" 
                    subtitle="THE COMMUTE SABBATICAL"
                    desc="Stop fighting traffic. Use your commute to listen, read, or meditate. Reclaim 2 hours of your life for deep mental restoration."
                    icon={VolumeX}
                    metric="ZEN READY"
                    color="indigo"
                 />

                 {/* 7. BIKE-TO-CAR PARITY */}
                 <OptimizationCard 
                    tag="[SAFETY PARITY]" 
                    title="Fleet Upgrade" 
                    subtitle="CAR SAFETY, BIKE PRICES"
                    desc="Own a bike but prefer car safety during peak traffic? Travel in premium car corridors at prices equivalent to your bike fuel."
                    icon={Bike}
                    metric="₹ FUEL PARITY"
                    color="orange"
                 />

                 {/* 8. NEXUS LOGIC (Organizing Chaos) */}
                 <OptimizationCard 
                    tag="[INFRASTRUCTURE]" 
                    title="Nexus Logic" 
                    subtitle="ORGANIZING THE CHAOS"
                    desc="No more scrolling through unorganized chat groups. We provide the structured setup that chat groups simply can't offer."
                    icon={LayoutGrid}
                    metric="ZERO SPAM"
                    color="pink"
                 />

                 {/* 9. EV GENESIS */}
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

                 {/* 10. WEALTH LEDGER */}
                 <OptimizationCard 
                    tag="[FINANCE NODE]" 
                    title="Wealth Ledger" 
                    subtitle="SURGE PROTECTION"
                    desc="Avoid unpredictable Ola/Uber surge pricing. Keep your commute expenses fixed, simple, and secured within the Syndicate Ledger."
                    icon={Coins}
                    metric="NO SURGE"
                    color="emerald"
                 />

              </div>

              {/* SECURE COMMS & PAYMENTS ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
                 <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-10 flex flex-col md:flex-row items-center gap-10 text-left group hover:bg-white/[0.06] transition-all">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] flex-shrink-0 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                       <Lock className="w-12 h-12 text-blue-400" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black uppercase italic mb-2">Secured Transmissions</h4>
                       <p className="text-slate-400 text-sm font-bold leading-relaxed">Identity remains a ghost until you confirm a node match. End-to-end encrypted comms only.</p>
                       <div className="flex items-center gap-2 mt-4 text-[8px] font-black text-blue-400 uppercase tracking-widest">
                          <Fingerprint className="w-3 h-3" /> VERIFIED CRYPTO-NODE
                       </div>
                    </div>
                 </div>

                 <div className="bg-white/[0.03] border border-white/5 rounded-[4rem] p-10 flex flex-col md:flex-row items-center gap-10 text-left group hover:bg-white/[0.06] transition-all">
                    <div className="w-24 h-24 bg-green-600/10 rounded-[2.5rem] flex-shrink-0 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-12 h-12 text-green-400" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black uppercase italic mb-2">Platform Ledger</h4>
                       <p className="text-slate-400 text-sm font-bold leading-relaxed">Secure, simple, and one-click settlements via UPI. No cash, no debt, no awkwardness.</p>
                       <div className="flex items-center gap-2 mt-4 text-[8px] font-black text-green-400 uppercase tracking-widest">
                          <Banknote className="w-3 h-3" /> SECURE SETTLEMENT ENGINE
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── THE SHIFT ────────────────────────── */}
        <section id="shift" className="py-20 relative border-t border-white/5">
           <div className="container max-w-7xl mx-auto px-6 text-left">
              <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE SYSTEMIC NEXUS</p>
              <h2 className="text-6xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.8] mb-40">
                 FROM CHAOS TO<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">INFRASTRUCTURE.</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                 <div className="bg-white/[0.02] border border-white/5 rounded-[5rem] p-12">
                    <h3 className="text-3xl font-black uppercase italic mb-10">THE CHAOS</h3>
                    <div className="space-y-6 opacity-40 grayscale">
                       {['Unvetted Chat Groups', 'Phone Numbers Leaked', 'Unpredictable Pricing', 'Safety Hazards'].map((t, i) => (
                         <div key={i} className="flex items-center gap-4 py-4 border-b border-white/5">
                            <XCircle className="w-5 h-5 text-red-500" /> <span className="font-bold text-xl uppercase italic">{t}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-blue-600/10 border border-blue-500/20 rounded-[5rem] p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 opacity-5">
                       <ZapIcon className="w-64 h-64 text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-black uppercase italic mb-10">THE SYNDICATE</h3>
                    <div className="space-y-6">
                       {['Society Verified Nodes', 'Masked Identity', 'Fixed Ledger Rates', 'Emergency SOS Grid'].map((t, i) => (
                         <div key={i} className="flex items-center gap-4 py-4 border-b border-blue-500/10">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" /> <span className="font-bold text-xl uppercase italic">{t}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── FINAL CTA ────────────────────────── */}
        <section className="container max-w-7xl mx-auto px-6 pb-40 pt-40">
           <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 rounded-[5rem] p-24 md:p-40 text-center relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(59,130,246,0.4)]">
              <div className="relative z-10">
                 <h2 className="text-6xl md:text-[10rem] font-black mb-12 tracking-tighter uppercase italic leading-[0.8]">
                    THE FUTURE<br />IS SHARED.
                 </h2>
                 <Link href="/register" className="bg-white text-black px-20 py-8 rounded-[3rem] text-xl font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all shadow-2xl active:scale-95">
                    Claim Your Node
                 </Link>
              </div>
           </div>
        </section>
      </main>

      <footer className="container mx-auto px-6 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">© 2026 JOOL TECHNOLOGY SYNDICATE • V10.3</p>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
           </div>
        </div>
      </footer>
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
       {/* Realism Elements */}
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

       {/* Interactive Bottom Bar */}
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
