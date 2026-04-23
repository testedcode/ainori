'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Eye, ArrowLeft, Database, Lock, Share2, Trash2, Bell,
  Globe, Server, CheckCircle2, AlertTriangle, MessageSquare,
  ArrowRight, UserCheck, CreditCard, ShieldCheck, Cookie
} from 'lucide-react'
import JoolNav from '../components/JoolNav'

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  )
}

const DATA_TABLE = [
  { category: 'Account Info', examples: 'Name, email address, phone number', purpose: 'Identity, login, communication', stored: 'Yes', shared: 'No' },
  { category: 'Vehicle Details', examples: 'Make, model, plate (masked), image', purpose: 'Ride listing for hosts', stored: 'Yes', shared: 'Riders on your ride only' },
  { category: 'UPI ID', examples: 'UPI handle (e.g. name@upi)', purpose: 'Payment facilitation display', stored: 'Yes', shared: 'Confirmed riders only' },
  { category: 'Ride Activity', examples: 'Rides posted, joined, seat requests', purpose: 'Platform functionality, history', stored: 'Yes', shared: 'No' },
  { category: 'Payment Status', examples: '"Marked done" flag only', purpose: 'Settlement tracking', stored: 'Yes', shared: 'Ride participants only' },
  { category: 'Payment Data', examples: 'Card numbers, bank accounts, UPI txn IDs', purpose: 'N/A — not collected', stored: 'Never', shared: 'Never' },
  { category: 'Location', examples: 'Pickup/drop text entered by user', purpose: 'Ride coordination', stored: 'Yes', shared: 'Ride participants only' },
  { category: 'Device / Analytics', examples: 'Browser type, page visits (aggregated)', purpose: 'Platform improvement', stored: 'Aggregated only', shared: 'No' },
]

