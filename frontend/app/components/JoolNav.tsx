'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { 
  Car, LayoutDashboard, Search, Plus, Wrench, Shield, LogOut, Menu, X, 
  Bell, User, Leaf, LifeBuoy, History as HistoryIcon 
} from 'lucide-react'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/rides', label: 'Find Ride', icon: Search },
  { href: '/offer-ride', label: 'Offer Ride', icon: Plus },
  { href: '/history', label: 'History', icon: HistoryIcon },
  { href: '/vehicles', label: 'My Vehicles', icon: Wrench },
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
      {/* Desktop Header — Hidden on mobile to make room for Bottom Nav */}
      <header className={`sticky top-0 z-50 transition-all duration-300 hidden md:block ${
        scrolled
          ? 'bg-[#0a0f1e]/95 backdrop-blur-2xl shadow-2xl shadow-black/30'
          : 'bg-[#0f172a]/80 backdrop-blur-xl'
      } border-b border-white/5`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AINORI</span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="flex items-center gap-0.5 flex-1">
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
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 ml-auto">
            {user?.carbon_credits !== undefined && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Leaf className="w-3 h-3 text-green-400" />
                <span className="text-xs font-black text-green-400">{user.carbon_credits}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-[10px] font-black text-white">
                {initials}
              </div>
              <span className="text-xs font-semibold text-slate-300 max-w-[80px] truncate">{user?.name?.split(' ')[0] || 'User'}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-2 rounded-xl">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Branding Bar (Minimal) */}
      <div className="md:hidden sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
           <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
             <Car className="w-4 h-4 text-white" />
           </div>
           <span className="text-sm font-black tracking-tighter text-white">AINORI</span>
        </Link>
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Link href="/admin" className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Shield className="w-4 h-4" />
            </Link>
          )}
          <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-black text-blue-400 border border-white/10">
            {initials}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION — The "Native App" experience */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#0f172a]/95 backdrop-blur-2xl border-t border-white/10 px-4 pb-8 pt-3 flex justify-around items-center safe-area-bottom">
        {NAV_LINKS.filter(l => ['/dashboard', '/rides', '/offer-ride', '/history', '/profile'].includes(l.href)).map(link => {
          const Icon = link.icon
          const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-blue-400 scale-110' : 'text-slate-500'}`}
            >
              <div className={`p-2 rounded-xl transition-all ${active ? 'bg-blue-400/10' : ''}`}>
                <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'opacity-100' : 'opacity-40'}`}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Floating Support Button — Only on Desktop/Tab since mobile has bottom nav */}
      {pathname !== '/support' && (
        <Link
          href="/support"
          className="fixed bottom-6 right-6 z-50 hidden md:flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-2xl shadow-blue-600/40 transition-all hover:scale-105 active:scale-95"
        >
          <LifeBuoy className="w-4 h-4" />
          <span className="hidden sm:inline">Help</span>
        </Link>
      )}

      {/* Spacing for mobile nav */}
      <div className="md:hidden h-24" />
    </>
  )
}
