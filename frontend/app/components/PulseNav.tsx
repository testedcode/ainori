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
    const usr = localStorage.getItem('user')
    if (usr) setUser(JSON.parse(usr))
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    if (!confirm('Sign out from Pulse?')) return
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    const { createClient } = await import('@/utils/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?'

  return (
    <>
      {/* Desktop Header */}
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 hidden md:block ${
        scrolled
          ? 'bg-[#0a0f1e]/80 backdrop-blur-2xl border-b border-white/10 py-3 shadow-2xl'
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-12 flex items-center justify-between relative h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">Pulse</span>
          </Link>

          {/* Navigation Pill - Centered */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl backdrop-blur-md z-0">
            {NAV_LINKS.filter(l => !['/vehicles', '/profile'].includes(l.href)).map(link => {
              const Icon = link.icon
              const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    active
                      ? 'bg-white text-black shadow-xl shadow-white/10 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4 shrink-0 relative z-10">
            {user?.carbon_credits !== undefined && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <Leaf className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-black text-green-400">{user.carbon_credits}g</span>
              </div>
            )}
            
            <Link href="/profile" className="flex items-center gap-3 bg-white/5 border border-white/10 pl-2 pr-4 py-1.5 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-[10px] font-black text-white group-hover:rotate-12 transition-transform">
                {initials}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{user?.name?.split(' ')[0] || 'Member'}</span>
            </Link>

            {/* Admin Dashboard Link */}
            {(user?.role === 'admin' || adminMode) && (
              <Link 
                href="/admin" 
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}

            <button onClick={handleLogout} className="w-11 h-11 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header - Enhanced Clickability & Design */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4 flex justify-between items-center ${
        scrolled ? 'bg-[#0f172a]/90 backdrop-blur-2xl border-b border-white/10' : 'bg-transparent'
      }`}>
        <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
           <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
             <Car className="w-4.5 h-4.5 text-white" />
           </div>
           <span className="text-lg font-black tracking-tighter text-white italic">Pulse</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {(user?.role === 'admin' || adminMode) && (
            <Link href="/admin" className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 active:scale-90 transition-transform">
              <Shield className="w-5 h-5" />
            </Link>
          )}
          <Link href="/profile" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[10px] font-black text-blue-400 active:scale-90 transition-transform">
            {initials}
          </Link>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-400 active:scale-90 transition-transform"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION - Glassmorphic / Glossy Design */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 duration-700">
        <nav className="bg-white/[0.08] backdrop-blur-3xl border border-white/20 rounded-[2.5rem] px-2 py-2 flex justify-around items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {NAV_LINKS.filter(l => ['/dashboard', '/rides', '/my-rides', '/offer-ride', '/profile'].includes(l.href)).map(link => {
            const Icon = link.icon
            const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-[1.8rem] transition-all duration-500 active:scale-90 ${
                  active 
                    ? 'bg-gradient-to-b from-white/20 to-white/5 shadow-inner' 
                    : 'text-slate-400'
                }`}
              >
                {active && (
                  <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-all duration-300 ${active ? 'text-white scale-110' : 'text-slate-500'}`} />
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
          className="fixed bottom-6 right-6 z-[110] hidden md:flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95"
        >
          <LifeBuoy className="w-4 h-4" />
          <span className="hidden sm:inline">Help</span>
        </Link>
      )}

      <div className="md:hidden h-24" />
    </>
  )
}
