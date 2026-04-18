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
    if (token) router.push('/dashboard')
  }, [router])

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
          throw new Error('Invalid login credentials (both systems failed)');
        }
      }

      if (token) {
        localStorage.removeItem('user')
        localStorage.setItem('token', token)
        if (legacyUser) {
          localStorage.setItem('user', JSON.stringify(legacyUser))
        }

        // Always prefer server-verified profile to avoid stale identity.
        api.getProfile().then((profile) => {
          if (profile) localStorage.setItem('user', JSON.stringify(profile))
        }).catch(() => {
          toast.error('Could not verify profile data. Please re-login if profile looks wrong.')
        })
        
        toast.success('Login successful!')
        router.push('/dashboard')
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
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Car className="w-7 h-7 text-white" />
          </div>
          <span className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">JOOL</span>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to your premium commute account</p>

          {errorDetails && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-sm mb-6">
              {errorDetails}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Quick fill */}
            <div className="flex gap-3">
              <button type="button" onClick={() => setFormData({ email: 'admin@cpoolai.com', password: 'admin@1357' })}
                className="flex-1 text-xs py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all font-bold">
                Supabase Admin
              </button>
              <button type="button" onClick={() => setFormData({ email: 'admin@135', password: 'password' })}
                className="flex-1 text-xs py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/20 transition-all font-bold">
                Local Admin
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New to JOOL?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
