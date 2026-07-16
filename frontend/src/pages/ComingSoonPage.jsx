import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function ComingSoonPage({
  title = "Top Devs",
  message = "We're building a definitive leaderboard for India's best student developers. Keep shipping projects and improving your credibility score — you might just be #1 when we launch!"
}) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <Navbar />
      <main className="flex-1 min-w-0 md:ml-64 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-10 max-w-lg w-full">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <span className="material-symbols-outlined text-3xl text-violet-400 animate-bounce">
              construction
            </span>
          </div>
          <h1 className="font-grotesk font-black text-4xl text-on-surface uppercase mb-3">
            {title}
          </h1>
          <h2 className="font-mono font-bold text-xl text-on-surface-variant mb-6 uppercase">
            Coming Soon
          </h2>
          <p className="text-on-surface mb-8 leading-relaxed">
            {message}
          </p>
          <Link to="/feed" className="btn-primary py-3 px-8 text-sm inline-flex">
            <span className="material-symbols-outlined text-base">rocket_launch</span>
            Explore Feed
          </Link>
        </div>
      </main>
    </div>
  );
}
