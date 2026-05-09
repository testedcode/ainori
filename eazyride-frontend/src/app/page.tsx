"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Car, Shield, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, ChevronRight, CheckCircle2,
  Zap, Star, Users, ShieldCheck, Gem, MessageSquare, 
  Workflow, Activity, Lock, Navigation, HeartHandshake, UserPlus
} from 'lucide-react';
import { api } from '@/lib/api';

export default function Home() {
  const [stats, setStats] = useState({ rides_today: 12, live_users: 347, carbon_saved: '450kg' });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats') as any;
        if (res) setStats(prev => ({ ...prev, ...res }));
      } catch {}
    };
    const usr = localStorage.getItem('user');
    if (usr) setUser(JSON.parse(usr));
    fetchStats();
  }, []);

  return (
    <div className="screen active">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-card">
          <div className="eyebrow"><span className="dot"></span>Trusted Community Commuting</div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9 }}>
            Shared Rides.<br />
            <span className="text-primary">Eazy Commute.</span>
          </h1>
          <p className="lead" style={{ maxWidth: '600px' }}>
            The exclusive carpooling network for professionals. Connect with neighbors, share the journey, and optimize your daily flow.
          </p>
          
          <div className="hero-actions">
            {user ? (
              <Link href="/dashboard" className="primary-btn">Go to Dashboard <ArrowRight size={18} /></Link>
            ) : (
              <Link href="/register" className="primary-btn">Get Started <UserPlus size={18} /></Link>
            )}
            <Link href="/book" className="secondary-btn">Find a Ride</Link>
          </div>

          <div className="metric-row">
            <div className="metric">
              <strong>{stats.rides_today}</strong>
              <span>rides today</span>
            </div>
            <div className="metric">
              <strong>{stats.live_users}</strong>
              <span>verified members</span>
            </div>
            <div className="metric">
              <strong>{stats.carbon_saved}</strong>
              <span>CO₂ mitigated</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ background: 'var(--bg-panel)', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="eyebrow"><span className="dot" style={{background:'var(--green)'}}></span>Eco Impact</div>
          <h3 className="mt-16">Carbon Credits</h3>
          <p className="mt-12 small">Every seat shared on EazyRide directly reduces solo commutes. Track your personal environmental contribution as you travel.</p>
          <div className="tag-row mt-28">
            <div className="tag green">Fewer solo cars</div>
            <div className="tag">Sustainable future</div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <div className="layout mt-28">
        <aside className="panel side-panel" style={{ height: 'fit-content' }}>
          <div className="side-title">Core Pillars</div>
          <div className="flow-step active"><span className="step-no"><ShieldCheck size={14}/></span>Verification</div>
          <div className="flow-step"><span className="step-no"><Zap size={14}/></span>Punctuality</div>
          <div className="flow-step"><span className="step-no"><HeartHandshake size={14}/></span>Community</div>
        </aside>

        <section className="content-grid">
           <div className="section-head">
              <div>
                 <h2>The EazyRide Protocol</h2>
                 <p>Built for the modern professional commute.</p>
              </div>
           </div>

           <div className="ride-list mt-28">
              {[
                { 
                  title: 'Verified Network', 
                  desc: 'Only users with company-validated profiles and registered vehicles participate in our network.',
                  icon: ShieldCheck,
                  color: 'blue'
                },
                { 
                  title: 'Live Coordination', 
                  desc: 'Real-time chat and ride tracking ensure you and your neighbors are always in sync.',
                  icon: Activity,
                  color: 'green'
                },
                { 
                  title: 'Transparent Settlement', 
                  desc: 'Direct peer-to-peer UPI payments with zero platform commission. Fair and simple.',
                  icon: Banknote,
                  color: 'gold'
                }
              ].map((f, i) => (
                <div key={i} className="panel" style={{ padding: '32px', marginBottom: '24px' }}>
                   <div className="ride-top">
                      <div className="driver">
                         <div className={`icon-bubble ${f.color}`}><f.icon size={24}/></div>
                         <div>
                            <h3 className="mt-0">{f.title}</h3>
                            <p className="muted small">{f.desc}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>

      {/* CALL TO ACTION */}
      <section className="mt-28 mb-32">
        <div className="panel center" style={{ background: 'var(--text)', color: 'var(--bg)', padding: '100px 40px', borderRadius: '40px' }}>
          <h2 style={{ color: 'var(--bg)', fontSize: '3rem' }}>Ready to optimize your morning?</h2>
          <p style={{ opacity: 0.7, maxWidth: '600px', margin: '20px auto 40px' }}>Join hundreds of professionals who have ditched solo commutes for a smarter, shared journey.</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="/register" className="primary-btn" style={{ background: 'var(--primary)', color: 'white' }}>Join Community</Link>
            <Link href="/login" className="secondary-btn" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>Member Login</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
