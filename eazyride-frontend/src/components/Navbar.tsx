'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Car, User, LogOut, LayoutDashboard, Search, Share2 } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    // Listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
    window.location.reload(); // Force refresh to clear all states
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="topbar" aria-label="EazyRide navigation">
      <Link href="/" className="brand" aria-label="EazyRide home">
        <span className="brand-mark">ER</span>
        <span>EazyRide<small>Share your route</small></span>
      </Link>
      
      <nav className="nav" aria-label="Primary navigation">
        <Link href="/" className={isActive('/') ? 'active' : ''}>Home</Link>
        <Link href="/book" className={isActive('/book') ? 'active' : ''}>Book a seat</Link>
        <Link href="/share" className={isActive('/share') ? 'active' : ''}>Share route</Link>
        {user && <Link href="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>My trips</Link>}
      </nav>

      <div className="top-actions">
        {user ? (
          <div className="segmented">
            <Link href="/profile" className={isActive('/profile') ? 'active' : ''} title="Profile">
              <User size={18} />
            </Link>
            <button onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <>
            <Link href="/login" className="light-btn">Log in</Link>
            <Link href="/register" className="dark-btn">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