const RIGHTS = [
  { icon: Eye, title: 'Right to Access', desc: 'You can request a copy of all personal data we hold about you at any time.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: CheckCircle2, title: 'Right to Rectification', desc: 'You can update or correct inaccurate data directly in your profile settings.', color: 'text-green-400', bg: 'bg-green-500/10' },
  { icon: Trash2, title: 'Right to Erasure', desc: 'You can request deletion of your account and associated personal data.', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Share2, title: 'Right to Portability', desc: 'You can request your data in a structured, machine-readable format.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Bell, title: 'Right to Object', desc: 'You can opt out of any non-essential processing of your data.', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Lock, title: 'Right to Restrict', desc: 'You can request we limit processing of your data while a dispute is resolved.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
]

const SECTIONS = [
  { id: 'collect', label: 'Data We Collect', icon: Database },
  { id: 'use', label: 'How We Use It', icon: CheckCircle2 },
  { id: 'share', label: 'Data Sharing', icon: Share2 },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'rights', label: 'Your Rights', icon: UserCheck },
  { id: 'cookies', label: 'Cookies', icon: Cookie },
  { id: 'retention', label: 'Retention', icon: Trash2 },
  { id: 'contact', label: 'Contact', icon: MessageSquare },
]

export default function PrivacyPage() {
  const [active, setActive] = useState('collect')

  useEffect(() => {
    const onScroll = () => {
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id)
        if (el && el.getBoundingClientRect().top <= 200) { setActive(SECTIONS[i].id); break }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-32">
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/4 blur-[200px] -z-10 pointer-events-none rounded-full" />
      <JoolNav />

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-12">
        <Reveal>
          <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest">
            <Link href="/" className="text-white/30 hover:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Home</Link>
            <span className="text-white/10">/</span>
            <span className="text-purple-400">Privacy Policy</span>
          </div>
          <div className="flex items-start gap-6 mb-8">
            <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-3">
                Privacy<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Policy</span>
              </h1>
              <div className="flex items-center gap-4 text-[10px] font-black text-white/30 uppercase tracking-widest">
                <span>Effective: April 2025</span>
                <span className="text-white/10">·</span>
                <span className="text-purple-400">Ainori / JOOL Platform</span>
              </div>
            </div>
          </div>
          <div className="p-5 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
            <p className="text-sm text-slate-400 leading-relaxed">
              <span className="font-black text-white">Your privacy matters to us.</span> This policy explains exactly what data we collect, why, how we protect it, and your rights over it. We do not sell your data. We do not use it for advertising. We collect only what is necessary to run the platform.
            </p>
          </div>
        </Reveal>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="sticky top-24 bg-white/[0.02] border border-white/10 rounded-[2rem] p-4">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4 px-2">Contents</p>
              {SECTIONS.map(s => {
                const Icon = s.icon
                return (
                  <a key={s.id} href={`#${s.id}`}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all mb-0.5 ${active === s.id ? 'text-purple-400 bg-white/5' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                    <Icon className="w-3 h-3 flex-shrink-0" />{s.label}
                  </a>
                )
              })}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-8">

            {/* Data we collect */}
            <section id="collect" className="scroll-mt-20">
              <Reveal>
                <div className="border border-purple-500/20 rounded-[2.5rem] p-8 md:p-12 bg-purple-500/[0.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center"><Database className="w-5 h-5 text-purple-400" /></div>
                    <div><p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Section 01</p><h2 className="text-xl font-black">Data We Collect</h2></div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">We only collect data that is necessary for the platform to function. Below is a complete breakdown of every category of data, what it is used for, and who can see it.</p>
                  <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.03]">
                          {['Category', 'Examples', 'Purpose', 'Stored?', 'Shared?'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-[9px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DATA_TABLE.map((row, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-black text-white whitespace-nowrap">{row.category}</td>
                            <td className="px-4 py-3 text-slate-400">{row.examples}</td>
                            <td className="px-4 py-3 text-slate-400">{row.purpose}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.stored === 'Never' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>{row.stored}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${row.shared === 'Never' || row.shared === 'No' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>{row.shared}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* How we use it */}
            <section id="use" className="scroll-mt-20">
              <Reveal>
                <div className="border border-blue-500/20 rounded-[2.5rem] p-8 bg-blue-500/[0.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-blue-400" /></div>
                    <div><p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Section 02</p><h2 className="text-xl font-black">How We Use Your Data</h2></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                    {[
                      { icon: UserCheck, title: 'Account Management', desc: 'Creating and managing your user profile, login sessions, and access control.', color: 'text-blue-400' },
                      { icon: Globe, title: 'Platform Features', desc: 'Enabling ride posting, discovery, booking, in-ride chat, and history tracking.', color: 'text-indigo-400' },
                      { icon: Bell, title: 'Notifications', desc: 'Alerting you to booking confirmations, request updates, and important platform news.', color: 'text-amber-400' },
                      { icon: ShieldCheck, title: 'Safety & Compliance', desc: 'Investigating reports, enforcing community standards, and preventing fraud.', color: 'text-green-400' },
                      { icon: Server, title: 'Platform Improvement', desc: 'Aggregated, anonymized usage analytics to understand how features are used.', color: 'text-cyan-400' },
                      { icon: MessageSquare, title: 'Support', desc: 'Resolving tickets, responding to queries, and tracking payment dispute communications.', color: 'text-purple-400' },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <Icon className={`w-4 h-4 ${item.color} flex-shrink-0 mt-0.5`} />
                          <div><p className="font-black text-white text-xs mb-1">{item.title}</p><p className="text-xs leading-relaxed">{item.desc}</p></div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-xs text-slate-400"><span className="font-black text-white">We do not use your data for:</span> advertising, third-party marketing, profiling for commercial resale, or any purpose not listed above.</p>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* Sharing */}
            <section id="share" className="scroll-mt-20">
              <Reveal>
                <div className="border border-amber-500/20 rounded-[2.5rem] p-8 bg-amber-500/[0.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center"><Share2 className="w-5 h-5 text-amber-400" /></div>
                    <div><p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Section 03</p><h2 className="text-xl font-black">Data Sharing</h2></div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5"><span className="font-black text-white">We do not sell, rent, or trade your personal data.</span> Data is shared only in the following limited, necessary circumstances:</p>
                  <div className="space-y-3 text-sm text-slate-400">
                    {[
                      { title: 'With ride participants', desc: 'Your name, phone number, and UPI ID are shared with confirmed co-riders on a specific ride. This information is only visible once a seat is confirmed.' },
                      { title: 'With infrastructure providers', desc: 'Our cloud infrastructure (database, hosting) processes your data solely to deliver the service. They are bound by confidentiality obligations.' },
                      { title: 'With legal authorities', desc: 'We will disclose data when required to do so by law, court order, or to protect the rights and safety of users or the public.' },
                      { title: 'With your consent', desc: 'For any other purpose, we will seek your explicit consent before sharing.' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="font-black text-white text-xs mb-1">{item.title}</p>
                        <p className="text-xs leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>

            {/* Security */}
            <section id="security" className="scroll-mt-20">
              <Reveal>
                <div className="border border-green-500/20 rounded-[2.5rem] p-8 bg-green-500/[0.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><Lock className="w-5 h-5 text-green-400" /></div>
                    <div><p className="text-[9px] font-black text-green-400 uppercase tracking-widest">Section 04</p><h2 className="text-xl font-black">How We Protect Your Data</h2></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {[
                      { icon: Lock, title: 'Encrypted Transit', desc: 'TLS 1.3 on all connections', color: 'text-green-400', bg: 'bg-green-500/10' },
                      { icon: Database, title: 'Encrypted at Rest', desc: 'Database encrypted at storage layer', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                      { icon: ShieldCheck, title: 'Password Hashing', desc: 'bcrypt cost-12, never stored plain', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                      { icon: Server, title: 'Access Control', desc: 'Role-based DB access, IP restricted', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                      { icon: UserCheck, title: 'JWT Sessions', desc: 'Auto-expiring session tokens', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                      { icon: AlertTriangle, title: 'Breach Protocol', desc: 'Users notified within 72 hours of breach', color: 'text-red-400', bg: 'bg-red-500/10' },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className={`${item.bg} border border-white/10 rounded-2xl p-5 text-center`}>
                          <Icon className={`w-6 h-6 ${item.color} mx-auto mb-3`} />
                          <p className="font-black text-white text-xs mb-1">{item.title}</p>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-slate-400 text-xs mt-5 leading-relaxed">No system is 100% secure. In the unlikely event of a breach affecting your personal data, we will notify you and relevant authorities within 72 hours in compliance with applicable data protection regulations.</p>
                </div>
              </Reveal>
            </section>

            {/* Your Rights */}
            <section id="rights" className="scroll-mt-20">
              <Reveal>
                <div className="border border-indigo-500/20 rounded-[2.5rem] p-8 bg-indigo-500/[0.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center"><UserCheck className="w-5 h-5 text-indigo-400" /></div>
                    <div><p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Section 05</p><h2 className="text-xl font-black">Your Rights</h2></div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">You have the following rights with respect to your personal data. To exercise any of them, contact us via the Support page.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RIGHTS.map((r, i) => {
                      const Icon = r.icon
                      return (
                        <div key={i} className={`${r.bg} border border-white/10 rounded-2xl p-5`}>
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className={`w-4 h-4 ${r.color}`} />
                            <p className="font-black text-white text-sm">{r.title}</p>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Reveal>
            </section>

            {/* Cookies */}
            <section id="cookies" className="scroll-mt-20">
              <Reveal>
                <div className="border border-white/10 rounded-[2.5rem] p-8 bg-white/[0.02]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"><Cookie className="w-5 h-5 text-slate-400" /></div>
                    <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Section 06</p><h2 className="text-xl font-black">Cookies &amp; Local Storage</h2></div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">JOOL uses minimal browser storage:</p>
                  <div className="space-y-3 text-sm text-slate-400">
                    {[
                      { name: 'Authentication token (localStorage)', purpose: 'Keeps you logged in across sessions', type: 'Essential', expires: 'On logout or expiry' },
                      { name: 'User profile cache (localStorage)', purpose: 'Faster loading of your profile data', type: 'Functional', expires: 'On logout' },
                      { name: 'Theme preference (localStorage)', purpose: 'Remembers your visual theme choice', type: 'Functional', expires: 'Never (manual clear)' },
                    ].map((c, i) => (
                      <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div><p className="font-black text-white text-xs">{c.name}</p><p className="text-[11px] text-slate-500 mt-0.5">{c.purpose}</p></div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className="text-[9px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 font-black">{c.type}</span>
                          <span className="text-[9px] px-2 py-1 rounded-full bg-white/5 text-white/30 font-black">{c.expires}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-500 text-xs mt-4">We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
                </div>
              </Reveal>
            </section>

            {/* Retention */}
            <section id="retention" className="scroll-mt-20">
              <Reveal>
                <div className="border border-red-500/20 rounded-[2.5rem] p-8 bg-red-500/[0.02]">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-400" /></div>
                    <div><p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Section 07</p><h2 className="text-xl font-black">Data Retention &amp; Deletion</h2></div>
                  </div>
                  <div className="text-slate-400 text-sm leading-relaxed space-y-3">
                    <p>We retain your personal data for as long as your account is active or as needed to provide the service. Ride history is retained for 24 months to facilitate dispute resolution.</p>
                    <p>When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are legally required to retain it (e.g., for fraud investigation or regulatory compliance).</p>
                    <p>Aggregated, anonymized ride and usage statistics may be retained indefinitely for platform improvement purposes. These cannot be used to identify you.</p>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mt-2">
                      <p className="font-black text-white text-xs mb-1">To delete your account:</p>
                      <p className="text-xs">Contact us via the <Link href="/support?tab=ticket&issue=account" className="text-blue-400 hover:underline">Support page</Link> with subject &ldquo;Account Deletion Request&rdquo;. We will process it within 7 working days.</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-20">
              <Reveal>
                <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <MessageSquare className="w-8 h-8 text-purple-400 flex-shrink-0" />
                    <div>
                      <p className="font-black text-white">Privacy Questions?</p>
                      <p className="text-sm text-slate-400">Reach out any time. We respond within 48 hours.</p>
                    </div>
                  </div>
                  <Link href="/support" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-purple-600/20">
                    Contact Support <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </Reveal>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
