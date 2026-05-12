"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Clock, Users, IndianRupee, Car, Shield,
  MessageSquare, Send, Check, X, Loader2, Navigation,
  AlertCircle, Sparkles, CheckCircle2, Banknote, QrCode,
  Timer, ArrowRight, Ticket, Copy, UserCheck, XCircle, Zap,
  Navigation2, Flag, Building2, Home, User, Calendar
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

const fmtTime = (raw: string) => raw ? raw.slice(0, 5) : "";
const fmtDate = (raw: string) => {
  if (!raw) return "";
  const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: 'numeric' });
};

export default function RideDetail() {
  const router = useRouter();
  const params = useParams();
  const rideId = params.id as string;

  const [ride, setRide] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const usr = localStorage.getItem('user');
    if (usr) setUser(JSON.parse(usr));
    fetchRideData();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [rideId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRideData = async () => {
    try {
      const r = await api.get(`/rides/${rideId}`) as any;
      setRide(r);
      const m = await api.get(`/rides/${rideId}/messages`) as any;
      if (Array.isArray(m)) setMessages(m);
      const req = await api.get(`/rides/${rideId}/requests`) as any;
      if (Array.isArray(req)) setRequests(req);
    } catch (e) {
      toast.error("Failed to load ride details");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const m = await api.get(`/rides/${rideId}/messages`) as any;
      if (Array.isArray(m)) setMessages(m);
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      await api.post(`/rides/${rideId}/messages`, { message: newMessage });
      setNewMessage("");
      fetchMessages();
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSendingMsg(false);
    }
  };

  const handleAcceptRequest = async (reqId: number) => {
    try {
      await api.put(`/rides/${rideId}/requests/${reqId}`, { status: 'accepted' });
      toast.success("Request accepted!");
      fetchRideData();
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Action failed");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await api.put(`/rides/${rideId}`, { status });
      toast.success(`Ride is now ${status}`);
      fetchRideData();
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <div className="screen active center"><Loader2 className="animate-spin" /></div>;
  if (!ride) return <div className="screen active center"><h2>Ride not found</h2><Link href="/book">Go back</Link></div>;

  const currentUserId = Number(user?.id || user?.userId);
  const isOwner = currentUserId === Number(ride.user_id);
  const acceptedRiders = requests.filter(r => r.status === 'accepted');

  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: '100px', background: 'rgba(255, 255, 255, 0.4)' }}>
          <div className="side-title">Ride Coordination</div>
          <div className="chat-box" style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
            {messages.length === 0 ? (
              <div className="center mt-28" style={{ padding: '20px' }}>
                <MessageSquare size={32} className="muted mb-12" style={{ opacity: 0.2 }} />
                <p className="muted small">Start coordinating with your ride team here.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`msg ${Number(m.user_id) === currentUserId ? 'own' : ''}`} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: Number(m.user_id) === currentUserId ? 'flex-end' : 'flex-start' }}>
                    <span className="small muted" style={{ fontSize: '9px', fontWeight: '950', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.user_name}</span>
                    <div className="panel" style={{ padding: '12px 16px', borderRadius: '20px', marginTop: '4px', background: Number(m.user_id) === currentUserId ? 'var(--primary)' : 'white', color: Number(m.user_id) === currentUserId ? 'white' : 'inherit', border: '1px solid var(--line)', boxShadow: 'var(--soft-shadow)' }}>
                      <p className="small" style={{ fontWeight: 600 }}>{m.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
            <input 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type message..." 
              style={{ flex: 1, padding: '15px', borderRadius: '18px', border: '1px solid var(--line)', background: 'white' }} 
            />
            <button type="submit" className="dark-btn" style={{ width: '50px', height: '50px', borderRadius: '18px', padding: 0 }}>
              {sendingMsg ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
        </aside>

        <section className="content-grid">
          <div className="panel" style={{ background: 'white' }}>
            <div className="section-head">
               <div>
                  <span className="eyebrow"><span className="dot"></span>Ride Portal Active</span>
                  <h1 className="italic-time mt-12" style={{ fontSize: '72px' }}>{fmtTime(ride.ride_time)}</h1>
                  <h2 style={{ fontSize: '24px', opacity: 0.6 }}>{ride.corridor_name}</h2>
               </div>
               <div className="price">
                  <div style={{ background: 'var(--surface-2)', padding: '12px 24px', borderRadius: '20px', border: '1px solid var(--line)' }}>
                    <strong style={{ fontSize: '32px' }}>₹{ride.price_per_seat}</strong>
                    <span style={{ fontSize: '10px' }}>PER SEAT</span>
                  </div>
               </div>
            </div>

            <div className="metric-row mt-28">
               <div className="metric" style={{ background: 'var(--surface-2)' }}>
                  <div className="icon-bubble mb-12"><MapPin size={20}/></div>
                  <strong>{ride.pickup_point}</strong><span>Start Point</span>
               </div>
               <div className="metric" style={{ background: 'var(--surface-2)' }}>
                  <div className="icon-bubble green mb-12"><Navigation size={20}/></div>
                  <strong>{ride.drop_point}</strong><span>End Point</span>
               </div>
               <div className="metric" style={{ background: 'var(--surface-2)' }}>
                  <div className="icon-bubble gold mb-12"><Calendar size={20}/></div>
                  <strong>{fmtDate(ride.ride_date)}</strong><span>Trip Date</span>
               </div>
            </div>

            <div className="mt-28 p-24" style={{ background: 'var(--ink)', borderRadius: '32px', color: 'white' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <p style={{ fontSize: '10px', fontWeight: 950, opacity: 0.5, letterSpacing: '1px' }}>CURRENT STATUS</p>
                   <h3 style={{ color: 'white', marginTop: '4px' }}>{ride.status.toUpperCase()}</h3>
                 </div>
                 {isOwner && (
                    <div className="hero-actions">
                       {ride.status === 'pending' && <button className="secondary-btn small" onClick={() => handleUpdateStatus('starting')}>Start Trip</button>}
                       {ride.status === 'starting' && <button className="secondary-btn small" onClick={() => handleUpdateStatus('at_pickup')}>At Spot</button>}
                       {['at_pickup', 'starting'].includes(ride.status) && <button className="primary-btn small" onClick={() => handleUpdateStatus('completed')}>Finish Ride</button>}
                    </div>
                 )}
               </div>
            </div>
          </div>

          <div className="panel mt-28">
             <div className="side-title">Seating Map ({acceptedRiders.length + 1} Confirmed)</div>
             
             <div className="choice-row mt-12" style={{ gap: '16px' }}>
                {/* Visual Seat Representation */}
                <div style={{ width: '80px', height: '100px', borderRadius: '24px', border: '2px solid var(--accent)', background: 'rgba(255, 176, 55, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                   <div className="avatar gold" style={{ width: '40px', height: '40px' }}>{ride.user_name?.[0]}</div>
                   <span style={{ fontSize: '10px', fontWeight: 950 }}>HOST</span>
                </div>

                {acceptedRiders.map((r, i) => (
                   <div key={i} style={{ width: '80px', height: '100px', borderRadius: '24px', border: '2px solid var(--primary)', background: 'rgba(24, 92, 255, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div className="avatar" style={{ width: '40px', height: '40px' }}>{(r.user_name || r.rider_name)?.[0]}</div>
                      <span style={{ fontSize: '10px', fontWeight: 950 }}>RIDER</span>
                   </div>
                ))}

                {Array.from({ length: ride.available_seats }).map((_, i) => (
                   <div key={`v-${i}`} style={{ width: '80px', height: '100px', borderRadius: '24px', border: '2px dashed var(--line)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.4 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '14px', border: '2px dashed var(--line)', display: 'grid', placeItems: 'center' }}>
                         <Users size={16} />
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 950 }}>VACANT</span>
                   </div>
                ))}
             </div>
          </div>

          {isOwner && requests.filter(r => r.status === 'pending').length > 0 && (
            <div className="panel mt-28">
               <div className="side-title">Pending Requests</div>
               <div className="ride-list mt-12">
                  {requests.filter(r => r.status === 'pending').map((req, i) => (
                    <div key={i} className="ride-card">
                       <div className="ride-top">
                          <div className="driver">
                             <div className="avatar">{req.user_name?.[0] || 'R'}</div>
                             <div>
                                <h4>{req.user_name || req.rider_name}</h4>
                                <span>Requested {req.seats_requested} seat(s)</span>
                             </div>
                          </div>
                          <div className="hero-actions">
                             <button className="primary-btn small" onClick={() => handleAcceptRequest(req.id)}>Accept</button>
                             <button className="light-btn small">Decline</button>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
