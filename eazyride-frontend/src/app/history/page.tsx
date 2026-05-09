"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  History as HistoryIcon, Calendar, MapPin, 
  ChevronRight, Car, User, Loader2, ZapOff
} from "lucide-react";
import { api } from "@/lib/api";

const fmtTime = (raw: string) => raw ? raw.slice(0, 5) : "";
const fmtDate = (raw: string) => {
  if (!raw) return "";
  const d = new Date(raw.includes("T") ? raw : raw + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: 'numeric' });
};

export default function History() {
  const router = useRouter();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchHistory();
  }, [router]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/user/rides');
      if (Array.isArray(res)) setRides(res);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="screen active center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Records</div>
          <div className="flow-step active"><span className="step-no"><HistoryIcon size={14}/></span>History</div>
          <Link href="/dashboard" className="flow-step"><span className="step-no"><Calendar size={14}/></span>Active</Link>
        </aside>

        <section className="content-grid">
          <div className="section-head">
             <div>
               <h2>Ride History</h2>
               <p>All your past commutes and shared journeys.</p>
             </div>
          </div>

          {rides.length === 0 ? (
            <div className="panel center" style={{ borderStyle: 'dashed', padding: '60px' }}>
              <ZapOff className="muted mb-12" size={40} />
              <p className="muted">No ride history found.</p>
              <Link href="/book" className="primary-btn mt-16">Find your first ride</Link>
            </div>
          ) : (
            <div className="ride-list">
              {rides.map((ride, i) => (
                <div key={i} className="panel" style={{ padding: '24px', marginBottom: '20px' }}>
                   <div className="ride-top">
                      <div className="driver">
                         <div className="icon-bubble"><Calendar size={20}/></div>
                         <div>
                            <h4>{ride.corridor_name}</h4>
                            <span>{fmtDate(ride.ride_date)} • {fmtTime(ride.ride_time)}</span>
                         </div>
                      </div>
                      <div className="tag-row">
                         <span className={`tag ${ride.status === 'completed' ? 'green' : 'blue'}`}>{ride.status.toUpperCase()}</span>
                         <span className="tag">{ride.role === 'host' ? 'Host' : 'Rider'}</span>
                      </div>
                   </div>
                   <div className="ride-actions mt-16">
                      <div className="route-mini">
                         <MapPin size={14} style={{marginRight:'4px'}} /> <b>{ride.pickup_point}</b> to <b>{ride.drop_point}</b>
                      </div>
                      <Link href={`/book/${ride.id}`} className="light-btn small">View Summary</Link>
                   </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
