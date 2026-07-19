'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Car } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Verifying your Google login...')

  useEffect(() => {
    let mounted = true

    const syncSession = async () => {
      try {
        const supabase = createClient()
        // Wait for Supabase to parse the URL and establish the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) throw sessionError
        
        if (!session) {
          // Sometimes the event takes a moment to fire
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
             if (event === 'SIGNED_IN' && newSession) {
               if (mounted) await processSession(newSession)
             }
          })
          
          // Fallback timeout
          setTimeout(() => {
            if (mounted && !localStorage.getItem('token')) {
              toast.error('Authentication timeout. Please try again.')
              router.push('/login')
            }
          }, 10000)
          
          return
        }

        await processSession(session)
      } catch (error: any) {
        console.error('Callback error:', error)
        toast.error('Authentication failed: ' + error.message)
        router.push('/login')
      }
    }

    const processSession = async (session: any) => {
      const token = session.access_token
      localStorage.setItem('token', token)
      
      setStatus('Syncing your profile...')
      try {
        // This call will hit the backend. The backend will see the Supabase cookie/token
        // and automatically insert the user into PostgreSQL if they don't exist.
        const profile = await api.getProfile() as any
        if (profile) {
          localStorage.setItem('user', JSON.stringify(profile))
          toast.success(`Welcome ${profile.name || ''}!`)
          if (profile.role === 'admin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        } else {
          throw new Error('Failed to fetch profile')
        }
      } catch (err) {
        console.error('Profile sync failed:', err)
        toast.error('Could not sync profile data.')
        router.push('/login')
      }
    }

    syncSession()

    return () => {
      mounted = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 animate-pulse">
        <Car className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-4">Pulse Auth</h2>
      <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        <span className="text-sm text-slate-700 font-medium">{status}</span>
      </div>
    </div>
  )
}
