import os
import re

def replace_classes(content):
    # Colors and borders
    replacements = [
        ('bg-[#0f172a]', 'bg-slate-50'),
        ('bg-[#1e293b]', 'bg-white'),
        ('bg-[#020617]', 'bg-white'),
        ('bg-[#0a0f1e]', 'bg-slate-50'),
        ('bg-[#050810]/50', 'bg-slate-50'),
        ('bg-[#0a0505]', 'bg-rose-50'),
        ('bg-[#100808]', 'bg-rose-50'),
        ('bg-[#050a15]', 'bg-blue-50'),
        ('text-white', 'text-slate-900'),
        ('text-white/20', 'text-slate-400'),
        ('text-white/30', 'text-slate-500'),
        ('text-white/40', 'text-slate-500'),
        ('text-white/60', 'text-slate-600'),
        ('text-white/80', 'text-slate-700'),
        ('border-white/5', 'border-slate-200'),
        ('border-white/10', 'border-slate-200'),
        ('border-white/20', 'border-slate-300'),
        ('border-white/30', 'border-slate-300'),
        ('bg-white/5', 'bg-white'),
        ('bg-white/10', 'bg-slate-100'),
        ('bg-white/20', 'bg-slate-200'),
        ('bg-white/[0.02]', 'bg-white'),
        ('bg-white/[0.03]', 'bg-slate-50'),
        ('bg-white/[0.05]', 'bg-slate-50'),
        ('bg-white/[0.06]', 'bg-slate-100'),
        ('bg-white/[0.08]', 'bg-slate-100'),
        ('bg-black/40', 'bg-slate-50'),
        ('bg-black/60', 'bg-slate-100/90'),
        ('border-blue-900/30', 'border-blue-200'),
        ('border-blue-900/40', 'border-blue-200'),
        ('border-red-900/20', 'border-rose-200'),
        ('border-red-900/30', 'border-rose-200'),
        ('bg-red-950/10', 'bg-rose-100'),
        ('bg-red-950/20', 'bg-rose-100'),
        ('bg-blue-600/5', 'bg-blue-50'),
        ('bg-blue-600/10', 'bg-blue-100'),
        ('bg-blue-600/20', 'bg-blue-100'),
        ('bg-blue-600/30', 'bg-blue-200'),
        ('bg-purple-900/20', 'bg-purple-100'),
        ('border-purple-500/20', 'border-purple-300'),
        ('bg-purple-500/10', 'bg-purple-50'),
        ('text-red-600/40', 'text-rose-500'),
        ('text-slate-300', 'text-slate-600'),
        ('text-slate-400', 'text-slate-500'),
        ('text-slate-500', 'text-slate-600'),
        ('text-slate-600', 'text-slate-700'),
        ('text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-blue-400', 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600'),
        ('bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800', 'bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 border border-blue-200'),
        ('text-blue-400', 'text-blue-600'),
        ('text-blue-500', 'text-blue-600'),
        ('text-amber-400', 'text-amber-600'),
        ('text-amber-500', 'text-amber-600'),
        ('bg-amber-500/10', 'bg-amber-50'),
        ('bg-amber-500/20', 'bg-amber-100'),
        ('bg-amber-500/30', 'bg-amber-100'),
        ('border-amber-400/40', 'border-amber-300'),
        ('border-amber-500/20', 'border-amber-300'),
        ('text-green-400', 'text-green-600'),
        ('text-cyan-400', 'text-cyan-600'),
        ('text-purple-400', 'text-purple-600'),
        ('text-rose-400', 'text-rose-600'),
        ('text-rose-500', 'text-rose-600'),
        ('border-white', 'border-slate-300'),
        ('bg-white text-black', 'bg-blue-600 text-white'), # primary buttons
        ('shadow-2xl', 'shadow-xl'),
        ('shadow-white/5', 'shadow-slate-200'),
        ('shadow-blue-900/50', 'shadow-blue-100'),
        ('shadow-blue-500/10', 'shadow-blue-200/50'),
        ('shadow-amber-500/10', 'shadow-amber-200/50'),
        ('shadow-purple-500/10', 'shadow-purple-200/50'),
        ('shadow-cyan-500/10', 'shadow-cyan-200/50'),
        ('shadow-red-500/10', 'shadow-red-200/50'),
        ('shadow-indigo-500/10', 'shadow-indigo-200/50'),
        ('from-purple-900/20', 'from-purple-100'),
        ('from-blue-600/10', 'from-blue-50'),
        ('from-blue-400/10', 'from-blue-50'),
        ('via-transparent', 'via-white'),
        ('to-transparent', 'to-white'),
        ('text-amber-200/60', 'text-amber-700/80'),
        ('text-amber-200/80', 'text-amber-700'),
        ('bg-white text-slate-900', 'bg-blue-600 text-white'), # buttons that turned slate-900
    ]

    for old, new in replacements:
        content = content.replace(old, new)

    return content

def process_file():
    src_file = r'c:\Users\abhi8\OneDrive\Desktop\ainori\frontend\app\page.tsx'
    dest_file = r'c:\Users\abhi8\OneDrive\Desktop\ainori\eazyride-frontend\src\app\page.tsx'

    with open(src_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove VibeCanvas imports and usage
    content = re.sub(r'import \{ getVibe, VIBE_THEMES \} from \'@/lib/vibe-utils\';\n', '', content)
    content = re.sub(r'import VibeCanvas from \'./components/VibeCanvas\';\n', '', content)
    content = re.sub(r'import PulseNav from \'./components/PulseNav\';\n', 'import Navbar from \'@/components/Navbar\';\n', content)

    # Remove vibe logic inside component
    content = re.sub(r'const hour = new Date\(\)\.getHours\(\);\n\s*const vibe = getVibe\(hour\);\n\s*const theme = VIBE_THEMES\[vibe\];\n', '', content)

    # Replace <VibeCanvas vibe={vibe} />
    content = re.sub(r'<VibeCanvas vibe=\{vibe\} />\n', '', content)

    # Replace PulseNav
    content = re.sub(r'<PulseNav />', '<Navbar />', content)

    # Remove transition-colors duration-1000 ${theme.bg}
    content = re.sub(r' transition-colors duration-1000 \$\{theme\.bg\}', ' bg-white', content)

    content = replace_classes(content)

    with open(dest_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print("Ported page.tsx")

if __name__ == '__main__':
    process_file()
