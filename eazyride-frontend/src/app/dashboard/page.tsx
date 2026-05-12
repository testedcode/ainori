"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Car, ShieldCheck, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, CheckCircle2, Navigation,
  Building2, Home, Zap, Calendar, Bookmark, Users, Crown, Loader2, RefreshCw
} from 'lucide-react';
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const fmtTime = (raw: string) => raw ? raw.slice(0, 5) : "";
const fmtDate = (raw: string) => {
  if (!raw) return "";
  const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [stats, setStats] = useState({ carbon: 0, rides: 0, money: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const rides = await api.get('/user/rides/active') as any[];
      if (Array.isArray(rides)) setActiveRides(rides);
      
      const profile = await api.getProfile() as any;
      if (profile && !profile.error) {
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      }

      const s = await api.get('/stats').catch(() => null) as any;
      if (s && !s.error) {
        setStats(prev => ({ ...prev, ...s }));
      } else {
        // Fallback for demo
        setStats({ carbon: 450, rides: 12, money: 3420 });
      }
    } catch (e: any) {
      console.error('Dashboard fetch failed:', e);
      if (e.response?.status === 401 || e.response?.status === 503) {
        toast.error("Session expired. Please login.");
        router.push('/login');
      } else {
        toast.error("Could not sync latest ride data.");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) return <div className="screen active center"><Loader2 className="animate-spin" /></div>;

  const currentUserId = user?.id;

  return (
    <div className="screen active">
      <section className="hero" style={{ paddingBottom: '0' }}>
        <div className="hero-card">
          <div className="eyebrow" style={{ background: 'rgba(24, 92, 255, 0.05)', color: 'var(--primary)' }}>
            <div className="dot"></div>
            {user?.role || 'MEMBER'} Account Active
          </div>
          <h1 style={{ fontStyle: 'italic', fontWeight: 950, textTransform: 'uppercase' }}>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="lead">Your office commute is optimized. You've saved {stats.carbon}g of Carbon this week.</p>
          <div className="hero-actions">
            <Link href="/share" className="primary-btn">Offer a ride</Link>
            <Link href="/book" className="secondary-btn">Find a ride</Link>
          </div>
          
          <div className="metric-row">
            <div className="metric" style={{ background: 'white' }}>
                <div className="icon-bubble green mb-12"><Leaf size={20} /></div>
                <strong>{stats.carbon}g</strong><span>Carbon Saved</span>
            </div>
            <div className="metric" style={{ background: 'white' }}>
                <div className="icon-bubble mb-12"><Zap size={20} /></div>
                <strong>{stats.rides}</strong><span>Total Trips</span>
            </div>
            <div className="metric" style={{ background: 'white' }}>
                <div className="icon-bubble gold mb-12"><Banknote size={20} /></div>
                <strong>₹{stats.money}</strong><span>Money Saved</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '34px', background: 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(20px)' }}>
          <div className="avatar" style={{ width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 20px', fontSize: '24px' }}>
            {user?.name?.[0] || 'U'}
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: 'var(--good)', color: 'white', width: '24px', height: '24px', borderRadius: '8px', border: '3px solid white', display: 'grid', placeItems: 'center' }}>
              <ShieldCheck size={12} />
            </div>
          </div>
          <h3 className="center" style={{ fontSize: '20px' }}>{user?.name || 'Verified Member'}</h3>
          <p className="center small muted mt-8">Priority Member • Authorized</p>
          
          <div className="mt-28 pt-20" style={{ borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
             <div style={{ textAlign: 'left' }}><p style={{ fontSize: '9px', fontWeight: 950, opacity: 0.3 }}>CREDITS</p><p style={{ fontWeight: 950, fontStyle: 'italic' }}>{stats.carbon}g</p></div>
             <div style={{ textAlign: 'right' }}><p style={{ fontSize: '9px', fontWeight: 950, opacity: 0.3 }}>STATUS</p><p style={{ fontWeight: 950, fontStyle: 'italic', color: 'var(--good)' }}>ACTIVE</p></div>
          </div>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
          <div className="side-title">Trip Management</div>
          <Link href="/dashboard" className="flow-step active"><span className="step-no"><Bookmark size={14}/></span>Active Rides</Link>
          <Link href="/history" className="flow-step"><span className="step-no"><Calendar size={14}/></span>History</Link>
          <Link href="/profile" className="flow-step"><span className="step-no"><User size={14}/></span>Profile</Link>
          <Link href="/vehicles" className="flow-step"><span className="step-no"><Car size={14}/></span>My Vehicles</Link>
        </aside>

        <section className="content-grid">
          <div className="section-head">
             <div>
               <h2 style={{ fontSize: '32px' }}>My Active Rides.</h2>
               <p>Your confirmed trips for today and tomorrow.</p>
             </div>
             <button onClick={fetchDashboard} className="light-btn" style={{ background: 'white' }}><RefreshCw size={14} className="mr-4"/> Sync</button>
          </div>

          <div className="ride-list">
             {activeRides.length === 0 ? (
                <div className="panel center" style={{ borderStyle: 'dashed', padding: '60px', background: 'transparent' }}>
                    <p className="muted">No active rides scheduled.</p>
                    <Link href="/book" className="primary-btn mt-16">Find a ride now</Link>
                </div>
             ) : (
                activeRides.map((ride, i) => (
                  <div key={i} className={`ride-card ${ride.user_id === currentUserId ? 'top-match' : ''}`}>
                      <div className="ride-top">
                          <div className="driver">
                             <div className="italic-time" style={{ fontSize: '36px' }}>{fmtTime(ride.ride_time)}</div>
                             <div className="tag-row" style={{ margin: '0 0 0 12px' }}>
                               <span className={`tag ${ride.direction === 'to_home' ? 'gold' : 'blue'}`} style={{ borderRadius: '12px' }}>
                                  {ride.direction === 'to_home' ? 'TO HOME' : 'TO OFFICE'}
                               </span>
                             </div>
                          </div>
                          <div className="price">
                              <div style={{ background: 'var(--surface-2)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                                <strong style={{ fontSize: '18px' }}>₹{ride.price_per_seat || 80}</strong>
                                <span style={{ fontSize: '8px' }}>PER SEAT</span>
                              </div>
                          </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                         <div className={`avatar ${ride.user_id === currentUserId ? 'gold' : ''}`} style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                            {ride.user_id === currentUserId ? 'YOU' : ride.user_name?.[0] || 'P'}
                         </div>
                         <div>
                            <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>{ride.user_id === currentUserId ? 'Hosting Trip' : ride.user_name}</h4>
                            <p style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{ride.corridor_name} • {ride.vehicle_make || 'Standard'}</p>
                         </div>
                      </div>
                      
                      <div className="tag-row">
                          <span className={`tag ${ride.status === 'completed' ? 'green' : 'blue'}`} style={{ textTransform: 'uppercase', fontSize: '9px' }}>{ride.status}</span>
                          <span className="tag" style={{ textTransform: 'uppercase', fontSize: '9px' }}>{fmtDate(ride.ride_date)}</span>
                          {ride.user_id === currentUserId && <span className="tag gold" style={{ fontSize: '9px' }}>HOSTING</span>}
                      </div>

                      <div className="ride-actions" style={{ border: 0, paddingTop: '12px' }}>
                          <div className="route-mini">
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginRight: '8px' }}></div>
                             <b style={{ fontSize: '11px' }}>{ride.pickup_point}</b>
                             <span style={{ margin: '0 8px', opacity: 0.2 }}>→</span>
                             <b style={{ fontSize: '11px' }}>{ride.drop_point}</b>
                          </div>
                          <Link href={`/book/${ride.id}`} className="dark-btn small" style={{ fontSize: '10px' }}>Open Portal</Link>
                      </div>
                  </div>
                ))
             )}
          </div>
        </section>
      </div>
    </div>
  );
}
