'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'

/* ═══════════════════════════════════════════════════════════════════
   SCROLL-DRIVEN VIDEO LANDING
   · Layout, video, scroll mechanics: UNCHANGED
   · Typography: Bebas Neue (headlines) + IBM Plex Mono (body/labels)
   · Hero: GSAP timeline on mount
   · Scroll scenes: CSS entrance animations triggered on mount
═══════════════════════════════════════════════════════════════════ */

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: auto !important; }
  body { background: #000; overflow-x: hidden; }

  /* ── Layout — UNCHANGED ── */
  .scroll-driver { position: relative; height: 600vh; }
  .stage {
    position: sticky; top: 0;
    width: 100vw; height: 100vh; overflow: hidden;
  }
  .video-layer { position: absolute; inset: 0; }
  .video-layer video {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .vignette {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.62) 100%),
      linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 25%,
        transparent 70%, rgba(0,0,0,0.58) 100%);
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
  .scene-inner  { max-width: 660px; pointer-events: auto; }

  /* ── Labels ── */
  .overline {
    display: block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 400;
    letter-spacing: 0.15em; text-transform: uppercase;
    color: #b8ff57;
    background: none; padding: 0;
    margin-bottom: 24px;
  }
  .overline-badge {
    display: inline-block;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: #0a0a0a; background: #b8ff57;
    padding: 4px 10px; border-radius: 0;
    margin-bottom: 20px;
  }

  /* ── Hero headline ── */
  .hero-line-wrap { overflow: hidden; display: block; }
  .hero-line {
    display: block;
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(72px, 10vw, 120px);
    font-weight: 400; color: #fff;
    line-height: 0.92; letter-spacing: 0.02em;
    will-change: transform, opacity;
  }
  .hero-line.lime {
    display: inline-block;
    color: #0a0a0a; background: #b8ff57;
    padding: 2px 10px 8px;
    line-height: 0.96;
  }

  /* ── Hero subtext ── */
  .hero-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px; font-weight: 400;
    color: rgba(255,255,255,0.65);
    max-width: 480px; line-height: 1.7;
    margin-bottom: 32px;
    will-change: opacity;
  }

  /* ── Section headings ── */
  .scene-h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(56px, 8vw, 96px);
    font-weight: 400; line-height: 0.95;
    color: #fff; letter-spacing: 0.02em;
    margin-bottom: 20px;
  }

  /* ── Body text ── */
  .scene-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px; font-weight: 400;
    color: rgba(255,255,255,0.65);
    max-width: 420px; line-height: 1.7;
  }

  /* ── Buttons ── */
  .btn-row { display: flex; gap: 14px; flex-wrap: wrap; }

  .btn-primary-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: #b8ff57; color: #0a0a0a;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
    padding: 14px 28px;
    border: none; border-radius: 0; cursor: pointer;
    transition: opacity 0.15s, transform 0.12s; outline: none;
    will-change: opacity, transform;
  }
  .btn-primary-cta:hover:not(:disabled) {
    opacity: 0.85; transform: translateY(-2px);
  }
  .btn-primary-cta:active:not(:disabled) { transform: translateY(0); }
  .btn-primary-cta:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-ghost-cta {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; color: #fff;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px; font-weight: 400; letter-spacing: 0.04em;
    padding: 14px 28px;
    border: 1.5px solid rgba(255,255,255,0.45); border-radius: 0;
    cursor: pointer; transition: border-color 0.15s, transform 0.12s; outline: none;
  }
  .btn-ghost-cta:hover { border-color: rgba(255,255,255,0.9); transform: translateY(-2px); }

  /* ── CTA scene (final) ── */
  .cta-block {
    display: flex; flex-direction: column;
    align-items: flex-start; gap: 16px;
  }
  .cta-sub {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 14px; color: rgba(255,255,255,0.5);
  }
  .btn-cta {
    display: inline-flex; align-items: center; gap: 10px;
    background: #b8ff57; color: #0a0a0a;
    font-family: 'IBM Plex Mono', monospace;
    font-weight: 600; font-size: 13px; letter-spacing: 0.06em;
    padding: 16px 32px; border: none; border-radius: 0;
    cursor: pointer; transition: opacity 0.15s, transform 0.12s; outline: none;
  }
  .btn-cta:hover:not(:disabled) { opacity: 0.85; transform: translateY(-2px); }
  .btn-cta:active:not(:disabled) { transform: translateY(0); }
  .btn-cta:disabled { opacity: 0.6; cursor: not-allowed; }
  .cta-fine {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; color: rgba(255,255,255,0.28); letter-spacing: 0.06em;
  }

  /* ── Stats ── */
  .stats-grid {
    display: flex; gap: clamp(20px, 4vw, 64px);
    align-items: flex-end; justify-content: center;
  }
  .stat-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .stat-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 7vw, 80px);
    font-weight: 400; color: #b8ff57;
    line-height: 1; letter-spacing: 0.02em;
  }
  .stat-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; font-weight: 400;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(255,255,255,0.45);
  }

  /* ── Scroll hint ── */
  .scroll-hint {
    position: absolute; bottom: 36px; left: 8vw;
    display: flex; flex-direction: column; align-items: flex-start;
    gap: 8px; pointer-events: none; transition: opacity 0.5s;
  }
  .scroll-hint-label {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px; font-weight: 400;
    letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
  .scroll-arrow {
    width: 18px; height: 18px;
    border-right: 2px solid rgba(255,255,255,0.25);
    border-bottom: 2px solid rgba(255,255,255,0.25);
    transform: rotate(45deg);
    animation: arrowBounce 1.5s ease-in-out infinite;
  }
  @keyframes arrowBounce {
    0%,100% { transform: rotate(45deg) translateY(0); }
    50%      { transform: rotate(45deg) translateY(6px); }
  }

  /* ── Progress bar ── */
  .progress-track {
    position: absolute; bottom: 0; left: 0;
    width: 100%; height: 3px; background: rgba(255,255,255,0.08);
  }
  .progress-fill { height: 100%; background: #b8ff57; will-change: width; }

  /* ── Loading ── */
  .loading-overlay {
    position: absolute; inset: 0; background: #000;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 20px; z-index: 99;
    transition: opacity 0.25s ease;
  }
  .loading-overlay.hidden { opacity: 0; pointer-events: none; }
  .loading-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px; font-weight: 400;
    color: #fff; letter-spacing: 0.04em; line-height: 1;
  }
  .loading-logo .hl { background: #b8ff57; color: #0a0a0a; padding: 0 8px; }
  .loading-bar-track {
    width: 180px; height: 2px;
    background: rgba(255,255,255,0.1); overflow: hidden;
  }
  .loading-bar-fill {
    height: 100%; background: #b8ff57; width: 40%;
    animation: loadSlide 1s ease-in-out infinite;
  }
  @keyframes loadSlide {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
  .loading-text {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; font-weight: 400;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }

  /* ── CSS scene-entrance animations (triggered on DOM mount) ── */
  @keyframes slideUp {
    from { transform: translateY(60px); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .anim-up   { animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) both; }
  .anim-fade { animation: fadeIn 0.6s ease both; }
  .ad-0 { animation-delay: 0s;     }
  .ad-1 { animation-delay: 0.15s;  }
  .ad-2 { animation-delay: 0.3s;   }
  .ad-3 { animation-delay: 0.45s;  }

  /* ── Spinner ── */
  .btn-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(10,10,10,0.25); border-top-color: #0a0a0a;
    border-radius: 50%; animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 600px) {
    .scene { padding: 0 5vw; }
    .scroll-hint { left: 5vw; }
    .stats-grid { gap: 16px; }
  }
`

/* ── Scroll scenes (all except intro + CTA which are inlined in JSX) ──
   CSS entrance animations (anim-up / anim-fade + delay classes)
   re-trigger automatically each time element mounts into DOM.         */
const SCENES = [
  {
    id: 'build',
    start: 0.16,
    end: 0.32,
    side: 'left',
    render: () => (
      <div>
        <div className="overline-badge anim-fade ad-0">01 — Project Feed</div>
        <h2 className="scene-h2 anim-up ad-1">
          Share what<br />you build.
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
      <div>
        <div className="overline-badge anim-fade ad-0">02 — Teammates</div>
        <h2 className="scene-h2 anim-up ad-1">
          Find your<br />hackathon squad.
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
      <div>
        <div className="overline-badge anim-fade ad-0">03 — Connections</div>
        <h2 className="scene-h2 anim-up ad-1">
          No noise.<br />Just builders.
        </h2>
        <p className="scene-sub anim-fade ad-2">
          Real connections with people who ship.<br />
          Not LinkedIn spam.
        </p>
      </div>
    ),
  },
  {
    id: 'stats',
    start: 0.74,
    end: 0.88,
    side: 'center',
    render: () => (
      <div className="stats-grid">
        {[['500+', 'Colleges'], ['10K+', 'Projects'], ['2K+', 'Teams Formed']].map(([num, label], i) => (
          <div key={label} className={`stat-item anim-up ad-${i}`}>
            <span className="stat-num">{num}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
]

/* ── Opacity helper: full in centre, fades at both edges ── */
function opacity(p, start, end) {
  const fade = 0.04
  if (p < start || p > end) return 0
  return Math.min(
    Math.min(1, (p - start) / fade),
    Math.min(1, (end - p) / fade)
  )
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

  /* scroll-driver + video refs — layout unchanged */
  const driverRef = useRef(null)
  const videoRef  = useRef(null)
  const rafRef    = useRef(null)

  /* GSAP targets for hero intro */
  const heroLabelRef = useRef(null)
  const heroLine1Ref = useRef(null)
  const heroLine2Ref = useRef(null)
  const heroLine3Ref = useRef(null)
  const heroSubRef   = useRef(null)
  const heroBtnsRef  = useRef(null)

  /* ── 400ms loading dismiss ── */
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), 400)
    return () => clearTimeout(t)
  }, [])

  /* ── GSAP hero entrance (runs once on mount) ── */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    /* Label */
    tl.from(heroLabelRef.current, { opacity: 0, duration: 0.5 }, 0.1)

    /* Headline lines — clip-reveal via overflow:hidden wrapper */
    tl.from(heroLine1Ref.current, { y: 80, opacity: 0, duration: 0.8 }, 0.3)
    tl.from(heroLine2Ref.current, { y: 80, opacity: 0, duration: 0.8 }, 0.5)
    tl.from(heroLine3Ref.current, { y: 80, opacity: 0, duration: 0.8 }, 0.7)

    /* Subtext */
    tl.from(heroSubRef.current,   { opacity: 0, duration: 0.6 }, 1.0)

    /* Buttons */
    if (heroBtnsRef.current) {
      tl.from(heroBtnsRef.current.children, {
        opacity: 0, y: 16, duration: 0.5, stagger: 0.1,
      }, 1.2)
    }

    return () => { tl.kill() }
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

  /* Intro visibility (progress 0–0.14) */
  const introOp = opacity(progress, 0, 0.14)
  /* CTA visibility (progress 0.90–1.0) */
  const ctaOp   = opacity(progress, 0.90, 1.0)
  const ctaTx   = translate('center', ctaOp)

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

          {/* ── Cinematic vignette — UNCHANGED ── */}
          <div className="vignette" />

          {/* ══ INTRO SCENE — rendered with GSAP refs ══ */}
          {introOp > 0 && (
            <div className="scene left" style={{ opacity: introOp }}>
              <div className="scene-inner">

                {/* Label */}
                <div className="overline" ref={heroLabelRef}>
                  FOR INDIAN COLLEGE STUDENTS
                </div>

                {/* Headline — three lines, each wrapped for clip-reveal */}
                <div style={{ marginBottom: 28 }}>
                  <span className="hero-line-wrap">
                    <span className="hero-line" ref={heroLine1Ref}>BUILD.</span>
                  </span>
                  <span className="hero-line-wrap">
                    <span className="hero-line" ref={heroLine2Ref}>SHARE.</span>
                  </span>
                  <span className="hero-line-wrap">
                    <span className="hero-line lime" ref={heroLine3Ref}>SHOWUP.</span>
                  </span>
                </div>

                {/* Subtext */}
                <p className="hero-sub" ref={heroSubRef}>
                  Where Indian college students showcase projects,<br />
                  find hackathon teammates &amp; get discovered.
                </p>

                {/* Buttons */}
                <div className="btn-row" ref={heroBtnsRef}>
                  <button
                    id="hero-get-started-btn"
                    className="btn-primary-cta"
                    onClick={handleSignIn}
                    disabled={loading}
                  >
                    {loading ? <span className="btn-spinner" /> : 'Get Started →'}
                  </button>
                  <button
                    id="hero-explore-btn"
                    className="btn-ghost-cta"
                    onClick={handleSignIn}
                    disabled={loading}
                  >
                    Explore Projects
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ══ SCROLL SCENES — CSS entrance animations ══ */}
          {SCENES.map((scene) => {
            const op = opacity(progress, scene.start, scene.end)
            if (op === 0) return null
            return (
              <div
                key={scene.id}
                className={`scene ${scene.side}`}
                style={{ opacity: op }}
              >
                <div
                  className="scene-inner"
                  style={{ transform: translate(scene.side, op) }}
                >
                  {scene.render()}
                </div>
              </div>
            )
          })}

          {/* ══ CTA SCENE ══ */}
          {ctaOp > 0 && (
            <div className="scene left" style={{ opacity: ctaOp }}>
              <div className="scene-inner" style={{ transform: ctaTx }}>
                <div className="cta-block">
                  <div className="overline">Ready to build?</div>
                  <h2 className="scene-h2">
                    Your next team<br />is already here.
                  </h2>
                  <p className="cta-sub">
                    Join hundreds of builders from IITs, NITs, BITs &amp; beyond.
                  </p>
                  <button
                    id="cta-signin-btn"
                    onClick={handleSignIn}
                    disabled={loading}
                    className="btn-cta"
                  >
                    {loading ? (
                      <span className="btn-spinner" />
                    ) : (
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.657 12.016 17.64 10.71 17.64 9.2Z" fill="#0a0a0a"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#0a0a0a"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#0a0a0a"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#0a0a0a"/>
                      </svg>
                    )}
                    Get started with Google
                  </button>
                  <p className="cta-fine">Free · No credit card · 2 min setup</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Scroll hint ── */}
          <div className="scroll-hint" style={{ opacity: progress < 0.04 ? 1 : 0 }}>
            <span className="scroll-hint-label">Scroll to explore ↓</span>
            <div className="scroll-arrow" />
          </div>

          {/* ── Progress bar ── */}
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
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
