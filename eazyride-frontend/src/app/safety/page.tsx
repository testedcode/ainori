"use client";
import { ShieldCheck, ShieldAlert, UserCheck, Lock, Eye, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function Safety() {
  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot" style={{background:'var(--red)'}}></span>Core Values</span>
          <h1>Your Safety First</h1>
          <p className="lead">Multi-layer verification and real-time monitoring for peace of mind.</p>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Policies</div>
          <Link href="/hacks" className="flow-step"><span className="step-no"><ShieldCheck size={14}/></span>Tips</Link>
          <div className="flow-step active"><span className="step-no"><ShieldAlert size={14}/></span>Safety</div>
          <Link href="/protocols" className="flow-step"><span className="step-no"><Lock size={14}/></span>Protocols</Link>
        </aside>

        <section className="content-grid">
           <div className="panel">
              <div className="section-head">
                 <h3 className="side-title">Verification Layers</h3>
              </div>
              <div className="choice-row mt-20">
                 <div className="choice-card">
                    <div className="icon-bubble blue"><UserCheck size={20}/></div>
                    <span><strong>Identity Check</strong><br/><span className="muted small">Government ID verification for all hosts.</span></span>
                 </div>
                 <div className="choice-card">
                    <div className="icon-bubble green"><ShieldCheck size={20}/></div>
                    <span><strong>Vehicle Scan</strong><br/><span className="muted small">Registration and insurance validation.</span></span>
                 </div>
              </div>
           </div>

           <div className="panel mt-28">
              <div className="section-head">
                 <h3 className="side-title">In-Ride Safety</h3>
              </div>
              <div className="ride-list mt-20">
                 <div className="ride-card">
                    <div className="driver">
                       <div className="icon-bubble gold"><Eye size={20}/></div>
                       <div>
                          <h4>Real-time Tracking</h4>
                          <p className="muted small">Every ride is logged and monitored by the system for deviations.</p>
                       </div>
                    </div>
                 </div>
                 <div className="ride-card">
                    <div className="driver">
                       <div className="icon-bubble red"><PhoneCall size={20}/></div>
                       <div>
                          <h4>SOS & Support</h4>
                          <p className="muted small">Instant access to help through the support portal for any emergency.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}
