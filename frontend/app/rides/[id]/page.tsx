'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Clock, Users, IndianRupee, Car, Star, Shield,
  MessageSquare, Send, Check, X, Loader2, Navigation,
  AlertCircle, Sparkles, CheckCircle2, Banknote, QrCode,
  Timer, ArrowRight, Ticket, Copy, UserCheck, XCircle, Zap, ExternalLink,
  PlayCircle, Navigation2, Flag
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../../components/JoolNav'
import { getVibe, VIBE_THEMES } from '@/lib/vibe-utils'
import VibeCanvas from '../../components/VibeCanvas'

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Ride {
  id: number; user_id: number; user_name: string; corridor_name: string; ride_date: string;
  ride_time: string; pickup_point: string; drop_point: string; route_description?: string;
  price_per_seat: number; available_seats: number; total_seats: number; status: string;
  corridor_description?: string; phone?: string; upi_id?: string; direction?: 'to_office' | 'to_home';
  host_avatar_url?: string; host_qr_code_url?: string;
  vehicle_info?: { id: number; make: string; model: string; color: string; vehicle_number: string; vehicle_type: string; total_seats: number; image_url?: string };
  confirmed_riders?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number }[];
}

interface Message { id: number; user_id?: number; user_name: string; message: string; created_at: string }
interface RideRequest { id: number; user_id: number; rider_name: string; user_name: string; avatar_url?: string; status: string; seats_requested: number; created_at: string }

