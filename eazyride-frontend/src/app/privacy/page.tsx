"use client";
import Link from "next/link";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function Privacy() {
  return (
    <div className="screen active">
      <section className="hero">
        <div className="hero-card">
          <span className="eyebrow"><span className="dot"></span>Legal</span>
          <h1>Privacy Policy</h1>
          <p className="lead">How we protect and manage your community data.</p>
        </div>
      </section>

      <div className="layout mt-28">
        <aside className="panel side-panel">
          <div className="side-title">Legal</div>
          <div className="flow-step active"><span className="step-no"><Shield size={14}/></span>Privacy</div>
          <Link href="/terms" className="flow-step"><span className="step-no"><FileText size={14}/></span>Terms</Link>
        </aside>

        <section className="content-grid">
           <div className="panel">
              <h3 className="side-title">Data Collection</h3>
              <p className="mt-20">We only collect data necessary for coordinating rides and verifying community members. This includes your name, work email, phone number, and vehicle details.</p>
              
              <h3 className="side-title mt-28">Usage</h3>
              <p className="mt-20">Your contact details are only shared with confirmed co-commuters on an accepted ride. We never sell your data to third parties.</p>
              
              <h3 className="side-title mt-28">Security</h3>
              <p className="mt-20">We use industry-standard encryption and secure database protocols to ensure your information remains private.</p>
           </div>
        </section>
      </div>
    </div>
  );
}
