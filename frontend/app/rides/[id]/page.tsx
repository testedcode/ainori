'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Users, DollarSign, MessageSquare, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Ride {
  id: number
  user_id: number
  user_name: string
  corridor_name: string
  ride_date: string
  ride_time: string
  pickup_point: string
  drop_point: string
  route_description: string
  price_per_seat: number
  available_seats: number
  total_seats: number
  status: string
  vehicle_info?: {
    make: string
    model: string
    vehicle_number: string
    vehicle_type: string
  }
}

interface Message {
  id: number
  user_name: string
  message: string
  created_at: string
}

interface Payment {
  rider_id: number
  rider_name: string
  amount: number
  rider_status: string
  giver_status: string
}

export default function RideDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string

  const [ride, setRide] = useState<Ride | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [upiCopied, setUpiCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }

    fetchRideDetails()
    fetchMessages()
    fetchPayments()

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchMessages()
    }, 5000)

    return () => clearInterval(interval)
  }, [rideId, router])

  const fetchRideDetails = async () => {
    try {
      const data = await api.get(`/rides/${rideId}`)
      setRide(data as unknown as Ride)
    } catch (error) {
      toast.error('Failed to load ride details')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const lastId = messages.length > 0 ? messages[messages.length - 1].id : undefined
      const params = lastId ? `?last_id=${lastId}` : ''
      const data = await api.get(`/rides/${rideId}/messages${params}`)
      if (lastId) {
        setMessages((prev) => [...prev, ...(data as unknown as Message[])])
      } else {
        setMessages(data as unknown as Message[])
      }
    } catch (error) {
      console.error('Failed to load messages')
    }
  }

  const fetchPayments = async () => {
    try {
      const data = await api.get(`/rides/${rideId}/payments`)
      setPayments(data as unknown as Payment[])
    } catch (error) {
      console.error('Failed to load payments')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      await api.post(`/rides/${rideId}/messages`, { message: newMessage })
      setNewMessage('')
      fetchMessages()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send message')
    }
  }

  const copyUPI = () => {
    // This would come from user profile or ride giver's UPI ID
    const upiId = 'your-upi-id@paytm' // Replace with actual UPI ID
    navigator.clipboard.writeText(upiId)
    setUpiCopied(true)
    setTimeout(() => setUpiCopied(false), 2000)
    toast.success('UPI ID copied!')
  }

  const updatePaymentStatus = async (riderId: number, status: 'done' | 'received') => {
    try {
      const isRider = riderId === user?.id
      await api.put(`/rides/${rideId}/payments/${riderId}`, {
        [isRider ? 'rider_status' : 'giver_status']: status === 'done' ? 'done' : 'received',
      })
      toast.success('Payment status updated')
      fetchPayments()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update payment')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!ride) {
    return <div className="min-h-screen flex items-center justify-center">Ride not found</div>
  }

  const isRideGiver = user?.id === ride.user_id
  const upiId = 'your-upi-id@paytm' // Replace with actual UPI ID from user profile

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/find-ride" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            Back to Rides
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Ride Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">{ride.corridor_name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              <span>{ride.pickup_point} → {ride.drop_point}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <span>{formatDate(ride.ride_date)} at {ride.ride_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span>{ride.available_seats} of {ride.total_seats} seats available</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <span className="font-semibold">{formatCurrency(ride.price_per_seat)} per seat</span>
            </div>
          </div>
          {ride.vehicle_info && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Vehicle: {ride.vehicle_info.make} {ride.vehicle_info.model} ({ride.vehicle_info.vehicle_number})
              </p>
            </div>
          )}
        </div>

        {/* Payment Section */}
        {isRideGiver && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Payment Information</h2>
            <div className="flex items-center gap-6">
              <div>
                <QRCodeSVG value={`upi://pay?pa=${upiId}&pn=${user?.name}&am=&cu=INR`} size={150} />
              </div>
              <div>
                <p className="font-semibold mb-2">UPI ID:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-3 py-1 rounded">{upiId}</code>
                  <button
                    onClick={copyUPI}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    {upiCopied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">Share this UPI ID for payments</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat
          </h2>
          <div className="border rounded-lg p-4 h-64 overflow-y-auto mb-4 space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <span className="text-sm font-semibold">{msg.user_name}</span>
                <span className="text-gray-700">{msg.message}</span>
                <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>

        {/* Payment Status */}
        {payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Payment Status</h2>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.rider_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{payment.rider_name}</span>
                    <span className="text-green-600 font-bold">{formatCurrency(payment.amount)}</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className="text-sm">
                      Rider: <span className={payment.rider_status === 'done' ? 'text-green-600' : 'text-yellow-600'}>
                        {payment.rider_status}
                      </span>
                    </span>
                    <span className="text-sm">
                      Giver: <span className={payment.giver_status === 'received' ? 'text-green-600' : 'text-yellow-600'}>
                        {payment.giver_status}
                      </span>
                    </span>
                  </div>
                  {user?.id === payment.rider_id && payment.rider_status === 'pending' && (
                    <button
                      onClick={() => updatePaymentStatus(payment.rider_id, 'done')}
                      className="mt-2 px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Mark Payment Done
                    </button>
                  )}
                  {isRideGiver && payment.giver_status === 'pending' && (
                    <button
                      onClick={() => updatePaymentStatus(payment.rider_id, 'received')}
                      className="mt-2 px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Mark Payment Received
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

