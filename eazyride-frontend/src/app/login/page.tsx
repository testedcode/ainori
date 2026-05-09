"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') router.push('/admin');
        else router.push('/dashboard');
      } catch (e) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      // Primary: Try Supabase Auth
      let token = '';
      let legacyUser: any = null;
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        token = authData.session?.access_token || '';
      } catch (authError: any) {
        // Fallback: If Supabase fails, try custom PostgreSQL login
        console.warn('Supabase auth failed, falling back to custom API login:', authError.message);
        try {
          const res: any = await api.login(email, password);
          if (res.token) {
             token = res.token;
             legacyUser = res.user || null;
          } else {
             throw new Error('Custom login failed');
          }
        } catch (legacyError: any) {
          throw new Error('Invalid login credentials');
        }
      }

      if (token) {
        localStorage.removeItem('user');
        localStorage.setItem('token', token);
        let finalUser = legacyUser;

        try {
          // Always prefer server-verified profile if we have one
          const profile = await api.getProfile() as any;
          if (profile && !profile.error) {
            localStorage.setItem('user', JSON.stringify(profile));
            finalUser = profile;
          }
        } catch (profileErr) {
          console.warn('Profile fetch failed during login, using legacy user data if available');
          if (legacyUser) {
            localStorage.setItem('user', JSON.stringify(legacyUser));
          } else {
            setError("Could not verify profile data.");
            return;
          }
        }
        
        toast.success(`Welcome back ${finalUser?.name || ''}`);
        
        // Role-based redirect
        if (finalUser?.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '80px 20px' }}>
      <div className="panel" style={{ maxWidth: '440px', width: '100%', padding: '40px' }}>
        <div className="center">
          <span className="brand-mark" style={{ width: '64px', height: '64px', fontSize: '24px', margin: '0 auto 24px' }}>ER</span>
          <h2>Welcome back</h2>
          <p className="muted">Sign in to your professional commute network.</p>
        </div>

        <form onSubmit={handleLogin} className="form-grid mt-28" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
          {error && (
            <div className="tag red" style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '12px' }}>
              {error}
            </div>
          )}
          
          <div className="field">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="primary-btn mt-12" style={{ width: '100%', height: '54px' }}>
            {loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="center mt-28">
          <p className="small muted">New to EazyRide? <Link href="/register" className="active" style={{ color: 'var(--primary)', fontWeight: '900' }}>Create account</Link></p>
        </div>
      </div>
    </div>
  );
}
