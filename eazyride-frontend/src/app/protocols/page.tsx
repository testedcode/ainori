"use client";
import { Zap, ShieldCheck, Clock, Users, Ban, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Protocols() {
  const protocols = [
    { title: 'Punctuality', desc: 'Arrive 2 minutes early. Every minute late impacts 3 other colleagues.', icon: Clock, color: 'blue' },
    { title: 'Zero Tolerance', desc: 'Any form of harassment or unprofessional behavior results in instant permanent ban.', icon: Ban, color: 'red' },
    { title: 'Cleanliness', desc: 'No smoking, no strong odors, and maintain vehicle hygiene for co-commuters.', icon: CheckCircle, color: 'green' },
    { title: 'Communication', desc: 'Use ride chat for coordination only. Keep it professional and clear.', icon: Zap, color: 'gold' }
  ];

  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot"></span>Code of Conduct</span>
          <h1>Community Protocols</h1>
          <p className="lead">Rules of the road that keep EazyRide professional and respected.</p>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Standard</div>
          <Link href="/hacks" className="flow-step"><span className="step-no"><ShieldCheck size={14}/></span>Tips</Link>
          <Link href="/safety" className="flow-step"><span className="step-no"><ShieldCheck size={14}/></span>Safety</Link>
          <div className="flow-step active"><span className="step-no"><Zap size={14}/></span>Protocols</div>
        </aside>

        <section className="content-grid">
           <div className="ride-list">
              {protocols.map((p, i) => (
                <div key={i} className="panel" style={{ padding: '32px', marginBottom: '20px' }}>
                   <div className="ride-top">
                      <div className="driver">
                         <div className={`icon-bubble ${p.color}`}><p.icon size={24}/></div>
                         <div>
                            <h3 className="mt-0">{p.title}</h3>
                            <p className="muted small">{p.desc}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}
