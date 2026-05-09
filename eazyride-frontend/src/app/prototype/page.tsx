'use client'
import { useState } from 'react';
import { 
  Car, ShieldCheck, Leaf, Banknote, Clock, ArrowRight, 
  User, Sparkles, MapPin, CheckCircle2, Navigation,
  Building2, Home, Zap, Calendar, Bookmark, Users, Crown
} from 'lucide-react';

export default function PrototypePage() {
  const [user] = useState({ name: "Aayushi Singh", role: "MEMBER", approved: true });

  return (
    <div className="screen active">
      {/* 1. EazyRide Hero Adaptation (Pulse Account Hero) */}
      <section className="hero" style={{ paddingBottom: '0' }}>
        <div className="hero-card">
          <span className="eyebrow"><span className="dot"></span>{user.role} Account</span>
          <h1>Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="lead">Your office commute is optimized and ready. You have saved 450g of Carbon this week.</p>
          <div className="hero-actions">
            <a href="/share" className="primary-btn">Offer a ride</a>
            <a href="/book" className="secondary-btn">Find a ride</a>
          </div>
          
          {/* Pulse Stats in EazyRide Metrics */}
          <div className="metric-row">
            <div className="metric">
                <div className="icon-bubble green mb-12"><Leaf size={20} /></div>
                <strong>450g</strong><span>carbon saved</span>
            </div>
            <div className="metric">
                <div className="icon-bubble mb-12"><Zap size={20} /></div>
                <strong>12</strong><span>total rides</span>
            </div>
            <div className="metric">
                <div className="icon-bubble gold mb-12"><Banknote size={20} /></div>
                <strong>₹3,420</strong><span>money saved</span>
            </div>
          </div>
        </div>

        {/* AI Insight Adapted to Panel */}
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

      {/* 2. Main Dashboard Content (2-Column Layout) */}
      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Trip Management</div>
          <a href="#" className="flow-step active"><span className="step-no"><Bookmark size={14}/></span>Active Rides</a>
          <a href="#" className="flow-step"><span className="step-no"><Calendar size={14}/></span>History</a>
          <a href="#" className="flow-step"><span className="step-no"><User size={14}/></span>Profile</a>
          <a href="#" className="flow-step"><span className="step-no"><Navigation size={14}/></span>Routes</a>
        </aside>

        <section className="content-grid">
          <div className="section-head">
             <div>
               <h2>My Active Rides</h2>
               <p>Your confirmed trips for today and tomorrow.</p>
             </div>
             <button className="light-btn">Clear All</button>
          </div>

          {/* Pulse Ride Card adapted to EazyRide .ride-card */}
          <div className="ride-list">
            <div className="ride-card top-match">
                <div className="ride-top">
                    <div className="driver">
                        <div className="avatar">AS</div>
                        <div>
                            <h4>Casa Rio → RCP</h4>
                            <span>Pilot: Aayushi Singh • Car: Honda City</span>
                        </div>
                    </div>
                    <div className="price">
                        <strong>08:30</strong>
                        <span>DEPARTURE</span>
                    </div>
                </div>
                
                <div className="tag-row">
                    <span className="tag green">Confirmed</span>
                    <span className="tag">Gate 1 Pickup</span>
                    <span className="tag gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Crown size={12}/> Premium</span>
                </div>

                <div className="ride-meta">
                    <div className="meta-box"><small>Date</small><strong>12 May</strong></div>
                    <div className="meta-box"><small>Route</small><strong>To Office</strong></div>
                    <div className="meta-box"><small>Status</small><strong>Authorized</strong></div>
                    <div className="meta-box"><small>Seats</small><strong>4 Filled</strong></div>
                </div>

                <div className="ride-actions">
                    <div className="route-mini">
                        <MapPin size={14} style={{ marginRight: '4px' }}/> <b>Gate 1</b> to <b>RCP Main</b>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="light-btn small">At Spot</button>
                        <button className="dark-btn small">Details</button>
                    </div>
                </div>
            </div>

            {/* Empty State / Placeholder Example */}
            <div className="panel center" style={{ borderStyle: 'dashed', padding: '60px' }}>
                <p className="muted">No other rides scheduled for today.</p>
                <button className="primary-btn mt-16">Offer a route</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
