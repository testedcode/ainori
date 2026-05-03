'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

// Use the real Public Key generated
const VAPID_PUBLIC_KEY = 'BH03JOrkRvMsAsTc4Zq2mZeqIIZHyXZMt_bgpJVALjdVhygUKBA4G_zF1EvoJRFc-42ERcMSg8gtAU53EJueJjY' 

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    } else {
      setLoading(false)
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      // Also check if the user has a subscription in the DB
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.push_subscription) {
          setIsSubscribed(true)
        } else {
          setIsSubscribed(!!subscription)
        }
      } else {
        setIsSubscribed(!!subscription)
      }
    } catch (err) {
      console.error('Error checking subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const subscribe = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Notification permission denied')
        setLoading(false)
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Save to backend
      await api.post('/auth/push-subscription', { subscription: JSON.stringify(subscription) })
      
      // Update local storage to persist state
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        user.push_subscription = JSON.stringify(subscription)
        localStorage.setItem('user', JSON.stringify(user))
      }

      setIsSubscribed(true)
      toast.success('Notifications enabled!', { icon: '🔔' })
    } catch (err) {
      console.error('Subscription failed:', err)
      toast.error('Failed to enable notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    setLoading(true)
    try {
      const res = await api.post('/auth/push-test', {})
      toast.success(res.data?.message || 'Test signal sent!', { icon: '🚀' })
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Test signal failed'
      toast.error(msg, { duration: 6000 })
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await api.post('/auth/push-subscription', { subscription: null })
        
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const user = JSON.parse(userStr)
          user.push_subscription = null
          localStorage.setItem('user', JSON.stringify(user))
        }

        setIsSubscribed(false)
        toast('Notifications disabled', { icon: '🔕' })
      }
    } catch (err) {
      console.error('Unsubscribe failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isSupported) return null
  if (loading) return <div className="h-24 bg-white/5 rounded-3xl animate-pulse mb-6" />

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isSubscribed ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
            {isSubscribed ? <CheckCircle2 className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Ride Updates</h3>
            <p className="text-xs text-slate-400">Get notified when someone joins or accepts your ride</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isSubscribed && (
            <button
              onClick={handleTestNotification}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              TEST
            </button>
          )}
          <button
            onClick={isSubscribed ? unsubscribe : subscribe}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
              isSubscribed 
                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500'
            }`}
          >
            {isSubscribed ? 'DISABLE' : 'ENABLE'}
          </button>
        </div>
      </div>
      
      {!isSubscribed && (
        <div className="flex items-center gap-2 p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10">
          <p className="text-[10px] text-blue-400/80 font-bold leading-tight">
            * We will send you notifications even when the app is closed. You can turn this off anytime.
          </p>
        </div>
      )}
    </div>
  )
}
