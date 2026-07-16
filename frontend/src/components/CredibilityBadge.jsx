const LEVELS = {
  Beginner: {
    style: { background: "rgba(138,138,174,0.12)", border: "1px solid rgba(138,138,174,0.25)", color: "#9090AE" },
    icon: "🌱",
  },
  Rising: {
    style: { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#C4B5FD" },
    icon: "⚡",
  },
  Notable: {
    style: { background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.35)", color: "#FCD34D" },
    icon: "🔥",
  },
  Elite: {
    style: {
      background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.15))",
      border: "1px solid rgba(139,92,246,0.45)",
      color: "#DDD6FE",
    },
    icon: "👑",
  },
};

export default function CredibilityBadge({ score, level, showScore = true }) {
  const lvl = level || getLevel(score);
  const { style, icon } = LEVELS[lvl] || LEVELS["Beginner"];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 font-nunito text-xs font-bold uppercase tracking-wider rounded-full"
      style={style}
    >
      <span>{icon}</span>
      <span>{lvl}</span>
      {showScore && <span style={{ opacity: 0.7 }}>· {score}</span>}
    </span>
  );
}

function getLevel(score) {
  if (score >= 100) return "Elite";
  if (score >= 50) return "Notable";
  if (score >= 20) return "Rising";
  return "Beginner";
}
