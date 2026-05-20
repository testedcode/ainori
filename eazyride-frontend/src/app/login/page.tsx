'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Car, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errorDetails, setErrorDetails] = useState<string | null>(null)

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.role === 'admin') router.push('/admin')
        else router.push('/dashboard')
      } catch (e) {
        router.push('/dashboard')
      }
    }
  }, [router])

  const handleQuickTestLogin = async () => {
    setLoading(true)
    setErrorDetails(null)
    const supabase = createClient()
    
    try {
      let token = ''
      let legacyUser: any = null
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: 'test@test.com',
          password: 'test123',
        })
        if (authError) throw authError;
        token = authData.session?.access_token || '';
      } catch (authError: any) {
        console.warn('Supabase auth failed, falling back to custom API login:', authError.message);
        try {
          const res = await api.post('/auth/login', { email: 'test@test.com', password: 'test123' }) as any;
          if (res.token) {
             token = res.token;
             legacyUser = res.user || null
          } else {
             throw new Error('Custom login failed');
          }
        } catch (legacyError: any) {
          console.warn('Backend login failed for test account, using local mock bypass');
          token = 'mock-test-token-12345';
          legacyUser = {
            id: 9999,
            name: 'Test User',
            email: 'test@test.com',
            role: 'user',
            phone: '+91 99999 88888',
            city: 'Mumbai',
            approved: true,
            avatar_url: null
          };
        }
      }

      if (token) {
        localStorage.removeItem('user')
        localStorage.setItem('token', token)
        let finalUser = legacyUser

        try {
          if (token === 'mock-test-token-12345') {
            throw new Error('Using mock token, skip server profile fetch');
          }
          const profile = await api.getProfile() as any
          if (profile) {
            localStorage.setItem('user', JSON.stringify(profile))
            finalUser = profile
          }
        } catch (profileErr) {
          console.warn('Profile fetch failed during login, using legacy user data if available');
          if (legacyUser) {
            localStorage.setItem('user', JSON.stringify(legacyUser))
          } else {
            toast.error('Could not verify profile data. Please try again.')
            return
          }
        }
        
        toast.success(`Login successful! Welcome back ${finalUser?.name || ''}`)
        if (finalUser?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorDetails(null)
    const supabase = createClient()
    
    try {
      // Primary: Try Supabase Auth
      let token = '';
      let legacyUser: any = null
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })
        if (authError) throw authError;
        token = authData.session?.access_token || '';
      } catch (authError: any) {
        // Fallback: If Supabase fails, try custom PostgreSQL login (e.g. for admin@135)
        console.warn('Supabase auth failed, falling back to custom API login:', authError.message);
        try {
          const res = await api.post('/auth/login', { email: formData.email, password: formData.password }) as any;
          if (res.token) {
             token = res.token;
             legacyUser = res.user || null
          } else {
             throw new Error('Custom login failed');
          }
        } catch (legacyError: any) {
          if (formData.email === 'test@test.com' && formData.password === 'test123') {
            console.warn('Backend login failed for test account, using local mock bypass');
            token = 'mock-test-token-12345';
            legacyUser = {
              id: 9999,
              name: 'Test User',
              email: 'test@test.com',
              role: 'user',
              phone: '+91 99999 88888',
              city: 'Mumbai',
              approved: true,
              avatar_url: null
            };
          } else {
            throw new Error('Invalid login credentials (both systems failed)');
          }
        }
      }

      if (token) {
        localStorage.removeItem('user')
        localStorage.setItem('token', token)
        let finalUser = legacyUser

        // Always prefer server-verified profile to avoid stale identity.
        try {
          if (token === 'mock-test-token-12345') {
            throw new Error('Using mock token, skip server profile fetch');
          }
          const profile = await api.getProfile() as any
          if (profile) {
            localStorage.setItem('user', JSON.stringify(profile))
            finalUser = profile
          }
        } catch (profileErr) {
          console.warn('Profile fetch failed during login, using legacy user data if available');
          if (legacyUser) {
            localStorage.setItem('user', JSON.stringify(legacyUser))
          } else {
            // If we have no profile and no legacy user, we can't determine the role safely
            toast.error('Could not verify profile data. Please try again.')
            return
          }
        }
        
        toast.success(`Login successful! Welcome back ${finalUser?.name || ''}`)
        
        // Role-based redirect
        if (finalUser?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      const msg = error.message || 'Login failed'
      setErrorDetails(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-100 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Car className="w-7 h-7 text-white" />
          </div>
          <span className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600">EazyRide</span>
        </div>

        {/* Card */}
        <div className="bg-white backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-700 text-sm mb-8">Sign in to your premium commute account</p>

          {errorDetails && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm mb-6">
              {errorDetails}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-slate-100 transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-slate-100 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Quick fill */}
            <button 
              type="button" 
              onClick={handleQuickTestLogin}
              className="w-full text-xs py-3 bg-white border border-slate-200 hover:border-blue-500/50 rounded-2xl text-blue-600 hover:text-blue-500 transition-all font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              Demo / Test Account Login
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-slate-900 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-700 mt-6">
            New to EazyRide?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-300 font-bold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
