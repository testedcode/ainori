"use client";
import Link from "next/link";
import { Shield, FileText, Scale, CheckCircle } from "lucide-react";

export default function Terms() {
  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot"></span>Legal</span>
          <h1>Terms of Service</h1>
          <p className="lead">The agreement for using the EazyRide community platform.</p>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Legal</div>
          <Link href="/privacy" className="flow-step"><span className="step-no"><Shield size={14}/></span>Privacy</Link>
          <div className="flow-step active"><span className="step-no"><FileText size={14}/></span>Terms</div>
        </aside>

        <section className="content-grid">
           <div className="panel">
              <h3 className="side-title">1. Community Conduct</h3>
              <p className="mt-20">EazyRide is a professional carpooling network. Users must maintain professional behavior, punctuality, and adhere to community protocols.</p>
              
              <h3 className="side-title mt-28">2. Ride Sharing</h3>
              <p className="mt-20">Hosts are responsible for maintaining valid vehicle registration and insurance. Riders are responsible for timely seat contributions directly to hosts.</p>
              
              <h3 className="side-title mt-28">3. Liability</h3>
              <p className="mt-20">EazyRide is a platform for coordination. We are not liable for any incidents during rides. Users commute at their own discretion and risk.</p>
              
              <h3 className="side-title mt-28">4. Zero Commission</h3>
              <p className="mt-20">We do not charge a commission for rides. All payments are peer-to-peer via UPI as per community guidelines.</p>
           </div>
        </section>
      </div>
    </div>
  );
}
