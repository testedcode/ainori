"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Car, ShieldCheck, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, CheckCircle2, Navigation,
  Building2, Home, Zap, Calendar, Bookmark, Users, Crown, Loader2
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
    } catch (e) {
      toast.error("Session expired. Please login.");
      router.push('/login');
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
          <span className="eyebrow"><span className="dot"></span>{user?.role || 'MEMBER'} Account</span>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p className="lead">Your office commute is optimized. You've saved {stats.carbon}g of Carbon this week.</p>
          <div className="hero-actions">
            <Link href="/share" className="primary-btn">Offer a ride</Link>
            <Link href="/book" className="secondary-btn">Find a ride</Link>
          </div>
          
          <div className="metric-row">
            <div className="metric">
                <div className="icon-bubble green mb-12"><Leaf size={20} /></div>
                <strong>{stats.carbon}g</strong><span>carbon saved</span>
            </div>
            <div className="metric">
                <div className="icon-bubble mb-12"><Zap size={20} /></div>
                <strong>{stats.rides}</strong><span>total rides</span>
            </div>
            <div className="metric">
                <div className="icon-bubble gold mb-12"><Banknote size={20} /></div>
                <strong>₹{stats.money}</strong><span>money saved</span>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '34px', background: 'linear-gradient(135deg, #eef4ff 0%, #ffffff 100%)' }}>
          <span className="eyebrow"><span className="dot" style={{background: '#185cff'}}></span>Smart Insight</span>
          <h3 className="mt-16">Morning Flow: 08:15 AM</h3>
          <p className="mt-12">Departing in 15 minutes gets you to RCP by 08:50 AM with current traffic patterns.</p>
          <div className="mt-28" style={{ display: 'flex', gap: '8px' }}>
            <div className="tag green">Optimal departure</div>
            <div className="tag">Normal traffic</div>
          </div>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Trip Management</div>
          <Link href="/dashboard" className="flow-step active"><span className="step-no"><Bookmark size={14}/></span>Active Rides</Link>
          <Link href="/history" className="flow-step"><span className="step-no"><Calendar size={14}/></span>History</Link>
          <Link href="/profile" className="flow-step"><span className="step-no"><User size={14}/></span>Profile</Link>
          <Link href="/vehicles" className="flow-step"><span className="step-no"><Car size={14}/></span>My Vehicles</Link>
        </aside>

        <section className="content-grid">
          <div className="section-head">
             <div>
               <h2>My Active Rides</h2>
               <p>Trips where you are a host or a passenger.</p>
             </div>
             <button onClick={fetchDashboard} className="light-btn"><Zap size={14} className="mr-4"/> Sync</button>
          </div>

          <div className="ride-list">
             {activeRides.length === 0 ? (
                <div className="panel center" style={{ borderStyle: 'dashed', padding: '60px' }}>
                    <p className="muted">No active rides found for today.</p>
                    <Link href="/book" className="primary-btn mt-16">Find a ride now</Link>
                </div>
             ) : (
                activeRides.map((ride, i) => (
                  <div key={i} className={`ride-card ${ride.user_id === currentUserId ? 'top-match' : ''}`}>
                      <div className="ride-top">
                          <div className="driver">
                              <div className={`avatar ${ride.user_id === currentUserId ? 'gold' : ''}`}>
                                 {ride.user_id === currentUserId ? 'YOU' : ride.user_name?.[0] || 'P'}
                              </div>
                              <div>
                                  <h4>{ride.corridor_name}</h4>
                                  <span>{ride.user_id === currentUserId ? 'Hosting' : `Pilot: ${ride.user_name}`} • {ride.vehicle_make || 'Ride'}</span>
                              </div>
                          </div>
                          <div className="price">
                              <strong>{fmtTime(ride.ride_time)}</strong>
                              <span>{fmtDate(ride.ride_date)}</span>
                          </div>
                      </div>
                      
                      <div className="tag-row">
                          <span className={`tag ${ride.status === 'completed' ? 'green' : 'blue'}`}>{ride.status.toUpperCase()}</span>
                          <span className="tag">{ride.direction === 'to_office' ? 'Officebound' : 'Homebound'}</span>
                          {ride.user_id === currentUserId && <span className="tag gold">Host</span>}
                      </div>

                      <div className="ride-actions">
                          <div className="route-mini">
                              <MapPin size={14} style={{marginRight:'4px'}}/> <b>{ride.pickup_point}</b> to <b>{ride.drop_point}</b>
                          </div>
                          <Link href={`/book/${ride.id}`} className="dark-btn small">Open Ride Portal</Link>
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
