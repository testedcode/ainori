"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res: any = await api.login(email, password);
      if (res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
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
