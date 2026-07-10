import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { feedApi } from "../api";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "upload",
    title: "Upload Your Project",
    desc: "Add your project title, description, tech stack, GitHub link, and a screenshot. Takes 2 minutes.",
  },
  {
    step: "02",
    icon: "auto_awesome",
    title: "Get AI Feedback",
    desc: "AI reviews your project and gives you a score out of 10 with strengths, improvements, and next steps.",
  },
  {
    step: "03",
    icon: "share",
    title: "Share Your Profile",
    desc: "Your unique profile URL is ready to share. Drop it in your resume, LinkedIn, or DM it to recruiters.",
  },
];

/** Animates a number from 0 → target over ~1.4 s with an ease-out curve */
function useCountUp(target, duration = 1400) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const numTarget = parseInt(target, 10);
    if (isNaN(numTarget) || numTarget === 0) {
      setDisplay(0);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * numTarget));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function AnimatedStat({ value, label, border }) {
  const animated = useCountUp(value);
  // If value is a plain number string, show animated; otherwise show raw (e.g. "98%")
  const isNumeric = /^\d+$/.test(String(value));

  return (
    <div className={`py-4 px-2 sm:py-6 sm:px-8 text-center flex-1 ${border ? "border-r-2 border-ink" : ""}`}>
      <p className="font-mono font-black text-xl sm:text-3xl text-on-surface leading-none">
        {isNumeric ? animated.toLocaleString() : value}
      </p>
      <p className="font-mono text-[9px] sm:text-xs uppercase text-on-surface-variant mt-1 leading-tight">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState([
    { value: "0", label: "Student Profiles" },
    { value: "0", label: "Projects Uploaded" },
    { value: "0", label: "Colleges" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await feedApi.stats();
        const data = res.data.data;
        setStats([
          { value: data.students.toLocaleString(), label: "Student Profiles" },
          { value: data.projects.toLocaleString(), label: "Projects Uploaded" },
          { value: data.colleges.toLocaleString(), label: "Colleges" },
        ]);
      } catch (err) {
        // Fallback or leave as zeroes
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b-2 border-ink flex items-center justify-between px-6 md:px-12 h-16">
        <div className="font-mono font-black text-xl uppercase tracking-tight text-on-surface">
          ShowUp
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="btn-secondary py-2 px-4 text-xs">
            Sign In
          </Link>
          <Link to="/auth" className="btn-primary py-2 px-4 text-xs">
            Get Started
          </Link>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="pt-16 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-20 text-center max-w-5xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border-2 border-ink px-3 py-1.5 mb-8 bg-tertiary-fixed" style={{ boxShadow: "2px 2px 0 #2A2A2A" }}>
            <span className="material-symbols-outlined text-sm text-on-tertiary-fixed">rocket_launch</span>
            <span className="font-mono text-xs font-bold uppercase text-on-tertiary-fixed">For Indian Students → No Experience, Full Credibility</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-7xl text-on-surface leading-none mb-6 text-balance">
            Your Work
            <br />
            <span className="text-primary relative inline-block">
              Speaks First.
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-tertiary-container" />
            </span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
            ShowUp is the portfolio platform for Indian college students. Upload your projects, get
            AI-powered feedback, and share a public link that proves you can build — not just study.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="btn-primary text-base py-4 px-10">
              <span className="material-symbols-outlined">person_add</span>
              Create Your Profile
            </Link>
            <Link to="/feed" className="btn-secondary text-base py-4 px-10">
              <span className="material-symbols-outlined">explore</span>
              Explore Projects
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t-2 border-b-2 border-ink grid grid-cols-3 w-full">
          {stats.map((stat, i) => (
            <AnimatedStat
              key={i}
              value={stat.value}
              label={stat.label}
              border={i < 2}
            />
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <p className="label-mono mb-2">The Process</p>
          <h2 className="font-grotesk font-bold text-3xl md:text-4xl text-on-surface">
            Three steps to credibility
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0 border-2 border-ink">
          {HOW_IT_WORKS.map((item, i) => (
            <div
              key={i}
              className={`p-8 ${i < 2 ? "md:border-r-2 border-b-2 md:border-b-0 border-ink" : ""}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="font-mono font-black text-4xl text-on-surface-variant" style={{ opacity: 0.55 }}>{item.step}</span>
                <span className="material-symbols-outlined text-primary text-2xl mt-2">{item.icon}</span>
              </div>
              <h3 className="font-grotesk font-bold text-lg text-on-surface mb-2">{item.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="border-t-2 border-b-2 border-ink bg-ink text-surface py-16 px-6 text-center">
        <h2 className="font-serif text-3xl md:text-5xl mb-4">
          Stop waiting for experience.
        </h2>
        <p className="font-mono text-sm text-surface-variant mb-8 max-w-lg mx-auto">
          Every senior developer started with a profile. Start yours today and let your projects do the talking.
        </p>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 bg-surface text-ink border-2 border-surface px-8 py-4 font-mono font-bold uppercase text-sm rounded-md"
          style={{ boxShadow: "4px 4px 0 #4f378a", transition: "all 0.2s ease" }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "#ede7f6";
            e.currentTarget.style.borderColor = "#4f378a";
            e.currentTarget.style.color = "#4f378a";
            e.currentTarget.style.boxShadow = "4px 4px 0 #7c4dff";
            e.currentTarget.style.transform = "translate(-2px, -2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "";
            e.currentTarget.style.borderColor = "";
            e.currentTarget.style.color = "";
            e.currentTarget.style.boxShadow = "4px 4px 0 #4f378a";
            e.currentTarget.style.transform = "";
          }}
        >
          <span className="material-symbols-outlined">star</span>
          Join for Free — No Experience Needed
        </Link>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-6 text-center border-t-2 border-ink">
        <p className="font-mono text-xs text-on-surface-variant uppercase">
          ShowUp © 2025 — Built for Indian Students 🇮🇳
        </p>
      </footer>
    </div>
  );
}
