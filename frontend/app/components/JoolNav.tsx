'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Car, LayoutDashboard, Search, Plus, Wrench, Shield, LogOut, Menu, X, 
  Bell, User, Leaf, LifeBuoy, History as HistoryIcon 
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rides', label: 'Find Ride', icon: Search },
  { href: '/offer-ride', label: 'Share Ride', icon: Plus },
  { href: '/history', label: 'History', icon: HistoryIcon },
  { href: '/vehicles', label: 'Garage', icon: Wrench },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function JoolNav({ adminMode = false }: { adminMode?: boolean }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const usr = localStorage.getItem('user')
    if (usr) setUser(JSON.parse(usr))
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
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
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0f1e]/95 backdrop-blur-2xl shadow-2xl shadow-black/30'
          : 'bg-[#0f172a]/80 backdrop-blur-xl'
      } border-b border-white/5`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex items-center gap-4">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">JOOL</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(link => {
              const Icon = link.icon
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              )
            })}
            {(user?.role === 'admin' || adminMode) && (
              <Link href="/admin" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                pathname === '/admin' ? 'bg-purple-600/20 text-purple-400' : 'text-slate-400 hover:text-purple-400 hover:bg-purple-600/10'
              }`}>
                <Shield className="w-3.5 h-3.5" /> Admin
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Carbon Credits */}
            {user?.carbon_credits !== undefined && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Leaf className="w-3 h-3 text-green-400" />
                <span className="text-xs font-black text-green-400">{user.carbon_credits}</span>
              </div>
            )}

            {/* User badge */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">
                {initials}
              </div>
              <span className="text-xs font-semibold text-slate-300 max-w-[80px] truncate">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="hidden md:flex items-center text-slate-500 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-400/5"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 bg-white/5 border border-white/10 rounded-xl">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#0f172a] border-t border-white/5 px-6 py-4 space-y-1">
            {NAV_LINKS.map(link => {
              const Icon = link.icon
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <Icon className="w-5 h-5" /> {link.label}
                </Link>
              )
            })}
            <Link href="/support" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-blue-400 hover:bg-blue-600/10 transition-all">
              <LifeBuoy className="w-5 h-5" /> Support
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-purple-400 hover:bg-purple-600/10 transition-all">
                <Shield className="w-5 h-5" /> Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-red-400 hover:bg-red-400/5 transition-all">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        )}
      </header>

      {/* Floating Support Button — visible on all pages except /support */}
      {pathname !== '/support' && (
        <Link
          href="/support"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95"
        >
          <LifeBuoy className="w-4 h-4" />
          <span className="hidden sm:inline">Help</span>
        </Link>
      )}
    </>
  )
}
