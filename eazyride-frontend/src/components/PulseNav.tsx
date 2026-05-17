'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Car, LayoutDashboard, Search, Plus, Wrench, Shield, LogOut, Menu, X, 
  Bell, User, Leaf, LifeBuoy, History as HistoryIcon, Bookmark
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/rides', label: 'Find Ride', icon: Search },
  { href: '/my-rides', label: 'My Rides', icon: Bookmark },
  { href: '/offer-ride', label: 'Offer Ride', icon: Plus },
  { href: '/history', label: 'History', icon: HistoryIcon },
  { href: '/vehicles', label: 'My Vehicles', icon: Wrench },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function PulseNav({ adminMode = false }: { adminMode?: boolean }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const usr = localStorage.getItem('user')
    if (token && usr) {
      try {
        setUser(JSON.parse(usr))
      } catch {
        setUser(null)
      }
    } else {
      setUser(null)
    }
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    if (!confirm('Sign out from Pulse?')) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('Supabase auth signout failed:', err)
    }
    window.location.href = '/'
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'

  return (
    <>
      {/* Desktop Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 hidden md:block ${
        scrolled
          ? 'bg-slate-50/80 backdrop-blur-2xl border-b border-slate-200 py-3 shadow-xl'
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-12 flex items-center justify-between relative h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600">Pulse</span>
          </Link>

          {/* Navigation Pill - Centered */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl backdrop-blur-md z-0">
            {NAV_LINKS.filter(l => !['/vehicles', '/profile'].includes(l.href)).map(link => {
              const Icon = link.icon
              const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    active
                      ? 'bg-blue-600 text-white shadow-xl shadow-white/10 scale-105'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3 shrink-0 relative z-10">

            {user?.carbon_credits !== undefined && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Leaf className="w-3.5 h-3.5 text-green-600" />
                <span className="text-[10px] font-black text-green-600">{user.carbon_credits}g</span>
              </div>
            )}
            
            <Link href="/profile" className="flex items-center justify-center bg-white border border-slate-200 p-1 rounded-xl hover:bg-slate-100 transition-all group" title="Profile">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white group-hover:rotate-12 transition-transform">
                {initials}
              </div>
            </Link>

            {/* Admin Dashboard Link */}
            {(user?.role === 'admin' || adminMode) && (
              <Link 
                href="/admin" 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-purple-50 border border-purple-300 text-purple-600 hover:bg-purple-500 hover:text-white'
                }`}
                title="Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Admin</span>
              </Link>
            )}

            <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header - Enhanced Clickability & Design */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 pt-[env(safe-area-inset-top,1rem)] pb-4 flex justify-between items-center ${
        scrolled ? 'bg-slate-50/90 backdrop-blur-2xl border-b border-slate-200' : 'bg-transparent'
      }`}>
        <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
           <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
             <Car className="w-4.5 h-4.5 text-white" />
           </div>
           <span className="text-lg font-black tracking-tighter text-slate-900 italic">Pulse</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {(user?.role === 'admin' || adminMode) && (
            <Link href="/admin" className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-600 active:scale-90 transition-transform">
              <Shield className="w-5 h-5" />
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-400 active:scale-90 transition-transform"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - Ultra-Premium Glassmorphic */}
      <div className="md:hidden fixed bottom-8 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-700">
        <nav className="bg-slate-50/40 backdrop-blur-3xl border border-slate-300 rounded-[3rem] px-3 py-2 flex justify-between items-center shadow-[0_25px_60px_rgba(0,0,0,0.1)]">
          {NAV_LINKS.filter(l => ['/dashboard', '/rides', '/offer-ride', '/my-rides', '/profile'].includes(l.href)).map((link, idx) => {
            const Icon = link.icon
            const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
            const isOfferRide = link.href === '/offer-ride'

            if (isOfferRide) {
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  className="relative -top-6 flex flex-col items-center justify-center w-16 h-16 bg-blue-600 rounded-full shadow-[0_15px_40px_rgba(37,99,235,0.2)] active:scale-90 transition-all border-4 border-slate-200"
                >
                  <Plus className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-slate-200 rounded-full blur-lg opacity-0 hover:opacity-100 transition-opacity" />
                </Link>
              )
            }
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`relative flex flex-col items-center justify-center flex-1 h-12 rounded-2xl transition-all duration-300 active:scale-90 ${
                  active ? 'text-slate-900' : 'text-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-300 ${active ? 'scale-110' : 'opacity-60'}`} />
                <span className={`text-[8px] font-black uppercase tracking-[0.1em] mt-1 transition-all ${active ? 'opacity-100' : 'opacity-0'}`}>
                  {link.label.split(' ')[0]}
                </span>
                {active && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,1)]" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Floating Support Button — Only on Desktop/Tab since mobile has bottom nav */}
      {pathname !== '/support' && (
        <Link
          href="/support"
          className="fixed bottom-28 md:bottom-6 right-6 z-[110] flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95"
        >
          <LifeBuoy className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">Help</span>
        </Link>
      )}

      <div className="md:hidden h-24" />
    </>
  )
}
