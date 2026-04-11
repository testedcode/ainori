'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Clock, Users, IndianRupee, Car, Star, Shield,
  MessageSquare, Send, Check, X, CheckCheck, Loader2, Phone, Navigation,
  Calendar, Info, AlertCircle, Sparkles, Leaf, CheckCircle2, Banknote, QrCode,
  Timer, ShieldCheck, ArrowRight
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
  vehicle_number?: string; phone?: string; upi_id?: string;
}

interface Message { id: number; user_id?: number; user_name: string; message: string; created_at: string }
interface RideRequest { id: number; user_id: number; rider_name: string; status: string; seats_requested: number }

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
  const [loading, setLoading] = useState(true)
  const [sendingMsg, setSendingMsg] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [seatsToBook, setSeatsToBook] = useState(1)
  const chatEndRef = useRef<HTMLDivElement>(null)

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
  }, [messages])

  const fetchAll = async () => {
    try {
      const [r, m, req] = await Promise.all([
        api.get(`/rides/${rideId}`) as unknown as Promise<Ride>,
        api.get(`/rides/${rideId}/messages`) as unknown as Promise<Message[]>,
        api.get(`/rides/${rideId}/requests`) as unknown as Promise<RideRequest[]>
      ])
      setRide(r); setMessages(m); setRequests(req)
    } catch { toast.error('Check mission link') }
    finally { setLoading(false) }
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

  const handleRequest = async () => {
    try {
      await api.post(`/rides/${rideId}/requests`, { seats_requested: seatsToBook })
      toast.success('Lets Go! Request broadcasted.', { icon: '🚀' })
      fetchAll()
    } catch { toast.error('Launch failed') }
  }

  const handleCancelRequest = async () => {
    try {
      const myReq = requests.find(r => r.user_id === user?.id && r.status === 'pending')
      if (myReq) {
        await api.delete(`/rides/${rideId}/requests/${myReq.id}`)
        toast.success('Retracted. Not yet.', { icon: '🛑' })
        fetchAll()
      }
    } catch { toast.error('Retraction failed') }
  }

  if (loading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Syncing_Details...</div>
  if (!ride) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-black">Link_Corrupted</div>

  const isOwner = user?.id === ride.user_id
  const myRequest = requests.find(r => r.user_id === user?.id)
  const isAccepted = myRequest?.status === 'accepted'
  const isPending = myRequest?.status === 'pending'
  const vibe = getVibe(parseInt(ride.ride_time.split(':')[0]))

  return (
    <div className={`min-h-screen font-sans pb-32 transition-all duration-1000 ${VIBE_THEMES[vibe].bg}`}>
      <VibeCanvas vibe={vibe} />
      <JoolNav />

      <main className="max-w-4xl mx-auto px-6 mt-12 space-y-6">
        {/* PANEL 1: MISSION CORE */}
        <div className="flex items-center gap-4 mb-8">
           <Link href="/rides" className="p-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95">
              <ArrowLeft className="w-5 h-5 text-white/40" />
           </Link>
           <div>
             <h1 className="text-4xl font-black tracking-tighter text-white leading-none uppercase italic">{ride.corridor_name}</h1>
             <p className="text-white/30 text-[10px] mt-1 font-black uppercase tracking-widest leading-none">Intelligence Node #{ride.id}</p>
           </div>
        </div>

        <GlassPanel className="flex flex-col md:flex-row items-center justify-between gap-8 border-blue-500/20">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-3xl shadow-2xl shadow-blue-600/30">
                 {ride.user_name[0].toUpperCase()}
              </div>
              <div>
                 <p className="text-[48px] font-black text-white leading-none tracking-tighter">{ride.ride_time.slice(0, 5)}</p>
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Confirmed Departure</p>
              </div>
           </div>
           <div className="text-center md:text-right">
              <p className="text-sm font-black text-white/40 uppercase tracking-widest mb-1">{new Date(ride.ride_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
              <div className="flex items-center gap-2 text-yellow-400 font-black">
                 <Star className="w-4 h-4 fill-yellow-400" /> 4.9 <span className="text-white/20">|</span> <span className="text-white">₹{ride.price_per_seat}</span>
              </div>
           </div>
        </GlassPanel>

        {/* PANEL 2: THE ACTION (LETS GO / NOT YET) */}
        {!isOwner && (
          <GlassPanel className={`transition-all duration-500 ${isAccepted ? 'border-green-500/20' : isPending ? 'border-amber-500/20' : 'border-white/5'}`}>
             <div className="flex flex-col items-center gap-6">
                {!isPending && !isAccepted && (
                   <div className="w-full">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-center mb-6">Select Capacity</p>
                      <div className="flex justify-center gap-4 mb-8">
                         {[1, 2, 3, 4].filter(n => n <= ride.available_seats).map(n => (
                           <button
                             key={n}
                             onClick={() => setSeatsToBook(n)}
                             className={`w-14 h-14 rounded-3xl border-2 font-black text-lg transition-all ${seatsToBook === n ? 'bg-blue-600 border-blue-500 text-white shadow-xl scale-110' : 'bg-white/5 border-white/5 text-white/20 hover:border-white/15'}`}
                           >
                             {n}
                           </button>
                         ))}
                      </div>
                   </div>
                )}
                
                <button
                  onClick={isPending ? handleCancelRequest : isAccepted ? undefined : handleRequest}
                  className={`w-full py-6 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.2em] transition-all active:scale-[0.98] flex items-center justify-center gap-4 ${
                    isAccepted ? 'bg-green-600/10 border border-green-500/20 text-green-400 cursor-default' :
                    isPending ? 'bg-amber-500 shadow-[0_20px_40px_rgba(245,158,11,0.2)] text-white hover:bg-red-500 group' :
                    'bg-blue-600 shadow-[0_20px_40px_rgba(37,99,235,0.3)] text-white hover:bg-blue-500'
                  }`}
                >
                  {isAccepted ? <><CheckCircle2 className="w-6 h-6" /> MISSION ACCEPTED</> :
                   isPending ? <><Timer className="w-6 h-6 group-hover:hidden" /><span className="group-hover:hidden">PENDING APPROVAL</span><X className="w-6 h-6 hidden group-hover:block" /><span className="hidden group-hover:block uppercase">NOT YET</span></> :
                   <>LETS GO <ArrowRight className="w-6 h-6" /></>}
                </button>
                {isAccepted && (
                   <p className="text-[10px] font-black text-green-400/50 uppercase tracking-widest animate-pulse">Synchronized with Captain</p>
                )}
             </div>
          </GlassPanel>
        )}

        {/* PANEL 3: THE INTEL (MAP & ROUTE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <GlassPanel className="flex flex-col justify-center">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-6">Navigation Hub</p>
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
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Route Analysis Active</span>
                 </div>
              </div>
           </div>
        </div>

        {/* PANEL 4: THE SOCIAL (CHAT) */}
        <GlassPanel className="h-[500px] flex flex-col !p-0">
           <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                 <MessageSquare className="w-5 h-5 text-blue-400" />
                 <h3 className="font-black text-sm uppercase tracking-widest">Global Coordination</h3>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                 <span className="text-[9px] font-black text-green-400 uppercase">Secure Link</span>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <Sparkles className="w-12 h-12 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">Establishing_Communications...</p>
                 </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.user_id === user?.id
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
                   placeholder={(isOwner || isAccepted || isPending) ? "Transmitting information..." : "Join mission to enable comms"}
                   className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-blue-600 transition-all placeholder:text-white/10" 
                 />
                 <button 
                   onClick={sendMessage}
                   disabled={!newMessage.trim() || sendingMsg}
                   className="bg-white text-black hover:bg-blue-600 hover:text-white px-6 py-4 rounded-2xl transition-all shadow-xl active:scale-90"
                 >
                    <Send className="w-5 h-5" />
                 </button>
              </div>
           </div>
        </GlassPanel>

      </main>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}


