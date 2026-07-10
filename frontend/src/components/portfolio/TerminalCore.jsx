import React, { useEffect, useState, useRef } from 'react';

export default function TerminalCore({ data, handleJoinShowUp, selectedProject, setSelectedProject }) {
  const { student, projects } = data;
  const [terminalText, setTerminalText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const lines = [
      "Initializing secure connection...",
      "Loading profile data...",
      "Accessing project repositories...",
      "System ready."
    ];
    let currentLine = 0;
    let currentChar = 0;
    let text = "";
    
    let timer;
    const typeChar = () => {
      if (currentLine < lines.length) {
        if (currentChar < lines[currentLine].length) {
          text += lines[currentLine][currentChar];
          setTerminalText(text);
          currentChar++;
          timer = setTimeout(typeChar, 30 + Math.random() * 50);
        } else {
          text += "\n";
          setTerminalText(text);
          currentLine++;
          currentChar = 0;
          timer = setTimeout(typeChar, 300);
        }
      }
    };
    timer = setTimeout(typeChar, 500);

    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => {
      clearTimeout(timer);
      clearInterval(cursorTimer);
    };
  }, []);

  const observerRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const skills = student.skills 
    ? (Array.isArray(student.skills) ? student.skills : student.skills.split(',').map(s => s.trim()).filter(Boolean))
    : [];

  return (
    <div style={{
      '--color-background': '#131313',
      '--color-surface': '#131313',
      '--color-on-surface': '#e5e2e1',
      '--color-primary': '#4be277',
      '--color-outline-variant': '#343d35',
      '--color-surface-container-lowest': '#000000',
    }} className="bg-background text-on-surface antialiased relative min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600&display=swap');
        
        .font-jetbrains { font-family: 'JetBrains Mono', monospace; }
        .font-inter { font-family: 'Inter', sans-serif; }
        
        .scanline {
            width: 100%;
            height: 100px;
            z-index: 10;
            position: absolute;
            pointer-events: none;
            background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(75,226,119,0.1) 50%, rgba(0,0,0,0) 100%);
            opacity: 0.1;
            animation: scanline 10s linear infinite;
        }
        @keyframes scanline {
            0% { top: -100px; }
            100% { top: 100%; }
        }
        
        .terminal-card {
            background: rgba(19, 19, 19, 0.8);
            border: 1px solid var(--color-outline-variant);
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        }
        .terminal-card:hover {
            border-color: var(--color-primary);
            box-shadow: inset 0 0 20px rgba(0,0,0,0.5), 0 0 10px rgba(75,226,119,0.1);
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
      `}</style>
      
      {/* Background overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay z-0" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'
      }}></div>
      
      <div className="scanline"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 border-b border-outline-variant backdrop-blur-sm">
          <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
              <div className="font-jetbrains font-bold text-on-surface tracking-tighter">
                  <span className="text-primary">&gt;</span> {student.name.replace(/\s+/g, '_').toUpperCase()}
              </div>
              <div className="hidden md:flex gap-8 items-center">
                  <a className="font-jetbrains text-sm text-primary" href="#terminal">~/root</a>
                  <a className="font-jetbrains text-sm text-on-surface hover:text-primary transition-colors" href="#skills">~/skills</a>
                  <a className="font-jetbrains text-sm text-on-surface hover:text-primary transition-colors" href="#projects">~/projects</a>
              </div>
              <button onClick={handleJoinShowUp} className="bg-primary/10 text-primary border border-primary font-jetbrains text-sm px-4 py-2 hover:bg-primary hover:text-background transition-colors">
                  {localStorage.getItem('showup_access_token') ? 'Go to ShowUp' : 'Join ShowUp'}
              </button>
          </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-4xl mx-auto space-y-20 relative z-10">
          
          {/* Terminal Hero Section */}
          <section id="terminal" className="terminal-card p-6 md:p-10 animate-on-scroll scroll-mt-24">
              <div className="flex gap-2 mb-6 border-b border-outline-variant pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/80"></div>
              </div>
              
              <div className="font-jetbrains text-primary text-sm md:text-base leading-relaxed whitespace-pre-wrap mb-8">
                  {terminalText}
                  <span className={showCursor ? 'opacity-100' : 'opacity-0'}>_</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-t border-outline-variant pt-8">
                  <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 border border-outline-variant p-2">
                      <img alt="Avatar" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" src={student.avatar_url || 'https://api.dicebear.com/7.x/notionists/svg?seed=' + student.name} />
                  </div>
                  <div className="space-y-4 text-center md:text-left">
                      <h1 className="font-jetbrains font-bold text-3xl md:text-4xl text-on-surface tracking-tight uppercase">
                          {student.name}
                      </h1>
                      <p className="font-inter text-on-surface/80 leading-relaxed max-w-xl mx-auto md:mx-0">
                          {student.bio || 'A developer building the future.'}
                      </p>
                  </div>
              </div>
          </section>

          {/* Data Grid Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="terminal-card p-6 text-center animate-on-scroll">
                  <div className="font-jetbrains text-primary text-4xl mb-2">{projects.length}</div>
                  <div className="font-jetbrains text-on-surface/60 text-xs uppercase tracking-widest">Projects</div>
              </div>
              <div className="terminal-card p-6 text-center animate-on-scroll" style={{transitionDelay: '100ms'}}>
                  <div className="font-jetbrains text-primary text-4xl mb-2">{student.credibility_score}</div>
                  <div className="font-jetbrains text-on-surface/60 text-xs uppercase tracking-widest">Credibility</div>
              </div>
              <div className="terminal-card p-6 text-center animate-on-scroll" style={{transitionDelay: '200ms'}}>
                  <div className="font-jetbrains text-primary text-4xl mb-2">{projects.filter(p => p.ai_analysis_used).length}</div>
                  <div className="font-jetbrains text-on-surface/60 text-xs uppercase tracking-widest">Analyzed</div>
              </div>
          </section>

          {/* Skills Array */}
          <section id="skills" className="space-y-6 animate-on-scroll scroll-mt-24">
              <div className="font-jetbrains text-primary text-sm flex items-center gap-4">
                  <span>[01]</span>
                  <span className="h-px bg-outline-variant flex-grow"></span>
                  <span>SKILLS_ARRAY</span>
              </div>
              <div className="flex flex-wrap gap-4">
                  {skills.map(skill => (
                      <span key={skill} className="font-jetbrains text-sm text-on-surface border border-outline-variant bg-surface px-4 py-2 hover:border-primary hover:text-primary transition-colors cursor-default">
                          {skill}
                      </span>
                  ))}
                  {skills.length === 0 && <span className="font-jetbrains text-on-surface/50">NO_DATA_FOUND</span>}
              </div>
          </section>

          {/* Projects Log */}
          <section id="projects" className="space-y-6 animate-on-scroll scroll-mt-24">
              <div className="font-jetbrains text-primary text-sm flex items-center gap-4 mb-8">
                  <span>[02]</span>
                  <span className="h-px bg-outline-variant flex-grow"></span>
                  <span>EXECUTION_LOG</span>
              </div>
              
              <div className="space-y-8">
                  {projects.map((project, idx) => (
                      <div key={project.id} onClick={() => setSelectedProject(project)} className="terminal-card flex flex-col md:flex-row cursor-pointer group">
                          <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-outline-variant p-4">
                              <div className="aspect-video bg-surface-container-lowest border border-outline-variant overflow-hidden relative">
                                  {project.screenshot_url ? (
                                      <img alt={project.title} className="w-full h-full object-cover filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" src={project.screenshot_url} />
                                  ) : (
                                      <div className="absolute inset-0 flex items-center justify-center font-jetbrains text-xs text-on-surface/30">NO_IMG_DATA</div>
                                  )}
                                  <div className="absolute top-2 left-2 bg-background/80 font-jetbrains text-[10px] text-primary px-2 py-1 border border-primary/30">
                                      ID: 0x{(idx+1).toString(16).padStart(4, '0')}
                                  </div>
                              </div>
                          </div>
                          <div className="md:w-2/3 p-6 flex flex-col justify-between">
                              <div>
                                  <div className="flex justify-between items-start mb-4">
                                      <h3 className="font-jetbrains font-bold text-xl text-on-surface group-hover:text-primary transition-colors">
                                          {project.title}
                                      </h3>
                                      <span className="font-jetbrains text-xs text-on-surface/50">v1.0</span>
                                  </div>
                                  <p className="font-inter text-sm text-on-surface/80 leading-relaxed mb-6">
                                      {project.description}
                                  </p>
                              </div>
                              <div className="flex gap-3 flex-wrap">
                                  {project.tech_stack?.split(',').slice(0, 4).map(tag => (
                                      <span key={tag} className="font-jetbrains text-xs text-on-surface/60 bg-surface-container-lowest border border-outline-variant px-2 py-1">
                                          {tag.trim()}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant bg-background/90 py-8 relative z-10">
          <div className="max-w-4xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="font-jetbrains text-xs text-on-surface/50">
                  SYSTEM_HALTED. EOF.
              </div>
              <div className="font-jetbrains text-xs text-primary">
                  © {new Date().getFullYear()} {student.name}
              </div>
          </div>
      </footer>
    </div>
  );
}
