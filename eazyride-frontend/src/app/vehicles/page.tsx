"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Car, Plus, Trash2, Settings, Star, Shield,
  Palette, ChevronRight, CheckCircle2, Loader2, Users
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Vehicle {
  id: number; vehicle_type: string; make: string; model: string;
  color: string; vehicle_number: string; total_seats: number;
  default_available_seats: number; image_url?: string;
}

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan', emoji: '🚗' },
  { value: 'suv', label: 'SUV', emoji: '🚙' },
  { value: 'hatchback', label: 'Hatchback', emoji: '🚘' },
  { value: 'muv', label: 'MUV/MPV', emoji: '🚐' },
  { value: 'bike', label: 'Bike', emoji: '🏍️' },
];

export default function Vehicles() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vehicle_type: 'sedan',
    make: '',
    model: '',
    color: 'White',
    vehicle_number: '',
    total_seats: '4',
    default_available_seats: '3',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchVehicles();
  }, [router]);

  const fetchVehicles = async () => {
    try {
      const data = await api.get('/vehicles');
      if (Array.isArray(data)) setVehicles(data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/vehicles', {
        ...form,
        total_seats: parseInt(form.total_seats),
        default_available_seats: parseInt(form.default_available_seats),
      });
      toast.success('Vehicle registered!');
      setShowForm(false);
      fetchVehicles();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Registration failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Vehicle removed.');
    } catch { toast.error('Failed to remove.'); }
  };

  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">My Garage</div>
          <button onClick={() => setShowForm(false)} className={`flow-step ${!showForm ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><Car size={14}/></span>Vehicles
          </button>
          <button onClick={() => setShowForm(true)} className={`flow-step ${showForm ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><Plus size={14}/></span>Add New
          </button>
        </aside>

        <section className="content-grid">
          {showForm ? (
            <div className="panel">
              <div className="section-head">
                <div>
                  <span className="eyebrow"><span className="dot"></span>Register</span>
                  <h2 className="mt-12">Add a Vehicle</h2>
                  <p>Register your vehicle to start offering rides.</p>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="form-grid mt-28">
                <div className="field">
                  <label>Type</label>
                  <select value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}>
                    {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Brand (Make)</label>
                  <input placeholder="e.g. Honda, Tesla" value={form.make} onChange={e => setForm({...form, make: e.target.value})} required />
                </div>
                <div className="field">
                  <label>Model</label>
                  <input placeholder="e.g. City, Model 3" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required />
                </div>
                <div className="field">
                  <label>Plate Number</label>
                  <input placeholder="MH-04-AB-1234" value={form.vehicle_number} onChange={e => setForm({...form, vehicle_number: e.target.value.toUpperCase()})} required />
                </div>
                <div className="field">
                  <label>Total Seats</label>
                  <input type="number" value={form.total_seats} onChange={e => setForm({...form, total_seats: e.target.value})} />
                </div>
                <div className="field">
                  <label>Default Offering</label>
                  <input type="number" value={form.default_available_seats} onChange={e => setForm({...form, default_available_seats: e.target.value})} />
                </div>
                <div className="hero-actions mt-28">
                  <button type="button" className="light-btn" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="primary-btn" disabled={submitting}>
                    {submitting ? <Loader2 className="animate-spin" /> : "Save Vehicle"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <div className="section-head">
                 <div>
                   <h2>Your Vehicles</h2>
                   <p>Manage the cars you use for commuting.</p>
                 </div>
                 <button onClick={() => setShowForm(true)} className="primary-btn small">Add New</button>
              </div>
              
              {loading ? (
                <div className="panel center"><Loader2 className="animate-spin" /></div>
              ) : vehicles.length === 0 ? (
                <div className="panel center" style={{ borderStyle: 'dashed' }}>
                  <p className="muted">No vehicles registered yet.</p>
                  <button className="primary-btn mt-16" onClick={() => setShowForm(true)}>Add your first car</button>
                </div>
              ) : (
                <div className="ride-list">
                  {vehicles.map(v => (
                    <div key={v.id} className="panel" style={{ padding: '24px', marginBottom: '20px' }}>
                      <div className="ride-top">
                        <div className="driver">
                          <div className="icon-bubble"><Car size={20}/></div>
                          <div>
                            <h4>{v.make} {v.model}</h4>
                            <span>{v.vehicle_number} • {v.color}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(v.id)} className="light-btn small" style={{ color: 'var(--red)' }}><Trash2 size={16}/></button>
                      </div>
                      <div className="tag-row mt-12">
                         <span className="tag blue">{v.vehicle_type.toUpperCase()}</span>
                         <span className="tag">{v.total_seats} Seats</span>
                         <span className="tag green">{v.default_available_seats} Offered by default</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
