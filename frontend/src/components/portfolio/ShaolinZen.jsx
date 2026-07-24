import React, { useEffect, useRef } from 'react';

export default function ShaolinZen({ data, handleJoinShowUp, selectedProject, setSelectedProject }) {
  const { student, projects } = data;
  const heroRef = useRef(null);

  const skills = student.skills
    ? (Array.isArray(student.skills) ? student.skills : student.skills.split(',').map(s => s.trim()).filter(Boolean))
    : [];

  // Parallax scroll for hero
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
      el.style.transition = 'opacity 0.9s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)';
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{ fontFamily: "'Libre Caslon Text', serif" }}
      className="bg-[#121414] text-[#e1e3e3] min-h-screen flex flex-col antialiased overflow-x-hidden selection:bg-[#7b1c00] selection:text-[#ffdbd1] relative"
    >
      {/* Injected styles & fonts */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Hanken+Grotesk:wght@400;500;600&display=swap');

        .shaolin-nav-pill {
          background: rgba(30,32,32,0.8);
          backdrop-filter: blur(20px);
          border: 0.5px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 40px -10px rgba(0,0,0,0.4);
        }
        .shaolin-card {
          background: rgba(30,32,32,0.6);
          backdrop-filter: blur(16px);
          border: 0.5px solid rgba(255,255,255,0.08);
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .shaolin-card:hover {
          border-color: rgba(216,67,21,0.4);
          box-shadow: 0 0 40px rgba(216,67,21,0.12), 0 20px 40px rgba(0,0,0,0.4);
          transform: translateY(-4px);
        }
        .shaolin-float {
          animation: shaolinFloat 7s ease-in-out infinite;
        }
        .shaolin-float-delay {
          animation: shaolinFloat 9s ease-in-out infinite;
          animation-delay: -3s;
        }
        @keyframes shaolinFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        .shaolin-glow {
          box-shadow: 0 0 24px rgba(216,67,21,0.5), 0 0 60px rgba(216,67,21,0.2);
        }
        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 30%, rgba(216,67,21,0.3) 60%, transparent 100%);
        }
      `}} />

      {/* Ambient Background */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#121414] via-[#1a1212]/70 to-[#0d0e0f]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'radial-gradient(ellipse, rgba(216,67,21,0.35), transparent 70%)' }} />
      </div>

      {/* ─── Floating Navbar ─── */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl shaolin-nav-pill rounded-full px-8 md:px-12 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <span className="text-[#e1e3e3] text-lg md:text-xl tracking-widest" style={{ fontFamily: "'Libre Caslon Text', serif" }}>
          {student.name?.split(' ')[0] || 'Portfolio'}
        </span>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
          {[
            { label: 'Work', href: '#work' },
            { label: 'Skills', href: '#skills' },
            { label: 'About', href: '#about' },
          ].map(item => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-[#bfc8c8] hover:text-[#e1e3e3] text-xs uppercase tracking-[0.15em] font-semibold hover:-translate-y-0.5 transition-all duration-500 block"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleJoinShowUp}
          className="text-[#121414] text-xs font-semibold uppercase tracking-[0.12em] px-5 py-2 rounded-full hover:-translate-y-0.5 transition-all duration-500 active:scale-95"
          style={{
            fontFamily: "'Hanken Grotesk', sans-serif",
            background: '#e1e3e3',
          }}
        >
          {localStorage.getItem('showup_access_token') ? 'Go To ShowUp' : 'Connect'}
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <main className="relative z-10 flex-grow">
        <section className="min-h-screen flex flex-col items-center justify-center text-center pt-32 pb-24 px-6 md:px-16 relative overflow-hidden">
          {/* Floating decorative orbs */}
          <div aria-hidden="true" className="absolute top-1/4 left-[8%] w-28 h-28 shaolin-card shaolin-float rounded-full border-white/10 hidden md:block" />
          <div aria-hidden="true" className="absolute bottom-1/3 right-[12%] w-44 h-44 shaolin-card shaolin-float-delay rounded-full border-white/5 hidden md:block" />
          <div aria-hidden="true" className="absolute top-1/2 left-[3%] w-14 h-14 rounded-full shaolin-float border border-[#d84315]/20 hidden lg:block"
            style={{ background: 'rgba(216,67,21,0.08)', animationDelay: '-5s' }} />

          {/* Central levitating content */}
          <div ref={heroRef} className="relative z-10 max-w-4xl mx-auto space-y-8 shaolin-float" style={{ animationDelay: '-1s' }}>
            {/* Subtle ambient aura */}
            <div aria-hidden="true" className="absolute inset-0 rounded-full opacity-30 blur-[120px] pointer-events-none"
              style={{ background: 'rgba(216,67,21,0.2)', zIndex: -1 }} />

            {/* Eyebrow label */}
            <p
              className="text-[#d84315] text-xs uppercase tracking-[0.2em] font-semibold"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              {student.college || 'The Space Between'}
            </p>

            {/* Main display heading */}
            <h1
              className="text-[#e1e3e3] text-5xl sm:text-6xl md:text-8xl tracking-tight leading-[1.05]"
              style={{ fontFamily: "'Libre Caslon Text', serif" }}
            >
              {student.name}
            </h1>

            {/* Bio */}
            <p
              className="text-[#bfc8c8] text-base md:text-lg max-w-2xl mx-auto leading-relaxed tracking-wide"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              {student.bio || 'Where traditional discipline meets ethereal minimalism. Building at the intersection of craft and code.'}
            </p>

            {/* Avatar */}
            <div className="flex justify-center pt-4">
              <div className="relative group">
                <div className="absolute -inset-3 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"
                  style={{ background: 'rgba(216,67,21,0.3)' }} />
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border border-white/10 shaolin-card">
                  <img
                    src={student.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${student.name}&backgroundColor=7b1c00&textColor=ffdbd1`}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* CTA button */}
            <div className="pt-4">
              <a
                href="#work"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-xs uppercase tracking-[0.15em] font-semibold hover:-translate-y-2 transition-all duration-500 shaolin-glow"
                style={{
                  fontFamily: "'Hanken Grotesk', sans-serif",
                  background: '#d84315',
                  color: '#fff',
                  border: '1px solid rgba(216,67,21,0.5)',
                }}
              >
                Explore Work
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_downward</span>
              </a>
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <section className="py-20 md:py-28 px-6 md:px-20 reveal">
          <div className="max-w-5xl mx-auto">
            <div className="divider-line mb-16" />
            <div className="grid grid-cols-2 gap-8 text-center">
              {[
                { value: projects.length, label: 'Projects Built' },
                { value: projects.filter(p => p.ai_analysis).length, label: 'AI Rated' },
              ].map((stat, i) => (
                <div key={i} className="space-y-2">
                  <div
                    className="text-4xl md:text-6xl text-[#d84315]"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    {stat.value}
                  </div>
                  <p
                    className="text-[#899292] text-[10px] uppercase tracking-[0.2em]"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="divider-line mt-16" />
          </div>
        </section>

        {/* ─── SKILLS ─── */}
        {skills.length > 0 && (
          <section id="skills" className="py-20 md:py-28 px-6 md:px-20 reveal">
            <div className="max-w-5xl mx-auto text-center space-y-12">
              <div>
                <p
                  className="text-[#d84315] text-xs uppercase tracking-[0.2em] mb-3 font-semibold"
                  style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                >
                  Discipline
                </p>
                <h2
                  className="text-[#e1e3e3] text-3xl md:text-5xl"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Core Arsenal
                </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="shaolin-card px-6 py-2.5 rounded-full text-[10px] uppercase tracking-[0.15em] text-[#bfc8c8] hover:text-[#ffb59d] hover:border-[#d84315]/40 transition-colors duration-300 cursor-default"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── PROJECTS ─── */}
        <section id="work" className="py-20 md:py-28 px-6 md:px-20">
          <div className="max-w-5xl mx-auto">
            <div className="reveal mb-16 flex flex-col md:flex-row items-center gap-6">
              <div className="shrink-0 text-center md:text-left">
                <p
                  className="text-[#d84315] text-xs uppercase tracking-[0.2em] mb-2 font-semibold"
                  style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                >
                  Craft
                </p>
                <h2
                  className="text-[#e1e3e3] text-3xl md:text-5xl"
                  style={{ fontFamily: "'Libre Caslon Text', serif" }}
                >
                  Selected Work
                </h2>
              </div>
              <div className="flex-grow h-px" style={{ background: 'linear-gradient(90deg, rgba(216,67,21,0.3), rgba(255,255,255,0.06) 60%, transparent)' }} />
            </div>

            <div className="space-y-8 md:space-y-12">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="reveal shaolin-card rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Image */}
                    {project.screenshot_url && (
                      <div className="lg:col-span-7 aspect-[16/9] md:aspect-[2.2/1] relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
                        <img
                          src={project.screenshot_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#121414]/80 via-transparent to-transparent" />
                        {project.ai_analysis && (
                          <div
                            className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold"
                            style={{
                              fontFamily: "'Hanken Grotesk', sans-serif",
                              background: 'rgba(216,67,21,0.85)',
                              color: '#fff',
                            }}
                          >
                            AI {project.ai_analysis.overall_score}/10
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className={`${project.screenshot_url ? 'lg:col-span-5' : 'lg:col-span-12'} p-8 md:p-12 flex flex-col justify-center`}>
                      <div className="space-y-4">
                        <span
                          className="text-[#d84315] text-[10px] uppercase tracking-[0.2em] font-semibold"
                          style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                        >
                          {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                        </span>

                        <h3
                          className="text-[#e1e3e3] text-2xl md:text-3xl leading-tight group-hover:text-[#ffb59d] transition-colors duration-500"
                          style={{ fontFamily: "'Libre Caslon Text', serif" }}
                        >
                          {project.title}
                        </h3>

                        <p
                          className="text-[#899292] text-sm md:text-base leading-relaxed line-clamp-3"
                          style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                        >
                          {project.description}
                        </p>

                        {/* Tech stack */}
                        {project.tech_stack && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {project.tech_stack.split(',').slice(0, 5).map(tech => (
                              <span
                                key={tech}
                                className="px-3 py-1 rounded-full text-[9px] md:text-[10px] uppercase tracking-widest text-[#bfc8c8]"
                                style={{
                                  fontFamily: "'Hanken Grotesk', sans-serif",
                                  border: '0.5px solid rgba(191,200,200,0.2)',
                                }}
                              >
                                {tech.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* View link */}
                        <div className="pt-4 flex items-center gap-2">
                          {project.live_url && (
                            <a
                              href={project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] uppercase tracking-widest text-[#d84315] hover:text-[#ffb59d] transition-colors flex items-center gap-1.5 font-semibold"
                              style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                              onClick={e => e.stopPropagation()}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                              Live Demo
                            </a>
                          )}
                          <span
                            className="text-[10px] uppercase tracking-widest text-[#bfc8c8] hover:text-[#e1e3e3] transition-colors flex items-center gap-1.5 ml-2 group-hover:translate-x-1 duration-300"
                            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                          >
                            View Details
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {projects.length === 0 && (
                <div className="text-center py-20 shaolin-card rounded-2xl">
                  <p
                    className="text-[#899292] text-sm uppercase tracking-[0.2em]"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  >
                    No projects yet — the canvas awaits.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── ABOUT / GITHUB ─── */}
        {(student.github_url || student.location) && (
          <section id="about" className="py-20 md:py-28 px-6 md:px-20 reveal">
            <div className="max-w-5xl mx-auto">
              <div className="divider-line mb-16" />
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left space-y-4">
                  <p
                    className="text-[#d84315] text-xs uppercase tracking-[0.2em] font-semibold"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  >
                    The Practitioner
                  </p>
                  <h2
                    className="text-[#e1e3e3] text-3xl md:text-4xl"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    {student.name}
                  </h2>
                  {student.location && (
                    <p
                      className="text-[#899292] text-sm flex items-center gap-2 justify-center md:justify-start"
                      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                    >
                      <span className="material-symbols-outlined text-[#d84315]" style={{ fontSize: '16px' }}>location_on</span>
                      {student.location}
                    </p>
                  )}
                  {student.bio && (
                    <p
                      className="text-[#bfc8c8] text-base leading-relaxed max-w-lg"
                      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                    >
                      {student.bio}
                    </p>
                  )}
                  {student.github_url && (
                    <a
                      href={student.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-semibold shaolin-card hover:border-[#d84315]/40 hover:text-[#d84315] transition-all duration-300 mt-4"
                      style={{ fontFamily: "'Hanken Grotesk', sans-serif", color: '#bfc8c8' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View GitHub
                    </a>
                  )}
                </div>

                {/* Philosophy quote */}
                <div className="flex-1 shaolin-card rounded-2xl p-8 md:p-10 text-center md:text-left">
                  <p
                    className="text-[#d84315] text-3xl md:text-4xl leading-tight italic mb-6"
                    style={{ fontFamily: "'Libre Caslon Text', serif" }}
                  >
                    "The space between keystrokes is where clarity lives."
                  </p>
                  <div className="divider-line" />
                  <p
                    className="text-[#899292] text-xs uppercase tracking-[0.2em] mt-6 font-semibold"
                    style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
                  >
                    On craft & code
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 py-12 md:py-16 px-6 md:px-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <span
            className="text-[#e1e3e3] text-lg md:text-xl tracking-widest"
            style={{ fontFamily: "'Libre Caslon Text', serif" }}
          >
            {student.name?.split(' ')[0]}
          </span>
          <div className="flex gap-6">
            {student.github_url && (
              <a
                href={student.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#899292] hover:text-[#d84315] transition-colors duration-300 text-xs uppercase tracking-widest font-semibold"
                style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
              >
                GitHub
              </a>
            )}
            <button
              onClick={handleJoinShowUp}
              className="text-[#899292] hover:text-[#d84315] transition-colors duration-300 text-xs uppercase tracking-widest font-semibold"
              style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
            >
              ShowUp
            </button>
          </div>
          <p
            className="text-[#3f4848] text-xs"
            style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
          >
            © {new Date().getFullYear()} {student.name}. Built with ShowUp.
          </p>
        </div>
      </footer>
    </div>
  );
}
