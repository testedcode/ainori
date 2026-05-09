"use client";
import { useState, useEffect, Suspense } from "react";
import { 
  Leaf, MessageSquare, Ticket, ChevronDown, ChevronUp,
  Car, Search, CheckCircle2, ArrowRight, Zap,
  IndianRupee, ShieldCheck, MapPin, Users,
  Sparkles, HelpCircle, Send, Star, AlertCircle,
  LifeBuoy, BookOpen, Activity, CreditCard, RefreshCw
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

function SupportContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('faq');
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', trip_id: '', issue_type: 'payment', description: '', urgency: 'normal' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'ticket') setActiveTab('ticket');
    const tripId = searchParams.get('trip_id');
    const issue = searchParams.get('issue');
    if (tripId || issue) {
      setActiveTab('ticket');
      setTicketForm(prev => ({ ...prev, trip_id: tripId || '', issue_type: issue || 'payment' }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/support/ticket', ticketForm) as any;
      toast.success(`Ticket ${res.ref} raised!`);
      setTicketForm({ name: '', email: '', trip_id: '', issue_type: 'payment', description: '', urgency: 'normal' });
    } catch {
      toast.error('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot"></span>24/7 Helpdesk</span>
          <h1>Community Support</h1>
          <p className="lead">Got a question or an issue? We're here to help you move smoothly.</p>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Help Center</div>
          <button onClick={() => setActiveTab('faq')} className={`flow-step ${activeTab === 'faq' ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><HelpCircle size={14}/></span>FAQs
          </button>
          <button onClick={() => setActiveTab('ticket')} className={`flow-step ${activeTab === 'ticket' ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><Ticket size={14}/></span>Raise Ticket
          </button>
          <button onClick={() => setActiveTab('feedback')} className={`flow-step ${activeTab === 'feedback' ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><MessageSquare size={14}/></span>Feedback
          </button>
        </aside>

        <section className="content-grid">
           {activeTab === 'faq' && (
              <div className="panel">
                 <div className="section-head">
                    <h3 className="side-title">Common Questions</h3>
                 </div>
                 <div className="ride-list mt-20">
                    <div className="ride-card">
                       <h4>How do I know my ride is confirmed?</h4>
                       <p className="muted small">Once the host accepts your request, the status changes to "Accepted" in your dashboard.</p>
                    </div>
                    <div className="ride-card">
                       <h4>How do I pay?</h4>
                       <p className="muted small">Pay directly to the host via UPI after the trip is completed.</p>
                    </div>
                    <div className="ride-card">
                       <h4>What if a host no-shows?</h4>
                       <p className="muted small">Raise a "Ride Problem" ticket immediately with the Trip ID.</p>
                    </div>
                 </div>
              </div>
           )}

           {activeTab === 'ticket' && (
              <div className="panel">
                 <div className="section-head">
                    <h3 className="side-title">Raise a Ticket</h3>
                 </div>
                 <form onSubmit={handleSubmit} className="form-grid mt-20">
                    <div className="field">
                       <label>Issue Type</label>
                       <select value={ticketForm.issue_type} onChange={e => setTicketForm({...ticketForm, issue_type: e.target.value})}>
                          <option value="payment">Payment Issue</option>
                          <option value="ride">Ride Problem</option>
                          <option value="safety">Safety Concern</option>
                          <option value="other">Other</option>
                       </select>
                    </div>
                    <div className="field">
                       <label>Trip ID (Optional)</label>
                       <input placeholder="e.g. 1042" value={ticketForm.trip_id} onChange={e => setTicketForm({...ticketForm, trip_id: e.target.value})} />
                    </div>
                    <div className="field" style={{gridColumn:'span 2'}}>
                       <label>Describe the Issue</label>
                       <textarea rows={4} style={{width:'100%', padding:'12px', borderRadius:'12px', border:'1px solid var(--line)', background:'var(--bg-panel)'}} 
                          value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} required />
                    </div>
                    <div className="hero-actions mt-20">
                       <button type="submit" className="primary-btn" disabled={loading}>
                          {loading ? "Submitting..." : "Submit Ticket"}
                       </button>
                    </div>
                 </form>
              </div>
           )}
        </section>
      </div>
    </div>
  );
}

export default function Support() {
  return (
    <Suspense fallback={<div className="screen active center">Loading...</div>}>
      <SupportContent />
    </Suspense>
  );
}
