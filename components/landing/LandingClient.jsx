'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════════════
   SCROLL-DRIVEN VIDEO LANDING
   · Layout, video, scroll mechanics: perfectly intact
   · Typography: Space Grotesk (sans) + Playfair Display (serif italic)
   · UI: Gen Z Editorial (No Boxes, White/Yellow Typography on Video)
   · Responsive: Added extensive mobile media queries and clamp() tweaks
═══════════════════════════════════════════════════════════════════ */

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { 
    scroll-behavior: auto !important; 
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  html::-webkit-scrollbar {
    display: none;
  }
  body { background: #000; overflow-x: hidden; font-family: 'Inter', sans-serif; }

  /* ── Layout — UNCHANGED ── */
  .scroll-driver { position: relative; height: 600vh; background: #000; }
  .stage {
    position: sticky; top: 0;
    width: 100vw; height: 100vh; overflow: hidden;
    background: #000;
  }
  .video-layer { position: absolute; inset: 0; background: #000; }
  .video-layer video {
    width: 100%; height: 100%; object-fit: cover; display: block;
    opacity: 1;
  }
  
  /* ── Vignette: Darkened significantly to make the scene richer and darker ── */
  .vignette {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at center, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.85) 100%),
      linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 25%,
        rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.8) 100%);
    pointer-events: none;
  }
  .scene {
    position: absolute; inset: 0;
    display: flex; align-items: center;
    padding: 0 8vw; pointer-events: none;
  }
  .scene.center { justify-content: center; }
  .scene.left   { justify-content: flex-start; }
  .scene.right  { justify-content: flex-end; }
  .scene-inner  { max-width: 660px; pointer-events: auto; width: 100%; }

  /* ── Text Container (No Background Box) ── */
  .content-block {
    padding: 24px 0; /* Just spacing, no background */
    width: 100%;
  }

  /* ── Typography Mix ── */
  .serif-italic {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 400;
    color: #FFC629; /* Highlight accent in yellow */
  }
  
  /* ── Labels ── */
  .overline {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: #FFC629;
    background: none; padding: 0;
    margin-bottom: 24px;
  }
  .overline-badge {
    display: inline-block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: #0A0A0A; background: #FFC629;
    padding: 6px 14px; border-radius: 0;
    margin-bottom: 24px;
    box-shadow: 4px 4px 0px rgba(0,0,0,0.4);
  }

  /* ── Hero headline ── */
  .hero-line-wrap { overflow: hidden; display: block; }
  .hero-line {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(42px, 10vw, 110px);
    font-weight: 800; color: #fff;
    line-height: 0.95; letter-spacing: -0.04em;
    will-change: transform, opacity;
  }
  
  .hero-line.serif {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-weight: 400;
    color: #FFC629;
    letter-spacing: -0.02em;
    padding-left: 8px; /* Slight indent for visual flair */
  }

  /* ── Hero subtext ── */
  .hero-sub {
    font-size: clamp(15px, 3.5vw, 17px); font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    max-width: 480px; line-height: 1.6;
    margin-bottom: 32px;
    will-change: opacity;
  }

  /* ── Section headings ── */
  .scene-h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(36px, 8vw, 72px);
    font-weight: 800; line-height: 1.05;
    color: #fff; letter-spacing: -0.04em;
    margin-bottom: 20px;
  }
  .scene-h2 .serif-italic {
    font-size: 1.1em; /* Make serif slightly larger to balance x-height */
  }

  /* ── Body text ── */
  .scene-sub {
    font-size: clamp(15px, 3.5vw, 17px); font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    max-width: 420px; line-height: 1.6;
  }

  /* ── Buttons (Brutalist Solid) ── */
  .btn-row { display: flex; gap: 16px; flex-wrap: wrap; }

  .btn-primary-cta {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: #FFC629; color: #0A0A0A;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 18px 36px;
    border: none; border-radius: 0; cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.1s ease; outline: none;
    will-change: opacity, transform;
    box-shadow: 6px 6px 0px rgba(0,0,0,0.4);
  }
  .btn-primary-cta:hover:not(:disabled) {
    transform: translate(-2px, -2px);
    box-shadow: 8px 8px 0px rgba(0,0,0,0.5);
  }
  .btn-primary-cta:active:not(:disabled) { 
    transform: translate(2px, 2px);
    box-shadow: 4px 4px 0px rgba(0,0,0,0.3);
  }
  .btn-primary-cta:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-ghost-cta {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: #fff;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 14px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 18px 36px;
    border: 2px solid #fff; border-radius: 0;
    cursor: pointer; transition: transform 0.1s ease, box-shadow 0.1s ease, background 0.15s ease; outline: none;
  }
  .btn-ghost-cta:hover { 
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.05);
  }

  /* ── CTA scene (final) ── */
  .cta-block {
    display: flex; flex-direction: column;
    align-items: flex-start; gap: 16px;
  }
  .cta-sub {
    font-size: clamp(15px, 3.5vw, 17px); color: rgba(255, 255, 255, 0.85); font-weight: 500;
  }
  .btn-cta {
    display: inline-flex; align-items: center; justify-content: center; gap: 12px;
    background: #FFC629; color: #0A0A0A;
    font-family: 'Space Grotesk', sans-serif;
    font-weight: 800; font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 20px 40px; border: none; border-radius: 0;
    cursor: pointer; transition: transform 0.1s ease, box-shadow 0.1s ease; outline: none;
    box-shadow: 6px 6px 0px rgba(0,0,0,0.4);
  }
  .btn-cta:hover:not(:disabled) { 
    transform: translate(-2px, -2px); 
    box-shadow: 8px 8px 0px rgba(0,0,0,0.5);
  }
  .btn-cta:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 4px 4px 0px rgba(0,0,0,0.3); }
  .btn-cta:disabled { opacity: 0.6; cursor: not-allowed; }
  
  .cta-fine {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; color: rgba(255, 255, 255, 0.5); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
  }

  /* ── Stats ── */
  .stats-grid {
    display: flex; gap: clamp(20px, 4vw, 64px);
    align-items: flex-end; justify-content: center;
  }
  .stat-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .stat-num {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(40px, 10vw, 80px);
    font-weight: 800; color: #FFC629;
    line-height: 1; letter-spacing: -0.04em;
    text-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  }
  .stat-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(10px, 2.5vw, 12px); font-weight: 800;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: rgba(255, 255, 255, 0.7);
  }

  /* ── Scroll hint ── */
  .scroll-hint {
    position: absolute; bottom: 36px; left: 8vw;
    display: flex; flex-direction: column; align-items: flex-start;
    gap: 8px; pointer-events: none; transition: opacity 0.5s;
  }
  .scroll-hint-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.8);
  }
  .scroll-arrow {
    width: 16px; height: 16px;
    border-right: 3px solid #FFC629;
    border-bottom: 3px solid #FFC629;
    transform: rotate(45deg);
    animation: arrowBounce 1.5s ease-in-out infinite;
  }
  @keyframes arrowBounce {
    0%,100% { transform: rotate(45deg) translateY(0); }
    50%      { transform: rotate(45deg) translateY(6px); }
  }

  /* ── Loading ── */
  .loading-overlay {
    position: absolute; inset: 0; background: #000;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 20px; z-index: 99;
    transition: opacity 0.25s ease;
  }
  .loading-overlay.hidden { opacity: 0; pointer-events: none; }
  .loading-logo {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 64px; font-weight: 800;
    color: #fff; letter-spacing: -0.04em; line-height: 1;
  }
  .loading-logo .hl { background: #FFC629; color: #0A0A0A; padding: 0 12px; margin-left: 4px; }
  .loading-bar-track {
    width: 180px; height: 4px;
    background: rgba(255,255,255,0.2); overflow: hidden;
  }
  .loading-bar-fill {
    height: 100%; background: #FFC629; width: 40%;
    animation: loadSlide 1s ease-in-out infinite;
  }
  @keyframes loadSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
  .loading-text {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }

  /* ── Intro Logo ── */
  .intro-logo {
    width: 80vw;
    max-width: 600px;
    height: auto;
    filter: drop-shadow(0 10px 40px rgba(0,0,0,0.8));
  }

  /* ── CSS scene-entrance animations (triggered on DOM mount) ── */
  /* Brutalist snappy entrance */
  @keyframes slideUpSnappy {
    from { transform: translateY(20px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .anim-up   { animation: slideUpSnappy 0.5s cubic-bezier(0.1, 0.9, 0.2, 1) both; }
  .anim-fade { animation: fadeIn 0.4s ease both; }
  .ad-0 { animation-delay: 0s;     }
  .ad-1 { animation-delay: 0.1s;  }
  .ad-2 { animation-delay: 0.2s;   }
  .ad-3 { animation-delay: 0.3s;  }

  /* ── Spinner ── */
  .btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(10, 10, 10, 0.2); border-top-color: #0A0A0A;
    border-radius: 50%; animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── RESPONSIVE TWEAKS ── */
  @media (max-width: 768px) {
    .intro-logo { width: 95vw; }
    
    .scene { padding: 0 6vw; }
    .scene.left, .scene.right { justify-content: flex-start; } /* Override right-align on mobile so text is legible */
    
    .btn-row { flex-direction: column; width: 100%; gap: 12px; }
    .btn-primary-cta, .btn-ghost-cta { width: 100%; padding: 16px; }
    
    .stats-grid { flex-wrap: wrap; justify-content: flex-start; gap: 32px 24px; }
    .stat-item { align-items: flex-start; }
    
    .hero-sub { margin-bottom: 24px; }
    .overline { margin-bottom: 16px; }
    
    .scroll-hint { left: 6vw; bottom: 24px; }
  }

  @media (max-width: 480px) {
    .scene-h2 { margin-bottom: 16px; }
    .scene-sub { font-size: 15px; }
    .hero-line.serif { padding-left: 0; } /* Remove indent on mobile to save space */
    .btn-cta { width: 100%; padding: 16px; }
  }
`

/* ── Scroll scenes (all except intro + CTA which are inlined in JSX) ──
   CSS entrance animations (anim-up / anim-fade + delay classes)
   re-trigger automatically each time element mounts into DOM.         */
const SCENES = [
  {
    id: 'build',
    start: 0.17,
    end: 0.32,
    side: 'left',
    render: () => (
      <div className="content-block">
        <div className="overline-badge anim-fade ad-0">01 — Project Feed</div>
        <h2 className="scene-h2 anim-up ad-1">
          Share what <br/><span className="serif-italic">you build.</span>
        </h2>
        <p className="scene-sub anim-fade ad-2">
          Post projects. Get discovered by peers,<br />
          mentors &amp; recruiters from India&apos;s top colleges.
        </p>
      </div>
    ),
  },
  {
    id: 'teammates',
    start: 0.34,
    end: 0.52,
    side: 'right',
    render: () => (
      <div className="content-block">
        <div className="overline-badge anim-fade ad-0">02 — Teammates</div>
        <h2 className="scene-h2 anim-up ad-1">
          Find your <br/><span className="serif-italic">hackathon squad.</span>
        </h2>
        <p className="scene-sub anim-fade ad-2">
          Filter by skill, college &amp; interest.<br />
          Connect with builders who complete your stack.
        </p>
      </div>
    ),
  },
  {
    id: 'connect',
    start: 0.54,
    end: 0.72,
    side: 'left',
    render: () => (
      <div className="content-block">
        <div className="overline-badge anim-fade ad-0">03 — Connections</div>
        <h2 className="scene-h2 anim-up ad-1">
          No noise. <br/><span className="serif-italic">Just builders.</span>
        </h2>
        <p className="scene-sub anim-fade ad-2">
          Real connections with people who ship.<br />
          Not LinkedIn spam.
        </p>
      </div>
    ),
  },
  {
    id: 'about',
    start: 0.74,
    end: 0.88,
    side: 'center',
    render: () => (
      <div className="content-block" style={{ textAlign: 'center' }}>
        <h2 className="scene-h2 anim-up ad-0">
          Know more <br/><span className="serif-italic">about us.</span>
        </h2>
        <div className="btn-row anim-fade ad-2" style={{ justifyContent: 'center', marginTop: '32px' }}>
          <button 
            className="btn-primary-cta"
            onClick={() => window.location.href = '/about'}
          >
            About Us
          </button>
        </div>
      </div>
    ),
  },
]

/* ── Opacity helper: full in centre, fades at both edges ── */
function opacity(p, start, end) {
  const fade = 0.04
  if (p < start || p > end) return 0
  const fadeIn = start <= 0 ? 1 : Math.min(1, (p - start) / fade)
  const fadeOut = end >= 1 ? 1 : Math.min(1, (end - p) / fade)
  return Math.min(fadeIn, fadeOut)
}

/* ── Slide translation driven by opacity ── */
function translate(side, op) {
  const px = (1 - op) * 44
  if (side === 'left')  return `translateX(-${px}px)`
  if (side === 'right') return `translateX(${px}px)`
  return `translateY(${px * 0.45}px)`
}

/* ════════════════════════════════════════════════════════════════ */
export default function LandingClient() {
  const [loading, setLoading]       = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [progress, setProgress]     = useState(0)
  const [isMobile, setIsMobile]     = useState(false)

  /* scroll-driver + video refs — layout unchanged */
  const driverRef = useRef(null)
  const videoRef  = useRef(null)
  const rafRef    = useRef(null)

  /* ── Check Mobile for Animation Tuning ── */
  useEffect(() => {
    setIsMobile(window.innerWidth <= 768)
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /* ── 400ms loading dismiss ── */
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), 400)
    return () => clearTimeout(t)
  }, [])

  /* ── Scroll → progress → video.currentTime ── */
  useEffect(() => {
    const video = videoRef.current

    const onScroll = () => {
      const driver = driverRef.current
      if (!driver || !video) return

      const rect    = driver.getBoundingClientRect()
      const total   = driver.offsetHeight - window.innerHeight
      const scrolled = Math.max(0, -rect.top)
      const p       = Math.min(1, scrolled / total)

      setProgress(p)

      const target = p * (video.duration || 0)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        if (video.readyState >= 2) video.currentTime = target
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/feed' })
  }

  /* Logo visibility (progress 0–0.04) */
  const logoOp = opacity(progress, 0, 0.04)
  /* Intro visibility (progress 0.05–0.15) */
  const introOp = opacity(progress, 0.05, 0.15)
  /* CTA visibility (progress 0.90–1.0) */
  const ctaOp   = opacity(progress, 0.90, 1.0)
  
  /* On mobile, disable the center translate to keep text left-aligned and readable */
  const ctaTx   = isMobile ? 'translateY(0px)' : translate('center', ctaOp)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* 600vh scroll driver */}
      <div ref={driverRef} className="scroll-driver">
        <div className="stage">

          {/* ── Video layer — UNCHANGED ── */}
          <div className="video-layer">
            <video
              ref={videoRef}
              src="/showup-demo.mp4"
              muted
              playsInline
              preload="auto"
              fetchPriority="high"
            />
          </div>

          {/* ── Cinematic vignette: Darkened for pure text readability ── */}
          <div className="vignette" />

          {/* ══ BIG LOGO SCENE (First frame) ══ */}
          {logoOp > 0 && (
            <div className="scene center" style={{ opacity: logoOp }}>
              <div className="scene-inner" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
                <img 
                  src="/logo.png" 
                  alt="ShowUp Logo" 
                  className="intro-logo anim-fade ad-0" 
                />
              </div>
            </div>
          )}

          {/* ══ INTRO SCENE (Second frame) ══ */}
          {introOp > 0 && (
            <div className="scene left" style={{ opacity: introOp }}>
              <div className="scene-inner">

                <div className="content-block" style={{ maxWidth: '620px' }}>
                  
                  {/* Label */}
                  <div className="overline anim-fade ad-0">
                    FOR INDIAN COLLEGE STUDENTS
                  </div>

                  {/* Headline — three lines, each wrapped for clip-reveal */}
                  <div style={{ marginBottom: 32 }}>
                    <span className="hero-line-wrap">
                      <span className="hero-line anim-up ad-1">BUILD.</span>
                    </span>
                    <span className="hero-line-wrap">
                      <span className="hero-line anim-up ad-2">SHARE.</span>
                    </span>
                    <span className="hero-line-wrap">
                      <span className="hero-line serif anim-up ad-3">ShowUp.</span>
                    </span>
                  </div>

                  {/* Subtext */}
                  <p className="hero-sub anim-fade ad-2">
                    Where Indian college students showcase projects,
                    find hackathon teammates &amp; get discovered.
                  </p>

                  {/* Buttons */}
                  <div className="btn-row anim-up ad-3">
                    <button
                      id="hero-get-started-btn"
                      className="btn-primary-cta"
                      onClick={handleSignIn}
                      disabled={loading}
                    >
                      {loading ? <span className="btn-spinner" /> : 'Get Started'}
                    </button>
                    <button
                      id="hero-explore-btn"
                      className="btn-ghost-cta"
                      onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                      disabled={loading}
                    >
                      Explore Platform
                    </button>
                  </div>
                  
                </div>

              </div>
            </div>
          )}

          {/* ══ SCROLL SCENES — CSS entrance animations ══ */}
          {SCENES.map((scene) => {
            const op = opacity(progress, scene.start, scene.end)
            if (op === 0) return null
            /* On mobile, force all scenes to the left for better readability */
            const sideClass = isMobile ? 'left' : scene.side
            const tx = isMobile ? translate('left', op) : translate(scene.side, op)
            
            return (
              <div
                key={scene.id}
                className={`scene ${sideClass}`}
                style={{ opacity: op }}
              >
                <div
                  className="scene-inner"
                  style={{ transform: tx }}
                >
                  {scene.render()}
                </div>
              </div>
            )
          })}

          {/* ══ CTA SCENE ══ */}
          {ctaOp > 0 && (
            <div className={`scene ${isMobile ? 'left' : 'center'}`} style={{ opacity: ctaOp }}>
              <div className="scene-inner" style={{ transform: ctaTx }}>
                <div className="content-block cta-block">
                  <div className="overline">Ready to build?</div>
                  <h2 className="scene-h2">
                    Your next team<br /><span className="serif-italic">is already here.</span>
                  </h2>
                  <p className="cta-sub">
                    Join hundreds of builders from IITs, NITs, BITs &amp; beyond.
                  </p>
                  <div style={{ marginTop: '12px', marginBottom: '8px', width: '100%' }}>
                    <button
                      id="cta-signin-btn"
                      onClick={handleSignIn}
                      disabled={loading}
                      className="btn-cta"
                    >
                      {loading ? (
                        <span className="btn-spinner" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.657 12.016 17.64 10.71 17.64 9.2Z" fill="#0A0A0A"/>
                          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#0A0A0A"/>
                          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#0A0A0A"/>
                          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#0A0A0A"/>
                        </svg>
                      )}
                      Continue with Google
                    </button>
                  </div>
                  <p className="cta-fine">Free forever · No credit card required</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Scroll hint ── */}
          <div className="scroll-hint" style={{ opacity: progress < 0.04 ? 1 : 0 }}>
            <span className="scroll-hint-label">Scroll to explore</span>
            <div className="scroll-arrow" />
          </div>

          {/* ── Loading overlay ── */}
          <div className={`loading-overlay${videoReady ? ' hidden' : ''}`}>
            <div className="loading-logo">
              SHOW<span className="hl">UP</span>
            </div>
            <div className="loading-bar-track">
              <div className="loading-bar-fill" />
            </div>
            <span className="loading-text">Loading experience…</span>
          </div>

        </div>
      </div>
    </>
  )
}
