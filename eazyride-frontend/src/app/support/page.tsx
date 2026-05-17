'use client'

import { useState, useEffect, Suspense } from 'react'
import {
  Leaf, MessageSquare, Ticket, ChevronDown, ChevronUp,
  Car, Search, CheckCircle2, ArrowRight, Zap,
  IndianRupee, ShieldCheck, MapPin, Users,
  Sparkles, HelpCircle, Send, Star, AlertCircle,
  LifeBuoy, BookOpen, Activity, CreditCard, RefreshCw, CheckCircle
} from 'lucide-react'
import PulseNav from '@/components/PulseNav'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useSearchParams } from 'next/navigation'

// ─── TYPES ───────────────────────────────────────────────────────────────────
type TabType = 'how-it-works' | 'faq' | 'payments' | 'feedback' | 'ticket'

// ─── DATA ────────────────────────────────────────────────────────────────────
const USER_FLOWS = [
  {
    role: 'Ride Seeker',
    icon: Search,
    gradient: 'from-blue-600/20 to-blue-900/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    steps: [
      { title: 'Sign Up & Get Verified', desc: 'Register with your work email. Our team verifies your profile to maintain a trusted network.' },
      { title: 'Explore Active Corridors', desc: 'Browse routes like Casa Rio to RCP, Casa Bella to RCP. Each corridor has live rides posted by colleagues.' },
      { title: 'Pick a Ride & Request Seat', desc: 'Choose a ride that matches your time. Select seats and send a join request to the host.' },
      { title: 'Get Confirmed & Commute', desc: 'Host accepts your request. You are confirmed! Meet at the pickup point and commute together.' },
      { title: 'Settle Payment', desc: 'After the trip, settle your seat contribution directly via UPI to the host.' },
    ]
  },
  {
    role: 'Ride Host',
    icon: Car,
    gradient: 'from-green-600/20 to-green-900/10',
    border: 'border-green-500/20',
    iconBg: 'bg-green-600/20',
    iconColor: 'text-green-600',
    steps: [
      { title: 'Add Your Vehicle', desc: 'Go to My Garage and register your car. This links to all rides you offer.' },
      { title: 'Post Your Commute', desc: 'Use Share Ride to publish your daily commute. Set date, time, pickup, drop-off, and price per seat.' },
      { title: 'Review Join Requests', desc: 'Co-commuters will request seats. Review their profiles and accept or decline.' },
      { title: 'Drive & Drop', desc: 'Pick up confirmed passengers at the agreed point and commute to your destination.' },
      { title: 'Collect Contribution', desc: 'Co-commuters pay you via UPI after the trip. Mark payment as received in the app.' },
    ]
  }
]

const FAQ_ITEMS = [
  {
    q: 'How do I know my ride is confirmed?',
    a: `Once the host accepts your seat request, your dashboard shows the ride as "Confirmed" under Upcoming Trips. You will also see the host's contact details and pickup point clearly.`
  },
  {
    q: 'Can I cancel a ride after booking?',
    a: `Yes, you can retract a pending request any time before it is accepted. Once accepted, please message the host and cancel at least 1 hour before the ride time. Repeated last-minute cancellations affect your trust score.`
  },
  {
    q: `What if the host doesn't show up?`,
    a: 'Use the SOS / Report button on the ride detail page. Our team reviews all reports within 24 hours. Hosts with no-show patterns get flagged and suspended.'
  },
  {
    q: 'Can I offer a ride without a registered vehicle?',
    a: 'No — you need to add at least one vehicle in My Garage before posting a ride. This keeps the platform transparent and safe.'
  },
  {
    q: 'How far in advance can I post or search for rides?',
    a: 'You can post or search rides for today and up to the next 5 days. This keeps the schedule relevant and prevents stale listings.'
  },
  {
    q: 'What is a corridor?',
    a: `A corridor is a fixed route between two key zones — for example, "Casa Rio to RCP". All rides within a corridor follow the same general path, making it easy to find co-commuters along your exact route.`
  },
  {
    q: 'Can I do a round trip (morning + evening)?',
    a: `Yes! When posting a ride, enable the "Round Trip (+10hr)" toggle. It automatically creates a return ride 10 hours after your departure.`
  },
  {
    q: 'Is my personal info visible to everyone?',
    a: `No. Your phone number and UPI ID are only shared with confirmed co-commuters on your accepted ride. Public profiles only show your name and trust score.`
  },
  {
    q: 'What is a Trust Score?',
    a: `Your trust score reflects ride history, punctuality, payment settlements, and community ratings. It ranges from 0-10 and is visible to others when they consider joining your ride.`
  },
  {
    q: 'Can I message someone before confirming a seat?',
    a: `Currently, messaging is available to confirmed participants of a ride. You can view the host's corridor and pickup info before sending a join request.`
  },
]

