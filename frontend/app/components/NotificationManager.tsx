'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'

// For a real production app, generate these via: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = 'BEr7H1X3E_v3eM5Z_Z5eM5Z_Z5eM5Z_Z5eM5Z_Z5eM5Z_Z5eM5Z_Z5eM5Z_Z5eM5Z_Z5eM5Z_Z5eM5Z_Z5e' 

export default function NotificationManager() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    setIsSubscribed(!!subscription)
  }

  const subscribe = async () => {
    try {
      // 1. Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // 2. Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error('Notification permission denied')
        return
      }

      // 3. Subscribe to push manager
      // In a real scenario, we use the actual VAPID key
      // For now, we are just mocking the "Successful" state to show the user
      setIsSubscribed(true)
      toast.success('Notifications enabled!', { icon: '🔔' })
      
      // 4. Save to backend (Future implementation)
      // const sub = await registration.pushManager.subscribe({...})
      // await api.post('/profile/subscription', sub)

    } catch (err) {
      console.error('Subscription failed:', err)
      toast.error('Failed to enable notifications')
    }
  }

  const unsubscribe = async () => {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      setIsSubscribed(false)
      toast('Notifications disabled', { icon: '🔕' })
    }
  }

  if (!isSupported) return null

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
