export type VibeState = 'dawn' | 'day' | 'afternoon' | 'dusk' | 'twilight' | 'midnight';

export function getVibe(hour: number): VibeState {
  if (hour >= 5 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 13) return 'day';
  if (hour >= 13 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 19) return 'dusk';
  if (hour >= 19 && hour < 22) return 'twilight';
  return 'midnight';
}

export const VIBE_THEMES: Record<VibeState, { 
  bg: string, 
  glow: string, 
  accent: string, 
  label: string, 
  icon: string,
  defaultDirection: 'to_office' | 'to_home',
  visuals: {
    gradient: string,
    elements: ('sun' | 'stars' | 'clouds' | 'birds' | 'moon')[]
  }
}> = {
  dawn: { 
    bg: 'bg-white', 
    glow: 'bg-amber-400/20', 
    accent: 'text-amber-600', 
    label: 'Morning Dawn', 
    icon: '☀️',
    defaultDirection: 'to_office',
    visuals: {
      gradient: 'from-amber-500/10 via-orange-500/5 to-white',
      elements: ['sun', 'birds']
    }
  },
  day: { 
    bg: 'bg-slate-50', 
    glow: 'bg-blue-400/15', 
    accent: 'text-blue-600', 
    label: 'High Day', 
    icon: '🏙️',
    defaultDirection: 'to_office',
    visuals: {
      gradient: 'from-blue-50 via-indigo-500/5 to-white',
      elements: ['clouds']
    }
  },
  afternoon: { 
    bg: 'bg-white', 
    glow: 'bg-slate-400/10', 
    accent: 'text-slate-700', 
    label: 'Afternoon', 
    icon: '🌥️',
    defaultDirection: 'to_office',
    visuals: {
      gradient: 'from-slate-400/5 via-blue-900/5 to-white',
      elements: ['clouds']
    }
  },
  dusk: { 
    bg: 'bg-slate-50', 
    glow: 'bg-orange-600/20', 
    accent: 'text-orange-500', 
    label: 'Golden Hour', 
    icon: '🌆',
    defaultDirection: 'to_home',
    visuals: {
      gradient: 'from-orange-600/15 via-purple-900/10 to-white',
      elements: ['sun', 'birds']
    }
  },
  twilight: { 
    bg: 'bg-white', 
    glow: 'bg-indigo-600/20', 
    accent: 'text-indigo-400', 
    label: 'Twilight', 
    icon: '🌙',
    defaultDirection: 'to_home',
    visuals: {
      gradient: 'from-indigo-600/20 via-purple-950/10 to-white',
      elements: ['stars', 'moon']
    }
  },
  midnight: { 
    bg: 'bg-white', 
    glow: 'bg-blue-900/20', 
    accent: 'text-blue-600', 
    label: 'Midnight', 
    icon: '✨',
    defaultDirection: 'to_home',
    visuals: {
      gradient: 'from-blue-900/20 via-slate-950/10 to-white',
      elements: ['stars']
    }
  }
};
