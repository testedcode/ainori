'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Clock, Users, IndianRupee, Car, Star, Shield,
  MessageSquare, Send, Check, X, Loader2, Navigation,
  AlertCircle, Sparkles, CheckCircle2, Banknote, QrCode,
  Timer, ArrowRight, Ticket, Copy, UserCheck, XCircle
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
  corridor_description?: string; vehicle_make?: string; vehicle_model?: string;
  vehicle_number?: string; phone?: string; upi_id?: string; direction?: 'to_office' | 'to_home';
  confirmed_riders?: { id: number; user_id: number; name: string; avatar_url: string; seats_requested: number }[];
}

interface Message { id: number; user_id?: number; user_name: string; message: string; created_at: string }
interface RideRequest { id: number; user_id: number; rider_name: string; user_name: string; status: string; seats_requested: number; created_at: string }

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
                  <span className="text-lg font-black text-white relative z-20">{name[0].toUpperCase()}</span>
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
    // 1. Fetch Core Ride Data (Blocks the page render)
    try {
      const r = await api.get(`/rides/${rideId}`) as unknown as Ride
      setRide(r)
      setLoading(false) // Core data is in, show the page!
    } catch { 
      toast.error('Mission link severed.')
      setLoading(false)
    }

    // 2. Fetch Supporting Data (Non-blocking)
    api.get(`/rides/${rideId}/messages`).then((m: any) => { if (Array.isArray(m)) setMessages(m) }).catch(() => {})
    api.get(`/rides/${rideId}/requests`).then((req: any) => { if (Array.isArray(req)) setRequests(req) }).catch(() => {})
  }

  const fetchMessages = async () => {
    try {
      const data = await api.get(`/rides/${rideId}/messages`)
      if (Array.isArray(data)) setMessages(data)
    } catch {}
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
    console.log('[BOOKING_DEBUG] Attempting join with payload:', payload)
    console.log('[BOOKING_DEBUG] Ownership Check:', { currentUserId, rideOwnerId: ride.user_id, isOwner })

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
      console.error('[BOOKING_ERROR] Server returned:', serverError)
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

        {/* RIDE SUMMARY PANEL */}
        <GlassPanel className="flex flex-col md:flex-row items-center justify-between gap-8 border-blue-500/20">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl shadow-blue-600/30">
              {ride.user_name[0].toUpperCase()}
            </div>
            <div>
              <p className="text-[48px] font-black text-white leading-none tracking-tighter">{ride.ride_time.slice(0, 5)}</p>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">
                {isOwner ? 'You are hosting' : `Host: ${ride.user_name}`} · {ride.direction === 'to_office' ? '🏢 To Office' : '🏠 To Home'}
              </p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm font-black text-white/40 uppercase tracking-widest mb-1">
              {new Date(ride.ride_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </p>
            <div className="flex items-center gap-2 text-yellow-400 font-black">
              <Star className="w-4 h-4 fill-yellow-400" /> 4.9 <span className="text-white/20">|</span> <span className="text-white">₹{ride.price_per_seat}/seat</span>
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-2">
              {ride.available_seats} of {ride.total_seats} seats free
            </p>
          </div>
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
                    className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                      req.status === 'accepted' ? 'bg-green-500/10 border-green-500/20'
                      : req.status === 'rejected' ? 'bg-white/[0.02] border-white/5 opacity-40'
                      : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {(req.user_name || req.rider_name || '?')[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-white text-sm truncate">{req.user_name || req.rider_name}</p>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
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
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                          req.status === 'accepted'
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
                     {/* Host Seat */}
                     <VisualSeat type="host" />
                     
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
                        className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                          selectedSeats > 0 
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
            {ride.upi_id && (isAccepted || isOwner) && (
              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">UPI (pay after ride)</p>
                <p className="font-mono text-white font-bold text-sm">{ride.upi_id}</p>
              </div>
            )}
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
