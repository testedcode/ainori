# Read the page content
$filePath = "c:\Users\abhi8\OneDrive\Desktop\ainori\frontend\app\page.tsx"
$content = [System.IO.File]::ReadAllText($filePath)

# Define the start and end markers
$startMarker = "        {/* ─── THE CORE PILLARS: SAFETY & SHIFT (COMPACTED) ────────────────────────── */}"
$endMarker = "        {/* ─── POPULAR JOURNEYS: BENTO CAROUSEL (COMPACTED) ────────────────────────── */}"

# Locate indices
$startIndex = $content.IndexOf($startMarker)
$endIndex = $content.IndexOf($endMarker)

if ($startIndex -lt 0) {
    Write-Host "Start marker not found!"
    exit 1
}
if ($endIndex -lt 0) {
    Write-Host "End marker not found!"
    exit 1
}

Write-Host "Start index: $startIndex, End index: $endIndex"

# Define the new content
$newSection = @"
        {/* ─── THE CORE PILLARS: SAFETY & SHIFT (COMPACTED & SPACE OPTIMIZED) ────────────────────────── */}
        <section id="shift" className="py-24 relative overflow-hidden bg-[#050810]/50">
           <div className="container max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                 
                 {/* SAFETY PROTOCOL (PURPLE) */}
                 <div className="relative overflow-hidden bg-[#0c0d14] border border-purple-500/20 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:border-purple-500/40 transition-all duration-500 group shadow-[0_0_50px_rgba(168,85,247,0.05)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div>
                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[8px] font-black uppercase tracking-widest mb-6 text-purple-400">
                          <ShieldCheck className="w-3 h-3" /> SECURITY
                       </div>
                       <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-6">
                          PEACE OF <span className="text-purple-400">MIND.</span>
                       </h3>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            'Same-Society Verification',
                            'Real-Time Family Tracking',
                            'Vetted Corporate Network',
                            'Secured In-App Comms'
                          ].map((feat, i) => (
                             <div key={i} className="flex items-center gap-2 p-2 bg-purple-950/20 border border-purple-500/10 rounded-xl hover:bg-purple-950/30 transition-colors">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span className="text-[8px] font-black text-white/70 uppercase tracking-wider">{feat}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5">
                       <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest leading-relaxed">
                          Our network is built on trust. We ensure every member is a verified professional from your community.
                       </p>
                    </div>
                 </div>

                 {/* CHAOS (RED) */}
                 <div className="relative overflow-hidden bg-[#140a0c] border border-red-900/30 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:border-red-500/30 transition-all duration-500 group shadow-[0_0_50px_rgba(244,63,94,0.05)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div>
                       <h3 className="text-xl font-black uppercase italic text-red-500/50 mb-6 tracking-widest">01. THE CHAOS</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            { t: 'Unvetted Groups', icon: XCircle },
                            { t: 'Identity Leaks', icon: EyeOff },
                            { t: 'Surge Pricing', icon: TrendingUp },
                            { t: 'Safety Risks', icon: ShieldAlert }
                          ].map((item, i) => (
                             <div key={i} className="flex items-center gap-2 p-2 bg-red-950/20 border border-red-900/20 rounded-xl hover:bg-red-950/30 transition-colors">
                                <item.icon className="w-3.5 h-3.5 text-red-500/60 shrink-0" />
                                <span className="text-[8px] font-black text-white/50 uppercase tracking-wider">{item.t}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5">
                       <p className="text-[9px] font-medium text-white/30 uppercase tracking-widest leading-relaxed">
                          Fragile coordinates with strangers, unverified profiles, high-friction chats, and uncontrolled surge fares.
                       </p>
                    </div>
                 </div>

                 {/* COMMUNITY (BLUE) */}
                 <div className="relative overflow-hidden bg-[#0a0f1a] border border-blue-900/30 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-500 group shadow-[0_0_50px_rgba(59,130,246,0.05)]">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div>
                       <h3 className="text-xl font-black uppercase italic text-blue-400 mb-6 tracking-widest">02. THE COMMUNITY</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {[
                            { t: 'Verified Neighbors', icon: ShieldCheck, color: 'text-blue-400' },
                            { t: 'Privacy Shield', icon: Fingerprint, color: 'text-cyan-400' },
                            { t: 'Fixed Fair Rates', icon: Coins, color: 'text-green-400' },
                            { t: 'Live Tracking', icon: Activity, color: 'text-blue-500' }
                          ].map((item, i) => (
                             <div key={i} className="flex items-center gap-2 p-2 bg-blue-950/20 border border-blue-900/20 rounded-xl hover:bg-blue-950/30 transition-colors">
                                <item.icon className={`w-3.5 h-3.5 shrink-0 ${item.color}`} />
                                <span className="text-[8px] font-black text-white uppercase tracking-wider">{item.t}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/5">
                       <p className="text-[9px] font-medium text-white/40 uppercase tracking-widest leading-relaxed">
                          Sleek neighbor-to-neighbor rides with full safety protocols, encrypted communications, and flat fair prices.
                       </p>
                    </div>
                 </div>

              </div>
           </div>
        </section>

"@

# Perform replacement
$before = $content.Substring(0, $startIndex)
$after = $content.Substring($endIndex)
$newContent = $before + $newSection + $after

# Write back to file
[System.IO.File]::WriteAllText($filePath, $newContent)
Write-Host "Successfully replaced and saved page.tsx!"