const CORRIDOR_PRICING = [
  { corridor: 'Casa Rio to RCP', min: 80, suggested: 120, distance: '~8 km', seats: '1-4' },
  { corridor: 'Casa Bella to RCP', min: 80, suggested: 110, distance: '~7 km', seats: '1-4' },
  { corridor: 'Lakeshore to RCP', min: 90, suggested: 130, distance: '~9 km', seats: '1-3' },
  { corridor: 'Kharghar to RCP', min: 100, suggested: 150, distance: '~12 km', seats: '1-3' },
]

// ─── ACCORDION ───────────────────────────────────────────────────────────────
function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className={`border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${open ? 'border-blue-500/30 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-5 gap-4">
        <div className="flex items-start gap-3">
          <HelpCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${open ? 'text-blue-600' : 'text-slate-900/20'}`} />
          <p className="font-bold text-sm text-slate-900 leading-snug">{q}</p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-900/30 flex-shrink-0" />
        }
      </div>
      {open && (
        <div className="px-5 pb-5 pt-0">
          <div className="ml-7 text-sm text-slate-700 leading-relaxed border-l-2 border-blue-500/30 pl-4">
            {a}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
function SupportContent() {
  const searchParams = useSearchParams()

  const [activeTab, setActiveTab] = useState<TabType>('how-it-works')
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', rating: 5, message: '', type: 'general' })
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [ticketForm, setTicketForm] = useState({ name: '', email: '', trip_id: '', issue_type: 'payment', description: '', urgency: 'normal' })
  const [ticketLoading, setTicketLoading] = useState(false)
  const [lastTicketRef, setLastTicketRef] = useState('')
  const [checkRef, setCheckRef] = useState('')
  const [ticketStatus, setTicketStatus] = useState<any>(null)
  const [checkLoading, setCheckLoading] = useState(false)

  // Auto-fill from URL params (deep link from ride detail page)
  useEffect(() => {
    const tab = searchParams.get('tab')
    const tripId = searchParams.get('trip_id')
    const issue = searchParams.get('issue')
    if (tab === 'ticket') setActiveTab('ticket')
    if (tripId || issue) {
      setActiveTab('ticket')
      setTicketForm(prev => ({
        ...prev,
        trip_id: tripId || prev.trip_id,
        issue_type: issue || prev.issue_type,
      }))
    }
  }, [searchParams])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackForm.message.trim() || !feedbackForm.email.trim()) {
      toast.error('Please fill email and message')
      return
    }
    setFeedbackLoading(true)
    try {
      await api.post('/support/feedback', feedbackForm)
      toast.success('Thank you! Your feedback has been received.', { duration: 4000 })
      setFeedbackForm({ name: '', email: '', rating: 5, message: '', type: 'general' })
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setFeedbackLoading(false)
    }
  }

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketForm.email.trim() || !ticketForm.description.trim()) {
      toast.error('Please fill email and describe your issue')
      return
    }
    setTicketLoading(true)
    try {
      const data = await api.post('/support/ticket', ticketForm) as any
      const ref = data.ref
      setLastTicketRef(ref)
      setCheckRef(ref)
      toast.success(`Ticket ${ref} raised! Save this reference number.`, { duration: 8000 })
      setTicketForm({ name: '', email: '', trip_id: '', issue_type: 'payment', description: '', urgency: 'normal' })
    } catch {
      toast.error('Failed to raise ticket. Please try again.')
    } finally {
      setTicketLoading(false)
    }
  }

  const handleCheckTicket = async () => {
    if (!checkRef.trim()) return
    setCheckLoading(true)
    setTicketStatus(null)
    try {
      const ref = checkRef.trim().toUpperCase().startsWith('Pulse-') ? checkRef.trim() : `Pulse-${checkRef.trim()}`
      const data = await api.get(`/support/${ref}`) as any
      setTicketStatus(data)
    } catch {
      toast.error('Ticket not found. Check the reference number.')
    } finally {
      setCheckLoading(false)
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'how-it-works', label: 'How It Works', icon: BookOpen },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'ticket', label: 'Raise Ticket', icon: Ticket },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-32">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-50 blur-[150px] -z-10 pointer-events-none" />
      <div className="fixed top-1/3 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] -z-10 pointer-events-none" />

      <PulseNav />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
              <LifeBuoy className="w-3 h-3" /> COMMUNITY SUPPORT CENTER
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
              We have Got<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Your Back.</span>
            </h1>
            <p className="text-slate-700 mt-4 text-base max-w-lg leading-relaxed">
              Everything you need to understand Pulse, resolve issues, and make your commute experience smooth.
            </p>
          </div>

          {/* Carbon Highlight */}
          <div className="bg-gradient-to-br from-green-600/20 to-emerald-900/20 border border-green-500/20 rounded-[2rem] p-6 md:p-8 min-w-[260px] relative overflow-hidden group">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Carbon Impact</p>
                  <p className="text-[9px] font-black text-slate-900/30 uppercase tracking-wider">Every Ride Counts</p>
                </div>
              </div>
              <p className="text-slate-900 font-bold text-sm leading-relaxed">
                Every shared seat on Pulse means one fewer solo car on the road — directly reducing CO2 emissions for your corridor.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Fewer Solo Cars', 'Verified Routes', 'Tracked Impact'].map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-600 text-[9px] font-black uppercase tracking-wider rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[10px] text-slate-900/30 font-medium">
                Your carbon credit balance in the app reflects your cumulative carpooling impact over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  active ? 'bg-blue-600 text-white shadow-xl' : 'bg-white border border-slate-200 text-slate-900/40 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 md:px-12">

        {/* HOW IT WORKS */}
        {activeTab === 'how-it-works' && (
          <div className="space-y-16">
            <div className="text-center mb-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">User Journey</p>
              <h2 className="text-3xl font-black tracking-tighter">Two ways to use Pulse</h2>
              <p className="text-slate-700 mt-2 text-sm">Whether you are offering a ride or looking for one, here is exactly how it works.</p>
            </div>

            {USER_FLOWS.map((flow) => {
              const Icon = flow.icon
              return (
                <div key={flow.role} className={`bg-gradient-to-br ${flow.gradient} border ${flow.border} rounded-[2.5rem] p-8 md:p-12`}>
                  <div className="flex items-center gap-4 mb-10">
                    <div className={`w-14 h-14 ${flow.iconBg} rounded-2xl flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${flow.iconColor}`} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${flow.iconColor}`}>User Story</p>
                      <h3 className="text-2xl font-black text-slate-900">{flow.role}</h3>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-5 top-6 bottom-6 w-[2px] bg-slate-100 hidden md:block" />
                    <div className="space-y-6">
                      {flow.steps.map((step, i) => (
                        <div key={i} className="flex items-start gap-6 group">
                          <div className={`relative z-10 w-10 h-10 rounded-xl ${flow.iconBg} border ${flow.border} flex items-center justify-center flex-shrink-0 font-black text-sm ${flow.iconColor} group-hover:scale-110 transition-transform`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 pb-2">
                            <h4 className="font-black text-slate-900 mb-1">{step.title}</h4>
                            <p className="text-slate-700 text-sm leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Platform Features */}
            <div>
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-8 text-center">Platform Features</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: ShieldCheck, title: 'Verified Network', desc: 'Every user is profile-verified. Only real colleagues from your building commute together.', color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                  { icon: Activity, title: 'Live Ride Tracking', desc: 'Track ride status in real-time from open through pickup and drop-off via the ride detail page.', color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                  { icon: Zap, title: 'Community Route Matching', desc: 'Our routing engine suggests the best rides based on your corridor, time of day, and past commutes.', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' },
                  { icon: IndianRupee, title: 'Transparent Pricing', desc: 'Price per seat is set by the host. No surge, no platform commission — what you see is what you pay.', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-300' },
                  { icon: Users, title: 'Co-Commuter Profiles', desc: 'See trust scores, ride history, and ratings before sending or accepting a join request.', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                  { icon: Leaf, title: 'Carbon Credits', desc: 'Every shared ride earns you carbon credits — a measure of your positive environmental footprint.', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                ].map((f, i) => (
                  <div key={i} className={`bg-slate-50 border ${f.border} rounded-[2rem] p-6 hover:bg-slate-100 transition-colors group`}>
                    <div className={`w-12 h-12 ${f.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <f.icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <h4 className="font-black text-slate-900 mb-2">{f.title}</h4>
                    <p className="text-slate-700 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div>
            <div className="text-center mb-10">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">Quick Answers</p>
              <h2 className="text-3xl font-black tracking-tighter">Common Questions</h2>
              <p className="text-slate-700 mt-2 text-sm">Everything you might wonder about Pulse — answered simply.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
            <div className="mt-12 text-center bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
              <HelpCircle className="w-8 h-8 text-slate-900/20 mx-auto mb-3" />
              <p className="text-slate-900/60 text-sm mb-4">Still have a question we did not cover?</p>
              <button
                onClick={() => setActiveTab('ticket')}
                className="px-6 py-3 bg-blue-600 text-slate-900 rounded-2xl text-sm font-black hover:bg-blue-500 transition-colors inline-flex items-center gap-2"
              >
                Raise a Support Ticket <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PAYMENTS */}
        {activeTab === 'payments' && (
          <div className="space-y-12">
            <div className="text-center mb-4">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">Transparent Pricing</p>
              <h2 className="text-3xl font-black tracking-tighter">Payment Info</h2>
              <p className="text-slate-700 mt-2 text-sm max-w-xl mx-auto">Pulse has zero platform commission. Contributions go directly from co-commuter to host via UPI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {[
                { step: '01', title: 'Ride Confirmed', desc: 'Host accepts your seat request. Your spot is reserved.', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/20' },
                { step: '02', title: 'Commute Together', desc: 'Complete the ride. Drop-off is marked on the ride page.', icon: Car, color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                { step: '03', title: 'Pay via UPI', desc: "Transfer the agreed amount to the host's UPI ID shown on the ride detail page.", icon: IndianRupee, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' },
              ].map((s, i) => (
                <div key={i} className={`bg-slate-50 border ${s.border} rounded-[2rem] p-7 text-center`}>
                  <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center mb-5 mx-auto`}>
                    <s.icon className={`w-7 h-7 ${s.color}`} />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${s.color} mb-1`}>Step {s.step}</p>
                  <h4 className="font-black text-slate-900 text-lg mb-2">{s.title}</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Pricing Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-[2rem] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">Corridor Pricing Guide</h3>
                    <p className="text-slate-700 text-xs">Minimum and suggested per-seat contributions</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">Corridor</th>
                      <th className="text-center px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">Distance</th>
                      <th className="text-center px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">Min / Seat</th>
                      <th className="text-center px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">Suggested</th>
                      <th className="text-center px-6 py-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">Seats</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CORRIDOR_PRICING.map((row, i) => (
                      <tr key={i} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4"><span className="font-bold text-slate-900 text-sm">{row.corridor}</span></td>
                        <td className="px-6 py-4 text-center"><span className="text-slate-700 text-sm">{row.distance}</span></td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-600 text-xs font-black rounded-full">Rs.{row.min}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-black rounded-full">Rs.{row.suggested}</span>
                        </td>
                        <td className="px-6 py-4 text-center"><span className="text-slate-700 text-sm">{row.seats}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-5 border-t border-slate-200 bg-white">
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  <AlertCircle className="w-3 h-3 inline mr-1 text-slate-700" />
                  Minimum prices are community guidelines. Hosts set their own price per seat. The platform charges zero commission — payments are peer-to-peer via UPI. Prices shown are one-way per seat contributions and exclude any toll charges agreed between riders.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <h4 className="font-black text-slate-900">What Pulse guarantees</h4>
                </div>
                <ul className="space-y-2">
                  {[
                    'Transparent UPI-based payment between peers',
                    'No hidden fees or platform deductions',
                    'Payment dispute tracking via support tickets',
                    'Host UPI visible only to confirmed co-commuters',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-500/5 border border-amber-300 rounded-[2rem] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-black text-slate-900">Payment Disputes</h4>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                  If you have paid but the host has not marked it received, or vice versa — raise a support ticket with your <strong className="text-slate-900">Trip ID</strong>. Our team will review within 24 hours.
                </p>
                <button
                  onClick={() => setActiveTab('ticket')}
                  className="w-full py-2.5 bg-amber-400/10 border border-amber-500/30 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400/20 transition-colors"
                >
                  Raise Payment Dispute
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">Your Voice Matters</p>
              <h2 className="text-3xl font-black tracking-tighter">Share Feedback</h2>
              <p className="text-slate-700 mt-2 text-sm">Help us make Pulse better for everyone. All feedback is reviewed by our product team.</p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-3">Feedback Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'general', label: 'General' },
                    { id: 'feature', label: 'Feature Request' },
                    { id: 'bug', label: 'Bug Report' },
                    { id: 'experience', label: 'Ride Experience' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFeedbackForm(f => ({ ...f, type: t.id }))}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${feedbackForm.type === t.id ? 'bg-blue-600 text-slate-900 shadow-lg' : 'bg-white border border-slate-200 text-slate-900/40 hover:text-slate-900'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-3">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFeedbackForm(f => ({ ...f, rating: n }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-7 h-7 ${n <= feedbackForm.rating ? 'fill-amber-400 text-amber-600' : 'text-slate-900/10'}`} />
                    </button>
                  ))}
                  <span className="text-sm text-slate-900/40 ml-2 font-bold">{feedbackForm.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-2">Your Name (optional)</label>
                <input
                  type="text"
                  value={feedbackForm.name}
                  onChange={e => setFeedbackForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Priya Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={feedbackForm.email}
                  onChange={e => setFeedbackForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-2">Your Feedback *</label>
                <textarea
                  required
                  rows={5}
                  value={feedbackForm.message}
                  onChange={e => setFeedbackForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us what is working, what is not, or what you would love to see..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={feedbackLoading}
                className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-600 hover:text-slate-900 transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-50"
              >
                {feedbackLoading
                  ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Send Feedback</>
                }
              </button>
            </form>
          </div>
        )}

        {/* TICKET */}
        {activeTab === 'ticket' && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3">Get Help</p>
              <h2 className="text-3xl font-black tracking-tighter">Raise a Support Ticket</h2>
              <p className="text-slate-700 mt-2 text-sm">Our team typically responds within 24 hours. Include your Trip ID for faster resolution.</p>
            </div>

            {ticketForm.trip_id ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-green-600 mb-0.5">Ride ID pre-filled</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Your ticket is linked to <strong className="text-slate-900">Ride #{ticketForm.trip_id}</strong>. Our team can look this up directly — just describe what happened below.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-1">Where to find your Trip ID?</p>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Go to <strong className="text-blue-600">Dashboard then Your Upcoming / Past Trips</strong> and click on the ride.
                    The Trip ID (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-300 font-mono">#1042</code>) is shown at the top of the ride detail page. Or tap <strong className="text-blue-600">Report / Dispute</strong> directly from any ride — it pre-fills automatically.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-3">Issue Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'payment', label: 'Payment Issue', desc: 'Disputes, UPI, amounts' },
                    { id: 'ride', label: 'Ride Problem', desc: 'No-show, cancellation' },
                    { id: 'account', label: 'Account Issue', desc: 'Login, profile, access' },
                    { id: 'safety', label: 'Safety Concern', desc: 'Behavior, SOS, report' },
                    { id: 'other', label: 'Other', desc: 'Anything else' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTicketForm(f => ({ ...f, issue_type: t.id }))}
                      className={`p-3 rounded-2xl text-left transition-all border ${ticketForm.issue_type === t.id ? 'bg-blue-100 border-blue-500/40 text-slate-900' : 'bg-white border-slate-200 text-slate-900/40 hover:border-slate-300 hover:text-slate-900/70'}`}
                    >
                      <p className="text-xs font-black">{t.label}</p>
                      <p className="text-[10px] text-slate-900/30 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-2">Your Name</label>
                <input
                  type="text"
                  value={ticketForm.name}
                  onChange={e => setTicketForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Rahul Mehta"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-2">Email Address *</label>
                <input
                  type="email"
                  required
                  value={ticketForm.email}
                  onChange={e => setTicketForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-2">
                  Trip ID <span className="text-slate-900/20 normal-case font-medium">(if applicable)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900/20 font-black text-sm">#</span>
                  <input
                    type="text"
                    value={ticketForm.trip_id}
                    onChange={e => setTicketForm(f => ({ ...f, trip_id: e.target.value.replace('#', '') }))}
                    placeholder="e.g. 1042"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-3">Priority</label>
                <div className="flex gap-2">
                  {[
                    { id: 'normal', label: 'Normal', sub: '24-48 hrs' },
                    { id: 'high', label: 'High', sub: '12-24 hrs' },
                    { id: 'urgent', label: 'Urgent', sub: 'Safety / Same day' },
                  ].map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setTicketForm(f => ({ ...f, urgency: u.id }))}
                      className={`flex-1 py-3 rounded-2xl text-center transition-all border ${ticketForm.urgency === u.id ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-white border-slate-200 text-slate-900/30 hover:text-slate-900/60'}`}
                    >
                      <p className="text-xs font-black">{u.label}</p>
                      <p className="text-[10px] text-slate-900/30 mt-0.5">{u.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-900/30 uppercase tracking-widest block mb-2">Describe the Issue *</label>
                <textarea
                  required
                  rows={5}
                  value={ticketForm.description}
                  onChange={e => setTicketForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Be as specific as possible — include date, time, what happened, and what resolution you are looking for..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={ticketLoading}
                className="w-full py-4 bg-blue-600 text-slate-900 font-black rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 text-sm disabled:opacity-50 shadow-xl shadow-blue-600/20"
              >
                {ticketLoading
                  ? <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                  : <><Ticket className="w-4 h-4" /> Submit Ticket</>
                }
              </button>

              <p className="text-center text-[10px] text-slate-900/20">
                You will receive a confirmation with your ticket ID. Our team responds to all tickets — please do not submit duplicates.
              </p>
            </form>

            {/* Ticket Status Checker */}
            <div className="mt-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">Check Ticket Status</h3>
                  <p className="text-slate-700 text-xs">Already raised a ticket? Enter your reference to see the reply.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-900/20 font-black text-sm">Pulse-</span>
                  <input
                    type="text"
                    value={checkRef.replace(/^Pulse-/i, '')}
                    onChange={e => setCheckRef(e.target.value)}
                    placeholder="e.g. 222091"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-4 py-3 text-sm text-slate-900 placeholder-white/20 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
                <button
                  onClick={handleCheckTicket}
                  disabled={checkLoading || !checkRef.trim()}
                  className="px-6 py-3 bg-blue-600 text-slate-900 rounded-2xl text-sm font-black hover:bg-blue-500 transition-colors disabled:opacity-40 flex items-center gap-2"
                >
                  {checkLoading ? <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" /> : 'Check'}
                </button>
              </div>

              {ticketStatus && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-blue-600 font-black text-sm">{ticketStatus.ref}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        ticketStatus.status === 'replied' ? 'bg-green-500/10 border border-green-500/20 text-green-600'
                        : ticketStatus.status === 'closed' ? 'bg-slate-500/10 border border-slate-500/20 text-slate-700'
                        : 'bg-amber-50 border border-amber-300 text-amber-600'
                      }`}>{ticketStatus.status}</span>
                    </div>
                    <span className="text-xs text-slate-900/20">{new Date(ticketStatus.created_at).toLocaleDateString('en-IN')}</span>
                  </div>

                  <div className="bg-black/30 border border-slate-200 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-900/20 uppercase tracking-widest mb-2">Your Issue</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{ticketStatus.description}</p>
                  </div>

                  {ticketStatus.admin_reply ? (
                    <div className="bg-blue-100 border border-blue-500/20 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Pulse Team Reply</p>
                        <span className="text-[10px] text-slate-900/20 ml-auto">{ticketStatus.replied_at ? new Date(ticketStatus.replied_at).toLocaleDateString('en-IN') : ''}</span>
                      </div>
                      <p className="text-sm text-slate-900 leading-relaxed">{ticketStatus.admin_reply}</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                      <p className="text-xs text-slate-900/30">No reply yet — we typically respond within 24 hours.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-900/20 animate-pulse">Loading...</div>}>
      <SupportContent />
    </Suspense>
  )
}