// ─── HELPERS ────────────────────────────────────────────────────────────────
const stageIndex = (s: string) => {
  if (s === 'starting') return 1
  if (s === 'at_pickup') return 2
  if (s === 'completed') return 3
  return 0
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/5 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export default function RideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string

  const [ride, setRide] = useState<Ride | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [requests, setRequests] = useState<RideRequest[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedSeats, setSelectedSeats] = useState<number>(0)
  const [joining, setJoining] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sendingMsg, setSendingMsg] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [seatsToBook, setSeatsToBook] = useState(1)
  const [handlingReq, setHandlingReq] = useState<number | null>(null)
  const [updatingSeats, setUpdatingSeats] = useState(false)
  const [markingPayment, setMarkingPayment] = useState<number | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [updatingStage, setUpdatingStage] = useState(false)
  const [markingAllPayment, setMarkingAllPayment] = useState(false)
  const [ridePayments, setRidePayments] = useState<any[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ─── HIGH-FIDELITY COMPONENTS ─────────────────────────────────────────────
  // ─── HIGH-FIDELITY SOCIAL SEATS ──────────────────────────────────────────
  const VisualSeat = ({
    type,
    user,
    isSelected,
    onClick
  }: {
    type: 'host' | 'rider' | 'available',
    user?: any,
    isSelected?: boolean,
    onClick?: () => void
  }) => {
    const isAvailable = type === 'available'
    const name = user?.name || (type === 'host' ? ride?.user_name : 'Available')

    return (
      <div className="flex flex-col items-center gap-4 group">
        <button
          onClick={onClick}
          disabled={!isAvailable}
          className={`relative w-24 h-32 flex items-center justify-center transition-all ${isAvailable ? 'hover:scale-105 active:scale-95' : 'cursor-default'}`}
        >
          {/* CAR SEAT OUTLINE - HIGH FIDELITY WITH DEPTH */}
          <svg viewBox="0 0 100 140" className={`absolute inset-0 w-full h-full transition-all duration-700 ${isSelected ? 'drop-shadow-[0_0_20px_rgba(34,197,94,0.4)]' : isAvailable ? 'drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}`}>
            <defs>
              <radialGradient id="seatCushionDet" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>

            {/* HEADREST */}
            <path
              d="M30,20 Q30,10 50,10 Q70,10 70,20 L70,30 Q70,40 50,40 Q30,40 30,30 Z"
              fill={isAvailable ? "none" : "url(#seatCushionDet)"}
              stroke={isSelected ? "#4ade80" : isAvailable ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}
              strokeWidth={isAvailable || isSelected ? "3" : "1.5"}
              strokeDasharray={isAvailable && !isSelected ? "4,4" : "0"}
              className={isAvailable && !isSelected ? "animate-[pulse_4s_infinite]" : ""}
            />

            {/* BACKREST */}
            <path
              d="M20,45 Q20,35 50,35 Q80,35 80,45 L85,90 Q85,110 50,110 Q15,110 15,90 Z"
              fill={isSelected ? "rgba(74,222,128,0.1)" : isAvailable ? "rgba(59,130,246,0.03)" : "url(#seatCushionDet)"}
              stroke={isSelected ? "#4ade80" : isAvailable ? "rgba(59,130,246,0.8)" : "rgba(255,255,255,0.1)"}
              strokeWidth={isAvailable || isSelected ? "3.5" : "1.5"}
              strokeDasharray={isAvailable && !isSelected ? "6,4" : "0"}
              className={isAvailable && !isSelected ? "animate-[pulse_2s_infinite]" : ""}
            />

            {/* SEAT BASE */}
            <path
              d="M15,115 Q15,105 50,105 Q85,105 85,115 L90,130 Q90,135 50,135 Q10,135 10,130 Z"
              fill={isAvailable ? "none" : "url(#seatCushionDet)"}
              stroke={isSelected ? "#4ade80" : isAvailable ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)"}
              strokeWidth={isAvailable || isSelected ? "3" : "1.5"}
              strokeDasharray={isAvailable && !isSelected ? "4,4" : "0"}
              className={isAvailable && !isSelected ? "animate-[pulse_5s_infinite]" : ""}
            />
          </svg>

          {/* AVATAR OVERLAY */}
          {!isAvailable && (
            <div className={`relative w-16 h-16 rounded-full p-1 transition-all duration-500 group-hover:scale-110 ${type === 'host' ? 'bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 shadow-[0_0_30px_rgba(251,191,36,0.5)]' : 'bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-200 shadow-[0_0_30px_rgba(59,130,246,0.5)]'}`}>
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-slate-900 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-10" />
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-black text-white relative z-20">{name[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${type === 'host' ? 'bg-amber-400' : 'bg-blue-400'}`} style={{ animationDuration: '3s' }} />
            </div>
          )}

          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-green-500 text-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg transform scale-110 animate-bounce">
                <span className="text-xs font-black">✔</span>
              </div>
            </div>
          )}

          {isAvailable && !isSelected && (
            <div className="flex flex-col items-center animate-pulse">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">VACANT</span>
              <Check className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,1)] animate-bounce" />
            </div>
          )}
        </button>
        <span className={`text-[6px] font-black uppercase tracking-widest ${isSelected ? 'text-green-400' : isAvailable ? 'text-white/10' : 'text-white/40'}`}>{name.split(' ')[0]}</span>
      </div>
    )
  }

  const StarRating = ({ rideId, rateeId, current, label, onRate }: { rideId: number, rateeId: number, current: number | null, label: string, onRate: (rating: number) => void }) => {
    const [hover, setHover] = useState(0)
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onRate(star)}
              className="transition-all active:scale-125"
            >
              <Star className={`w-4 h-4 ${star <= (hover || (current || 0)) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-white/10'}`} />
            </button>
          ))}
          {current && <span className="text-[10px] font-black text-amber-400 ml-1">{current}.0</span>}
        </div>
      </div>
    )
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    const usr = localStorage.getItem('user')
    if (usr) setUser(JSON.parse(usr))
    fetchAll()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [rideId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const fetchAll = async () => {
    try {
      const r = await api.get(`/rides/${rideId}`) as unknown as Ride
      setRide(r)
      setLoading(false)
    } catch {
      toast.error('Mission link severed.')
      setLoading(false)
    }
    api.get(`/rides/${rideId}/messages`).then((m: any) => { if (Array.isArray(m)) setMessages(m) }).catch(() => { })
    api.get(`/rides/${rideId}/requests`).then((req: any) => { if (Array.isArray(req)) setRequests(req) }).catch(() => { })
    api.get(`/rides/${rideId}/payments`).then((pay: any) => { if (Array.isArray(pay)) setRidePayments(pay) }).catch(() => { })
  }

  const handleUpdateAvailableSeats = async (newCount: number) => {
    if (!ride || newCount < 0 || newCount > ride.total_seats) return
    setUpdatingSeats(true)
    try {
      await api.put(`/rides/${rideId}`, { available_seats: newCount })
      toast.success(`Seats updated to ${newCount}`)
      fetchAll()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Update failed')
    } finally { setUpdatingSeats(false) }
  }

  const handleMarkPayment = async (riderId: number, asGiver: boolean, riderName?: string) => {
    setMarkingPayment(riderId)
    try {
      const payload = asGiver ? { giver_status: 'received' } : { rider_status: 'done' }
      await api.put(`/rides/${rideId}/payments/${riderId}`, payload)
      toast.success(asGiver ? `✅ Received from ${riderName || 'rider'}!` : '✅ Payment marked as done!')
      fetchAll() // Refresh to show updated status
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed')
    } finally { setMarkingPayment(null) }
  }

  const handleMarkAllReceived = async () => {
    const pending = ridePayments.filter(p => p.giver_status !== 'received')
    if (pending.length === 0) return
    setMarkingAllPayment(true)
    try {
      await Promise.all(pending.map(p => api.put(`/rides/${rideId}/payments/${p.rider_id}`, { giver_status: 'received' })))
      toast.success('All mission dues settled! 💰', { icon: '✅' })
      fetchAll()
    } catch { toast.error('Batch settlement failed') }
    finally { setMarkingAllPayment(false) }
  }

  const handleUpdateStage = async (stage: string) => {
    setUpdatingStage(true)
    try {
      await api.put(`/rides/${rideId}`, { status: stage })
      toast.success(`Mission Status: ${stage.toUpperCase()}`, { icon: '🛰️' })
      fetchAll()
    } catch { toast.error('Comms link failed') }
    finally { setUpdatingStage(false) }
  }

  const handleRate = async (rating: number, rateeId: number) => {
    try {
      await api.post(`/rides/${rideId}/rate`, { rating, ratee_id: rateeId })
      toast.success('Rating synchronized', { icon: '⭐' })
      fetchAll()
    } catch { toast.error('Rating failed') }
  }

  const fetchMessages = async () => {
    try {
      const data = await api.get(`/rides/${rideId}/messages`)
      if (Array.isArray(data)) setMessages(data)
    } catch { }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    const txt = newMessage.trim(); setSendingMsg(true); setNewMessage('')
    try {
      await api.post(`/rides/${rideId}/messages`, { message: txt })
      fetchMessages()
    } catch { toast.error('Failed to sync message') }
    finally { setSendingMsg(false) }
  }

  const currentUserId = Number(user?.id || user?.userId)
  const isOwner = ride && currentUserId === Number(ride.user_id)
  const myRequest = requests.find(r => Number(r.user_id) === currentUserId)
  const isAccepted = myRequest?.status === 'accepted'
  const isPending = myRequest?.status === 'pending'

  const handleSeatClick = (index: number) => {
    if (isOwner) return
    setSelectedSeats(index + 1)
  }

  const handleJoin = async () => {
    if (!ride) return
    const payload = { seats_requested: selectedSeats }

    if (isOwner) {
      toast.error('You are the host! Manage this ride from your dashboard.', { icon: '🛡️' })
      return
    }
    if (selectedSeats === 0) {
      toast.error('Please select your seats on the diagram first.', { icon: '💺' })
      return
    }
    setJoining(true)
    try {
      await api.post(`/rides/${rideId}/requests`, payload)
      toast.success(`Broadcasting ${selectedSeats} seat request!`, { icon: '🚀' })
      fetchAll()
    } catch (e: any) {
      const serverError = e.response?.data?.error || e.message || 'Connection failed'
      toast.error(serverError, { duration: 5000 })
    }
    finally { setJoining(false) }
  }

  const handleCancelRequest = async () => {
    try {
      const currentUserId = Number(user?.id || user?.userId)
      const myReq = requests.find(r => Number(r.user_id) === currentUserId && r.status === 'pending')
      if (myReq) {
        await api.delete(`/rides/${rideId}/requests/${myReq.id}`)
        toast.success('Request retracted.', { icon: '🛑' })
        fetchAll()
      }
    } catch { toast.error('Retraction failed') }
  }

  const handleAcceptReject = async (reqId: number, action: 'accepted' | 'rejected') => {
    setHandlingReq(reqId)
    try {
      await api.put(`/rides/${rideId}/requests/${reqId}`, { status: action })
      toast.success(action === 'accepted' ? '✅ Seat confirmed! Ride updated.' : '❌ Request declined.')
      fetchAll()
    } catch { toast.error('Action failed') }
    finally { setHandlingReq(null) }
  }

  const copyId = () => { navigator.clipboard.writeText(String(rideId)); toast.success('Ride ID copied!') }

  const hour = new Date().getHours()
  const vibe = getVibe(ride ? parseInt(ride.ride_time.split(':')[0]) : hour)
  const theme = VIBE_THEMES[vibe]

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const acceptedRequests = requests.filter(r => r.status === 'accepted')
  const totalAcceptedSeats = acceptedRequests.reduce((s, r) => s + r.seats_requested, 0)

  return (
    <div className={`min-h-screen font-sans pb-32 transition-all duration-1000 ${theme.bg}`}>
      <VibeCanvas vibe={vibe} />
      <JoolNav />

      {loading ? (
        <div className="max-w-4xl mx-auto px-6 mt-12 flex flex-col items-center justify-center py-32 opacity-20">
          <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing_Mission_Data...</p>
        </div>
      ) : !ride ? (
        <div className="max-w-4xl mx-auto px-6 mt-32 text-center py-20 bg-white/5 rounded-[3rem] border border-white/5">
          <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Ride Terminal Not Found</h2>
          <Link href="/rides" className="text-blue-400 font-bold mt-4 block text-xs uppercase tracking-widest">Return to Roster</Link>
        </div>
      ) : (
        <main className="max-w-4xl mx-auto px-6 mt-12 space-y-6 animate-in fade-in duration-700">

          {/* HEADER */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link href="/rides" className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95">
                <ArrowLeft className="w-5 h-5 text-white/40" />
              </Link>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white leading-none uppercase italic">{ride.corridor_name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={copyId}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all group"
                  >
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Ride ID</span>
                    <span className="text-[11px] font-mono font-black text-blue-400">#{rideId}</span>
                    <Copy className="w-3 h-3 text-white/20 group-hover:text-blue-400 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            <Link
              href={`/support?tab=ticket&trip_id=${rideId}&issue=${isOwner ? 'ride' : 'payment'}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-black hover:bg-red-500/20 transition-all flex-shrink-0"
            >
              <Ticket className="w-3.5 h-3.5" />
              {isOwner ? 'Report Issue' : 'Report / Dispute'}
            </Link>
          </div>

          {/* ─── RATINGS (FOR PAST RIDES) ────────────────────────────────────── */}
          {(() => {
            const datePart = ride.ride_date.split('T')[0]
            const isPast = new Date(datePart + 'T' + ride.ride_time) < new Date()
            return isPast && (
              <GlassPanel className="border-amber-400/30 bg-amber-400/[0.02]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-400/10 rounded-2xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Rate your trip</h3>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Help others by sharing your experience</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 bg-white/5 p-4 rounded-3xl border border-white/5">
                  {/* Rider rates Host */}
                  {!isOwner && isAccepted && (
                    <StarRating
                      rideId={ride.id}
                      rateeId={ride.user_id}
                      current={(ride as any).user_rating}
                      label={`Rate Host (${ride.user_name})`}
                      onRate={(r) => handleRate(r, ride.user_id)}
                    />
                  )}

                  {/* Host rates each Rider */}
                  {isOwner && ride.confirmed_riders?.map(r => (
                    <StarRating
                      key={r.user_id}
                      rideId={ride.id}
                      rateeId={r.user_id}
                      current={(r as any).user_rating}
                      label={`Rate ${r.name.split(' ')[0]}`}
                      onRate={(rating) => handleRate(rating, r.user_id)}
                    />
                  ))}

                  {isOwner && (!ride.confirmed_riders || ride.confirmed_riders.length === 0) && (
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">No confirmed riders to rate</p>
                  )}
                </div>
              </div>
            </GlassPanel>
          )}

          {/* RIDE SUMMARY PANEL */}
          <GlassPanel className="border-blue-500/20 !p-0 overflow-hidden">
            {/* Vehicle image as glossy background */}
            {ride.vehicle_info?.image_url && (
              <div className="absolute inset-0 opacity-10">
                <img src={ride.vehicle_info.image_url} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
              </div>
            )}
            <div className="relative p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left: Host info */}
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-black overflow-hidden border-2 border-white/10">
                    {ride.host_avatar_url
                      ? <img src={ride.host_avatar_url} alt={ride.user_name} className="w-full h-full object-cover" />
                      : <span>{ride.user_name[0]?.toUpperCase()}</span>}
                  </div>
                  {isOwner && <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"><span className="text-[8px] font-black text-black">★</span></div>}
                </div>
                <div>
                  <p className="text-[48px] font-black text-white leading-none tracking-tighter">{ride.ride_time.slice(0, 5)}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-1">
                    <span className={isOwner ? 'text-amber-400' : 'text-blue-400'}>
                      {isOwner ? '⭐ You are hosting' : `Host: ${ride.user_name}`}
                    </span>
                    <span className="text-white/20 mx-2">·</span>
                    <span className={ride.direction === 'to_office' ? 'text-cyan-400' : 'text-green-400'}>
                      {ride.direction === 'to_office' ? '🏢 To Office' : '🏠 To Home'}
                    </span>
                  </p>
                  {/* Vehicle Badge */}
                  {ride.vehicle_info && (
                    <div className="mt-3 flex items-center gap-2 p-2 bg-white/5 border border-white/5 rounded-xl w-fit">
                      <span className="text-sm">
                        {ride.vehicle_info.vehicle_type === 'bike' ? '🏍️' : ride.vehicle_info.vehicle_type === 'suv' ? '🚙' : '🚗'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/60 leading-none uppercase tracking-tighter">
                          {ride.vehicle_info.make} {ride.vehicle_info.model}
                        </span>
                        <span className="text-[8px] font-black text-white/30 leading-none uppercase tracking-widest mt-0.5">
                          {ride.vehicle_info.color} · {ride.vehicle_info.vehicle_number || 'REG: PRIVATE'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Right: Date + seats */}
              <div className="text-center md:text-right space-y-3">
                <p className="text-sm font-black text-white/60 uppercase tracking-widest">
                  {new Date(ride.ride_date.includes('T') ? ride.ride_date : ride.ride_date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <IndianRupee className="w-4 h-4 text-green-400" />
                  <span className="text-xl font-black text-white">{ride.price_per_seat}</span>
                  <span className="text-[10px] text-white/30 font-black uppercase">/seat</span>
                </div>
                {/* Seat progress bar */}
                <div className="w-full md:w-40">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] text-white/30 uppercase font-black">Seats</span>
                    <span className="text-[9px] font-black text-white">{ride.available_seats} / {ride.total_seats} free</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((ride.total_seats - ride.available_seats) / ride.total_seats) * 100}%`,
                        background: ride.available_seats === 0 ? '#ef4444' : ride.available_seats <= 1 ? '#f59e0b' : '#22c55e'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* ─── TRIP JOURNEY STRIP ────────────────────────────────────────── */}
          <GlassPanel className="border-blue-500/20 !p-8">
            <div className="relative">
              <div className="flex items-center justify-between relative z-10">
                {[
                  { id: 'starting', label: 'Starting', icon: PlayCircle, color: 'text-blue-400', bg: 'bg-blue-400/20' },
                  { id: 'at_pickup', label: 'At Pickup', icon: Navigation2, color: 'text-cyan-400', bg: 'bg-cyan-400/20' },
                  { id: 'completed', label: 'Finished', icon: Flag, color: 'text-green-400', bg: 'bg-green-400/20' }
                ].map((step, idx, arr) => {
                  const isActive = ride.status === step.id;
                  const isPast = stageIndex(ride.status) > stageIndex(step.id);
                  const isNext = stageIndex(ride.status) === stageIndex(arr[idx-1]?.id || 'full');

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-3 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        isActive ? `${step.bg} ${step.color} scale-110 shadow-[0_0_20px_rgba(59,130,246,0.3)] border-2 border-blue-400/50` :
                        isPast ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        'bg-white/5 text-white/20 border border-white/5'
                      }`}>
                        <step.icon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                        {isPast && <Check className="w-3 h-3 absolute top-1 right-1" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/20'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-7 left-7 right-7 h-[2px] bg-white/5 -z-0">
                <div 
                  className="h-full bg-blue-500/50 transition-all duration-1000"
                  style={{ width: `${Math.max(0, (stageIndex(ride.status) - 2) * 50)}%` }}
                />
              </div>
            </div>

            {/* Host Controls for Journey */}
            {isOwner && ride.status !== 'completed' && ride.status !== 'cancelled' && (
              <div className="mt-8 flex flex-wrap gap-3">
                {ride.status !== 'starting' && ride.status !== 'at_pickup' && (
                  <button
                    onClick={() => handleUpdateStage('starting')}
                    disabled={updatingStage}
                    className="flex-1 min-w-[140px] py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {updatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                    Start Trip
                  </button>
                )}
                {ride.status === 'starting' && (
                  <button
                    onClick={() => handleUpdateStage('at_pickup')}
                    disabled={updatingStage}
                    className="flex-1 min-w-[140px] py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(8,145,178,0.2)]"
                  >
                    {updatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation2 className="w-4 h-4" />}
                    I'm at the spot
                  </button>
                )}
                {(ride.status === 'at_pickup' || ride.status === 'starting' || (() => {
                  const datePart = ride.ride_date.split('T')[0]
                  return new Date(datePart + 'T' + ride.ride_time) < new Date()
                })()) && (
                  <button
                    onClick={() => {
                      if (confirm('Finish this trip? This will move it to history.')) {
                        handleUpdateStage('completed')
                      }
                    }}
                    disabled={updatingStage}
                    className="flex-1 min-w-[140px] py-4 bg-green-600/20 border border-green-500/30 text-green-400 hover:bg-green-600 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {updatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                    Finish Trip
                  </button>
                )}
                {/* Cancel option for host */}
                <button
                  onClick={() => {
                    if (confirm('Permanently cancel this ride? All accepted riders will be notified.')) {
                      api.delete(`/rides/${rideId}`).then(() => {
                        toast.success('Mission aborted.');
                        router.push('/rides');
                      }).catch(() => toast.error('Abort failed'))
                    }
                  }}
                  className="flex-1 min-w-[140px] py-4 bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel Ride
                </button>
              </div>
            )}

            {/* Rider Control: At Spot */}
            {!isOwner && isAccepted && ride.status !== 'completed' && (
              <div className="mt-8">
                <button
                  onClick={() => {
                    api.post(`/rides/${rideId}/messages`, { message: "📍 I am at the pickup spot!" })
                    toast.success('Notified host you are at the spot!')
                  }}
                  className="w-full py-4 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  I'm at the spot
                </button>
              </div>
            )}
          </GlassPanel>

          {/* ─── HOST: BOOKING REQUESTS PANEL ─────────────────────────────────── */}
          {isOwner && (
            <GlassPanel className="border-amber-500/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-white">Seat Requests</h3>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">
                      {pendingRequests.length} pending · {acceptedRequests.length} accepted · {totalAcceptedSeats}/{ride.total_seats} seats filled
                    </p>
                  </div>
                </div>
                {/* Seat Adjuster Widget */}
                <div className="flex items-center gap-2 bg-white/5 border border-amber-500/20 rounded-2xl px-3 py-2">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest mr-1">Open Seats</span>
                  <button
                    onClick={() => handleUpdateAvailableSeats(ride.available_seats - 1)}
                    disabled={updatingSeats || ride.available_seats <= 0}
                    className="w-7 h-7 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 flex items-center justify-center text-white font-black transition-all disabled:opacity-30"
                  >−</button>
                  <span className="text-lg font-black text-white w-6 text-center">{ride.available_seats}</span>
                  <button
                    onClick={() => handleUpdateAvailableSeats(ride.available_seats + 1)}
                    disabled={updatingSeats || ride.available_seats >= ride.total_seats}
                    className="w-7 h-7 rounded-xl bg-white/5 hover:bg-green-500/20 border border-white/10 flex items-center justify-center text-white font-black transition-all disabled:opacity-30"
                  >+</button>
                  {updatingSeats && <Loader2 className="w-3 h-3 text-amber-400 animate-spin ml-1" />}
                </div>
              </div>

              {requests.length === 0 ? (
                <div className="text-center py-8 opacity-30">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest">No requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {requests.map(req => (
                    <div
                      key={req.id}
                      className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${req.status === 'accepted' ? 'bg-green-500/10 border-green-500/20'
                          : req.status === 'rejected' ? 'bg-white/[0.02] border-white/5 opacity-40'
                            : 'bg-white/5 border-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 border-2 border-white/10 overflow-hidden">
                          {req.avatar_url ? (
                            <img src={req.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            (req.user_name || req.rider_name || '?')[0]
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-white text-sm truncate">{req.user_name || req.rider_name}</p>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                            {req.seats_requested} seat{req.seats_requested > 1 ? 's' : ''} · {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {req.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleAcceptReject(req.id, 'accepted')}
                              disabled={handlingReq === req.id || ride.available_seats < req.seats_requested}
                              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black transition-all disabled:opacity-40 flex items-center gap-1.5"
                            >
                              {handlingReq === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                              Accept
                            </button>
                            <button
                              onClick={() => handleAcceptReject(req.id, 'rejected')}
                              disabled={handlingReq === req.id}
                              className="px-4 py-2 bg-white/5 border border-white/10 text-white/40 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/30 rounded-xl text-xs font-black transition-all disabled:opacity-40 flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Decline
                            </button>
                          </>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${req.status === 'accepted'
                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                              : 'bg-white/5 border-white/10 text-white/20'
                            }`}>
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassPanel>
          )}

          {/* ─── SOCIAL CABIN STRIP (VISIBLE TO ALL) ───────────────────────── */}
          <GlassPanel className="border-white/5 !p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="text-xs font-black text-white/60 uppercase tracking-[0.3em]">Social Cabin</h3>
            </div>

            <div className="flex flex-col items-center gap-6">
              {/* CABIN VISUALIZATION */}
              <div className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-white/[0.03] border border-white/5 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none" />

                <div className="flex -space-x-3">
                  {/* Host Seat - now passes real avatar */}
                  <VisualSeat type="host" user={{ avatar_url: ride.host_avatar_url, name: ride.user_name }} />

                  {/* Accepted Riders */}
                  {ride.confirmed_riders?.map(r => (
                    <VisualSeat key={r.id} type="rider" user={r} />
                  ))}
                </div>

                <div className="flex-1 flex justify-center gap-4">
                  {/* Available Slots */}
                  {Array.from({ length: ride.available_seats }).map((_, i) => (
                    <VisualSeat
                      key={`avail-${i}`}
                      type="available"
                      isSelected={selectedSeats > i}
                      onClick={() => handleSeatClick(i)}
                    />
                  ))}
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="text-2xl font-black text-white leading-none italic tracking-tighter">₹{ride.price_per_seat}</p>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">per seat</p>
                </div>
              </div>

              {/* JOIN ACTIONS (Riders Only) */}
              {!isOwner && (
                <div className="w-full">
                  {!myRequest ? (
                    <button
                      onClick={handleJoin}
                      disabled={joining || ride.available_seats === 0}
                      className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${selectedSeats > 0
                          ? 'bg-white text-black shadow-[0_20px_40px_rgba(255,255,255,0.2)] scale-102 active:scale-95'
                          : 'bg-white/5 text-white/20 border border-white/5'
                        }`}
                    >
                      {selectedSeats > 0 && <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-transparent to-green-400/20 animate-pulse" />}
                      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {selectedSeats > 0 ? `REQUEST ${selectedSeats} SEAT${selectedSeats > 1 ? 'S' : ''}` : 'SELECT YOUR SEATS'}
                    </button>
                  ) : (
                    <div className="w-full h-16 rounded-[2rem] border-2 border-dashed border-white/10 flex items-center justify-center gap-4 group">
                      {isAccepted ? (
                        <div className="flex items-center gap-2 text-green-400 font-extrabold text-xs uppercase tracking-widest">
                          <CheckCircle2 className="w-5 h-5" /> Seat Confirmed
                        </div>
                      ) : (
                        <button
                          onClick={handleCancelRequest}
                          className="flex items-center gap-2 text-blue-400 font-extrabold text-xs uppercase tracking-widest hover:text-red-400 transition-colors"
                        >
                          <Timer className="w-5 h-5 group-hover:hidden" />
                          <span className="group-hover:hidden">Pending {myRequest.seats_requested} Seats</span>
                          <X className="w-5 h-5 hidden group-hover:block" />
                          <span className="hidden group-hover:block">Cancel Request</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassPanel>

          {/* ROUTE PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-6">Route</p>
              <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-black" />
                  <p className="font-black text-white uppercase text-xs">{ride.pickup_point}</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-3.5 h-3.5 rounded-full bg-white/10 border-2 border-black" />
                  <p className="font-black text-white/30 uppercase text-xs">{ride.drop_point}</p>
                </div>
              </div>
            </GlassPanel>

            <div className="h-64 rounded-[2.5rem] overflow-hidden border border-white/5 relative group">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(ride.pickup_point)}+to+${encodeURIComponent(ride.drop_point)}&output=embed&z=12`}
                className="absolute inset-0 w-full h-full grayscale opacity-40 group-hover:opacity-60 transition-opacity"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Route Preview</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── PREMIUM VEHICLE CARD ─────────────────────────────────────────── */}
          {ride.vehicle_info && (
            <GlassPanel className="!p-0 overflow-hidden border-white/10 group/car">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Left: Info */}
                <div className="p-8 relative z-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Vehicle Details</span>
                    </div>
                    <h2 className="text-3xl font-black text-white leading-tight mb-2">
                      {ride.vehicle_info.make} <span className="text-blue-400 italic">{ride.vehicle_info.model}</span>
                    </h2>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">{ride.vehicle_info.color}</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">{ride.vehicle_info.vehicle_type}</span>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest">{ride.vehicle_info.total_seats} Seats</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">Plate Number</p>
                    <div className="inline-flex flex-col">
                      <div className="px-6 py-3 bg-white text-black rounded-xl font-mono font-black text-xl tracking-[0.2em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] border-4 border-slate-200">
                        {ride.vehicle_info.vehicle_number}
                      </div>
                      <div className="h-2 bg-blue-600 rounded-b-xl w-full" />
                    </div>
                  </div>
                </div>

                {/* Right: Visual */}
                <div className="relative min-h-[300px] md:min-h-full overflow-hidden bg-slate-900 flex items-center justify-center">
                  {ride.vehicle_info.image_url ? (
                    <img
                      src={ride.vehicle_info.image_url}
                      className="absolute inset-0 w-full h-full object-cover group-hover/car:scale-110 transition-transform duration-1000"
                      alt=""
                    />
                  ) : (
                    <Car className="w-24 h-24 text-white/5" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:hidden" />
                </div>
              </div>
            </GlassPanel>
          )}

          {/* ─── PAYMENT PANEL ────────────────────────────────────────────────── */}
          {ride.upi_id && (
            <GlassPanel className="border-green-500/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Payment</h3>
                  <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">
                    {isAccepted ? `₹${ride.price_per_seat * (myRequest?.seats_requested || 1)} due` : isOwner ? 'Payment details' : '🔒 Get confirmed to unlock full payment'}
                  </p>
                </div>
              </div>

              {/* UPI ID always visible with copy */}
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl mb-4">
                <span className="font-mono text-white font-bold text-sm flex-1">{ride.upi_id}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(ride.upi_id || ''); toast.success('UPI ID copied!') }}
                  className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-[10px] font-black hover:bg-green-500/30 transition-all flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> COPY
                </button>
              </div>

              {/* QR Code - show if host has one */}
              {(ride as any).host_qr_code_url && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowQrModal(true)}
                    className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" /> View Payment QR Code
                  </button>
                </div>
              )}

              {/* UPI App deep link buttons — shown to accepted riders */}
              {isAccepted && (
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Pay via app</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'GPay', emoji: '🟢', scheme: `gpay://upi/pay?pa=${ride.upi_id}&pn=${encodeURIComponent(ride.user_name)}&am=${ride.price_per_seat * (myRequest?.seats_requested || 1)}&cu=INR&tn=Ainori+Ride+${rideId}` },
                      { label: 'PhonePe', emoji: '🟣', scheme: `phonepe://pay?pa=${ride.upi_id}&pn=${encodeURIComponent(ride.user_name)}&am=${ride.price_per_seat * (myRequest?.seats_requested || 1)}&cu=INR` },
                      { label: 'Paytm', emoji: '🔵', scheme: `paytmmp://pay?pa=${ride.upi_id}&pn=${encodeURIComponent(ride.user_name)}&am=${ride.price_per_seat * (myRequest?.seats_requested || 1)}&cu=INR` },
                      { label: 'CRED', emoji: '⚫', scheme: `cred://pay?pa=${ride.upi_id}&pn=${encodeURIComponent(ride.user_name)}&am=${ride.price_per_seat * (myRequest?.seats_requested || 1)}&cu=INR` },
                      { label: 'BHIM', emoji: '🟠', scheme: `upi://pay?pa=${ride.upi_id}&pn=${encodeURIComponent(ride.user_name)}&am=${ride.price_per_seat * (myRequest?.seats_requested || 1)}&cu=INR&tn=Ainori+Ride` },
                      { label: 'Amazon', emoji: '🟡', scheme: `amazonpay://pay?pa=${ride.upi_id}&pn=${encodeURIComponent(ride.user_name)}&am=${ride.price_per_seat * (myRequest?.seats_requested || 1)}&cu=INR` },
                    ].map(app => (
                      <button
                        key={app.label}
                        onClick={() => { window.location.href = app.scheme }}
                        className="flex flex-col items-center gap-1.5 p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                      >
                        <span className="text-xl">{app.emoji}</span>
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-wide">{app.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* Mark payment done */}
                  <button
                    onClick={() => handleMarkPayment(Number(user?.userId || user?.id), false)}
                    disabled={markingPayment !== null}
                    className="w-full py-3 bg-green-600/20 border border-green-500/30 text-green-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    {markingPayment !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Mark Payment Done
                  </button>
                </div>
              )}

              {/* Host: mark received per rider */}
              {isOwner && acceptedRequests.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Payment Roster</p>
                    {ridePayments.filter((p: any) => p.giver_status !== 'received').length > 1 && (
                      <button 
                        onClick={handleMarkAllReceived}
                        disabled={markingAllPayment}
                        className="text-[9px] font-black text-blue-400 uppercase tracking-tighter bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20 hover:bg-blue-400/20 transition-all"
                      >
                        {markingAllPayment ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                        Mark All Received
                      </button>
                    )}
                  </div>
                  
                  {acceptedRequests.map(req => {
                    const payment = ridePayments.find((p: any) => Number(p.rider_id) === Number(req.user_id));
                    const isReceived = payment?.giver_status === 'received';
                    const isProcessing = markingPayment === req.user_id;

                    return (
                      <div key={req.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isReceived ? 'bg-green-500/5 border-green-500/10 opacity-60' : 'bg-white/5 border-white/10'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black overflow-hidden border border-white/10">
                            {req.avatar_url ? <img src={req.avatar_url} className="w-full h-full object-cover" alt="" /> : (req.user_name || req.rider_name || "?")[0]}
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-white leading-none">{req.user_name || req.rider_name}</p>
                            <p className="text-[10px] font-black text-green-400 mt-1 uppercase tracking-widest">
                              ₹{ride.price_per_seat * req.seats_requested} <span className="text-white/20">/ {req.seats_requested} seat{req.seats_requested > 1 ? 's' : ''}</span>
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleMarkPayment(req.user_id, true, req.user_name || req.rider_name)}
                          disabled={isReceived || markingPayment !== null}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            isReceived 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                          }`}
                        >
                          {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : isReceived ? 'Received ✓' : 'Mark Received'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassPanel>
          )}

          {/* QR Modal */}
          {showQrModal && (ride as any).host_qr_code_url && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6" onClick={() => setShowQrModal(false)}>
              <div className="bg-white rounded-[2rem] p-8 max-w-xs w-full" onClick={e => e.stopPropagation()}>
                <img src={(ride as any).host_qr_code_url} alt="Payment QR" className="w-full rounded-xl" />
                <p className="text-center text-black font-black text-xs mt-4 tracking-widest uppercase">Scan to Pay</p>
                <p className="text-center text-black/60 text-xs font-mono mt-1">{ride.upi_id}</p>
              </div>
            </div>
          )}

          {/* CHAT PANEL */}
          <GlassPanel className="h-[500px] flex flex-col !p-0">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <h3 className="font-black text-sm uppercase tracking-widest">Ride Chat</h3>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <Sparkles className="w-12 h-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">No messages yet</p>
                </div>
              ) : (
                messages.map(msg => {
                  const currentUserId = Number(user?.id || user?.userId)
                  const isMine = Number(msg.user_id) === currentUserId
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && <span className="text-[9px] font-black text-white/20 uppercase mb-1 ml-1">{msg.user_name}</span>}
                      <div className={`px-5 py-3 rounded-2xl text-sm font-medium ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white/5 text-white/70 border border-white/5 rounded-bl-none'}`}>
                        {msg.message}
                      </div>
                      <span className="text-[9px] text-white/10 mt-1 uppercase font-black">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-6 bg-white/5 border-t border-white/5">
              <div className="flex gap-3">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  disabled={!isOwner && !isAccepted && !isPending}
                  placeholder={(isOwner || isAccepted || isPending) ? "Send a message..." : "Join to enable chat"}
                  className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-blue-600 transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMsg}
                  className="bg-white text-black hover:bg-blue-600 hover:text-white px-6 py-4 rounded-2xl transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </GlassPanel>

        </main>
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
