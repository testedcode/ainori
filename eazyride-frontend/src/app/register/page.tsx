"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { Loader2, UserPlus } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();

    try {
      // 1. Supabase Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name }
        }
      });

      if (authError) throw authError;

      // 2. Create Profile in our DB via API
      await api.post('/auth/register', {
        email: formData.email,
        name: formData.name,
        password: formData.password // Optional, depends on backend implementation
      });

      toast.success("Account created! Please login.");
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active" style={{ display: 'flex', justifyContent: 'center', padding: '60px 20px' }}>
      <div className="panel" style={{ maxWidth: '480px', width: '100%', padding: '40px' }}>
        <div className="center">
          <span className="brand-mark" style={{ width: '64px', height: '64px', fontSize: '24px', margin: '0 auto 24px' }}>ER</span>
          <h2>Create account</h2>
          <p className="muted">Join your professional neighbors for a better commute.</p>
        </div>

        <form onSubmit={handleRegister} className="form-grid mt-28" style={{ gridTemplateColumns: '1fr', gap: '16px' }}>
          {error && (
            <div className="tag red" style={{ width: '100%', justifyContent: 'center', padding: '12px', borderRadius: '12px' }}>
              {error}
            </div>
          )}
          
          <div className="field">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="Aayushi Singh" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="field">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Confirm</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="primary-btn mt-12" style={{ width: '100%', height: '54px' }}>
            {loading ? <Loader2 className="animate-spin" /> : <UserPlus />}
            {loading ? "Creating account..." : "Register Now"}
          </button>
        </form>

        <div className="center mt-28">
          <p className="small muted">Already have an account? <Link href="/login" className="active" style={{ color: 'var(--primary)', fontWeight: '900' }}>Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
