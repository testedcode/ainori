"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Car, Search, IndianRupee, Zap, 
  MapPin, Clock, RefreshCw, Calendar,
  ArrowRight, ShieldCheck, Crown,
  Building2, Home, Users, Sun, Sunrise,
  Navigation2, CheckCircle2, Timer, Moon,
  ChevronRight, Info, EyeOff
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

// --- HELPERS ---
const fmtTime = (raw: string) => raw ? raw.slice(0, 5) : "";
const fmtDate = (raw: string) => {
  if (!raw) return "";
  const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const VIBE_CONFIG: Record<string, { label: string, icon: any, sub: string }> = {
  'all': { label: 'All Rides', icon: <Zap size={18} />, sub: 'Full Grid' },
  '6-7': { label: 'Early Birds', icon: <Sun size={18} />, sub: '6-7 AM' },
  '7-8': { label: 'Morning', icon: <Sunrise size={18} />, sub: '7-8 AM' },
  '8-9': { label: 'Rush Hour', icon: <Navigation2 size={18} />, sub: '8-9 AM' },
  '9-10': { label: 'Perfect', icon: <CheckCircle2 size={18} />, sub: '9-10 AM' },
  '12-24': { label: 'Late Join', icon: <Timer size={18} />, sub: '12+ PM' },
  '16-18': { label: 'On Time', icon: <Clock size={18} />, sub: '4-6 PM' },
  '18-20': { label: 'Evening', icon: <Zap size={18} />, sub: '6-8 PM' },
  '20-22': { label: 'Late Night', icon: <Moon size={18} />, sub: '8-10 PM' },
};

interface Ride {
  id: number; user_id: number; user_name: string; corridor_name: string; corridor_id: number;
  ride_date: string; ride_time: string; pickup_point: string;
  drop_point: string; price_per_seat: number; available_seats: number; total_seats: number;
  status: string; vehicle_make?: string; vehicle_model?: string; direction?: string;
  user_approved?: boolean; user_avatar_url?: string;
  confirmed_riders?: { id: number; name: string; avatar_url: string }[];
}

function BookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const corridorParam = searchParams.get('corridor');

  const [rides, setRides] = useState<Ride[]>([]);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [filter, setFilter] = useState({
    corridor: corridorParam || 'all',
    date: new Date().toISOString().split('T')[0],
    vibeTag: 'all',
    direction: 'all'
  });

  useEffect(() => {
    const usr = localStorage.getItem('user');
    if (usr) setUser(JSON.parse(usr));
    fetchCorridors();
    fetchUserRequests();
  }, []);

  useEffect(() => {
    fetchRides();
  }, [filter.date, filter.corridor]);

  const fetchCorridors = async () => {
    try {
      const res = await api.get('/corridors?active=true') as any;
      if (Array.isArray(res)) setCorridors(res);
    } catch {}
  };

  const fetchUserRequests = async () => {
    try {
      const res = await api.get('/user/requests') as any[];
      if (Array.isArray(res)) setRequests(res);
    } catch {}
  };

  const fetchRides = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: filter.date });
      if (filter.corridor !== 'all') params.set('corridor_id', filter.corridor);
      const data = await api.get(`/rides?${params.toString()}`) as any;
      if (Array.isArray(data)) setRides(data);
    } catch {
      toast.error("Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (rideId: number) => {
    try {
      await api.post(`/rides/${rideId}/requests`, { seats_requested: 1 });
      toast.success("Request sent! Host notified.");
      fetchUserRequests();
      fetchRides();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Booking failed");
    }
  };

  const filtered = rides.filter(r => {
    if (r.available_seats === 0 || r.status === 'cancelled' || r.status === 'finished') return false;
    if (filter.direction !== 'all' && r.direction !== filter.direction) return false;
    
    if (filter.vibeTag !== 'all') {
      const h = parseInt(r.ride_time.split(':')[0]);
      const [start, end] = filter.vibeTag.split('-').map(Number);
      if (end === 24) { if (h < start) return false; }
      else { if (h < start || h >= end) return false; }
    }
    return true;
  });

  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Find a ride</div>
          <div className="flow-step active"><span className="step-no"><Search size={14}/></span>Search</div>
          
          <div className="mt-28">
             <div className="side-title">Filter by Time</div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(VIBE_CONFIG).map(([id, v]) => (
                  <button 
                    key={id}
                    onClick={() => setFilter({ ...filter, vibeTag: id })}
                    className={`flow-step ${filter.vibeTag === id ? 'active' : ''}`}
                    style={{ border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span className="step-no">{v.icon}</span>
                    <div>{v.label}<small>{v.sub}</small></div>
                  </button>
                ))}
             </div>
          </div>
        </aside>

        <section className="content-grid">
          <div className="panel">
            <div className="section-head">
               <div>
                  <span className="eyebrow"><span className="dot"></span>Search Results</span>
                  <h2 className="mt-12">Available rides for {fmtDate(filter.date)}</h2>
                  <p>Choose from professional neighbors driving your route.</p>
               </div>
               <div className="segmented">
                  <button onClick={() => setFilter({...filter, direction: 'all'})} className={filter.direction === 'all' ? 'active' : ''}>All</button>
                  <button onClick={() => setFilter({...filter, direction: 'to_office'})} className={filter.direction === 'to_office' ? 'active' : ''}>Office</button>
                  <button onClick={() => setFilter({...filter, direction: 'to_home'})} className={filter.direction === 'to_home' ? 'active' : ''}>Home</button>
               </div>
            </div>

            <div className="form-grid">
               <div className="field">
                  <label>Route</label>
                  <select value={filter.corridor} onChange={(e) => setFilter({...filter, corridor: e.target.value})}>
                     <option value="all">All Corridors</option>
                     {corridors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="field">
                  <label>Date</label>
                  <input type="date" value={filter.date} onChange={(e) => setFilter({...filter, date: e.target.value})} />
               </div>
            </div>
          </div>

          <div className="ride-list">
             {loading ? (
                <div className="panel center"><p>Searching for routes...</p></div>
             ) : filtered.length === 0 ? (
                <div className="panel center" style={{ borderStyle: 'dashed' }}>
                   <h3 className="muted">No rides found</h3>
                   <p className="small">Try a different date or corridor.</p>
                </div>
             ) : (
                filtered.map(ride => {
                  const isRequested = requests.some(req => req.ride_id === ride.id && req.status === 'pending');
                  return (
                    <div key={ride.id} className={`ride-card ${ride.user_approved ? 'top-match' : ''}`}>
                       <div className="ride-top">
                          <div className="driver">
                             <h1 className="italic-time mb-0" style={{ fontSize: '48px' }}>{fmtTime(ride.ride_time)}</h1>
                             <div className="tag-row" style={{ margin: '0 0 0 12px' }}>
                               <span className={`tag ${ride.direction === 'to_home' ? 'gold' : 'blue'}`} style={{ borderRadius: '12px', padding: '6px 12px' }}>
                                  {ride.direction === 'to_home' ? 'TO HOME' : 'TO OFFICE'}
                               </span>
                             </div>
                          </div>
                          <div className="price">
                             <div style={{ background: 'var(--surface-2)', padding: '8px 16px', borderRadius: '14px', border: '1px solid var(--line)' }}>
                               <strong style={{ fontSize: '24px' }}>₹{ride.price_per_seat}</strong>
                               <span style={{ fontSize: '8px', opacity: 0.5 }}>RIDE RATE</span>
                             </div>
                          </div>
                       </div>

                       <div className="m-host-block" style={{ margin: '20px 0', background: 'var(--panel-bg)', borderRadius: '24px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid var(--line)' }}>
                          <div className="avatar" style={{ width: '40px', height: '40px', borderRadius: '12px' }}>
                             {ride.user_avatar_url ? <img src={ride.user_avatar_url} style={{borderRadius:'inherit', width:'100%', height:'100%', objectFit:'cover'}} /> : ride.user_name[0]}
                          </div>
                          <div>
                             <h4 style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase' }}>{ride.user_name}</h4>
                             <p style={{ fontSize: '9px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>{ride.user_approved ? 'Verified Neighbor' : 'Community Member'} • {ride.vehicle_make || 'Ride'}</p>
                          </div>
                       </div>

                       <div className="seats-panel" style={{ background: 'rgba(16, 32, 51, 0.03)', borderRadius: '24px', padding: '16px', display: 'flex', gap: '8px', marginBottom: '20px', border: '1px solid var(--line)' }}>
                          {/* Host */}
                          <div style={{ width: '36px', height: '44px', borderRadius: '8px', border: '1.5px solid var(--accent)', background: 'white', display: 'grid', placeItems: 'center' }}>
                             <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'var(--ink)', fontSize: '10px', fontWeight: 900, display: 'grid', placeItems: 'center' }}>{ride.user_name[0]}</div>
                          </div>
                          {/* Riders */}
                          {Array.from({ length: ride.total_seats - 1 }).map((_, i) => {
                             const occupant = ride.confirmed_riders?.[i];
                             return (
                               <div key={i} style={{ width: '36px', height: '44px', borderRadius: '8px', border: '1.5px dashed var(--line)', display: 'grid', placeItems: 'center' }}>
                                  {occupant ? (
                                    <img src={occupant.avatar_url || `https://ui-avatars.com/api/?name=${occupant.name}`} style={{ width: '24px', height: '24px', borderRadius: '50%' }} alt="" />
                                  ) : (
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--line)' }}></div>
                                  )}
                               </div>
                             );
                          })}
                       </div>

                       <div className="ride-actions" style={{ border: 0, paddingTop: 0 }}>
                          <div className="route-mini">
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginRight: '8px' }}></div>
                             <b style={{ fontSize: '11px' }}>{ride.pickup_point}</b>
                             <span style={{ margin: '0 8px', opacity: 0.2 }}>→</span>
                             <b style={{ fontSize: '11px' }}>{ride.drop_point}</b>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                             <Link href={`/book/${ride.id}`} className="light-btn small">Details</Link>
                             {isRequested ? (
                                <button className="dark-btn small" disabled>Requested</button>
                             ) : (
                                <button onClick={() => handleBook(ride.id)} className="primary-btn small">Book Seat</button>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })
             )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Book() {
  return (
    <Suspense fallback={<div className="screen active center">Loading rides...</div>}>
      <BookContent />
    </Suspense>
  );
}
