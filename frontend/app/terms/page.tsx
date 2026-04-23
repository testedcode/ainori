'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  FileText, ArrowLeft, ChevronDown, ChevronUp, CheckCircle2,
  Car, Users, CreditCard, AlertTriangle, Shield, BookOpen,
  Clock, Globe, UserX, Ban, Scale, MessageSquare, ArrowRight, Zap
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

function SectionBlock({ id, num, title, icon: Icon, color, bg, border, children }: any) {
  return (
    <section id={id} className="scroll-mt-20">
      <Reveal>
        <div className={`border ${border} rounded-[2.5rem] p-8 md:p-12 ${bg} relative overflow-hidden`}>
          <div className="flex items-start gap-5 mb-8">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/5`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${color} mb-1`}>Section {num}</p>
              <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
            </div>
          </div>
          <div className="space-y-4 text-slate-400 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

const SECTIONS = [
  { id: 'acceptance', num: '01', title: 'Acceptance of Terms', icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/[0.03]', border: 'border-blue-500/20' },
  { id: 'platform', num: '02', title: 'Platform Role', icon: Car, color: 'text-indigo-400', bg: 'bg-indigo-500/[0.03]', border: 'border-indigo-500/20' },
  { id: 'eligibility', num: '03', title: 'Eligibility', icon: UserX, color: 'text-amber-400', bg: 'bg-amber-500/[0.03]', border: 'border-amber-500/20' },
  { id: 'accounts', num: '04', title: 'User Accounts', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/[0.03]', border: 'border-purple-500/20' },
  { id: 'rides', num: '05', title: 'Ride Conduct', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.03]', border: 'border-cyan-500/20' },
  { id: 'payments', num: '06', title: 'Payments', icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/[0.03]', border: 'border-green-500/20' },
  { id: 'prohibited', num: '07', title: 'Prohibited Conduct', icon: Ban, color: 'text-red-400', bg: 'bg-red-500/[0.03]', border: 'border-red-500/20' },
  { id: 'termination', num: '08', title: 'Termination', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/[0.03]', border: 'border-orange-500/20' },
  { id: 'liability', num: '09', title: 'Liability', icon: Scale, color: 'text-slate-400', bg: 'bg-white/[0.02]', border: 'border-white/10' },
  { id: 'changes', num: '10', title: 'Changes to Terms', icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/[0.03]', border: 'border-yellow-500/20' },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('acceptance')
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const sections = SECTIONS.map(s => document.getElementById(s.id))
      const scrollY = window.scrollY + 200
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i]
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(SECTIONS[i].id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-32">
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/4 blur-[200px] -z-10 pointer-events-none rounded-full" />

      <JoolNav />

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-12">
        <Reveal>
          <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest">
            <Link href="/" className="text-white/30 hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Home
            </Link>
            <span className="text-white/10">/</span>
            <span className="text-blue-400">Terms of Service</span>
          </div>

          <div className="flex items-start gap-6 mb-8">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-3">
                Terms of<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Service</span>
              </h1>
              <div className="flex items-center gap-4 text-[10px] font-black text-white/30 uppercase tracking-widest">
                <span>Effective: April 2025</span>
                <span className="text-white/10">·</span>
                <span>Version 1.0</span>
                <span className="text-white/10">·</span>
                <span className="text-blue-400">Ainori / JOOL Platform</span>
              </div>
            </div>
          </div>

          <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <p className="text-sm text-slate-400 leading-relaxed">
              <span className="font-black text-white">Please read these terms carefully.</span> By creating an account or using JOOL, you agree to be bound by these Terms. If you do not agree, do not use the platform.
            </p>
          </div>
        </Reveal>

        {/* Mobile nav toggle */}
        <div className="md:hidden mt-6">
          <button onClick={() => setNavOpen(!navOpen)} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400" /> Jump to Section</span>
            {navOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {navOpen && (
            <div className="mt-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {SECTIONS.map(s => (
                <a key={s.id} href={`#${s.id}`} onClick={() => setNavOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold border-b border-white/5 last:border-0 transition-colors ${activeSection === s.id ? 'text-blue-400 bg-blue-500/5' : 'text-white/40 hover:text-white'}`}>
                  <s.icon className="w-3 h-3" /> {s.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="flex gap-10">
          {/* Sticky sidebar */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white/[0.02] border border-white/10 rounded-[2rem] p-4 overflow-hidden">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-4 px-2">Contents</p>
              {SECTIONS.map(s => {
                const Icon = s.icon
                return (
                  <a key={s.id} href={`#${s.id}`}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all mb-0.5 ${activeSection === s.id ? `${s.color} bg-white/5` : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                    <Icon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </a>
                )
              })}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-6">

            <SectionBlock id="acceptance" num="01" title="Acceptance of Terms" icon={CheckCircle2} color="text-blue-400" bg="bg-blue-500/[0.03]" border="border-blue-500/20">
              <p>By accessing or using the JOOL / Ainori carpooling platform (the &ldquo;Platform&rdquo;), whether through our website or any associated application, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).</p>
              <p>These Terms form a legally binding agreement between you and Ainori (operating as JOOL). If you are using the Platform on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.</p>
              <p>Your continued use of the Platform following any modifications to these Terms constitutes your acceptance of the revised Terms.</p>
            </SectionBlock>

            <SectionBlock id="platform" num="02" title="Platform Role — We Are a Connector" icon={Car} color="text-indigo-400" bg="bg-indigo-500/[0.03]" border="border-indigo-500/20">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-2">
                <p className="font-black text-white text-sm">JOOL is a technology platform, not a transport provider.</p>
              </div>
              <p>JOOL connects verified community members who wish to share their private commutes. We do not own, operate, or control any vehicle. We do not employ drivers. We are not a taxi, cab, or ride-hailing service.</p>
              <p>Hosts (ride providers) and Riders (co-commuters) enter into a private arrangement facilitated by the Platform. JOOL is not a party to that arrangement and accepts no liability arising from it, except as expressly stated in these Terms.</p>
              <p>The Platform merely provides tools for users to find each other, communicate, coordinate timing, and track payment status. Actual vehicle operation, passenger safety during transit, and financial settlement remain the responsibility of the individual users involved.</p>
            </SectionBlock>

            <SectionBlock id="eligibility" num="03" title="Eligibility" icon={UserX} color="text-amber-400" bg="bg-amber-500/[0.03]" border="border-amber-500/20">
              <p>To use JOOL you must:</p>
              <ul className="space-y-2 ml-4">
                {['Be at least 18 years of age', 'Be a resident of or work in a community or campus served by a JOOL corridor', 'Have a valid government-issued ID if requested during verification', 'Have a valid driving licence if offering rides as a Host', 'Not have been previously suspended or banned from the Platform'].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>JOOL reserves the right to deny access to any person at its sole discretion.</p>
            </SectionBlock>

            <SectionBlock id="accounts" num="04" title="User Accounts" icon={Users} color="text-purple-400" bg="bg-purple-500/[0.03]" border="border-purple-500/20">
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify JOOL immediately at our support channel if you suspect unauthorized access to your account.</p>
              <p>You are responsible for all activity that occurs under your account. JOOL will not be liable for any loss or damage arising from unauthorized use of your account if you failed to maintain reasonable security practices (e.g., sharing your password).</p>
              <p>Each person may hold only one account. Creating multiple accounts to circumvent a suspension or ban is a violation of these Terms and will result in permanent removal from the Platform.</p>
              <p>Your profile information must be accurate and up to date. Misrepresentation of identity, vehicle details, or community membership is grounds for immediate termination.</p>
            </SectionBlock>

            <SectionBlock id="rides" num="05" title="Ride Conduct" icon={Globe} color="text-cyan-400" bg="bg-cyan-500/[0.03]" border="border-cyan-500/20">
              <p><strong className="text-white">For Hosts:</strong> By posting a ride, you confirm that (a) you hold a valid driving licence, (b) your vehicle is roadworthy, insured, and registered, and (c) you will follow all applicable traffic laws. You accept full responsibility for the safe operation of your vehicle.</p>
              <p><strong className="text-white">For Riders:</strong> By requesting a seat, you confirm that you will be at the designated pickup point at the agreed time, will behave respectfully toward the Host and other co-riders, and will settle the agreed payment after the ride.</p>
              <p><strong className="text-white">Cancellations:</strong> Pending requests may be retracted any time before acceptance. Once a seat is confirmed, cancellations should be communicated to the Host at least 1 hour before departure. Repeated last-minute cancellations may affect your Trust Score and access to the Platform.</p>
              <p><strong className="text-white">No-shows:</strong> Hosts or Riders who repeatedly fail to honor confirmed rides without notice may be suspended.</p>
            </SectionBlock>

            <SectionBlock id="payments" num="06" title="Payments — Peer to Peer Only" icon={CreditCard} color="text-green-400" bg="bg-green-500/[0.03]" border="border-green-500/20">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl mb-2">
                <p className="font-black text-white text-sm">JOOL does not process, hold, or mediate any payments. Zero commission is charged by the Platform.</p>
              </div>
              <p>All financial contributions (referred to as &ldquo;seat contributions&rdquo;) are paid directly by the Rider to the Host using UPI or any mutually agreed method. JOOL provides UPI deep links as a convenience feature — we do not initiate, verify, or store any transaction data.</p>
              <p>Pricing is set solely by the Host. JOOL provides community pricing guidelines but does not enforce them. The agreed price between Host and Rider governs.</p>
              <p>JOOL is not responsible for failed payments, disputed amounts, or non-payment. Payment disputes should be raised via our support ticket system, and our team will facilitate communication — but cannot compel payment on behalf of either party.</p>
            </SectionBlock>

            <SectionBlock id="prohibited" num="07" title="Prohibited Conduct" icon={Ban} color="text-red-400" bg="bg-red-500/[0.03]" border="border-red-500/20">
              <p>The following actions are strictly prohibited and may result in immediate account termination:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {[
                  'Posting false or misleading ride information',
                  'Harassing, threatening, or abusing other users',
                  'Using the Platform for any commercial cab or taxi service',
                  'Carrying more passengers than your vehicle is licensed for',
                  'Driving under the influence of alcohol or drugs',
                  'Collecting payment beyond the agreed seat contribution',
                  'Creating fake accounts or impersonating others',
                  'Attempting to access or scrape the Platform\'s data unlawfully',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                    <Ban className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </SectionBlock>

            <SectionBlock id="termination" num="08" title="Termination" icon={Clock} color="text-orange-400" bg="bg-orange-500/[0.03]" border="border-orange-500/20">
              <p>JOOL may suspend or terminate your access to the Platform at any time, with or without notice, for conduct that we believe violates these Terms, harms other users, or is otherwise harmful to the Platform or the community.</p>
              <p>You may terminate your account at any time by contacting us via the support page. Upon termination, your profile data will be handled per our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>.</p>
              <p>Termination does not release you from obligations incurred prior to termination, including outstanding payment obligations to other users.</p>
            </SectionBlock>

            <SectionBlock id="liability" num="09" title="Limitation of Liability" icon={Scale} color="text-slate-400" bg="bg-white/[0.02]" border="border-white/10">
              <p>To the maximum extent permitted by applicable law, JOOL and its team members shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Platform, including but not limited to accidents during rides, payment disputes, or data loss.</p>
              <p>JOOL&apos;s total liability to you for any claim arising from these Terms or the Platform shall not exceed INR 1,000 (one thousand rupees), being the approximate equivalent of the platform&apos;s fee-free nature to users.</p>
              <p>Nothing in these Terms excludes liability for fraud, personal injury caused by negligence, or any other liability that cannot be excluded under Indian law.</p>
            </SectionBlock>

            <SectionBlock id="changes" num="10" title="Changes to These Terms" icon={AlertTriangle} color="text-yellow-400" bg="bg-yellow-500/[0.03]" border="border-yellow-500/20">
              <p>JOOL reserves the right to modify these Terms at any time. When we make material changes, we will update the &ldquo;Effective&rdquo; date at the top of this page and, where practicable, notify users via in-app notification or email.</p>
              <p>Your continued use of the Platform after the revised Terms take effect constitutes your acceptance. If you do not agree to the changes, you must stop using the Platform and may request account deletion.</p>
            </SectionBlock>

            {/* Contact */}
            <Reveal>
              <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-500/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <MessageSquare className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="font-black text-white">Questions about these Terms?</p>
                    <p className="text-sm text-slate-400">Our team is happy to explain anything.</p>
                  </div>
                </div>
                <Link href="/support" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all flex items-center gap-2 whitespace-nowrap shadow-lg shadow-blue-600/20">
                  Contact Support <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Reveal>

          </div>
        </div>
      </div>
    </div>
  )
}
