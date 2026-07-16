import { Link } from "react-router-dom";

export default function LandingPage() {
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
              <Link to="/coming-soon" className="hover:text-white transition-colors">Product</Link>
              <Link to="/coming-soon" className="hover:text-white transition-colors">Developers</Link>
              <Link to="/coming-soon" className="hover:text-white transition-colors">Solutions</Link>
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
      <header className="relative pt-32 pb-20 md:pt-48 md:pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center md:items-start text-center md:text-left relative z-10">
          
          <h1 className="text-4xl sm:text-5xl md:text-[56px] leading-[1.1] font-bold tracking-tight mb-6 max-w-2xl">
            <span className="block text-white">Build your portfolio.</span>
            <span className="block text-[#8b5cf6]">Stand out to recruiters.</span>
          </h1>
          
          <p className="text-[#8b8b8b] text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light">
            Start your project with a ShowUp portfolio. Add projects, get AI feedback, share a public link, and build credibility.
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Link to="/auth" className="bg-[#8b5cf6] hover:bg-[#7c3aed] border border-[#8b5cf6] text-black font-medium text-sm px-5 py-2.5 rounded-md transition-colors shadow-[0_0_15px_rgba(62,207,142,0.3)]">
              Start your project
            </Link>
            <Link to="/feed" className="bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-white font-medium text-sm px-5 py-2.5 rounded-md transition-colors">
              Explore projects
            </Link>
          </div>

        </div>
      </header>

      {/* ─── Features Grid (Products) ─── */}
      <section className="px-6 py-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <Link to="/auth" className="group relative w-full h-[220px] md:h-[280px] lg:col-span-2 flex flex-col rounded-xl overflow-hidden bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-white mb-4">
                <span className="material-symbols-outlined text-[20px]">dataset</span>
                <h2 className="font-medium text-lg">Build Your Portfolio</h2>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#8b8b8b] leading-relaxed">
                  Every project is <strong>a full showcase</strong> of your skills. Create a stunning portfolio that highlights your best work to the world.
                </p>
              </div>
            </div>
            {/* Subtle bottom gradient glow */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#2a2a2a]/20 to-transparent pointer-events-none group-hover:from-[#8b5cf6]/10 transition-colors"></div>
          </Link>

          {/* Card 2 */}
          <Link to="/auth" className="group relative w-full h-[220px] md:h-[280px] lg:col-span-2 flex flex-col rounded-xl overflow-hidden bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-white mb-4">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <h2 className="font-medium text-lg">AI-Powered Feedback</h2>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#8b8b8b] leading-relaxed">
                  <strong>Instant, actionable feedback</strong> on your projects to improve and stand out in the competitive landscape.
                </p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#2a2a2a]/20 to-transparent pointer-events-none group-hover:from-[#8b5cf6]/10 transition-colors"></div>
          </Link>

          {/* Card 3 */}
          <Link to="/auth" className="group relative w-full h-[220px] md:h-[280px] lg:col-span-2 flex flex-col rounded-xl overflow-hidden bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-white mb-4">
                <span className="material-symbols-outlined text-[20px]">link</span>
                <h2 className="font-medium text-lg">Share & Stand Out</h2>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#8b8b8b] leading-relaxed">
                  <strong>Get a shareable link</strong> to your portfolio. Impress recruiters and collaborators without sending bulky zip files.
                </p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#2a2a2a]/20 to-transparent pointer-events-none group-hover:from-[#8b5cf6]/10 transition-colors"></div>
          </Link>

          {/* Card 4 */}
          <Link to="/auth" className="group relative w-full h-[220px] md:h-[280px] lg:col-span-2 flex flex-col rounded-xl overflow-hidden bg-[#111111] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-white mb-4">
                <span className="material-symbols-outlined text-[20px]">group</span>
                <h2 className="font-medium text-lg">Built for Students</h2>
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#8b8b8b] leading-relaxed">
                  <strong>Made specifically</strong> for Indian college students with zero experience in mind. Build your credibility today.
                </p>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#2a2a2a]/20 to-transparent pointer-events-none group-hover:from-[#8b5cf6]/10 transition-colors"></div>
          </Link>

        </div>
      </section>

    </div>
  );
}
