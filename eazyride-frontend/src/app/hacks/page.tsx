"use client";
import { 
  ArrowLeft, Clock, MessageSquare, Banknote, ShieldCheck, 
  Smile, UserCheck, Coffee, Zap, MapPin, Sparkles, Star
} from "lucide-react";
import Link from "next/link";

export default function Hacks() {
  const hacks = [
    {
      title: 'The "Single Seat" Rule',
      desc: 'When requesting a ride, specify exactly which seat you want. Avoid multiple pending requests to different hosts for the same time slot.',
      icon: UserCheck,
      color: 'blue'
    },
    {
      title: 'In-Commute Settlement',
      desc: 'The best way to travel: pay during the ride. Once you are in the vehicle, settle via UPI for instant confirmation.',
      icon: Banknote,
      color: 'green'
    },
    {
      title: 'The Silent Greet',
      desc: 'A simple "Hello" goes a long way. Communicate your preference for a social or silent trip early on.',
      icon: Smile,
      color: 'gold'
    },
    {
      title: 'Digital Notes',
      desc: 'Always post a confirmation message in the ride chat: "Hey, I am at the pickup point." This helps record safety.',
      icon: MessageSquare,
      color: 'blue'
    }
  ];

  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot"></span>Best Practices</span>
          <h1>Helpful Ride Hacks</h1>
          <p className="lead">Simple tips to make your shared commute premium and professional.</p>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Community</div>
          <div className="flow-step active"><span className="step-no"><Sparkles size={14}/></span>Tips & Hacks</div>
          <Link href="/safety" className="flow-step"><span className="step-no"><ShieldCheck size={14}/></span>Safety</Link>
          <Link href="/protocols" className="flow-step"><span className="step-no"><Zap size={14}/></span>Protocols</Link>
        </aside>

        <section className="content-grid">
           <div className="ride-list">
              {hacks.map((hack, i) => (
                <div key={i} className="panel" style={{ padding: '32px', marginBottom: '20px' }}>
                   <div className="ride-top">
                      <div className="driver">
                         <div className={`icon-bubble ${hack.color}`}><hack.icon size={24}/></div>
                         <div>
                            <h3 className="mt-0">{hack.title}</h3>
                            <p className="muted small">{hack.desc}</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="panel mt-28 center" style={{ background: 'var(--primary)', color: 'white', padding: '60px' }}>
              <Star className="mb-16" size={40} />
              <h2 style={{ color: 'white' }}>Contribute a Tip</h2>
              <p className="small" style={{ opacity: 0.8 }}>Have a hack that makes your commute better? Share it with us.</p>
              <button className="light-btn mt-20">Submit Hack</button>
           </div>
        </section>
      </div>
    </div>
  );
}
