'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, Shield, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, ChevronRight, CheckCircle2,
  Lock, Zap, Star, Users, ShieldCheck, Gem, Crown,
  XCircle, AlertCircle, MessageSquare, VolumeX, Handshake, Smile, Heart
} from 'lucide-react';
import { api } from '@/lib/api';
import { getVibe, VIBE_THEMES, VibeState } from '@/lib/vibe-utils';

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
      {/* Background Texture & Pattern */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] -z-10 pointer-events-none" />
      
      {/* Dynamic Vibe Background Glow */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full h-[800px] blur-[150px] -z-10 pointer-events-none transition-all duration-1000 ${theme.glow}`} />
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/5 blur-[180px] -z-10 rounded-full animate-pulse" />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-500/5 blur-[180px] -z-10 rounded-full animate-pulse" />
      {/* Premium Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 px-6 md:px-12 py-4 flex justify-between items-center ${
        scrolled ? 'bg-[#0f172a]/80 backdrop-blur-2xl border-b border-white/5 py-3' : 'bg-transparent'
      }`}>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">JOOL</span>
            <span className="text-[8px] font-black tracking-[0.3em] text-blue-500 uppercase">Premium Commute</span>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
          <Link href="#safety" className="hover:text-white transition-colors">Safety Nets</Link>
          <Link href="#premium" className="hover:text-white transition-colors">Premium</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="px-5 py-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors text-slate-400">Log in</Link>
          <Link href="/register" className="bg-white text-black hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5 active:scale-95">Get Started</Link>
        </div>
      </nav>

      <main>
      <main>
        {/* ─── PREMIUM IDENTITY HERO (VERIFIED ONLY) ────────────────────────── */}
        {user?.approved ? (
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Elite Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/10 via-transparent to-transparent -z-10" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent -z-10" />
            
            <div className="container mx-auto px-6 relative z-10">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                  {/* Left: Identity Briefing */}
                  <div className="lg:col-span-7">
                     <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-amber-500 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <Crown className="w-4 h-4" /> SECURE EXECUTIVE ACCESS GRANTED
                     </div>
                     <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85] uppercase italic">
                        COMMANDING<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 animate-gradient-x">THE FLOW.</span>
                     </h1>
                     <p className="max-w-2xl text-xl text-white/50 font-bold mb-12 uppercase tracking-wide leading-relaxed">
                        Welcome back to the Syndicate, {user.name.split(' ')[0]}. Your priority corridor is initialized and AI orchestration is standing by.
                     </p>
                     
                     <div className="flex flex-wrap gap-6">
                        <Link href="/find-ride" className="px-12 py-6 bg-amber-500 text-black rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-amber-400 transition-all shadow-[0_20px_60px_rgba(245,158,11,0.4)] active:scale-95 flex items-center gap-3">
                           Initialize Ride <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link href="/exclusive-benefits" className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3">
                           <Gem className="w-5 h-5 text-amber-500" /> Executive Vault
                        </Link>
                     </div>
                  </div>

                  {/* Right: Holographic Status Node */}
                  <div className="lg:col-span-5 relative">
                     <div className="relative bg-white/[0.03] border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-2xl overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                           <ShieldCheck className="w-64 h-64" />
                        </div>
                        
                        <div className="flex items-center gap-6 mb-12">
                           <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-amber-500 to-orange-600 p-1 shadow-2xl">
                              <div className="w-full h-full rounded-[1.8rem] bg-slate-900 overflow-hidden">
                                 {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/20">{user.name[0]}</div>}
                              </div>
                           </div>
                           <div>
                              <h4 className="text-2xl font-black italic uppercase text-white leading-none mb-1">{user.name}</h4>
                              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">ELITE EXECUTIVE NODE L3</p>
                           </div>
                        </div>

                        <div className="space-y-8">
                           <div className="flex justify-between items-end border-b border-white/5 pb-6">
                              <div>
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Network Priority</p>
                                 <p className="text-2xl font-black text-blue-400">98.4%</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Status</p>
                                 <p className="text-xs font-black text-green-500 uppercase tracking-widest">Authorized</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Sync Latency</p>
                                 <p className="text-sm font-black italic">0.2ms</p>
                              </div>
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Trust Score</p>
                                 <p className="text-sm font-black italic">4.9/5.0</p>
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* Floating Accents */}
                     <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 blur-[60px] -z-10 animate-pulse" />
                     <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 blur-[60px] -z-10 animate-pulse" />
                  </div>
               </div>
            </div>
          </section>
        ) : (
          /* ─── DYNAMIC HERO SECTION (STANDARD) ────────────────────────── */
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
            {/* Background Elements */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b ${theme.heroGradient} -z-10`} />
            
            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-blue-400">
                  <ShieldCheck className="w-4 h-4" /> Secure Office Commute Corridor
                </div>
                
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.85] uppercase italic">
                  Mumbai's<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400 animate-gradient-x">Elite Grid.</span>
                </h1>
                
                <p className="text-xl md:text-3xl text-white/50 font-bold mb-16 uppercase tracking-wide leading-relaxed">
                  The private corridor for professionals.<br />
                  <span className="text-blue-500/80">Palava • RCP • MBP • LODHA iTHINK</span>
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
            </div>
          </section>
        )}
        
        {/* ─── EXECUTIVE MOTION DASHBOARD (FOR VERIFIED) ────────────────── */}
        {user?.approved && (
          <section className="container mx-auto px-6 py-12">
             <div className="bg-gradient-to-br from-blue-600/20 via-white/[0.02] to-transparent border border-white/20 rounded-[4rem] p-12 md:p-20 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                   <ShieldCheck className="w-96 h-96" />
                </div>
                
                <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10">
                   {/* Identity Briefing */}
                   <div className="flex-1 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                         <Shield className="w-3.5 h-3.5" /> SYSTEM BRIEFING
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 italic uppercase">EXECUTIVE MOTION.</h2>
                      <p className="text-lg text-white/40 font-bold mb-8 uppercase tracking-widest">Active Corridor Authorization: Full Sector Access</p>
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                         <Link href="/find-ride" className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-2xl">
                            Request Priority Ride
                         </Link>
                         <Link href="/profile" className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-white/10 transition-all">
                            Syndicate Vault
                         </Link>
                      </div>
                   </div>

                   {/* Vehicle Node (Surprise Element) */}
                   <div className="lg:w-1/3 w-full">
                      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 relative group/car overflow-hidden">
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">Your Executive Fleet</p>
                         {vehicles.length > 0 ? (
                           <div className="space-y-4">
                              <div className="aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                                 <img src={vehicles[0].image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80'} className="w-full h-full object-cover group-hover/car:scale-110 transition-transform duration-700" />
                              </div>
                              <div className="flex justify-between items-end">
                                 <div>
                                    <h5 className="font-black text-white uppercase italic">{vehicles[0].make} {vehicles[0].model}</h5>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{vehicles[0].vehicle_number}</p>
                                 </div>
                                 <span className="text-[8px] font-black bg-blue-600/20 text-blue-400 px-2 py-1 rounded-md uppercase">Primary Node</span>
                              </div>
                           </div>
                         ) : (
                           <div className="text-center py-10 opacity-30">
                              <Car className="w-12 h-12 mx-auto mb-4" />
                              <p className="text-[10px] font-black uppercase tracking-widest">No vehicle synchronized</p>
                              <Link href="/profile" className="text-[8px] text-blue-400 underline mt-2 inline-block">Add Vehicle</Link>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </section>
        )}

        {/* ─── DYNAMIC HERO SECTION ────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
          
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="lg:w-3/5 text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-10">
                  <Sparkles className="w-3 h-3" />
                  <span>The Future of Professional Commute</span>
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter mb-8 leading-[0.85] text-white uppercase italic">
                  SMASH THE<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">CHAOTIC MESH.</span>
                </h1>
                
                <p className="max-w-xl text-slate-400 text-lg md:text-xl mb-12 leading-relaxed font-medium">
                  Stop leaking your privacy in unverified chat groups. JOOL is the elite orchestration engine for Mumbai's professional corridors. Secure, synced, and sustainable.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Link href="/find-ride" className="w-full sm:w-auto group bg-blue-600 text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/30">
                    Join a Corridor <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>
                  <Link href="/register" className="w-full sm:w-auto text-center bg-white/5 backdrop-blur-md border border-white/10 text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Apply for Verification
                  </Link>
                </div>
              </div>

              {/* Visual Side: The Floating Card */}
              <div className="lg:w-2/5 relative group perspective-1000">
                <div className="absolute inset-0 bg-blue-600/20 blur-[100px] -z-10 group-hover:bg-blue-600/30 transition-all" />
                <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-3xl border border-white/20 p-8 rounded-[3rem] shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Car className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Secure Ride</span>
                    </div>
                    <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] font-black text-green-400 uppercase tracking-widest">
                      JOOL Verified
                    </div>
                  </div>
                  
                  <div className="space-y-6 mb-10">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 uppercase font-black">Corridor</span>
                      <span className="text-sm font-bold">Casa Rio → RCP</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 uppercase font-black">Departure</span>
                      <span className="text-sm font-bold">08:45 AM</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <span className="text-[10px] text-white/40 uppercase font-black">Identity Node</span>
                      <span className="text-sm font-bold flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400" /> Professional Node 0x4F
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                     <span className="text-lg font-black tracking-widest uppercase italic">GJ 05 JK 7732</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Counter */}
            <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-white/5 pt-16">
               {[
                 { v: stats.live_users, l: 'Live Syncing', c: 'text-blue-500', sub: 'Active Nodes' },
                 { v: stats.rides_today, l: 'Daily Trips', c: 'text-white', sub: 'Corridor Capacity' },
                 { v: stats.carbon_saved.split(' ')[0], l: 'Tons CO₂ Saved', c: 'text-green-500', sub: 'Planet Positive' },
                 { v: stats.trees_saved, l: 'Trees Saved', c: 'text-green-400', sub: 'Impact Score' }
               ].map((item, i) => (
                 <div key={i} className="text-center md:text-left">
                    <p className={`text-4xl lg:text-6xl font-black ${item.c} leading-none mb-3`}>{item.v}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">{item.l}</p>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{item.sub}</p>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* ─── THE EXPOSE BANNER ────────────────────────────────────────── */}
        <section className="bg-red-600/5 border-y border-red-500/10 py-32 overflow-hidden relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
           <div className="container mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                 <div className="lg:w-1/2">
                    <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE VULNERABILITY NEXUS</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 italic uppercase leading-none">
                       YOUR DATA IS<br /><span className="text-red-500">PUBLIC PROPERTY.</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                       Chat groups are not a platform; they are an open leak. Your phone number, home location, and commute patterns are harvested by thousands of unverified strangers every day.
                    </p>
                    <div className="space-y-4">
                       {[
                         { t: 'Public Phone Numbers', d: 'Stalked by anyone in the group without verification.' },
                         { t: 'Fixed Schedule Exposure', d: 'Revealing your "In-Out" times to anonymous observers.' },
                         { t: 'Unauthorized Intruders', d: 'Zero control over who joins or harvests data from the group.' }
                       ].map((item, i) => (
                         <div key={i} className="flex gap-4 p-5 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <div>
                               <p className="text-xs font-black uppercase text-white">{item.t}</p>
                               <p className="text-[10px] text-white/40 font-medium mt-1">{item.d}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="lg:w-1/2 relative group">
                    <div className="absolute inset-0 bg-red-500/10 blur-[100px] -z-10" />
                    <div className="bg-[#080d1b] border border-red-500/20 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
                       <div className="space-y-6 opacity-30 blur-[1px]">
                          <div className="bg-white/5 p-4 rounded-xl">"8:45 AM | GJ 05 JK 7732 | GPay: 98108xxxxx..."</div>
                          <div className="bg-white/5 p-4 rounded-xl">"Tomorrow 1 seat available, Casario to RCP..."</div>
                          <div className="bg-white/5 p-4 rounded-xl">"Ping me personally to join..."</div>
                       </div>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="px-8 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-full shadow-2xl">
                             DATA LEAK DETECTED
                          </div>
                       </div>
                    </div>
                    <div className="mt-8 text-center">
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">SIMULATED CHAT VULNERABILITY</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── THE PLATFORM BENEFITS ─────────────────────────────────────── */}
        <section id="safety" className="py-40 relative">
           <div className="container mx-auto px-6">
              <div className="text-center mb-32">
                 <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">THE JOOL INFRASTRUCTURE</p>
                 <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase italic leading-none">
                    ENGINEERED FOR<br />THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">SYNDICATE.</span>
                 </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {[
                   { icon: ShieldCheck, title: 'Identity Nodes', desc: 'Every participant is multi-node verified. We eliminate the "anonymous intruder" completely.', color: 'from-blue-600/20 to-transparent' },
                   { icon: Lock, title: 'Stealth Discovery', desc: 'Your trip details only unlock for confirmed partners. You stay invisible to the crowd.', color: 'from-indigo-600/20 to-transparent' },
                   { icon: Zap, title: 'Corridor Sync', desc: 'Real-time AI-optimized departure nodes. No searching through messy group messages.', color: 'from-blue-500/20 to-transparent' }
                 ].map((net, idx) => (
                   <div key={idx} className={`bg-gradient-to-br ${net.color} border border-white/10 p-12 rounded-[4rem] hover:bg-white/5 transition-all group relative overflow-hidden`}>
                      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-12 group-hover:scale-110 transition-transform">
                         <net.icon className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-3xl font-black mb-6 uppercase tracking-tight italic">{net.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">{net.desc}</p>
                      <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                         <net.icon className="w-40 h-40" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Premium Features & Verified Travellers */}
        <section id="premium" className="container mx-auto px-6 py-32">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mb-24">
              <div className="lg:w-1/2">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[9px] font-black uppercase tracking-widest rounded-lg mb-6">
                    <Gem className="w-3 h-3" /> LUXURY STANDARDS
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight uppercase italic">
                    THE PREMIUM<br />DIFFERENCE.
                 </h2>
                 <ul className="space-y-4">
                    {[
                      'High-end sedans and SUVs for ultimate comfort.',
                      'A-grade professionals and corporate colleagues only.',
                      'Punctuality tracking with AI-adjusted departure nodes.',
                      'Climate-controlled, scent-optimized environments.',
                      'Silent commute or networking modes available.'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-slate-400 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                 </ul>
              </div>
              <div className="lg:w-1/2 w-full">
                 <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-white/10 rounded-[4rem] p-10 md:p-14">
                    <p className="text-[10px] font-black text-white/40 tracking-[0.3em] mb-10 uppercase">Trusted Participants</p>
                    <div className="space-y-6">
                       {[
                         { name: 'Aditi Sharma', role: 'Sr. Product Manager', score: 9.9, img: 'AS' },
                         { name: 'Dr. Rohan Mehra', role: 'Lead Architect', score: 9.8, img: 'RM' },
                         { name: 'Sanjay Kapoor', role: 'VP Operations', score: 9.7, img: 'SK' }
                       ].map((user, idx) => (
                         <div key={idx} className="flex items-center justify-between bg-[#060b18]/60 p-5 rounded-[2rem] border border-white/5">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-sm">{user.img}</div>
                               <div>
                                  <h5 className="font-black text-white text-sm uppercase tracking-tight">{user.name}</h5>
                                  <p className="text-[10px] text-slate-500 font-bold">{user.role}</p>
                               </div>
                            </div>
                            <div className="flex flex-col items-end">
                               <div className="flex items-center gap-1 text-yellow-500">
                                  <Star className="w-3 h-3 fill-yellow-500" />
                                  <span className="text-xs font-black">{user.score}</span>
                               </div>
                               <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">TRUST SCORE</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* ─── HAPPY RIDE HACKS ─────────────────────────────────────────── */}
        <section id="hacks" className="container mx-auto px-6 py-32 border-t border-white/5">
           <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-20">
              <div className="md:w-2/3">
                 <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">OPTIMIZATION PROTOCOLS</p>
                 <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                    HAPPY RIDE<br /><span className="text-blue-500 italic">HACKS.</span>
                 </h2>
              </div>
              <Link href="/hacks" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                 View Full Playbook <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Treat with Greet', d: 'A smile is the best commute start. Be the energy you want to ride with.', icon: Smile, color: 'bg-blue-500/10 text-blue-400' },
                { title: 'The Silent Node', d: 'Respect "No Yelling" and low volume. Use headphones for calls.', icon: VolumeX, color: 'bg-purple-500/10 text-purple-400' },
                { title: 'In-Ride Settle', d: 'Settle via UPI during the ride. Zero debt, zero friction.', icon: Banknote, color: 'bg-green-500/10 text-green-400' },
                { title: 'Nexus Integrity', d: 'Never share personal numbers in groups. Keep it secure in JOOL.', icon: ShieldCheck, color: 'bg-red-500/10 text-red-400' },
                { title: 'Time Discipline', d: 'Departure nodes are strict. Follow time or update via chat.', icon: Clock, color: 'bg-amber-500/10 text-amber-400' },
                { title: 'Social Respect', d: 'Respect personal space. No unauthorized recordings or photos.', icon: Lock, color: 'bg-indigo-500/10 text-indigo-400' },
                { title: 'Zero Spam Signal', d: 'Signal only. No promotions or unnecessary group celebrations.', icon: Zap, color: 'bg-yellow-500/10 text-yellow-400' },
                { title: 'The Punctual Shake', d: 'Early is on time. Respect the ride provider\'s corridor schedule.', icon: Handshake, color: 'bg-cyan-500/10 text-cyan-400' }
              ].map((hack, i) => (
                <div key={i} className="group bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] hover:bg-white/[0.05] transition-all relative overflow-hidden">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${hack.color}`}>
                      <hack.icon className="w-7 h-7" />
                   </div>
                   <h4 className="font-black text-white text-lg uppercase tracking-tight mb-4">{hack.title}</h4>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed">{hack.d}</p>
                   {/* Abstract pictorial element */}
                   <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                      <hack.icon className="w-24 h-24" />
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 pb-40">
           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden group shadow-2xl shadow-blue-600/30">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
              
              <h2 className="text-4xl md:text-7xl font-black mb-10 relative z-10 tracking-tighter uppercase italic leading-none">
                 REDEFINE YOUR<br />MOTION.
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                 <Link href="/register" className="bg-white text-black px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-200 transition-all shadow-2xl active:scale-95">
                    Apply for Verification
                 </Link>
                 <Link href="/find-ride" className="bg-transparent border-2 border-white/30 text-white px-12 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
                    Explore Routes
                 </Link>
              </div>
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-20 border-t border-white/5 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-black tracking-widest uppercase">JOOL TECHNOLOGY SYNDICATE</span>
           </div>
           <div className="flex flex-wrap justify-center md:justify-start gap-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <Link href="/protocols" className="hover:text-white transition-colors">Security Protocols</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Commute</Link>
              <Link href="/nodes" className="hover:text-white transition-colors">Syndicate Nodes</Link>
              <Link href="/hacks" className="hover:text-white transition-colors">Ride Hacks</Link>
           </div>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 JOOL • CRAFTED IN INDIA FOR THE GLOBE • V4.5</p>
        </div>
      </footer>
    </div>
  );
}
