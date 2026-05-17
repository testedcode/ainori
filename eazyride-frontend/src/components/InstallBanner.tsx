'use client'

import { useState, useEffect } from 'react'
import { Share, PlusSquare, X, Download } from 'lucide-react'

export default function InstallBanner() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')

  useEffect(() => {
    // 1. Check if already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    if (isStandalone) return

    // 2. Check platform
    const ua = navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua)

    if (isIos) setPlatform('ios')
    else if (isAndroid) setPlatform('android')
    else return

    // 3. Check if they've dismissed it this session
    const dismissed = sessionStorage.getItem('install-banner-dismissed')
    if (!dismissed) {
      // Delay slightly for better UX
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('install-banner-dismissed', 'true')
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[110] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-5 shadow-xl shadow-black/50">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white rounded-full text-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
            <Download className="w-6 h-6 text-slate-900" />
          </div>
          
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Install Pulse App</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Add to your home screen for the full "Private Syndicate" experience and faster access.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          {platform === 'ios' ? (
            <div className="flex items-center gap-3 text-[11px] font-bold text-blue-600">
              <span>Tap</span>
              <div className="p-1.5 bg-white rounded-lg border border-slate-200">
                <Share className="w-3.5 h-3.5" />
              </div>
              <span>then</span>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200">
                <PlusSquare className="w-3.5 h-3.5" />
                <span>Add to Home Screen</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[11px] font-bold text-green-600">
              <span>Tap the</span>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200">
                <span>Menu ⋮</span>
              </div>
              <span>then</span>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-200">
                <span>Install App</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Pointer for iOS (Standard Safari Share button is at bottom center) */}
      {platform === 'ios' && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center">
           <div className="w-0.5 h-12 bg-gradient-to-b from-blue-500/0 via-blue-500/50 to-blue-500" />
           <div className="text-[10px] font-black text-blue-600 uppercase mt-1">Tap Share</div>
        </div>
      )}
    </div>
  )
}
