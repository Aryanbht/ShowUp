import { Link } from "react-router-dom";

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#8b5cf6] selection:text-white">
      
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 outline-none">
              <svg viewBox="0 0 581 113" fill="none" width="100" height="20" aria-label="ShowUp Logo" role="img">
                <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#8b5cf6"></path>
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="#7c3aed"></path>
              </svg>
              <span className="font-bold text-lg tracking-tight">ShowUp</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-400">
              <Link to="/product" className="text-white transition-colors">Product</Link>
              <Link to="/coming-soon" className="hover:text-white transition-colors">Developers</Link>
              <Link to="/solutions" className="hover:text-white transition-colors">Solutions</Link>
              <Link to="/coming-soon" className="hover:text-white transition-colors">Docs</Link>
              <Link to="/coming-soon" className="hover:text-white transition-colors">Blog</Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/auth" className="hidden lg:flex items-center justify-center text-xs font-medium bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-white px-3 py-1.5 rounded-md transition-colors">
              Sign in
            </Link>
            <Link to="/auth" className="hidden lg:flex items-center justify-center text-xs font-medium bg-[#8b5cf6] hover:bg-[#7c3aed] border border-[#8b5cf6] text-black px-3 py-1.5 rounded-md transition-colors">
              Start your project
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <header className="relative pt-32 pb-16 md:pt-48 md:pb-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          
          <h1 className="text-4xl sm:text-5xl md:text-[56px] leading-[1.1] font-bold tracking-tight mb-6">
            <span className="block text-white">The ultimate toolkit</span>
            <span className="block text-[#8b5cf6]">for student builders.</span>
          </h1>
          
          <p className="text-[#8b8b8b] text-lg md:text-xl mb-10 leading-relaxed font-light max-w-2xl">
            Everything you need to showcase your work, find the perfect hackathon team, and get AI-powered insights on your code. Built to help you stand out.
          </p>

        </div>
      </header>

      {/* ─── Feature 1: Portfolio Templates ─── */}
      <section className="px-6 py-16 max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-sm font-medium">
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Stunning Portfolios
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Templates that make your work shine.
            </h2>
            <p className="text-[#8b8b8b] text-lg leading-relaxed">
              Don't spend hours tweaking CSS when you should be coding your core product. ShowUp provides beautifully crafted, highly optimized portfolio templates specifically designed for developers and student builders. 
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Dark-mode optimized, glassmorphic UI templates.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Pre-built project showcase cards with tech stack badges.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Easily shareable public link to send to recruiters.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full rounded-2xl border border-[#2a2a2a] bg-[#111111] overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.1)] relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/10 to-transparent pointer-events-none"></div>
            <div className="p-8 pb-0">
               {/* Abstract Portfolio UI mockup */}
               <div className="w-full bg-[#1e1e1e] rounded-t-xl border border-[#333] border-b-0 h-64 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 w-full h-8 border-b border-[#333] bg-[#1a1a1a] flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <div className="pt-12 px-6 flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-[#2a2a2a] rounded"></div>
                    <div className="flex gap-4 mt-4">
                      <div className="w-24 h-24 rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/30"></div>
                      <div className="w-24 h-24 rounded-lg bg-[#2a2a2a]"></div>
                      <div className="w-24 h-24 rounded-lg bg-[#2a2a2a]"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Feature 2: Hackathon Connections ─── */}
      <section className="px-6 py-20 max-w-6xl mx-auto relative z-10 border-t border-[#2a2a2a]">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 w-full rounded-2xl border border-[#2a2a2a] bg-[#111111] overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.1)] relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#8b5cf6]/10 to-transparent pointer-events-none"></div>
            <div className="p-8 flex flex-col gap-4">
               {/* Abstract Match UI mockup */}
               <div className="w-full p-4 border border-[#333] rounded-xl bg-[#1e1e1e] flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#4c1d95]"></div>
                 <div className="flex-1">
                   <div className="h-4 w-32 bg-[#333] rounded mb-2"></div>
                   <div className="flex gap-2">
                     <div className="h-3 w-16 bg-[#2a2a2a] rounded"></div>
                     <div className="h-3 w-12 bg-[#2a2a2a] rounded"></div>
                   </div>
                 </div>
                 <div className="px-3 py-1 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs font-bold">95% Match</div>
               </div>
               <div className="w-full p-4 border border-[#333] rounded-xl bg-[#1e1e1e] flex items-center gap-4 opacity-70">
                 <div className="w-12 h-12 rounded-full bg-[#2a2a2a]"></div>
                 <div className="flex-1">
                   <div className="h-4 w-24 bg-[#333] rounded mb-2"></div>
                   <div className="flex gap-2">
                     <div className="h-3 w-20 bg-[#2a2a2a] rounded"></div>
                   </div>
                 </div>
                 <div className="px-3 py-1 rounded bg-[#333] text-[#8b8b8b] text-xs font-bold">82% Match</div>
               </div>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-sm font-medium">
              <span className="material-symbols-outlined text-sm">groups</span>
              Student Network
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Find your next hackathon dream team.
            </h2>
            <p className="text-[#8b8b8b] text-lg leading-relaxed">
              Stop settling for random team assignments. ShowUp's discovery feed and networking tools let you find like-minded students with complimentary skills.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Search for teammates by skill stack, college, or interests.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Direct messaging system to coordinate before registering.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">View verified project history to ensure skill compatibility.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Feature 3: AI GitHub Rating ─── */}
      <section className="px-6 py-20 max-w-6xl mx-auto relative z-10 border-t border-[#2a2a2a]">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] text-sm font-medium">
              <span className="material-symbols-outlined text-sm">psychology</span>
              AI Code Analysis
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Instant feedback on your GitHub repositories.
            </h2>
            <p className="text-[#8b8b8b] text-lg leading-relaxed">
              Wondering if your project is actually good? Our integrated AI engine connects directly to your GitHub repository to analyze your code quality, architecture, and documentation.
            </p>
            <ul className="space-y-4 pt-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Automated rating out of 10 based on industry standards.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Actionable suggestions to improve readability and performance.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#8b5cf6] mt-1">check_circle</span>
                <span className="text-[#a1a1aa]">Display verified high-scoring badges directly on your portfolio.</span>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full rounded-2xl border border-[#2a2a2a] bg-[#111111] overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.1)] relative">
            <div className="absolute inset-0 bg-gradient-to-bl from-[#8b5cf6]/10 to-transparent pointer-events-none"></div>
            <div className="p-8">
               {/* Abstract AI Analysis mockup */}
               <div className="w-full border border-[#333] rounded-xl bg-[#1e1e1e] p-6 relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#8b5cf6]/20 blur-xl rounded-full"></div>
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-[#8b5cf6]">auto_awesome</span>
                     <span className="text-white font-medium text-sm">AI Analysis</span>
                   </div>
                   <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 font-mono font-bold text-lg rounded">
                     9.2/10
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-green-400"></span>
                     <div className="h-2 w-full bg-[#333] rounded"></div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                     <div className="h-2 w-5/6 bg-[#333] rounded"></div>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-green-400"></span>
                     <div className="h-2 w-11/12 bg-[#333] rounded"></div>
                   </div>
                 </div>
                 <div className="mt-6 p-3 bg-[#2a2a2a]/50 rounded-lg border border-[#333] border-dashed">
                   <div className="h-2 w-3/4 bg-[#444] rounded mb-2"></div>
                   <div className="h-2 w-1/2 bg-[#444] rounded"></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">
          Ready to show up?
        </h2>
        <p className="text-[#8b8b8b] text-lg mb-10 max-w-xl mx-auto">
          Join thousands of student builders discovering hackathon teams, building portfolios, and shipping real products.
        </p>
        <Link to="/auth" className="inline-flex items-center justify-center bg-[#8b5cf6] hover:bg-[#7c3aed] border border-[#8b5cf6] text-black font-medium text-base px-8 py-4 rounded-lg transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
          Start your project now
          <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
        </Link>
      </section>

    </div>
  );
}
