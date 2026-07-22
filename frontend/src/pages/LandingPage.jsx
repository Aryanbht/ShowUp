import { Link } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import { FolderOpen, Sparkles, Link2, GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-brand-500 selection:text-white">
      
      <LandingNavbar />

      {/* ─── Hero Section ─── */}
      <header className="relative pt-32 pb-8 md:pt-48 md:pb-10 px-6 overflow-hidden">
        {/* Subtle background radial glow */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(ellipse at center, #B845EE 0%, transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto flex flex-col items-center md:items-start text-center md:text-left relative z-10">

          {/* Eyebrow badge */}
          <span className="inline-flex items-center gap-2 mb-5 text-xs font-medium tracking-widest uppercase text-brand-400 border border-brand-500/30 bg-brand-500/5 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Student portfolio · credibility built in
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-[60px] leading-[1.08] font-bold tracking-tight mb-6 max-w-2xl">
            <span className="block text-white">Build your portfolio.</span>
            <span className="block text-brand-500">Stand out to recruiters.</span>
          </h1>

          <p className="text-[#8b8b8b] text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light">
            Add your projects, get AI feedback, share a public link — and arrive at every conversation with proof, not just a resume.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <Link
              to="/auth"
              className="bg-brand-500 hover:bg-brand-600 border border-brand-500 text-white font-medium text-sm px-5 py-2.5 rounded-md transition-colors shadow-[0_0_15px_rgba(184,69,238,0.3)]"
            >
              Start your project
            </Link>
            <Link
              to="/feed"
              className="bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-[#2a2a2a] hover:border-[#3a3a3a] text-white font-medium text-sm px-5 py-2.5 rounded-md transition-colors"
            >
              Explore projects
            </Link>
          </div>

        </div>
      </header>

      {/* ─── Features Grid ─── */}
      <section className="px-6 pt-4 pb-16 max-w-7xl mx-auto relative z-10">

        {/* Left-biased section label — deliberate asymmetry */}
        <p className="text-xs font-medium tracking-[0.18em] uppercase text-[#555] mb-5 md:max-w-[50%]">
          What ShowUp gives you
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* ── Card 1: Wide hero — Portfolio builder (lg:col-span-3) ── */}
          <Link
            to="/auth"
            className="group relative flex flex-col rounded-xl overflow-hidden bg-[#0e0e0e] border border-[#1f1f1f] hover:border-brand-500/40 transition-all duration-300 lg:col-span-3"
            style={{ minHeight: "260px" }}
          >
            <div className="p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20">
                    <FolderOpen size={16} className="text-brand-400" />
                  </span>
                  <h2 className="font-semibold text-white text-lg tracking-tight">Build Your Portfolio</h2>
                </div>
                <p className="text-[#8b8b8b] text-sm leading-relaxed max-w-lg">
                  Every project becomes a full showcase — tech stack, screenshots, write-up, live link.
                  Pick a template that fits your style and get a public URL you can drop anywhere.
                </p>
              </div>

              {/* Mock URL pill */}
              <div className="mt-6 flex items-center gap-2 self-start bg-[#181818] border border-[#2a2a2a] rounded-md px-3 py-1.5 text-[11px] text-[#555] font-mono group-hover:border-[#3a3a3a] transition-colors">
                <span className="w-2 h-2 rounded-full bg-[#3a3a3a] group-hover:bg-brand-500/50 transition-colors" />
                showup.app/<span className="text-[#777]">yourname</span>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* ── Card 2: Narrow stat callout — AI Feedback (lg:col-span-1) ── */}
          <Link
            to="/auth"
            className="group relative flex flex-col justify-between rounded-xl overflow-hidden bg-[#0e0e0e] border border-[#1f1f1f] hover:border-[#F76F53]/40 transition-all duration-300 p-7 lg:col-span-1"
            style={{ minHeight: "260px" }}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F76F53]/10 border border-[#F76F53]/20">
              <Sparkles size={16} className="text-[#F76F53]" />
            </span>

            <div>
              <div className="text-5xl font-bold text-white leading-none mb-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                2<span className="text-2xl font-medium text-[#F76F53] ml-0.5">min</span>
              </div>
              <p className="text-xs text-[#555] mt-1 uppercase tracking-widest">avg. AI review time</p>
            </div>

            <p className="text-[#8b8b8b] text-sm leading-relaxed">
              Instant, specific feedback on your project — not a generic checklist.
            </p>
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#F76F53]/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* ── Card 3: Square — Share & Stand Out (lg:col-span-1) ── */}
          <Link
            to="/auth"
            className="group relative flex flex-col justify-between rounded-xl overflow-hidden bg-[#0e0e0e] border border-[#1f1f1f] hover:border-brand-500/40 transition-all duration-300 p-7 lg:col-span-1"
            style={{ minHeight: "200px" }}
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <Link2 size={16} className="text-brand-400" />
            </span>

            <div>
              <h2 className="font-semibold text-white text-base mb-2 tracking-tight">Share &amp; Stand Out</h2>
              <p className="text-[#8b8b8b] text-sm leading-relaxed">
                One link. Send it to any recruiter, drop it in your email signature, put it on LinkedIn.
              </p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

          {/* ── Card 4: Medium — Built for Students (lg:col-span-2) ── */}
          <Link
            to="/auth"
            className="group relative flex flex-col justify-between rounded-xl overflow-hidden bg-[#0e0e0e] border border-[#1f1f1f] hover:border-brand-500/40 transition-all duration-300 p-7 lg:col-span-2"
            style={{ minHeight: "200px" }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20">
                <GraduationCap size={16} className="text-brand-400" />
              </span>
              <h2 className="font-semibold text-white text-base tracking-tight">Built for Students</h2>
            </div>

            <div>
              <p className="text-[#8b8b8b] text-sm leading-relaxed mb-4">
                No work experience required — just real projects. ShowUp is designed around Indian college students who are building in public for the first time.
              </p>
              <hr className="border-[#1f1f1f] group-hover:border-brand-500/20 transition-colors" />
              <p className="text-[#444] text-xs mt-3 tracking-wide">Zero setup · free to start</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-brand-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#111] max-w-4xl mx-auto py-8 px-5 flex items-center justify-center gap-4 text-xs text-[#666]">
        <Link to="/privacy" className="hover:text-[#8b8b8b] transition-colors">Privacy Policy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-[#8b8b8b] transition-colors">Terms of Service</Link>
      </footer>
    </div>
  );
}
