import { Link } from "react-router-dom";

export default function SolutionsPage() {
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
              <Link to="/product" className="hover:text-white transition-colors">Product</Link>
              <Link to="/coming-soon" className="hover:text-white transition-colors">Developers</Link>
              <Link to="/solutions" className="text-white transition-colors">Solutions</Link>
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

      {/* ─── Header ─── */}
      <header className="relative pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            ShowUp <span className="text-[#8b5cf6]">Solutions</span>
          </h1>
          <p className="text-[#8b8b8b] text-lg max-w-2xl">
            Whether you're building your first project or recruiting top talent, discover how ShowUp is designed for your needs.
          </p>
        </div>
      </header>

      {/* ─── Solutions Directory Grid ─── */}
      <section className="px-6 pb-24 max-w-7xl mx-auto relative z-10">
        
        {/* Main Glassmorphic Container wrapping the columns */}
        <div className="w-full bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 md:p-12 shadow-[0_0_40px_rgba(139,92,246,0.05)] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 relative z-10">
            
            {/* Column 1: SKILL LEVEL */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#8b8b8b] uppercase border-b border-[#2a2a2a] pb-3">
                Skill Level
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">school</span>
                    <span className="text-sm font-medium">Beginners</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">code</span>
                    <span className="text-sm font-medium">CS Majors</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">auto_stories</span>
                    <span className="text-sm font-medium">Self-Taught Devs</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">local_fire_department</span>
                    <span className="text-sm font-medium">Hackathon Vets</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">public</span>
                    <span className="text-sm font-medium">Open Source</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: WHO IT'S FOR */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#8b8b8b] uppercase border-b border-[#2a2a2a] pb-3">
                Who It's For
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">group</span>
                    <span className="text-sm font-medium">Hackathon Teams</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">search</span>
                    <span className="text-sm font-medium">Recruiters</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">diversity_3</span>
                    <span className="text-sm font-medium">Student Clubs</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">account_balance</span>
                    <span className="text-sm font-medium">Universities</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">rocket_launch</span>
                    <span className="text-sm font-medium">Indie Hackers</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: USE CASE */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#8b8b8b] uppercase border-b border-[#2a2a2a] pb-3">
                Use Case
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">dashboard</span>
                    <span className="text-sm font-medium">Portfolio Generation</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">hub</span>
                    <span className="text-sm font-medium">Team Discovery</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">psychology</span>
                    <span className="text-sm font-medium">AI Code Review</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 text-[#a1a1aa] hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px] text-[#4b4b4b] group-hover:text-[#8b5cf6] transition-colors">verified</span>
                    <span className="text-sm font-medium">Skill Endorsement</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: INTEGRATIONS (Visual style matches Supabase's "Migration" column) */}
            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-[#8b8b8b] uppercase border-b border-[#2a2a2a] pb-3">
                Integrations
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1e1e1e] rounded-lg transition-all shadow-sm">
                    <svg className="w-4 h-4 fill-current text-white group-hover:text-[#8b5cf6] transition-colors" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
                    </svg>
                    <span className="text-sm font-medium text-white">Connect with GitHub</span>
                  </Link>
                </li>
                <li>
                  <Link to="/auth" className="group flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1e1e1e] rounded-lg transition-all shadow-sm">
                    <svg className="w-4 h-4 fill-current text-white group-hover:text-[#8b5cf6] transition-colors" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-sm font-medium text-white">Share to LinkedIn</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Quote Section ─── */}
      <section className="px-6 py-24 max-w-4xl mx-auto text-center relative z-10">
        <p className="text-2xl md:text-3xl font-medium text-[#8b8b8b] leading-relaxed mb-10">
          "You can have a really great project, but you need to want to work with the people behind it. <span className="text-[#8b5cf6]">With ShowUp, we always find the perfect teammates.</span>"
        </p>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] overflow-hidden">
            <img src="https://i.pravatar.cc/150?img=11" alt="User Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-white font-medium">Alex Chen</div>
            <div className="text-[#8b8b8b] text-sm">Hackathon Winner</div>
          </div>
        </div>
      </section>

    </div>
  );
}
