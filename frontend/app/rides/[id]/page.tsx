'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, MapPin, Clock, Users, IndianRupee, Car, Star, Shield,
  MessageSquare, Send, Check, X, CheckCheck, Loader2, Phone, Navigation,
  Calendar, Info, AlertCircle, Sparkles, Leaf, CheckCircle2, Banknote, QrCode
} from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import JoolNav from '../../components/JoolNav'

interface Ride {
  id: number
  user_id: number
  user_name: string
  corridor_name: string
  ride_date: string
  ride_time: string
  pickup_point: string
  drop_point: string
  route_description?: string
  price_per_seat: number
  available_seats: number
  total_seats: number
  status: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_color?: string
  vehicle_type?: string
  vehicle_number?: string
  pickup_points?: string[]
  upi_id?: string
  phone?: string
  vehicle_info?: { make: string; model: string; vehicle_number: string; vehicle_type: string; color?: string }
}

interface Payment {
  id: number
  rider_id: number
  amount: number
  rider_status: string
  giver_status: string
}

interface RideRequest {
  id: number
  rider_id: number
  rider_name: string
  pickup_point: string
  seats_requested: number
  status: string
  created_at: string
}

interface Message {
  id: number
  user_id?: number
  user_name: string
  message: string
  created_at: string
}

// Demo data
const DEMO_RIDE: Ride = {
  id: 1, user_id: 2, user_name: 'Aayushi Singh', corridor_name: 'Casa Rio → RCP',
  ride_date: new Date().toISOString().split('T')[0], ride_time: '08:30:00',
  pickup_point: 'Casa Rio Gate 1', drop_point: 'Reliance Corporate Park (RCP)',
  price_per_seat: 120, available_seats: 2, total_seats: 4, status: 'active',
  vehicle_make: 'Honda', vehicle_model: 'City', vehicle_color: 'White',
  vehicle_type: 'Sedan', vehicle_number: 'MH04 AB 1234',
  pickup_points: ['Casa Rio Gate 2', 'Lodha Splendora'],
  route_description: 'Route via Eastern Expressway, NH-48',
}

const DEMO_MESSAGES: Message[] = [
  { id: 1, user_id: 2, user_name: 'Aayushi Singh', message: 'Hey! Starting on time. Please be ready 5 min early.', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, user_id: 3, user_name: 'Rajiv', message: 'Got it! I will be at Gate 1.', created_at: new Date(Date.now() - 1800000).toISOString() },
]

const DEMO_REQUESTS: RideRequest[] = [
  { id: 1, rider_id: 5, rider_name: 'Priya Nair', pickup_point: 'Casa Rio Gate 2', seats_requested: 1, status: 'pending', created_at: new Date().toISOString() },
  { id: 2, rider_id: 6, rider_name: 'Rahul Verma', pickup_point: 'Lodha Splendora', seats_requested: 2, status: 'accepted', created_at: new Date().toISOString() },
]

