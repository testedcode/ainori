"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, Gem, Zap, Star, Users, MapPin, 
  ArrowRight, CheckCircle2, Crown, Sparkles, 
  Shield, Lock, ZapOff, Heart, Brain, Headset,
  Fingerprint, Search, Bell, ShieldEllipsis,
  CircleUser, Briefcase, Car, Coffee, Music,
  Wifi, SlidersHorizontal, UserPlus, HeartPulse, Loader2
} from 'lucide-react';
import { api } from "@/lib/api";
import Link from "next/link";

export default function ExclusiveBenefitsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile();
      setUser(data);
    } catch (e) {
      // Not strictly required for benefits page, but good for context
      console.warn("Not logged in");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="screen active center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="screen active">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-card center">
          <div className="icon-bubble gold mb-20 mx-auto"><Crown size={24} /></div>
          <span className="eyebrow center">EazyRide Premium</span>
          <h1 className="mt-12">Your Commute, <span className="text-primary">Optimized.</span></h1>
          <p className="lead mt-16 max-w-2xl mx-auto">
            Step into a better way to travel. Smart matching, neighborly networking, and premium safety guidelines tailored for your daily office trip.
          </p>
          <div className="hero-actions center mt-28">
            <Link href="/book" className="primary-btn">Find a Ride</Link>
            <Link href="/share" className="secondary-btn">Offer a Ride</Link>
          </div>
        </div>
      </section>

      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Premium Perks</div>
          <div className="flow-step active"><span className="step-no"><Sparkles size={14}/></span>Smart Matching</div>
          <div className="flow-step"><span className="step-no"><ShieldCheck size={14}/></span>Verified Hosts</div>
          <div className="flow-step"><span className="step-no"><Zap size={14}/></span>Priority Support</div>
        </aside>

        <section className="content-grid">
          {/* Smart Matching */}
          <div className="panel" style={{ padding: '40px' }}>
            <div className="flex items-center gap-16 mb-24">
               <div className="icon-bubble blue"><Brain size={24} /></div>
               <div>
                  <h3 className="uppercase italic">Smart Matching Engine</h3>
                  <p className="small muted">AI-Powered Coordination</p>
               </div>
            </div>
            
            <div className="grid gap-20">
               <div className="flex gap-16">
                  <div className="icon-bubble small"><Zap size={16} className="text-primary" /></div>
                  <div>
                     <h4 className="font-bold mb-4">Predictive Suggestions</h4>
                     <p className="small muted">Our system learns your schedule and preferences to suggest the perfect match before you even open the app.</p>
                  </div>
               </div>
               <div className="flex gap-16">
                  <div className="icon-bubble small"><SlidersHorizontal size={16} className="text-primary" /></div>
                  <div>
                     <h4 className="font-bold mb-4">Route Optimization</h4>
                     <p className="small muted">Real-time traffic adjustments ensure you're never caught in stagnant flow. We find the fastest path to RCP.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
             <div className="panel">
                <h4 className="text-2xl font-black mb-8">98%</h4>
                <p className="small muted uppercase tracking-widest">Member Satisfaction</p>
             </div>
             <div className="panel">
                <h4 className="text-2xl font-black mb-8">0.4s</h4>
                <p className="small muted uppercase tracking-widest">Matching Speed</p>
             </div>
          </div>

          <div className="section-head mt-40">
             <div>
                <h2>Upcoming Features</h2>
                <p>Coming soon to your dashboard: More ways to customize your trip.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
             {[
               { icon: Music, title: "Trip Vibe", desc: "Choose your ride atmosphere - Jazz, Lo-fi, or a Quiet Trip for deep focus." },
               { icon: Coffee, title: "Daily Rituals", desc: "Matches with partners who stop for morning coffee or news." },
               { icon: Wifi, title: "Work Ready", desc: "Ensure your ride has connectivity and a comfortable space to work." }
             ].map((item, i) => (
               <div key={i} className="panel hover-up">
                  <item.icon className="mb-16 text-primary" size={24} />
                  <h4 className="mb-8">{item.title}</h4>
                  <p className="small muted">{item.desc}</p>
                  <div className="tag mt-16" style={{ fontSize: '9px' }}>IN DEVELOPMENT</div>
               </div>
             ))}
          </div>

          {/* Safety & Trust */}
          <div className="panel mt-40" style={{ background: 'linear-gradient(135deg, #fff5f8 0%, #ffffff 100%)', border: '1px solid #ffcad4' }}>
             <div className="flex items-center gap-12 mb-20">
                <HeartPulse className="text-red-500" size={20} />
                <span className="eyebrow" style={{ color: '#d00045' }}>Safety & Trust</span>
             </div>
             <h2 className="italic uppercase">Safe & Trusted.</h2>
             <p className="lead mt-12 muted">
                We are creating a secure environment for all our members. Premium membership includes access to verified rides and our safety guidelines.
             </p>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-28 mt-28">
                <div className="flex gap-12">
                   <UserPlus className="text-red-400 flex-shrink-0" size={20} />
                   <div>
                      <h4 className="font-bold">Female-Only Trips</h4>
                      <p className="small muted">Explicit filter to match only with vetted female ride partners.</p>
                   </div>
                </div>
                <div className="flex gap-12">
                   <ShieldEllipsis className="text-red-400 flex-shrink-0" size={20} />
                   <div>
                      <h4 className="font-bold">Live Safety Share</h4>
                      <p className="small muted">Share your live trip details with up to 3 emergency contacts automatically.</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="panel center mt-40" style={{ padding: '60px' }}>
             <div className="icon-bubble gold mx-auto mb-20"><Gem size={32} /></div>
             <h2>Ready to start?</h2>
             <p className="muted mt-12 mb-28">Join our professional community today for a better daily commute.</p>
             <Link href="/register" className="primary-btn">Join EazyRide</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
