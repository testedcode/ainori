'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Shield, Lock, Eye, AlertTriangle, CheckCircle2, Phone, Users,
  CreditCard, Key, Fingerprint, ArrowLeft, ChevronDown, ChevronUp,
  Bell, Car, UserCheck, Zap, Globe, Server, ShieldAlert, Heart,
  ArrowRight, Star
} from 'lucide-react'
import JoolNav from '../components/JoolNav'

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function AnimCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0
        const step = to / 60
        const t = setInterval(() => {
          start += step
          if (start >= to) { setVal(to); clearInterval(t) }
          else setVal(Math.floor(start))
        }, 16)
        obs.disconnect()
      }
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val}{suffix}</span>
}

// ─── SECTION REVEAL ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {children}
    </div>
  )
}

// ─── ACCORDION ────────────────────────────────────────────────────────────────
function Accordion({ q, a, icon: Icon, color }: { q: string; a: string; icon: any; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(!open)}
      className={`border rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden ${open ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04]'}`}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${open ? 'bg-blue-500/20' : 'bg-white/5'}`}>
            <Icon className={`w-4 h-4 ${open ? 'text-blue-400' : color}`} />
          </div>
          <p className="font-bold text-sm text-white">{q}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/20 flex-shrink-0" />}
      </div>
      {open && (
        <div className="px-5 pb-5 ml-11">
          <p className="text-sm text-slate-400 leading-relaxed border-l-2 border-blue-500/30 pl-4">{a}</p>
        </div>
      )}
    </div>
  )
}

// ─── SAFETY PILLARS ───────────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: UserCheck, title: 'Verified-Only Network', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
    desc: 'Every JOOL user is manually reviewed before getting access. We verify profiles to ensure only genuine colleagues from the same residential or office community can participate.',
    points: ['Profile review before activation', 'Community-based access control', 'No anonymous users on the platform']
  },
  {
    icon: CreditCard, title: 'Zero Payment Data Stored', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20',
    desc: 'JOOL never handles, stores, or processes any payment data. All financial transactions happen directly between users via UPI — peer to peer, zero platform involvement.',
    points: ['No card or bank details collected', 'UPI payments are user-to-user only', 'We never see or store transaction data']
  },
  {
    icon: Lock, title: 'Secure Authentication', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
    desc: 'Login sessions are protected with JWT token-based authentication with expiry. Your credentials are hashed and never stored in plain text. 2FA via SMS/email is coming soon.',
    points: ['bcrypt password hashing (cost factor 12)', 'JWT with automatic expiry', '2-Factor Authentication — coming soon']
  },
  {
    icon: Eye, title: 'Minimal Data Exposure', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
    desc: 'Personal data like phone number and UPI ID is only revealed to confirmed ride participants. Public profiles show only name and trust score — nothing else.',
    points: ['Phone shown only to confirmed co-riders', 'UPI ID gated behind ride confirmation', 'No public data broker exposure']
  },
  {
    icon: ShieldAlert, title: 'Incident Reporting', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20',
    desc: 'Any user can raise a safety concern directly from the ride detail page. All reports are reviewed within 24 hours. Repeat offenders are suspended from the platform.',
    points: ['1-tap SOS report on any ride', '24-hour review SLA', 'Pattern-based account suspension']
  },
  {
    icon: Server, title: 'Secure Infrastructure', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20',
    desc: 'JOOL runs on enterprise-grade cloud infrastructure with encrypted data in transit (TLS 1.3) and at rest. Database access is IP-restricted with role-based access control.',
    points: ['TLS 1.3 for all data in transit', 'Encrypted database at rest', 'Role-based DB access control']
  },
]

const PAYMENT_FLOW = [
  { step: '01', icon: CheckCircle2, title: 'Ride Confirmed', desc: 'Host accepts your request. Seat is reserved.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { step: '02', icon: Car, title: 'Travel Together', desc: 'Complete the commute with your co-riders.', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { step: '03', icon: Phone, title: 'Pay via UPI', desc: 'Directly transfer to host\'s UPI. JOOL is not involved.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { step: '04', icon: CheckCircle2, title: 'Mark as Done', desc: 'Both rider and host confirm payment in the app.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
]

const SECURITY_QA = [
  { q: 'Is my phone number visible to everyone?', a: 'No. Your phone number is only shown to confirmed co-riders on a specific accepted ride. It is never shown to users who are pending, rejected, or on other rides.', icon: Phone, color: 'text-blue-400' },
  { q: 'Does JOOL store my UPI ID?', a: 'Your UPI ID is stored in your profile and is only shown to confirmed co-riders on a specific ride. JOOL never initiates or processes any UPI transactions — all payments are purely peer-to-peer between users.', icon: CreditCard, color: 'text-green-400' },
  { q: 'How are passwords protected?', a: 'Passwords are hashed using bcrypt with a cost factor of 12. We never store plain-text passwords. In the event of any breach (which we work hard to prevent), your actual password is never exposed.', icon: Lock, color: 'text-amber-400' },
  { q: 'What happens if I report a safety issue?', a: 'Your report goes directly to the JOOL safety team. The accused account is flagged for review. We respond within 24 hours. Serious violations result in immediate suspension pending investigation.', icon: ShieldAlert, color: 'text-red-400' },
  { q: 'Is 2FA available?', a: 'We are actively building 2-Factor Authentication (SMS + Email OTP). This will be rolled out as part of our global login upgrade. Until then, strong JWT-based session management is in place.', icon: Fingerprint, color: 'text-purple-400' },
  { q: 'What data does JOOL collect?', a: 'We collect only what is necessary: name, email, phone, vehicle details (for hosts), and ride activity. We do not collect payment data, location continuously, or sell data to third parties.', icon: Eye, color: 'text-cyan-400' },
]

export default function SafetyPage() {
  const [activeSection, setActiveSection] = useState(0)

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-32 overflow-x-hidden">
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[200px] -z-10 pointer-events-none rounded-full" />
      <div className="fixed top-1/2 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none rounded-full" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-green-600/4 blur-[150px] -z-10 pointer-events-none rounded-full" />

      <JoolNav />

      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-16">
        <Reveal>
          <div className="flex items-center gap-2 mb-6">
            <Link href="/support" className="inline-flex items-center gap-2 text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-widest">
              <ArrowLeft className="w-3 h-3" /> Support
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Safety Policy</span>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">All Systems Secure · Last reviewed April 2025</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none mb-6">
            Your Safety<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-green-400">
              Is Our Priority.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            JOOL is a community-first platform. Every feature we build starts with one question — <em className="text-white">is this safe for our users?</em> Here is exactly how we protect you.
          </p>
        </Reveal>

        {/* Stats bar */}
        <Reveal delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
            {[
              { label: 'Verified Users Only', value: 100, suffix: '%', icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Payment Data Stored', value: 0, suffix: ' bytes', icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Ticket Response SLA', value: 24, suffix: 'h', icon: Bell, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'TLS Encryption', value: 1.3, suffix: '', icon: Lock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className={`${s.bg} border border-white/10 rounded-3xl p-6 text-center`}>
                  <Icon className={`w-6 h-6 ${s.color} mx-auto mb-3`} />
                  <p className={`text-3xl font-black ${s.color} mb-1`}>
                    {i === 3 ? 'v1.3' : <AnimCounter to={s.value} suffix={s.suffix} />}
                  </p>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.label}</p>
                </div>
              )
            })}
          </div>
        </Reveal>
      </section>

      {/* ─── SAFETY PILLARS ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 mb-24">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-3">Built-in Safety</p>
            <h2 className="text-4xl font-black tracking-tighter">6 Layers of Protection</h2>
            <p className="text-slate-500 mt-3 text-sm max-w-xl mx-auto">Every safety measure is active by default. No settings to configure, no opt-in required.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <Reveal key={i} delay={i * 80}>
                <div className={`group h-full bg-white/[0.02] border ${p.border} rounded-[2.5rem] p-8 hover:bg-white/[0.05] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}>
                  <div className={`w-14 h-14 ${p.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-7 h-7 ${p.color}`} />
                  </div>
                  <h3 className="font-black text-white text-xl mb-3 leading-tight">{p.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5">{p.desc}</p>
                  <ul className="space-y-2">
                    {p.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${p.color} flex-shrink-0 mt-0.5`} />
                        <span className="text-[11px] font-bold text-white/60">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ─── PAYMENT SAFETY FLOW ───────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 mb-24">
        <Reveal>
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-500/20 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Payment Safety</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
                JOOL Never Touches Your Money
              </h2>
              <p className="text-slate-400 text-base mb-12 max-w-2xl leading-relaxed">
                Payments on JOOL are 100% peer-to-peer via UPI. We do not act as a payment gateway, intermediary, or wallet. We do not store any card numbers, bank details, or UPI transaction records.
              </p>

              {/* Flow diagram */}
              <div className="flex flex-col md:flex-row items-stretch gap-4">
                {PAYMENT_FLOW.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={i} className="flex-1 flex flex-col md:flex-row items-center gap-4">
                      <div className={`flex-1 ${step.bg} border border-white/10 rounded-2xl p-6 text-center`}>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${step.color} mb-3`}>Step {step.step}</p>
                        <Icon className={`w-8 h-8 ${step.color} mx-auto mb-3`} />
                        <h4 className="font-black text-white text-sm mb-1">{step.title}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                      </div>
                      {i < PAYMENT_FLOW.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-white/10 flex-shrink-0 rotate-90 md:rotate-0" />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  <span className="font-black text-white">Important:</span> JOOL only records whether users have <em>marked</em> a payment as done — not the actual transaction. We have zero visibility into UPI transaction data.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── AUTH SECURITY ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal>
            <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/10 border border-amber-500/20 rounded-[2.5rem] p-10 h-full">
              <Key className="w-8 h-8 text-amber-400 mb-5" />
              <h3 className="text-2xl font-black tracking-tight mb-3">Authentication Security</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your login credentials are protected at every layer. Passwords are never stored as-is — they go through a one-way cryptographic hash.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Lock, label: 'bcrypt hashing', desc: 'Cost factor 12 — computationally expensive to crack' },
                  { icon: Zap, label: 'JWT Sessions', desc: 'Tokens expire automatically — no indefinite sessions' },
                  { icon: Globe, label: 'HTTPS Only', desc: 'All communication is TLS 1.3 encrypted end-to-end' },
                  { icon: Fingerprint, label: '2FA (Coming Soon)', desc: 'SMS + Email OTP for double verification' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">{item.label}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/20 rounded-[2.5rem] p-10 h-full">
              <Heart className="w-8 h-8 text-purple-400 mb-5" />
              <h3 className="text-2xl font-black tracking-tight mb-3">Community Safety Standards</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Beyond technical security, JOOL enforces community standards that keep every interaction respectful and safe.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Verified profiles only', status: 'Active' },
                  { label: 'Trust score system', status: 'Active' },
                  { label: 'Ride-level reporting', status: 'Active' },
                  { label: 'Host acceptance control', status: 'Active' },
                  { label: 'Repeat offender flagging', status: 'Active' },
                  { label: 'Anonymous complaint channel', status: 'Soon' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-sm font-bold text-white">{item.label}</span>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${item.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── SECURITY FAQ ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 mb-24">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-3">Common Questions</p>
            <h2 className="text-3xl font-black tracking-tighter">Safety FAQ</h2>
          </div>
        </Reveal>
        <div className="space-y-3">
          {SECURITY_QA.map((item, i) => (
            <Reveal key={i} delay={i * 50}>
              <Accordion q={item.q} a={item.a} icon={item.icon} color={item.color} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── REPORT CTA ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 md:px-12">
        <Reveal>
          <div className="bg-gradient-to-r from-red-900/20 via-rose-900/10 to-transparent border border-red-500/20 rounded-[3rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">See Something Wrong?</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  If you witness unsafe behavior, payment fraud, or any violation of community standards — report it immediately. All reports are reviewed by a human within 24 hours.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link
                href="/support?tab=ticket&issue=safety"
                className="px-8 py-4 bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl transition-all text-sm flex items-center gap-2 shadow-lg shadow-red-500/20 whitespace-nowrap"
              >
                <ShieldAlert className="w-4 h-4" /> Report Safety Issue
              </Link>
              <Link
                href="/support"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white/60 hover:text-white font-black rounded-2xl transition-all text-sm text-center"
              >
                General Support
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