function SeatBar({ available, total }: { available: number; total: number }) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all duration-500 ${
            i < (total - available) ? 'bg-white/10' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
          }`}
        />
      ))}
    </div>
  )
}

function MapEmbed({ from, to }: { from: string; to: string }) {
  const query = encodeURIComponent(`${from} to ${to}, Mumbai`)
  return (
    <div className="relative w-full h-80 rounded-[2rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
      <iframe
        src={`https://maps.google.com/maps?q=${query}&output=embed&z=12`}
        className="absolute inset-0 w-full h-full grayscale opacity-70"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Route Map"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-6 right-6 flex gap-2">
        <a
          href={`https://maps.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-xl transition-all active:scale-95"
        >
          <Navigation className="w-4 h-4" /> OPEN IN GOOGLE MAPS
        </a>
      </div>
    </div>
  )
}

export default function RideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string

  const [ride, setRide] = useState<Ride | null>(null)
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [requests, setRequests] = useState<RideRequest[]>(DEMO_REQUESTS)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMsg, setSendingMsg] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [seatsToBook, setSeatsToBook] = useState(1)
  const [payments, setPayments] = useState<Payment[]>([])
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
      const data = await api.get(`/rides/${rideId}`) as unknown as Ride
      setRide(data)
    } catch {
      setRide(DEMO_RIDE)
    }
    
    try {
      const data = await api.get(`/rides/${rideId}/messages`) as unknown as Message[]
      if (Array.isArray(data)) setMessages(data)
    } catch {}

    try {
      const data = await api.get(`/rides/${rideId}/requests`) as unknown as RideRequest[]
      if (Array.isArray(data)) {
        setRequests(data)
        const myUserId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id
        const myReq = data.find((r: any) => r.user_id === myUserId && (r.status === 'pending' || r.status === 'accepted'))
        if (myReq) setRequestSent(true)
      }
    } catch {}

    try {
      const data = await api.get(`/rides/${rideId}/payments`) as unknown as Payment[]
      if (Array.isArray(data)) setPayments(data)
    } catch {}

    setLoading(false)
  }

  const fetchMessages = async () => {
    try {
      const data = await api.get(`/rides/${rideId}/messages`)
      if (Array.isArray(data) && data.length > 0) setMessages(data as Message[])
    } catch {}
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    setSendingMsg(true)
    const optimistic: Message = {
      id: Date.now(), user_name: user?.name || 'You',
      user_id: user?.id, message: newMessage,
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimistic])
    setNewMessage('')
    try {
      await api.post(`/rides/${rideId}/messages`, { message: optimistic.message })
    } catch { /* optimistically shown */ }
    setSendingMsg(false)
  }

  const handleRequest = async () => {
    try {
      await api.post(`/rides/${rideId}/requests`, { seats_requested: seatsToBook })
      setRequestSent(true)
      toast.success(`🚀 Your request for ${seatsToBook} seat(s) has been broadcasted!`)
      fetchAll() // Refresh to get the actual request ID
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Request failed')
    }
  }

  const handleCancelRequest = async () => {
    try {
      const myUserId = user?.id
      const myReq = requests.find(r => (r as any).user_id === myUserId && r.status === 'pending')
      if (!myReq) return
      
      await api.delete(`/rides/${rideId}/requests/${myReq.id}`)
      setRequestSent(false)
      toast.success('Request retracted successfully.')
      fetchAll()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to cancel request')
    }
  }

  const handleAccept = async (requestId: number) => {
    try {
      await api.put(`/rides/${rideId}/requests/${requestId}`, { status: 'accepted' })
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r))
      toast.success('Passenger accepted into trip!')
    } catch {
      // Demo mode
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r))
      toast.success('Passenger accepted!')
    }
  }

  const handleReject = async (requestId: number) => {
    try {
      await api.put(`/rides/${rideId}/requests/${requestId}`, { status: 'rejected' })
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r))
      toast.success('Request declined.')
    } catch {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r))
    }
  }

  const handleUpdatePayment = async (userId: number, status: string, side: 'rider_status' | 'giver_status') => {
    try {
      await api.put(`/rides/${rideId}/payments/${userId}`, { [side]: status })
      toast.success('Payment status synchronized!')
      fetchAll()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update payment status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 font-bold tracking-widest text-[10px] uppercase">Retrieving Ride Intelligence...</p>
        </div>
      </div>
    )
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 text-white p-6">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
          <AlertCircle className="w-12 h-12 text-white/20" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">Ride Unavailable</h2>
          <p className="text-white/40">This commute link has expired or been removed.</p>
        </div>
        <Link href="/rides" className="bg-blue-600 px-10 py-4 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
          EXPLORE OTHER RIDES
        </Link>
      </div>
    )
  }

  const isOwner = user?.id === ride.user_id
  const initials = ride.user_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()
  const pickupList = ride.pickup_points || []

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans pb-20 overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-600/5 blur-[150px] -z-10 pointer-events-none" />

      <JoolNav />

      {/* Hero Header */}
      <div className="bg-[#0f172a]/40 border-b border-white/5 pt-12 pb-16 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="flex-1">
             <Link href="/rides" className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest mb-6">
              <ArrowLeft className="w-3 h-3" /> BACK TO NETWORK
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-tighter ${
                ride.status === 'active' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
              }`}>
                {ride.status}
              </div>
              <span className="text-white/20 font-bold text-xs">JOOL COMMUTE ID: #{ride.id}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white max-w-2xl">{ride.corridor_name}</h1>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl flex flex-col items-center min-w-[240px] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -z-10 rounded-full" />
             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Contribution</p>
             <div className="flex items-center gap-1 text-5xl font-black text-white mb-6">
                <IndianRupee className="w-8 h-8 text-green-400" /> {ride.price_per_seat}
             </div>
             {!isOwner && (
                <div className="w-full space-y-4">
                  {ride.available_seats > 0 && !requestSent && (
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Select Seats</p>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setSeatsToBook(prev => Math.max(1, prev - 1))}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black hover:bg-white/20 transition-all text-lg"
                          >
                            -
                          </button>
                          <span className="text-xl font-black min-w-[20px] text-center">{seatsToBook}</span>
                          <button 
                            onClick={() => setSeatsToBook(prev => Math.min(ride.available_seats, prev + 1))}
                            className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black hover:bg-blue-700 transition-all text-lg"
                          >
                            +
                          </button>
                       </div>
                    </div>
                  )}
                  <button
                    onClick={requestSent ? handleCancelRequest : handleRequest}
                    disabled={(ride.available_seats === 0 && !requestSent)}
                    className={`w-full py-4 rounded-[2rem] font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      requestSent
                        ? 'bg-white/5 border border-white/10 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                        : ride.available_seats === 0
                        ? 'bg-white/5 border border-white/10 text-white/20'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30'
                    }`}
                  >
                    {requestSent ? <><X className="w-5 h-5" /> CANCEL REQUEST</> : ride.available_seats === 0 ? 'TRIP FULL' : 'JOIN TRIP'}
                  </button>
                  {requestSent && (
                    <p className="text-[10px] text-center font-black text-blue-400 uppercase tracking-widest animate-pulse">
                      Waiting for host approval...
                    </p>
                  )}
                </div>
             )}
             {isOwner && (
               <div className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-4 h-4" /> MANAGING AS HOST
               </div>
             )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Details & Map */}
        <div className="lg:col-span-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Host Profile */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-[0_15px_30px_rgba(37,99,235,0.3)] mb-6 relative">
                  {initials}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0f172a] shadow-lg" />
                </div>
                <h3 className="text-2xl font-black text-white">{ride.user_name}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                      <Star className="w-4 h-4 fill-yellow-400" /> 4.9
                   </div>
                   <div className="w-1 h-1 bg-white/10 rounded-full" />
                   <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">VERIFIED CAPTAIN</div>
                </div>
                
                <div className="flex gap-3 mt-8 w-full">
                   <a href="tel:+91" className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all">
                      <Phone className="w-4 h-4" /> AUDIO CALL
                   </a>
                   <button className="flex-1 bg-white/5 border border-white/5 hover:bg-white/10 py-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all">
                      <Shield className="w-4 h-4" /> PROFILE
                   </button>
                </div>
            </div>

            {/* Logistics Card */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">Trip Logistics</p>
               <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                 <div className="flex items-start gap-4 relative z-10 transition-all group">
                    <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-[#0f172a] mt-1 group-hover:scale-125 transition-transform" />
                    <div>
                      <p className="text-lg font-black text-white leading-none mb-1">{ride.pickup_point}</p>
                      <p className="text-xs text-white/40 font-bold">STARTING POINT</p>
                    </div>
                 </div>
                 {pickupList.map((pt, i) => (
                   <div key={i} className="flex items-start gap-4 relative z-10 group">
                      <div className="w-3 h-3 rounded-full bg-white/20 border-2 border-[#0f172a] mt-1 ml-[1px] group-hover:bg-blue-400 transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-slate-300 mb-0.5">{pt}</p>
                        <p className="text-[10px] text-white/20 font-black uppercase">WAYPOINT {i+1}</p>
                      </div>
                   </div>
                 ))}
                 <div className="flex items-start gap-4 relative z-10 group">
                    <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-[#0f172a] mt-1 group-hover:scale-125 transition-transform" />
                    <div>
                      <p className="text-lg font-black text-white leading-none mb-1">{ride.drop_point}</p>
                      <p className="text-xs text-white/40 font-bold">FINAL DESTINATION</p>
                    </div>
                 </div>
               </div>

               <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5">
                     <Calendar className="w-4 h-4 text-white/20 mb-2" />
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Date</p>
                     <p className="text-sm font-bold">{new Date(ride.ride_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/5">
                     <Clock className="w-4 h-4 text-white/20 mb-2" />
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Time</p>
                     <p className="text-sm font-bold">{ride.ride_time?.slice(0,5)}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-black flex items-center gap-3">
                   <MapPin className="w-6 h-6 text-blue-500" /> ROUTE GEOMETRY
                </h3>
             </div>
             <MapEmbed from={ride.pickup_point} to={ride.drop_point} />
          </div>

          {/* JOOL AI Commute Assistant */}
          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-24 h-24 text-blue-400" />
             </div>
             <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md mb-6">
                  <Sparkles className="w-3 h-3" /> JOOL AI ASSISTANT
                </div>
                <h3 className="text-3xl font-black text-white mb-4">Commute Intelligence Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-[#0f172a]/80 p-5 rounded-2xl border border-white/5">
                      <Clock className="w-5 h-5 text-blue-400 mb-2" />
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Time Efficiency</p>
                      <p className="text-lg font-black text-white mt-1">94% Efficient</p>
                      <p className="text-[10px] text-green-400 font-bold mt-1">Saves 15 mins vs Solo</p>
                   </div>
                   <div className="bg-[#0f172a]/80 p-5 rounded-2xl border border-white/5">
                      <Leaf className="w-5 h-5 text-green-400 mb-2" />
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Carbon Impact</p>
                      <p className="text-lg font-black text-white mt-1">-4.2kg CO₂</p>
                      <p className="text-[10px] text-green-400 font-bold mt-1">Equivalent to 2 trees</p>
                   </div>
                   <div className="bg-[#0f172a]/80 p-5 rounded-2xl border border-white/5">
                      <Users className="w-5 h-5 text-purple-400 mb-2" />
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Social Score</p>
                      <p className="text-lg font-black text-white mt-1">Premium Match</p>
                      <p className="text-[10px] text-blue-400 font-bold mt-1">Verified Colleagues</p>
                   </div>
                </div>
                <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                   <p className="text-sm text-white/60 leading-relaxed italic">
                     "Predictive analysis suggests clear traffic on NH-48. This route is optimized for your 9:00 AM meeting at RCP."
                   </p>
                </div>
             </div>
          </div>

          {/* Ride Group Chat */}
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-[500px]">
            <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3 bg-white/5 backdrop-blur-md">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              <div>
                <h3 className="font-black text-lg">Group Chatroom</h3>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Only confirmed riders can participate</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">SYNC LIVE</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                   <MessageSquare className="w-12 h-12 mb-4" />
                   <p className="font-black uppercase text-xs tracking-[0.2em]">Silent Channel</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.user_id === user?.id
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      {!isMine && (
                         <div className="flex items-center gap-2 mb-2 ml-1">
                            <div className="w-5 h-5 bg-white/10 rounded-md flex items-center justify-center text-[8px] font-black">{msg.user_name[0]}</div>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{msg.user_name}</span>
                         </div>
                      )}
                      <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm font-medium leading-relaxed ${
                        isMine 
                          ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-600/20' 
                          : 'bg-white/5 text-white border border-white/5 rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 transition-opacity px-1">
                        <span className="text-[9px] font-black text-white/20 uppercase">
                          {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && <CheckCheck className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="px-8 py-6 border-t border-white/5 bg-white/5 backdrop-blur-md">
              <div className="flex gap-4 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Communicate with the group..."
                  className="flex-1 bg-[#0f172a] border border-white/5 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:border-blue-600 transition-all shadow-inner"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMsg}
                  className="bg-white text-black hover:bg-blue-600 hover:text-white px-6 py-4 rounded-2xl disabled:opacity-20 transition-all active:scale-95 shadow-xl group"
                >
                  <Send className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fleet & Requests */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Capacity Meter */}
          <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
             <div className="flex items-center justify-between mb-8">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Capacity Tracker</p>
                <Users className="w-4 h-4 text-white/20" />
             </div>
             <SeatBar available={ride.available_seats} total={ride.total_seats} />
             <div className="mt-8 flex justify-between items-end">
                <div>
                   <p className="text-3xl font-black text-white">{ride.available_seats}</p>
                   <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">SEATS LEFT</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-white/20">{ride.total_seats}</p>
                   <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">TOTAL CAP</p>
                </div>
             </div>
          </div>

          {/* Vehicle Intel */}
          {(ride.vehicle_make || ride.vehicle_info) && (
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8">Registered Fleet Intel</p>
               <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 bg-[#0f172a] border border-white/5 rounded-3xl flex items-center justify-center text-3xl">
                     {ride.vehicle_type === 'Bike' ? '🏍️' : '🚗'}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white leading-tight">{ride.vehicle_make || ride.vehicle_info?.make}</h4>
                    <p className="text-sm font-bold text-white/40 tracking-tight">{ride.vehicle_model || ride.vehicle_info?.model}</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Official Plate</span>
                    <span className="text-sm font-mono font-black text-yellow-500 bg-yellow-400/5 px-3 py-1 rounded-xl border border-yellow-400/10 tracking-[0.1em]">
                      {ride.vehicle_number || ride.vehicle_info?.vehicle_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Conditioning</span>
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest">PREMIUM AIR</span>
                  </div>
               </div>
            </div>
          )}

          {/* Confirmation & Payment Hub (Shown for Confirmed Riders or Owner) */}
          {(isOwner || requests.find(r => (r as any).user_id === user?.id && r.status === 'accepted')) && (
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500/5 blur-3xl rounded-full" />
               <div className="flex items-center justify-between mb-8">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> PAYMENT HUB
                  </div>
                  <Banknote className="w-5 h-5 text-green-400" />
               </div>

               <h3 className="text-2xl font-black text-white mb-2">Settle Contribution</h3>
               <p className="text-sm text-white/40 mb-8 font-medium">Please finalize payment with the captain.</p>

               <div className="bg-[#0f172a]/60 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">UPI ID / Phone</p>
                    <div className="flex items-center justify-between font-mono font-black text-white">
                       <span>{ride.upi_id || ride.phone || (isOwner ? 'YOUR_UPI_ADDRESS' : 'abhi@pay')}</span>
                       <button 
                         onClick={() => {
                            const val = ride.upi_id || ride.phone || 'abhi@pay'
                            navigator.clipboard.writeText(val)
                            toast.success('Address copied to clipboard')
                         }}
                         className="text-blue-400 text-[10px] hover:underline uppercase tracking-widest"
                       >
                         COPY
                       </button>
                    </div>
                  </div>
                  
                  <div className="aspect-square bg-white rounded-2xl p-4 flex items-center justify-center relative overflow-hidden group/qr">
                     <QrCode className="w-full h-full text-slate-100 group-hover/qr:scale-105 transition-transform" />
                     {isOwner && (
                       <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover/qr:opacity-100 transition-opacity">
                          <button className="px-6 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl">
                             UPDATE QR
                          </button>
                       </div>
                     )}
                     <div className="absolute inset-0 border-4 border-slate-100/50 pointer-events-none rounded-2xl" />
                     <p className="absolute bottom-4 text-slate-300 text-[8px] font-black uppercase tracking-[0.2em]">Scan to Pay ₹{ride.price_per_seat}</p>
                  </div>

                  {!isOwner ? (
                    (() => {
                      const myPay = payments.find(p => p.rider_id === user?.id)
                      const isDone = myPay?.rider_status === 'done'
                      return (
                        <button 
                          onClick={() => handleUpdatePayment(user.id, 'done', 'rider_status')}
                          disabled={isDone}
                          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                            isDone 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                              : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
                          }`}
                        >
                          {isDone ? 'PAID CONFIRMED' : 'MARK AS PAID'}
                        </button>
                      )
                    })()
                  ) : (
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Rider Settlements</p>
                       {payments.map(p => (
                         <div key={p.id} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="text-xs font-bold">{(p as any).rider_name || 'Rider'}</span>
                            <div className="flex gap-2">
                               <span className={`text-[8px] font-black px-2 py-1 rounded-md ${p.rider_status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                  {p.rider_status === 'done' ? 'SENT' : 'PENDING'}
                               </span>
                               <button 
                                 onClick={() => handleUpdatePayment(p.rider_id, 'received', 'giver_status')}
                                 disabled={p.giver_status === 'received'}
                                 className={`text-[8px] font-black px-2 py-1 rounded-md transition-all ${p.giver_status === 'received' ? 'bg-blue-500/20 text-blue-400' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}
                               >
                                  {p.giver_status === 'received' ? 'RECEIVED' : 'MARK RECEIVED'}
                               </button>
                            </div>
                         </div>
                       ))}
                       {payments.length === 0 && <p className="text-[10px] text-center text-white/20 italic">No confirmed riders yet</p>}
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* Manager Controls / Requests */}
          {isOwner && (
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl -z-10 rounded-full" />
               <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> MANAGER CONSOLE
               </h3>
               
               {requests.length === 0 ? (
                 <div className="py-12 text-center opacity-20">
                    <Users className="w-10 h-10 mx-auto mb-4" />
                    <p className="font-black text-xs uppercase tracking-widest">Searching for Colleagues...</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {requests.map(req => (
                     <div key={req.id} className="bg-[#0f172a] border border-white/5 rounded-3xl p-5 group hover:border-white/10 transition-all">
                       <div className="flex items-center gap-4 mb-5">
                         <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center text-xs font-black group-hover:bg-blue-600 transition-colors">
                           {req.rider_name[0]}
                         </div>
                         <div className="flex-1">
                           <p className="text-sm font-black text-white">{req.rider_name}</p>
                           <p className="text-[10px] text-white/40 font-bold uppercase tracking-tight">{req.pickup_point} · {req.seats_requested} seat(s)</p>
                         </div>
                       </div>
                       
                       {req.status === 'pending' ? (
                         <div className="flex gap-2">
                           <button onClick={() => handleAccept(req.id)} className="flex-1 bg-green-600 hover:bg-green-700 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5">
                             <Check className="w-3.5 h-3.5" /> CONFIRM
                           </button>
                           <button onClick={() => handleReject(req.id)} className="flex-1 bg-white/5 hover:bg-red-600 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5">
                             <X className="w-3.5 h-3.5" /> IGNORE
                           </button>
                         </div>
                       ) : (
                         <div className={`w-full py-2.5 rounded-xl text-center text-[10px] font-black uppercase tracking-widest ${
                            req.status === 'accepted' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                         }`}>
                            STATUS: {req.status}
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
