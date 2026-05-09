"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Clock, Users, IndianRupee, Car, Shield,
  MessageSquare, Send, Check, X, Loader2, Navigation,
  AlertCircle, Sparkles, CheckCircle2, Banknote, QrCode,
  Timer, ArrowRight, Ticket, Copy, UserCheck, XCircle, Zap,
  Navigation2, Flag, Building2, Home, User
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
        <aside className="panel side-panel" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: '100px' }}>
          <div className="side-title">Live Chat</div>
          <div className="chat-box" style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
            {messages.length === 0 ? (
              <p className="muted small center mt-28">No messages yet. Say hi to your team!</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`msg ${Number(m.user_id) === currentUserId ? 'own' : ''}`} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: Number(m.user_id) === currentUserId ? 'flex-end' : 'flex-start' }}>
                    <span className="small muted" style={{ fontSize: '9px', fontWeight: '900' }}>{m.user_name}</span>
                    <div className="panel" style={{ padding: '10px 14px', borderRadius: '14px', marginTop: '4px', background: Number(m.user_id) === currentUserId ? 'var(--primary)' : 'var(--bg-panel)', color: Number(m.user_id) === currentUserId ? 'white' : 'inherit' }}>
                      <p className="small">{m.message}</p>
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
              style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg-panel)' }} 
            />
            <button type="submit" className="primary-btn" style={{ padding: '12px', borderRadius: '12px', minWidth: 'unset' }}>
              {sendingMsg ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
        </aside>

        <section className="content-grid">
          <div className="panel">
            <div className="section-head">
               <div>
                  <span className="eyebrow"><span className="dot"></span>Ride Overview</span>
                  <h2 className="mt-12">{ride.corridor_name}</h2>
                  <p>{fmtDate(ride.ride_date)} at {fmtTime(ride.ride_time)}</p>
               </div>
               <div className="tag gold"><Shield size={12} style={{marginRight:'4px'}} /> Verified Route</div>
            </div>

            <div className="metric-row mt-28">
               <div className="metric">
                  <div className="icon-bubble mb-12"><MapPin size={20}/></div>
                  <strong>{ride.pickup_point}</strong><span>Pickup</span>
               </div>
               <div className="metric">
                  <div className="icon-bubble green mb-12"><Navigation size={20}/></div>
                  <strong>{ride.drop_point}</strong><span>Dropoff</span>
               </div>
               <div className="metric">
                  <div className="icon-bubble gold mb-12"><IndianRupee size={20}/></div>
                  <strong>₹{ride.price_per_seat}</strong><span>Per Seat</span>
               </div>
            </div>

            <div className="mt-28 p-20 bg-panel border-line rounded-24">
               <div className="side-title">Status: <span className="tag blue">{ride.status.toUpperCase()}</span></div>
               {isOwner && (
                  <div className="hero-actions mt-12">
                     {ride.status === 'pending' && <button className="primary-btn small" onClick={() => handleUpdateStatus('starting')}>Start Trip</button>}
                     {ride.status === 'starting' && <button className="primary-btn small" onClick={() => handleUpdateStatus('at_pickup')}>At Pickup</button>}
                     {['at_pickup', 'starting'].includes(ride.status) && <button className="dark-btn small" onClick={() => handleUpdateStatus('completed')}>Finish Ride</button>}
                  </div>
               )}
            </div>
          </div>

          <div className="panel mt-28">
             <div className="side-title">Passengers ({acceptedRiders.length + 1} confirmed)</div>
             <div className="choice-row mt-12">
                <div className="choice-card active" style={{ cursor: 'default' }}>
                   <div className="icon-bubble gold"><User size={20}/></div>
                   <span><strong>{ride.user_name}</strong><br/><span className="muted small">Host (Driver)</span></span>
                </div>
                {acceptedRiders.map((r, i) => (
                   <div key={i} className="choice-card" style={{ cursor: 'default' }}>
                      <div className="icon-bubble blue"><User size={20}/></div>
                      <span><strong>{r.user_name || r.rider_name}</strong><br/><span className="muted small">Passenger</span></span>
                   </div>
                ))}
                {Array.from({ length: ride.available_seats }).map((_, i) => (
                   <div key={`v-${i}`} className="choice-card" style={{ opacity: 0.5, borderStyle: 'dashed', cursor: 'default' }}>
                      <div className="icon-bubble"><Users size={20}/></div>
                      <span><strong>Vacant</strong><br/><span className="muted small">Seat available</span></span>
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
