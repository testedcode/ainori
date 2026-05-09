"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, MapPin, Car, BarChart3, Lock, Unlock, 
  CheckCircle, XCircle, Shield, Search, Plus, AlertTriangle,
  ChevronRight, Activity, Leaf, Database, Pencil, Camera, Loader2,
  Inbox, MessageSquare, Ticket, Send, RefreshCw, Globe
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function Admin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [corridors, setCorridors] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_users: 0, total_rides: 0, active_corridors: 0 });

  useEffect(() => {
    const usr = localStorage.getItem('user');
    if (usr) {
      const u = JSON.parse(usr);
      if (u.role !== 'admin') {
        toast.error("Admin access required");
        router.push('/dashboard');
        return;
      }
    }
    fetchAdminData();
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const [u, c, t, s] = await Promise.all([
        api.get('/admin/users'),
        api.get('/corridors'),
        api.get('/admin/tickets'),
        api.get('/admin/analytics').catch(() => ({ total_users: 0, total_rides: 0, active_corridors: 0 }))
      ]) as any[];
      if (Array.isArray(u)) setUsers(u);
      if (Array.isArray(c)) setCorridors(c);
      if (Array.isArray(t)) setTickets(t);
      setStats(s);
    } catch {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.put(`/admin/users/${id}`, { approved: true });
      toast.success("User approved!");
      fetchAdminData();
    } catch { toast.error("Action failed"); }
  };

  if (loading) return <div className="screen active center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot" style={{background:'var(--red)'}}></span>System Control</span>
          <h1>Admin Dashboard</h1>
          <p className="lead">Platform oversight, user verification, and route management.</p>
          <div className="metric-row">
            <div className="metric">
                <div className="icon-bubble blue mb-12"><Users size={20} /></div>
                <strong>{stats.total_users}</strong><span>Users</span>
            </div>
            <div className="metric">
                <div className="icon-bubble green mb-12"><Activity size={20} /></div>
                <strong>{stats.total_rides}</strong><span>Trips</span>
            </div>
            <div className="metric">
                <div className="icon-bubble gold mb-12"><MapPin size={20} /></div>
                <strong>{stats.active_corridors}</strong><span>Routes</span>
            </div>
          </div>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Oversight</div>
          <button onClick={() => setActiveTab('overview')} className={`flow-step ${activeTab === 'overview' ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><BarChart3 size={14}/></span>Summary
          </button>
          <button onClick={() => setActiveTab('users')} className={`flow-step ${activeTab === 'users' ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><Users size={14}/></span>Verification
            {users.filter(u => !u.approved).length > 0 && <span className="tag red small" style={{marginLeft:'auto'}}>{users.filter(u => !u.approved).length}</span>}
          </button>
          <button onClick={() => setActiveTab('routes')} className={`flow-step ${activeTab === 'routes' ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><MapPin size={14}/></span>Routes
          </button>
          <button onClick={() => setActiveTab('tickets')} className={`flow-step ${activeTab === 'tickets' ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><Ticket size={14}/></span>Tickets
            {tickets.filter(t => t.status === 'open').length > 0 && <span className="tag gold small" style={{marginLeft:'auto'}}>{tickets.filter(t => t.status === 'open').length}</span>}
          </button>
        </aside>

        <section className="content-grid">
          {activeTab === 'overview' && (
            <div className="panel">
              <div className="section-head">
                <h3 className="side-title">Platform Health</h3>
              </div>
              <p className="mt-20">All systems operational. Regional availability is scaling at 12% WoW.</p>
              <div className="choice-row mt-28">
                 <div className="choice-card">
                    <div className="icon-bubble blue"><Shield size={20}/></div>
                    <span><strong>Security</strong><br/><span className="muted small">WAF & SSL Active</span></span>
                 </div>
                 <div className="choice-card">
                    <div className="icon-bubble green"><Database size={20}/></div>
                    <span><strong>Database</strong><br/><span className="muted small">Syncing 0.2ms</span></span>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="panel">
              <div className="section-head">
                <h3 className="side-title">Pending Approvals</h3>
              </div>
              <div className="ride-list mt-20">
                {users.filter(u => !u.approved).map(u => (
                  <div key={u.id} className="ride-card">
                    <div className="ride-top">
                      <div className="driver">
                        <div className="avatar">{u.name?.[0]}</div>
                        <div>
                          <h4>{u.name}</h4>
                          <span>{u.email}</span>
                        </div>
                      </div>
                      <div className="hero-actions">
                        <button className="primary-btn small" onClick={() => handleApprove(u.id)}>Verify</button>
                        <button className="light-btn small">Deny</button>
                      </div>
                    </div>
                  </div>
                ))}
                {users.filter(u => !u.approved).length === 0 && <p className="muted center">No pending verifications.</p>}
              </div>
            </div>
          )}

          {activeTab === 'routes' && (
            <div className="panel">
              <div className="section-head">
                <h3 className="side-title">Network Routes</h3>
                <button className="primary-btn small">Add New</button>
              </div>
              <div className="ride-list mt-20">
                {corridors.map(c => (
                  <div key={c.id} className="ride-card">
                     <div className="ride-top">
                        <div className="driver">
                           <div className="icon-bubble blue"><MapPin size={20}/></div>
                           <div>
                              <h4>{c.name}</h4>
                              <span>{c.location_from} → {c.location_to}</span>
                           </div>
                        </div>
                        <div className="tag blue">{c.is_active ? 'Active' : 'Offline'}</div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tickets' && (
             <div className="panel">
                <div className="section-head">
                   <h3 className="side-title">Support Inbox</h3>
                </div>
                <div className="ride-list mt-20">
                   {tickets.map(t => (
                      <div key={t.id} className="ride-card" style={{opacity: t.status === 'closed' ? 0.5 : 1}}>
                         <div className="ride-top">
                            <div>
                               <p className="small muted font-bold">{t.ref}</p>
                               <h4 className="mt-4">{t.issue_type.toUpperCase()}</h4>
                               <p className="small mt-4">{t.description}</p>
                            </div>
                            <div className={`tag ${t.status === 'open' ? 'red' : 'blue'}`}>{t.status}</div>
                         </div>
                         <div className="ride-actions mt-12">
                            <span className="small muted">{t.email}</span>
                            <button className="light-btn small">Reply</button>
                         </div>
                      </div>
                   ))}
                   {tickets.length === 0 && <p className="muted center">Inbox is empty.</p>}
                </div>
             </div>
          )}
        </section>
      </div>
    </div>
  );
}
