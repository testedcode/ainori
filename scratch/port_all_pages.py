import os
import re

dir_src = r"c:\Users\abhi8\OneDrive\Desktop\ainori\frontend"
dir_dest = r"c:\Users\abhi8\OneDrive\Desktop\ainori\eazyride-frontend\src"

exclude_folders = {".next", ".vercel", "node_modules", "package-lock.json", "tsconfig.tsbuildinfo"}

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
    ('bg-white text-black', 'bg-blue-600 text-white'), 
    ('bg-white text-slate-900', 'bg-blue-600 text-white'),
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
    # additional replacements for light theme
    ('border-white/12', 'border-slate-200'),
    ('border-white/15', 'border-slate-200'),
    ('bg-white/15', 'bg-slate-100'),
    ('bg-white/[0.04]', 'bg-slate-50'),
    ('bg-white/[0.06]', 'bg-slate-100'),
    ('bg-[#0f172a]/90', 'bg-slate-50/90'),
    ('bg-[#0f172a]/40', 'bg-slate-50/40'),
    ('border-[#1e293b]', 'border-slate-300'),
    ('border-[#0a0f1e]', 'border-slate-200'),
    ('border-[#0f172a]', 'border-slate-200'),
    ('text-slate-100', 'text-slate-800'),
    ('text-slate-200', 'text-slate-700'),
    ('text-white/10', 'text-slate-300'),
    ('text-white/15', 'text-slate-300'),
    ('text-white/5', 'text-slate-200'),
    ('text-white/50', 'text-slate-600'),
    ('text-white/70', 'text-slate-700'),
    ('text-white/90', 'text-slate-900'),
    ('text-white/95', 'text-slate-900'),
    ('border-white/8', 'border-slate-200'),
    ('border-white/25', 'border-slate-300'),
    ('shadow-[0_25px_60px_rgba(0,0,0,0.6)]', 'shadow-[0_25px_60px_rgba(0,0,0,0.1)]'),
    ('shadow-[0_40px_100px_rgba(0,0,0,0.5)]', 'shadow-[0_40px_100px_rgba(0,0,0,0.1)]'),
    ('shadow-[0_20px_40px_rgba(34,197,94,0.05)]', 'shadow-[0_20px_40px_rgba(34,197,94,0.1)]'),
    ('shadow-[0_15px_40px_rgba(37,99,235,0.5)]', 'shadow-[0_15px_40px_rgba(37,99,235,0.2)]'),
    ('shadow-[0_0_30px_rgba(37,99,235,0.4)]', 'shadow-[0_0_30px_rgba(37,99,235,0.1)]')
]

def replace_classes(content):
    for old, new in replacements:
        content = content.replace(old, new)
    return content

def transform_file(src_path, dest_path):
    # Ensure destination folder exists
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    # Read source content
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Process only TypeScript / JavaScript files
    if src_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
        # Remove VibeCanvas imports and usages
        content = re.sub(r"import\s+VibeCanvas\s+from\s+['\"].*VibeCanvas['\"];?\n?", "", content)
        content = re.sub(r"import\s+\{\s*getVibe\s*,\s*VIBE_THEMES\s*\}\s*from\s+['\"].*vibe-utils['\"];?\n?", "", content)
        content = re.sub(r"const\s+hour\s*=\s*new\s+Date\(\)\.getHours\(\);\s*\n\s*const\s+vibe\s*=\s*getVibe\(hour\);\s*\n\s*const\s+theme\s*=\s*VIBE_THEMES\[vibe\];\s*\n?", "", content)
        content = re.sub(r"<\s*VibeCanvas\s+vibe\s*=\s*\{\s*vibe\s*\}\s*/?>\s*\n?", "", content)
        content = re.sub(r"\$\{theme\.bg\}", "bg-slate-50", content)
        
        # Replace components path alias and relative paths to components
        content = re.sub(r"@/app/components/", "@/components/", content)
        content = re.sub(r"\.\./components/PulseNav", "@/components/PulseNav", content)
        content = re.sub(r"\.\./components/PulseFooter", "@/components/PulseFooter", content)
        content = re.sub(r"\.\./components/NotificationManager", "@/components/NotificationManager", content)
        content = re.sub(r"\.\./components/InstallBanner", "@/components/InstallBanner", content)
        content = re.sub(r"\.\./\.\./components/PulseNav", "@/components/PulseNav", content)
        content = re.sub(r"\.\./\.\./components/PulseFooter", "@/components/PulseFooter", content)
        content = re.sub(r"\.\./\.\./components/NotificationManager", "@/components/NotificationManager", content)
        content = re.sub(r"\.\./\.\./components/InstallBanner", "@/components/InstallBanner", content)
        
        # Substitute class names
        content = replace_classes(content)
        
    # Write to destination
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Ported {src_path} -> {dest_path}")

def main():
    # 1. Port middleware.ts
    src_middleware = os.path.join(dir_src, "middleware.ts")
    dest_middleware = os.path.join(dir_dest, "middleware.ts")
    if os.path.exists(src_middleware):
        transform_file(src_middleware, dest_middleware)
        
    # 2. Port lib/
    lib_src = os.path.join(dir_src, "lib")
    for root, dirs, files in os.walk(lib_src):
        for file in files:
            src_file = os.path.join(root, file)
            rel = os.path.relpath(src_file, lib_src)
            dest_file = os.path.join(dir_dest, "lib", rel)
            transform_file(src_file, dest_file)
            
    # 3. Port utils/
    utils_src = os.path.join(dir_src, "utils")
    for root, dirs, files in os.walk(utils_src):
        for file in files:
            src_file = os.path.join(root, file)
            rel = os.path.relpath(src_file, utils_src)
            dest_file = os.path.join(dir_dest, "utils", rel)
            transform_file(src_file, dest_file)
            
    # 4. Port app/
    app_src = os.path.join(dir_src, "app")
    for root, dirs, files in os.walk(app_src):
        dirs[:] = [d for d in dirs if d not in exclude_folders]
        for file in files:
            src_file = os.path.join(root, file)
            rel = os.path.relpath(src_file, app_src)
            
            # Re-map components
            if rel.startswith("components" + os.sep):
                dest_file = os.path.join(dir_dest, rel)  # src/components/*
            else:
                dest_file = os.path.join(dir_dest, "app", rel)  # src/app/*
                
            # Skip page.tsx since we want to keep the landing page as-is if already fine
            # Actually let's not overwrite src/app/page.tsx or globals.css if they exist
            if rel == "page.tsx" or rel == "globals.css":
                # Only copy them if they do not exist
                if os.path.exists(dest_file):
                    print(f"Skipping existing base file: {dest_file}")
                    continue
            transform_file(src_file, dest_file)

if __name__ == "__main__":
    main()
