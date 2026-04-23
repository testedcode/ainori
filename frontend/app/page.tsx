'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, Shield, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, ChevronRight, CheckCircle2,
  Lock, Zap, Star, Users, ShieldCheck, Gem,
  XCircle, AlertCircle, MessageSquare
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

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats') as any;
        if (res) setStats(prev => ({ ...prev, ...res }));
      } catch (e) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hour = new Date().getHours();
  const vibe = getVibe(hour);
  const theme = VIBE_THEMES[vibe];

  return (
    <div className={`min-h-screen text-white overflow-x-hidden font-sans selection:bg-blue-600/30 transition-colors duration-1000 ${theme.bg}`}>
      {/* Dynamic Vibe Background Glow */}
      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full h-[800px] blur-[150px] -z-10 pointer-events-none transition-all duration-1000 ${theme.glow}`} />
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
        {/* Dynamic Hero Section */}
        <section className="relative pt-40 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full -z-10 animate-pulse" />
          <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-10">
              <Sparkles className="w-3 h-3" />
              <span>Elite Office Commute Network</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tight mb-10 leading-[0.85] text-white uppercase italic">
              Solve the<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Daily Mesh.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl mb-14 leading-relaxed font-medium">
              Ainori is the premium corridor-based carpooling engine designed for Mumbai's professional elite. 
              Zero gaps, total safety, and significant savings.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/find-ride" className="group bg-blue-600 text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-3 shadow-2xl shadow-blue-600/30">
                Join a Corridor <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link href="/offer-ride" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-12 py-5 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Publish Route
              </Link>
            </div>

            {/* Live Counter */}
            <div className="mt-20 flex flex-wrap justify-center gap-12 border-t border-white/5 pt-12">
               <div className="flex flex-col items-center">
                  <p className="text-3xl lg:text-5xl font-black text-white">{stats.live_users}</p>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Now
                  </p>
               </div>
               <div className="flex flex-col items-center">
                  <p className="text-3xl lg:text-5xl font-black text-white">{stats.rides_today}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Daily Trips</p>
               </div>
               <div className="flex flex-col items-center">
                  <p className="text-3xl lg:text-5xl font-black text-white">{stats.carbon_saved.split(' ')[0]}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Tons CO₂ Saved</p>
               </div>
               <div className="flex flex-col items-center">
                  <p className="text-3xl lg:text-5xl font-black text-white">{stats.trees_saved}</p>
                  <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mt-2">Trees Equivalent</p>
               </div>
            </div>
          </div>
        </section>

        {/* ─── THE CHAOS VS THE SYNDICATE ─────────────────────────────────── */}
        <section className="container mx-auto px-6 py-32 border-t border-white/5">
           <div className="text-center mb-20">
              <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">THE REALITY CHECK</p>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase italic leading-none">
                 STOP THE<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">OPEN MESH.</span>
              </h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* The Old Way: Chat Groups */}
              <div className="bg-red-500/[0.02] border border-red-500/20 rounded-[3rem] p-10 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <XCircle className="w-32 h-32 text-red-500" />
                 </div>
                 <h3 className="text-2xl font-black text-red-500 mb-8 uppercase tracking-tight">The Chat Group Chaos</h3>
                 <div className="space-y-6">
                    {[
                      { icon: Shield, t: 'Privacy Leaks', d: 'Phone numbers and live locations shared with 2000+ unverified strangers.' },
                      { icon: AlertCircle, t: 'Scams & Fakes', d: 'Zero identity verification. Anyone can join, stalk, or scam.' },
                      { icon: MessageSquare, t: 'Digital Noise', d: 'Unnecessary promotions, "Good Morning" spam, and chaotic open loops.' },
                      { icon: MapPin, t: 'Static Routes', d: 'Searching through 100s of messages to find one relevant trip.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                         <item.icon className="w-5 h-5 text-red-500/40 flex-shrink-0 mt-1" />
                         <div>
                            <h4 className="text-xs font-black text-white/80 uppercase">{item.t}</h4>
                            <p className="text-xs text-white/30 font-medium leading-relaxed mt-1">{item.d}</p>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="mt-10 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl italic text-[10px] text-red-400 font-bold">
                    "Casario to RCP, 8:45 AM, 1 seat, 98108xxxxx..." — Your personal data is now public property.
                 </div>
              </div>

              {/* The New Way: JOOL */}
              <div className="bg-blue-600/5 border border-blue-500/30 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl shadow-blue-500/10">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck className="w-32 h-32 text-blue-400" />
                 </div>
                 <h3 className="text-2xl font-black text-blue-400 mb-8 uppercase tracking-tight">The JOOL Infrastructure</h3>
                 <div className="space-y-6">
                    {[
                      { icon: Lock, t: 'Identity Isolation', d: 'Details only visible to confirmed partners. No public leaks.' },
                      { icon: CheckCircle2, t: 'Verified Network', d: 'Corporate and identity verification for every single participant.' },
                      { icon: Zap, t: 'Dynamic Discovery', d: 'Intelligent corridor matching. Find your ride in 2 taps.' },
                      { icon: Banknote, t: 'Secure Settle', d: 'Encrypted payment coordination without sharing bank details publicly.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                         <item.icon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                         <div>
                            <h4 className="text-xs font-black text-white uppercase">{item.t}</h4>
                            <p className="text-xs text-white/40 font-medium leading-relaxed mt-1">{item.d}</p>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="mt-10 p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl italic text-[10px] text-blue-400 font-bold">
                    End-to-end encrypted commute orchestration. Crafted in India for the global elite.
                 </div>
              </div>
           </div>
        </section>

        {/* ─── SUSTAINABILITY IMPACT ────────────────────────────────────────── */}
        <section className="bg-slate-900/50 py-32 border-y border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-10 pointer-events-none" />
           <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-20">
                 <div className="lg:w-1/2">
                    <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">ENVIRONMENTAL LEDGER</p>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-10 italic uppercase">
                       Planet<br /><span className="text-green-400">Positive.</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-12">
                       Every shared ride reduces the net carbon ceiling. JOOL doesn't just move people; we nurture the ecosystem by removing thousands of individual vehicle emissions from our office corridors.
                    </p>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                          <p className="text-4xl font-black text-white">{stats.trees_saved}</p>
                          <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-2">Trees Equivalent</p>
                          <p className="text-[9px] text-white/20 mt-1 uppercase">Saved this month</p>
                       </div>
                       <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                          <p className="text-4xl font-black text-white">0.0g</p>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">Data Carbon</p>
                          <p className="text-[9px] text-white/20 mt-1 uppercase">Lean Architecture</p>
                       </div>
                    </div>
                 </div>
                 <div className="lg:w-1/2 flex items-center justify-center">
                    <div className="relative w-full aspect-video rounded-[3rem] overflow-hidden group">
                       <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent z-10" />
                       <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className="text-center">
                             <Leaf className="w-20 h-20 text-green-400 mx-auto mb-4 animate-bounce" />
                             <p className="text-2xl font-black text-white tracking-widest uppercase">1 Ride = 50 Trees</p>
                             <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] mt-2">CO₂ Absorption Power</p>
                          </div>
                       </div>
                       <div className="absolute inset-0 bg-slate-800" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Safety Nets Section */}
        <section id="safety" className="bg-[#080d1b] py-32 overflow-hidden relative">
           <div className="container mx-auto px-6">
              <div className="text-center mb-24">
                 <p className="text-green-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6">SECURITY INFRASTRUCTURE</p>
                 <h2 className="text-4xl md:text-5xl font-black tracking-tighter">OUR SAFETY NETS</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { icon: ShieldCheck, title: 'Verified Only', desc: 'Every user is identity-verified via official corporate/identity nodes.', color: 'text-green-400' },
                   { icon: Lock, title: 'Privacy Shield', desc: 'Your details are only visible to confirmed trip partners. Absolute privacy.', color: 'text-blue-400' },
                   { icon: Shield, title: 'SOS Protocols', desc: 'Real-time monitoring and one-tap emergency response for all active trips.', color: 'text-red-400' }
                 ].map((net, idx) => (
                   <div key={idx} className="bg-white/[0.03] border border-white/5 p-10 rounded-[3rem] hover:bg-white/[0.06] transition-all group">
                      <div className={`w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform ${net.color}`}>
                         <net.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black mb-6 uppercase tracking-tight">{net.title}</h3>
                      <p className="text-slate-500 leading-relaxed font-medium">{net.desc}</p>
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
           <div className="text-center mb-20">
              <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-4">OPTIMIZATION PROTOCOLS</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">HAPPY RIDE <span className="text-blue-500">HACKS.</span></h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Single Seat Strategy', d: 'Request exact seats to avoid multi-approval bottlenecks.', icon: Users },
                { title: 'In-App Confirms', d: 'Always post confirmation messages in the ride chat for record.', icon: MessageSquare },
                { title: 'Live Settle', d: 'Pay during the ride to ensure a smooth, zero-friction exit.', icon: Banknote },
                { title: 'Time Discipline', d: 'Follow departure nodes strictly or use secure chat to update.', icon: Clock },
                { title: 'Privacy First', d: 'Never share personal numbers in open corridor discussions.', icon: Lock },
                { title: 'Fair Share', d: 'Ride providers maintain fixed price standards for fair commute.', icon: ShieldCheck },
                { title: 'No Spam Policy', d: 'Zero tolerance for promotions or unnecessary celebrations.', icon: XCircle },
                { title: 'Verified Nodes', d: 'Only trust rides with the blue checkmark for maximum security.', icon: CheckCircle2 }
              ].map((hack, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 p-8 rounded-[2rem] hover:bg-blue-600/5 transition-all group">
                   <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <hack.icon className="w-5 h-5 text-blue-400" />
                   </div>
                   <h4 className="font-black text-white text-sm uppercase tracking-tight mb-2">{hack.title}</h4>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{hack.d}</p>
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
           <div className="flex gap-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Security Protocols</span>
              <span>Terms of Commute</span>
              <span>Syndicate Nodes</span>
           </div>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">© 2026 JOOL • CRAFTED IN INDIA FOR THE GLOBE • V4.5</p>
        </div>
      </footer>
    </div>
  );
}
