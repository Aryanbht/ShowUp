import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#8b5cf6] selection:text-white">
      
      <LandingNavbar />

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

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-8 px-5 flex items-center justify-center gap-4 text-xs text-[#666]">
        <Link to="/privacy" className="hover:text-[#8b8b8b] transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-[#8b8b8b] transition-colors">Terms of Service</Link>
      </footer>
    </div>
  );
}
