import React, { useEffect } from 'react';

export default function NeuralOS({ data, handleJoinShowUp, selectedProject, setSelectedProject }) {
  const { student, projects } = data;

  const skills = student.skills 
    ? (Array.isArray(student.skills) ? student.skills : student.skills.split(',').map(s => s.trim()).filter(Boolean))
    : [];

  return (
    <div style={{
      '--color-background': '#131313',
      '--color-surface-container-lowest': '#0e0e0e',
      '--color-surface-container-low': '#1c1b1b',
      '--color-surface-container': '#201f1f',
      '--color-surface-container-high': '#2a2a2a',
      '--color-surface-container-highest': '#353534',
      '--color-surface': '#131313',
      '--color-on-surface': '#e5e2e1',
      '--color-on-surface-variant': '#b9cacb',
      '--color-primary': '#e3fdff',
      '--color-primary-container': '#00f3ff',
      '--color-on-primary-container': '#006b71',
      '--color-secondary': '#c6c6c7',
      '--color-on-secondary': '#2f3131',
      '--color-outline': '#849495',
      '--color-cyan': '#00f3ff'
    }} className="bg-background text-on-surface font-hanken min-h-screen flex flex-col">
      <style dangerouslySetInnerHTML={{__html: `
        .os-border {
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .os-glow-hover:hover {
            box-shadow: 0 0 16px rgba(0, 243, 255, 0.2);
            border-color: rgba(0, 243, 255, 0.5);
        }
        .text-cyan {
            color: #00f3ff;
        }
        .bg-cyan {
            background-color: #00f3ff;
        }
      `}} />

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center h-20 px-6 md:px-20 max-w-7xl mx-auto">
          <div className="font-space font-bold text-2xl md:text-4xl tracking-tighter text-on-surface">SHOWUP</div>
          <div className="hidden md:flex gap-8 font-jetbrains text-xs font-medium tracking-widest">
            <a className="text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 transition-all duration-300 px-4 py-2 rounded" href="#metrics">METRICS</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 transition-all duration-300 px-4 py-2 rounded" href="#skills">SKILLS</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors hover:bg-white/5 transition-all duration-300 px-4 py-2 rounded" href="#projects">PROJECTS</a>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={handleJoinShowUp} className="bg-primary-container text-on-primary-container font-jetbrains text-[10px] md:text-xs font-medium tracking-widest px-3 md:px-6 py-2 rounded hover:opacity-80 active:scale-95 transition-all duration-300">
              {localStorage.getItem('showup_access_token') ? 'GO TO SHOWUP' : 'CONNECT'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="flex md:hidden fixed bottom-0 left-0 w-full z-50 bg-background/90 backdrop-blur-xl border-t border-white/10 px-6 py-4 justify-around items-center">
        <a className="flex flex-col items-center text-on-surface-variant hover:text-cyan transition-colors" href="#metrics">
          <span className="material-symbols-outlined mb-1 text-sm">equalizer</span>
          <span className="font-jetbrains text-[10px] uppercase">Metrics</span>
        </a>
        <a className="flex flex-col items-center text-on-surface-variant hover:text-cyan transition-colors" href="#skills">
          <span className="material-symbols-outlined mb-1 text-sm">bolt</span>
          <span className="font-jetbrains text-[10px] uppercase">Skills</span>
        </a>
        <a className="flex flex-col items-center text-on-surface-variant hover:text-cyan transition-colors" href="#projects">
          <span className="material-symbols-outlined mb-1 text-sm">layers</span>
          <span className="font-jetbrains text-[10px] uppercase">Projects</span>
        </a>
      </div>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-32 md:pt-40 pb-32 px-6 md:px-20 max-w-7xl mx-auto w-full flex flex-col gap-24 md:gap-40">
        
        {/* Section 1: Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[60vh]">
          <div className="lg:col-span-6 flex flex-col gap-6 order-2 lg:order-1">
            <div className="font-jetbrains text-xs font-medium text-primary-container tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
              System Initialized
            </div>
            <h1 className="font-space font-bold text-4xl md:text-6xl lg:text-7xl text-on-surface leading-tight tracking-tight">
              {student.name.split(' ').map((part, i) => (
                <React.Fragment key={i}>{part}<br/></React.Fragment>
              ))}
            </h1>
            <p className="font-hanken text-base text-on-surface-variant max-w-md leading-relaxed">
              {student.bio || 'Learning developer. Engineering scalable solutions and exploring AI integration within minimal architectures.'}
            </p>
          </div>
          <div className="lg:col-span-6 relative h-[300px] md:h-[450px] lg:h-[600px] w-full os-border rounded-xl overflow-hidden group order-1 lg:order-2">
            <div className="absolute inset-0 bg-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
            <img 
              alt="Profile Avatar" 
              className="w-full h-full object-cover object-center transition-all duration-700" 
              src={student.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + student.name} 
            />
          </div>
        </section>

        {/* Section 2: System Metrics */}
        <section id="metrics" className="flex flex-col gap-12 scroll-mt-24">
          <h2 className="font-space font-semibold text-3xl md:text-4xl text-on-surface">System Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="os-border rounded-xl p-8 bg-surface-container-low flex flex-col gap-6 os-glow-hover transition-all duration-300">
              <div className="font-jetbrains text-xs font-medium text-on-surface-variant flex justify-between">
                <span>PROJECTS DEPLOYED</span>
                <span className="text-cyan">{projects.length}</span>
              </div>
              <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-cyan w-[75%] shadow-[0_0_8px_#00f3ff]"></div>
              </div>
            </div>
            <div className="os-border rounded-xl p-8 bg-surface-container-low flex flex-col gap-6 os-glow-hover transition-all duration-300">
              <div className="font-jetbrains text-xs font-medium text-on-surface-variant flex justify-between">
                <span>CREDIBILITY SCORE</span>
                <span className="text-cyan">{student.credibility_score}</span>
              </div>
              <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-cyan w-[98%] shadow-[0_0_8px_#00f3ff]"></div>
              </div>
            </div>
            <div className="os-border rounded-xl p-8 bg-surface-container-low flex flex-col gap-6 os-glow-hover transition-all duration-300">
              <div className="font-jetbrains text-xs font-medium text-on-surface-variant flex justify-between">
                <span>AI REVIEWS</span>
                <span className="text-cyan">{projects.filter(p => p.ai_analysis).length}</span>
              </div>
              <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-cyan w-[100%] shadow-[0_0_8px_#00f3ff] animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Ability Unlocks */}
        <section id="skills" className="flex flex-col gap-12 scroll-mt-24">
          <h2 className="font-space font-semibold text-3xl md:text-4xl text-on-surface">Ability Unlocks</h2>
          <div className="flex flex-wrap gap-4">
            {skills.map(skill => (
              <div key={skill} className="os-border rounded-full px-6 py-3 font-jetbrains text-xs font-medium text-on-surface hover:border-primary-container hover:text-primary-container transition-colors cursor-default">
                {skill}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Mission Log */}
        <section id="projects" className="flex flex-col gap-12 scroll-mt-24">
          <h2 className="font-space font-semibold text-3xl md:text-4xl text-on-surface">Mission Log</h2>
          <div className="flex flex-col gap-8">
            {projects.map((project, index) => (
              <div key={project.id} className="grid grid-cols-1 lg:grid-cols-12 gap-0 os-border rounded-xl bg-surface-container-lowest overflow-hidden group cursor-pointer" onClick={() => setSelectedProject(project)}>
                {project.screenshot_url && (
                  <div className="lg:col-span-7 relative h-[250px] md:h-[350px] lg:h-[400px] border-b lg:border-b-0 lg:border-r border-white/10">
                    <img 
                      alt={project.title} 
                      className="absolute inset-0 w-full h-full object-cover object-left opacity-60 group-hover:opacity-100 transition-opacity duration-500" 
                      src={project.screenshot_url} 
                    />
                  </div>
                )}
                <div className={`${project.screenshot_url ? 'lg:col-span-5' : 'lg:col-span-12'} p-6 md:p-8 lg:p-12 flex flex-col justify-center gap-6 lg:gap-8 relative overflow-hidden`}>
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
                  <div>
                    <div className="font-jetbrains text-xs font-medium text-primary-container mb-2 uppercase">PROJ_ID: PRJ-{(index+1).toString().padStart(3, '0')}</div>
                    <h3 className="font-space font-semibold text-2xl md:text-4xl text-on-surface">{project.title}</h3>
                  </div>
                  <p className="font-hanken text-base text-on-surface-variant">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tech_stack?.split(',').map(tech => (
                      <span key={tech} className="font-jetbrains text-xs font-medium text-on-surface bg-surface-container px-3 py-1 rounded border border-white/10 uppercase">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <span className="font-jetbrains text-xs font-medium text-primary-container flex items-center gap-2 hover:opacity-80 transition-opacity w-fit pb-1 border-b border-primary-container">
                      OPEN TERMINAL <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 md:py-20 bg-surface-container-lowest border-t border-white/5 mt-auto mb-20 md:mb-0">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-20 max-w-7xl mx-auto gap-8 text-center md:text-left">
          <div className="font-space font-bold text-3xl md:text-4xl text-on-surface">Create With Showup</div>
          <div className="font-jetbrains text-xs font-medium uppercase tracking-widest text-on-surface-variant">
            © {new Date().getFullYear()} TERMINAL. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
