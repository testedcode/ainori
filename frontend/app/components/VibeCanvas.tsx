import React, { useState, useEffect } from 'react'
import { VibeState, VIBE_THEMES } from '@/lib/vibe-utils'

export default function VibeCanvas({ vibe }: { vibe: VibeState }) {
  const [mounted, setMounted] = useState(false)
  const [starPositions, setStarPositions] = useState<{top: string, left: string, delay: string, opacity: number}[]>([])
  
  const theme = VIBE_THEMES[vibe]
  const elements = theme.visuals.elements

  useEffect(() => {
    setMounted(true)
    if (elements.includes('stars')) {
      const stars = [...Array(50)].map(() => ({
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        opacity: Math.random() * 0.5
      }))
      setStarPositions(stars)
    }
  }, [vibe, elements])

  if (!mounted) return null

  return (
    <div className={`fixed inset-0 pointer-events-none -z-20 overflow-hidden ${theme.bg}`}>
      {/* Dynamic Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.visuals.gradient} transition-all duration-1000 ease-in-out`} />
      
      {/* Sun / Moon */}
      {(elements.includes('sun') || elements.includes('moon')) && (
        <div className={`absolute transition-all duration-[2000ms] ease-in-out ${
          elements.includes('sun') 
            ? 'top-[10%] right-[10%] w-64 h-64 bg-amber-400/20 blur-[100px] rounded-full' 
            : 'top-[5%] right-[15%] w-40 h-40 bg-blue-100/10 blur-[60px] rounded-full'
        }`}>
          {elements.includes('sun') && (
            <svg className="w-full h-full text-amber-500/10 animate-pulse" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="20" fill="currentColor" />
              {[...Array(8)].map((_, i) => (
                <rect key={i} x="48" y="10" width="4" height="15" fill="currentColor" transform={`rotate(${i * 45} 50 50)`} />
              ))}
            </svg>
          )}
        </div>
      )}

      {/* Clouds */}
      {elements.includes('clouds') && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="absolute bg-white/5 blur-3xl rounded-full" style={{
              width: `${200 + i * 100}px`,
              height: `${100 + i * 50}px`,
              top: `${20 + i * 15}%`,
              left: `${-10 + i * 30}%`,
              animation: `float ${20 + i * 10}s linear infinite`
            }} />
          ))}
        </div>
      )}

      {/* Stars */}
      {elements.includes('stars') && (
        <div className="absolute inset-0">
          {starPositions.map((p, i) => (
            <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{
              top: p.top,
              left: p.left,
              animationDelay: p.delay,
              opacity: p.opacity
            }} />
          ))}
        </div>
      )}

      {/* Birds */}
      {elements.includes('birds') && (
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute text-white/10" style={{
              top: `${30 + i * 5}%`,
              left: `-50px`,
              animation: `fly ${15 + i * 5}s linear infinite`,
              animationDelay: `${i * 2}s`
            }}>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
              </svg>
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateX(-20vw); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.5; }
          100% { transform: translateX(120vw); opacity: 0; }
        }
        @keyframes fly {
          0% { transform: translate(0, 0) scaleY(1); opacity: 0; }
          10% { opacity: 0.5; }
          50% { transform: translate(60vw, -30px) scaleY(0.7); }
          90% { opacity: 0.5; }
          100% { transform: translate(120vw, -10px) scaleY(1); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
