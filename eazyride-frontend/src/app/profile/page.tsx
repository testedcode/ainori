"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, Mail, Phone, MapPin, CreditCard, Save, Loader2, 
  Leaf, Star, Award, ShieldCheck, QrCode, Edit3, Camera,
  Building2, Home, Gem, Crown, ShieldAlert
} from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import NotificationManager from "@/components/NotificationManager";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    upi_id: '',
    bio: '',
    avatar_url: '',
    qr_code_url: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const data = await api.getProfile() as any;
      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          city: data.city || '',
          upi_id: data.upi_id || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          qr_code_url: data.qr_code_url || ''
        });
      }
    } catch {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/profile', formData);
      toast.success('Profile updated!');
      setIsEditing(false);
      fetchProfile();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="screen active center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="screen active">
      <div className="layout">
        <aside className="panel side-panel">
          <div className="side-title">My Settings</div>
          <button onClick={() => setIsEditing(false)} className={`flow-step ${!isEditing ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><User size={14}/></span>Overview
          </button>
          <button onClick={() => setIsEditing(true)} className={`flow-step ${isEditing ? 'active' : ''}`} style={{background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer'}}>
            <span className="step-no"><Edit3 size={14}/></span>Edit Profile
          </button>
          <Link href="/history" className="flow-step">
            <span className="step-no"><Award size={14}/></span>Achievements
          </Link>
        </aside>

        <section className="content-grid">
           <div className="panel">
              <h3 className="side-title">Push Notifications</h3>
              <div className="mt-20">
                 <NotificationManager />
              </div>
           </div>

           <div className="panel">
            <div className="section-head">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black overflow-hidden">
                  {formData.avatar_url ? <img src={formData.avatar_url} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : formData.name?.[0]}
                </div>
                <div>
                  <span className="eyebrow"><span className="dot"></span>{profile?.role || 'Member'} Profile</span>
                  <h2 className="mt-8">{formData.name}</h2>
                  <p className="muted">{profile?.email}</p>
                </div>
              </div>
              <div className="hero-actions">
                {profile?.approved ? (
                  <div className="tag green"><ShieldCheck size={12} style={{marginRight:'4px'}}/> Verified</div>
                ) : (
                  <div className="tag gold"><ShieldAlert size={12} style={{marginRight:'4px'}}/> Pending</div>
                )}
              </div>
            </div>

            <div className="metric-row mt-28">
               <div className="metric">
                  <div className="icon-bubble green mb-12"><Leaf size={20}/></div>
                  <strong>{profile?.carbon_credits || 0}g</strong><span>CO₂ Saved</span>
               </div>
               <div className="metric">
                  <div className="icon-bubble mb-12"><Star size={20}/></div>
                  <strong>4.9</strong><span>Trust Score</span>
               </div>
               <div className="metric">
                  <div className="icon-bubble gold mb-12"><Crown size={20}/></div>
                  <strong>PRO</strong><span>Tier</span>
               </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="panel mt-28">
            <div className="section-head">
               <h3 className="side-title">Personal Details</h3>
               {!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="light-btn small">Edit</button>}
            </div>
            <div className="form-grid mt-20">
               <div className="field">
                  <label>Full Name</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!isEditing} />
               </div>
               <div className="field">
                  <label>Phone Number</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} />
               </div>
               <div className="field">
                  <label>Current City</label>
                  <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} disabled={!isEditing} />
               </div>
               <div className="field">
                  <label>UPI ID (for payments)</label>
                  <input value={formData.upi_id} onChange={e => setFormData({...formData, upi_id: e.target.value})} disabled={!isEditing} placeholder="user@upi" />
               </div>
               <div className="field" style={{ gridColumn: 'span 2' }}>
                  <label>About Me</label>
                  <input value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} disabled={!isEditing} placeholder="Tell neighbors about yourself..." />
               </div>
            </div>
            {isEditing && (
              <div className="hero-actions mt-28">
                <button type="button" className="light-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : "Update Profile"}
                </button>
              </div>
            )}
          </form>

          <div className="panel mt-28">
            <div className="side-title">Identity & Payment</div>
            <div className="choice-row mt-12">
               <div className="choice-card">
                  <div className="icon-bubble"><QrCode size={20}/></div>
                  <span><strong>Payment QR</strong><br/><span className="muted small">{formData.qr_code_url ? 'Uploaded' : 'Not uploaded'}</span></span>
               </div>
               <div className="choice-card">
                  <div className="icon-bubble green"><Award size={20}/></div>
                  <span><strong>Verified Status</strong><br/><span className="muted small">{profile?.approved ? 'Confirmed' : 'In Review'}</span></span>
               </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
