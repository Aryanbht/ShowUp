import React, { useEffect } from 'react';

export default function ObsidianIridescence({ data, handleJoinShowUp, selectedProject, setSelectedProject }) {
  const { student, projects } = data;

  useEffect(() => {
    // Simple scroll reveal for cards
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const skills = student.skills 
    ? (Array.isArray(student.skills) ? student.skills : student.skills.split(',').map(s => s.trim()).filter(Boolean))
    : [];

  return (
    <div style={{
      '--color-background': '#13131b',
      '--color-surface-container-lowest': '#0d0d15',
      '--color-surface-container-low': '#1b1b23',
      '--color-surface-container': '#1f1f27',
      '--color-surface-container-high': '#292932',
      '--color-surface-container-highest': '#34343d',
      '--color-surface': '#13131b',
      '--color-on-surface': '#e4e1ed',
      '--color-on-surface-variant': '#c7c4d7',
      '--color-primary': '#c0c1ff',
      '--color-primary-container': '#8083ff',
      '--color-on-primary-container': '#0d0096',
      '--color-secondary': '#c1c7cf',
      '--color-on-secondary': '#2b3137',
      '--color-outline': '#908fa0',
      '--color-outline-variant': '#464554'
    }} className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-surface-container-high via-background to-background text-on-surface font-geist selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden relative min-h-screen">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: rgba(31, 31, 39, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(226, 232, 240, 0.1);
            position: relative;
            overflow: hidden;
        }
        .glass-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, rgba(226, 232, 240, 0.2) 0%, rgba(226, 232, 240, 0) 100%);
        }
        .iridescent-hover:hover {
            box-shadow: 0 0 40px rgba(99, 102, 241, 0.15);
            border-color: rgba(192, 193, 255, 0.3);
            transform: translateY(-4px);
        }
      `}} />

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-[20px] border-b border-white/10 shadow-[0_0_60px_rgba(99,102,241,0.05)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 md:px-20 h-20">
          <span className="font-bricolage text-2xl md:text-3xl font-medium text-on-surface tracking-tight">Portfolio</span>
          <nav className="hidden md:flex gap-8 items-center">
            <a className="font-geist text-xs uppercase tracking-widest text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-500 ease-out" href="#">Work</a>
            <a className="font-geist text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all duration-500 ease-out" href="#stats">Metrics</a>
            <a className="font-geist text-xs uppercase tracking-widest text-on-surface-variant hover:text-on-surface hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all duration-500 ease-out" href="#expertise">Skills</a>
          </nav>
          <button onClick={handleJoinShowUp} className="bg-primary text-[#13131b] px-4 md:px-6 py-2 rounded-full font-geist text-[10px] md:text-xs uppercase tracking-widest font-bold hover:opacity-90 transition-all duration-300">
            {localStorage.getItem('showup_access_token') ? 'Go To ShowUp' : 'Connect'}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="flex md:hidden fixed bottom-0 left-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 justify-around items-center">
        <a className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors" href="#">
          <span className="material-symbols-outlined mb-1 text-sm">home</span>
          <span className="font-geist text-[10px] uppercase tracking-widest">Home</span>
        </a>
        <a className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors" href="#stats">
          <span className="material-symbols-outlined mb-1 text-sm">analytics</span>
          <span className="font-geist text-[10px] uppercase tracking-widest">Metrics</span>
        </a>
        <a className="flex flex-col items-center text-on-surface-variant hover:text-primary transition-colors" href="#expertise">
          <span className="material-symbols-outlined mb-1 text-sm">bolt</span>
          <span className="font-geist text-[10px] uppercase tracking-widest">Skills</span>
        </a>
      </div>

      <main className="relative z-10 pt-28 md:pt-40 pb-32 md:pb-20">
        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center px-6 md:px-20 text-center mb-8 md:mb-16">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border-outline-variant/30 mb-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-geist text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant">System Initialized</span>
            </div>
            <h1 className="font-bricolage text-4xl md:text-6xl lg:text-7xl font-medium text-on-surface leading-[1.1] tracking-tighter">
              {student.name}
            </h1>
            <p className="font-geist text-sm md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
              {student.bio || 'Crafting the future of intelligent interfaces and deep technical architectures through obsidian-sharp precision.'}
            </p>
            
            {/* Clean Glass Profile */}
            <div className="mt-12 md:mt-16 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/10 blur-[60px] rounded-full opacity-30 group-hover:opacity-60 transition-opacity"></div>
                <div className="glass-card w-56 h-56 md:w-72 md:h-72 rounded-full p-2 relative z-20 transition-transform duration-700">
                  <div className="w-full h-full rounded-full overflow-hidden bg-surface-container">
                    <img 
                      alt="Profile" 
                      className="w-full h-full object-cover transition-all duration-700" 
                      src={student.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + student.name} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Metrics (Stats) */}
        <section id="stats" className="py-16 md:py-24 px-6 md:px-20 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
              <div className="space-y-2">
                <span className="font-geist text-xs text-primary uppercase tracking-[0.2em]">Diagnostic Overview</span>
                <h2 className="font-bricolage text-3xl md:text-5xl text-on-surface font-medium tracking-tight">System Metrics</h2>
              </div>
              <div className="h-[1px] flex-grow bg-outline-variant/30 mx-8 hidden md:block mb-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 md:p-8 rounded-2xl iridescent-hover transition-all duration-500 group">
                <span className="material-symbols-outlined text-primary text-3xl md:text-4xl mb-4 transition-transform group-hover:scale-110">deployed_code</span>
                <div className="font-bricolage text-4xl md:text-6xl font-medium mb-2">{projects.length}</div>
                <p className="font-geist text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant">Projects Deployed</p>
              </div>
              <div className="glass-card p-6 md:p-8 rounded-2xl iridescent-hover transition-all duration-500 group border-primary/20">
                <span className="material-symbols-outlined text-primary text-3xl md:text-4xl mb-4 transition-transform group-hover:scale-110">analytics</span>
                <div className="font-bricolage text-4xl md:text-6xl font-medium mb-2">{student.credibility_score}</div>
                <p className="font-geist text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant">Credibility Score</p>
              </div>
              <div className="glass-card p-6 md:p-8 rounded-2xl iridescent-hover transition-all duration-500 group sm:col-span-2 md:col-span-1">
                <span className="material-symbols-outlined text-primary text-3xl md:text-4xl mb-4 transition-transform group-hover:scale-110">history_edu</span>
                <div className="font-bricolage text-4xl md:text-6xl font-medium mb-2">{projects.filter(p => p.ai_analysis).length}</div>
                <p className="font-geist text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant">AI Reviews</p>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Grid */}
        <section id="expertise" className="py-16 md:py-24 px-6 md:px-20 bg-surface-container-lowest/30 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <span className="font-geist text-xs text-primary uppercase tracking-[0.2em]">Core Competencies</span>
              <h2 className="font-bricolage text-3xl md:text-5xl text-on-surface mt-2 font-medium tracking-tight">Technical Arsenal</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
              {skills.map(skill => (
                <div key={skill} className="glass-card px-5 md:px-8 py-2 md:py-4 rounded-full font-geist text-[10px] md:text-xs uppercase tracking-widest hover:text-primary hover:border-primary/40 transition-colors cursor-default">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Log (Projects) */}
        <section className="py-16 md:py-24 px-6 md:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-12 md:mb-16 text-center md:text-left">
              <h2 className="font-bricolage text-3xl md:text-5xl text-on-surface shrink-0 font-medium tracking-tight">Mission Log</h2>
              <div className="h-[1px] w-full bg-gradient-to-r from-outline-variant/50 to-transparent"></div>
            </div>
            
            <div className="flex flex-col gap-8 md:gap-16">
              {projects.map((project, index) => (
                <div key={project.id} className="group relative" onClick={() => setSelectedProject(project)}>
                  <div className="absolute -inset-4 md:-inset-10 bg-primary/5 blur-[40px] md:blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 glass-card rounded-2xl md:rounded-3xl overflow-hidden relative z-10 border border-white/5 group-hover:border-white/10 transition-colors duration-500 cursor-pointer">
                    {project.screenshot_url && (
                      <div className="lg:col-span-7 aspect-[4/3] md:aspect-[2.04/1] relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
                        <img 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100" 
                          src={project.screenshot_url} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-surface-dim via-transparent to-transparent"></div>
                      </div>
                    )}
                    <div className={`${project.screenshot_url ? 'lg:col-span-5' : 'lg:col-span-12'} p-6 md:p-12 lg:p-16 flex flex-col justify-center`}>
                      <div className="space-y-4">
                        <span className="font-geist text-[10px] md:text-xs text-primary uppercase tracking-[0.2em]">Proj_ID: PRJ-{(index+1).toString().padStart(3, '0')}</span>
                        <h3 className="font-bricolage text-2xl md:text-4xl text-on-surface font-medium tracking-tight">{project.title}</h3>
                        <p className="font-geist text-sm md:text-base text-on-surface-variant leading-relaxed">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 md:pt-4">
                          {project.tech_stack?.split(',').map(tech => (
                            <div key={tech} className="px-3 py-1 border border-outline-variant/20 rounded-full font-geist text-[9px] md:text-[10px] uppercase tracking-widest">{tech.trim()}</div>
                          ))}
                        </div>
                        <div className="pt-6 md:pt-8">
                          <span className="inline-flex items-center gap-2 font-geist text-[10px] md:text-xs uppercase tracking-widest text-on-surface hover:text-primary transition-colors group/link">
                            View Details
                            <span className="material-symbols-outlined text-sm group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-surface-dim border-t border-outline-variant/30 w-full py-8 md:py-12 mb-16 md:mb-0">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-20 gap-4 max-w-7xl mx-auto text-center md:text-left">
          <span className="font-bricolage text-xl md:text-2xl font-medium text-on-surface tracking-tight">ShowUp</span>
          <p className="font-geist text-[10px] md:text-xs text-on-tertiary-fixed-variant uppercase tracking-widest">© {new Date().getFullYear()} {student.name}. Built with ShowUp.</p>
        </div>
      </footer>
    </div>
  );
}
