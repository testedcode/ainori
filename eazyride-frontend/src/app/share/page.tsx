"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Car, MapPin, Clock, IndianRupee, Sun, Sunset, 
  Check, Loader2, Sparkles, ShieldCheck, ChevronRight 
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Corridor { id: number; name: string; location_from: string; location_to: string }
interface Vehicle { id: number; make: string; model: string; total_seats: number }

const DRAFT_KEY = 'EazyRide_share_draft';

export default function ShareRoute() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [direction, setDirection] = useState<'to_office' | 'to_home'>('to_office');
  
  const [form, setForm] = useState({
    corridor_id: '',
    vehicle_id: '',
    ride_date: new Date().toISOString().split('T')[0],
    ride_time: '08:30',
    pickup_point: '',
    drop_point: '',
    price_per_seat: '120',
    available_seats: '3',
    total_seats: '4',
    round_trip: false
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try { setForm(prev => ({ ...prev, ...JSON.parse(draft) })); } catch (e) {}
    }
    
    Promise.all([
      api.get('/corridors?active=true'), 
      api.get('/vehicles')
    ]).then(([c, v]: any) => {
      if (Array.isArray(c)) setCorridors(c);
      if (Array.isArray(v)) {
        setVehicles(v);
        if (v.length > 0) setForm(p => ({ ...p, vehicle_id: p.vehicle_id || String(v[0].id) }));
      }
    }).catch(() => {});
  }, [router]);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const handleCorridorSelect = (id: string) => {
    const c = corridors.find(cor => String(cor.id) === id);
    if (c) {
      const p = direction === 'to_office' ? c.location_from : c.location_to;
      const d = direction === 'to_office' ? c.location_to : c.location_from;
      setForm(prev => ({ ...prev, corridor_id: id, pickup_point: p, drop_point: d }));
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        corridor_id: parseInt(form.corridor_id),
        vehicle_id: parseInt(form.vehicle_id),
        price_per_seat: parseFloat(form.price_per_seat),
        available_seats: parseInt(form.available_seats),
        total_seats: parseInt(form.total_seats),
        direction: direction,
      };
      await api.post('/rides', payload);
      localStorage.removeItem(DRAFT_KEY);
      toast.success("Ride published successfully!");
      router.push("/dashboard");
    } catch (e: any) {
      toast.error(e.response?.data?.error || "Failed to publish ride");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">Share route</div>
          <button onClick={() => setStep(1)} className={`flow-step ${step === 1 ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no">1</span><div>Route<small>Where & When</small></div>
          </button>
          <button onClick={() => setStep(2)} className={`flow-step ${step === 2 ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no">2</span><div>Car<small>Seats & Vehicle</small></div>
          </button>
          <button onClick={() => setStep(3)} className={`flow-step ${step === 3 ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no">3</span><div>Price<small>Split costs</small></div>
          </button>
          <button onClick={() => setStep(4)} className={`flow-step ${step === 4 ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no">4</span><div>Review<small>Final check</small></div>
          </button>
        </aside>

        <section className="content-grid">
          {step === 1 && (
            <div className="panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow"><span className="dot"></span>Step 1</span>
                  <h2 className="mt-12">Route and Timing</h2>
                  <p>Designed for professionals sharing their daily office commute.</p>
                </div>
              </div>
              <div className="segmented mb-28">
                <button onClick={() => setDirection('to_office')} className={direction === 'to_office' ? 'active' : ''}>To Office</button>
                <button onClick={() => setDirection('to_home')} className={direction === 'to_home' ? 'active' : ''}>To Home</button>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Select Corridor</label>
                  <select value={form.corridor_id} onChange={(e) => handleCorridorSelect(e.target.value)}>
                    <option value="">Choose a route...</option>
                    {corridors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                   <label>Ride Date</label>
                   <input type="date" value={form.ride_date} onChange={(e) => setForm({...form, ride_date: e.target.value})} />
                </div>
                <div className="field">
                  <label>Pickup Location</label>
                  <input value={form.pickup_point} onChange={(e) => setForm({...form, pickup_point: e.target.value})} />
                </div>
                <div className="field">
                  <label>Drop Location</label>
                  <input value={form.drop_point} onChange={(e) => setForm({...form, drop_point: e.target.value})} />
                </div>
                <div className="field">
                  <label>Departure Time</label>
                  <input type="time" value={form.ride_time} onChange={(e) => setForm({...form, ride_time: e.target.value})} />
                </div>
                <div className="field" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setForm({...form, round_trip: !form.round_trip})}>
                  <div className={`tag ${form.round_trip ? 'green' : 'blue'}`} style={{ padding: '4px 12px', borderRadius: '12px' }}>
                    {form.round_trip ? 'YES' : 'NO'}
                  </div>
                  <span className="small font-bold">Auto-post return trip (+10 hours)?</span>
                </div>
              </div>
              <button className="primary-btn mt-28" onClick={() => setStep(2)}>Continue to Car Details</button>
            </div>
          )}

          {step === 2 && (
            <div className="panel">
              <div className="section-head">
                <div><span className="eyebrow"><span className="dot"></span>Step 2</span><h2 className="mt-12">Vehicle and Seats</h2></div>
              </div>
              <div className="form-grid">
                <div className="field">
                  <label>Select Vehicle</label>
                  <select value={form.vehicle_id} onChange={(e) => setForm({...form, vehicle_id: e.target.value})}>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.total_seats} seats)</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Available Passenger Seats</label>
                  <select value={form.available_seats} onChange={(e) => setForm({...form, available_seats: e.target.value})}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Seats</option>)}
                  </select>
                </div>
              </div>
              <div className="hero-actions mt-28">
                <button className="light-btn" onClick={() => setStep(1)}>Back</button>
                <button className="primary-btn" onClick={() => setStep(3)}>Continue to Pricing</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="panel">
              <div className="section-head">
                <div><span className="eyebrow"><span className="dot"></span>Step 3</span><h2 className="mt-12">Set Your Price</h2></div>
              </div>
              <div className="field">
                <label>Price per Seat (₹)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <IndianRupee size={24} className="muted" />
                  <input type="number" style={{ fontSize: '32px', fontWeight: '900', border: 'none', background: 'none', borderBottom: '2px solid var(--line)' }} value={form.price_per_seat} onChange={(e) => setForm({...form, price_per_seat: e.target.value})} />
                </div>
                <p className="small muted mt-12">We recommend ₹100-150 for this route to cover fuel costs.</p>
              </div>
              <div className="hero-actions mt-28">
                <button className="light-btn" onClick={() => setStep(2)}>Back</button>
                <button className="primary-btn" onClick={() => setStep(4)}>Review Listing</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="panel">
              <div className="section-head">
                <div><span className="eyebrow"><span className="dot"></span>Step 4</span><h2 className="mt-12">Review and Publish</h2></div>
              </div>
              <div className="ride-card top-match">
                 <div className="ride-top">
                    <div className="driver">
                       <div className="avatar">P</div>
                       <div>
                          <h4>{corridors.find(c => String(c.id) === form.corridor_id)?.name || "New Route"}</h4>
                          <span>{direction === 'to_office' ? 'Officebound' : 'Homebound'} • {form.ride_time}</span>
                       </div>
                    </div>
                    <div className="price"><strong>₹{form.price_per_seat}</strong><span>per seat</span></div>
                 </div>
                 <div className="tag-row">
                    <span className="tag green">{form.available_seats} seats available</span>
                    <span className="tag">{form.ride_date}</span>
                 </div>
                 <div className="ride-actions">
                    <div className="route-mini"><MapPin size={14} style={{marginRight:'4px'}} /> <b>{form.pickup_point}</b> to <b>{form.drop_point}</b></div>
                 </div>
              </div>
              <div className="hero-actions mt-28">
                <button className="light-btn" onClick={() => setStep(3)}>Edit</button>
                <button className="primary-btn" onClick={handlePublish} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Publish Ride"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
