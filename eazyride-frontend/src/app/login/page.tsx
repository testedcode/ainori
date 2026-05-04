"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { createClient } from '@/utils/supabase/client';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          }
        }
        
        // Redirect
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="panel" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="section-head" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span className="brand-mark" style={{ width: '64px', height: '64px', fontSize: '24px', marginBottom: '16px' }}>ER</span>
          <h2>Welcome back</h2>
          <p>Sign in to your EazyRide account.</p>
        </div>
        <form onSubmit={handleLogin} className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '16px', marginTop: '20px' }}>
          {error && <div style={{ color: 'var(--danger)', fontSize: '14px', textAlign: 'center', background: '#ffe6ea', padding: '8px', borderRadius: '8px' }}>{error}</div>}
          <div className="field">
            <label>Email or Phone</label>
            <input 
              type="text" 
              placeholder="Enter your email or phone" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="primary-btn mt-12" style={{ width: '100%' }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="#" className="muted small">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}
