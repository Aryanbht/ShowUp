import { useState } from "react";
import { projectsApi } from "../api";

const DIMENSION_ICONS = {
  problem_clarity: "lightbulb",
  tech_appropriateness: "settings",
  complexity_for_year: "school",
  industry_relevance: "business_center",
  completeness: "checklist",
  code_quality_signals: "code",
  presentation: "star",
};

const scoreColor = (s) =>
  s >= 8 ? "text-emerald-400" : s >= 6 ? "text-amber-400" : "text-red-400";

const barColor = (s) =>
  s >= 8 ? "bg-emerald-500" : s >= 6 ? "bg-amber-500" : "bg-red-500";

function ScoreBar({ score, max = 10 }) {
  return (
    <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div
        className={`h-full ${barColor(score)} rounded-full transition-all duration-700`}
        style={{ width: `${(score / max) * 100}%` }}
      />
    </div>
  );
}

function DimensionCard({ dim, data }) {
  const [open, setOpen] = useState(false);
  const icon = DIMENSION_ICONS[dim] || "analytics";

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#111122" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ hover: { background: "rgba(255,255,255,0.03)" } }}
      >
        <span className="material-symbols-outlined text-violet-400 text-base flex-shrink-0">{icon}</span>
        <span className="font-mono text-xs font-semibold uppercase tracking-wide text-on-surface flex-1">{data.label}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreBar score={data.score} />
          <span className={`font-mono font-black text-sm ${scoreColor(data.score)} w-6 text-right`}>
            {data.score}
          </span>
        </div>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0D0D1A" }}>
          <p className="text-sm text-on-surface leading-relaxed">{data.feedback}</p>
        </div>
      )}
    </div>
  );
}

function HistoryMiniChart({ history }) {
  if (!history || history.length < 2) return null;
  const scores = history.map((h) => h.score ?? 0);
  const max = 10;
  const h = 40;
  const w = 160;
  const step = w / (scores.length - 1);

  const points = scores
    .map((s, i) => `${i * step},${h - (s / max) * h}`)
    .join(" ");

  return (
    <div className="mt-3">
      <p className="label-mono mb-2">Score history ({history.length} analyses)</p>
      <div className="flex items-end gap-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-40 h-10 flex-shrink-0">
          <polyline
            points={points}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {scores.map((s, i) => (
            <circle key={i} cx={i * step} cy={h - (s / max) * h} r="2.5" fill="#8B5CF6" />
          ))}
        </svg>
        <div className="flex gap-4 font-mono text-xs text-on-surface-variant">
          <span>First: <strong className="text-on-surface">{scores[0]}</strong></span>
          <span>Latest: <strong className={`${scoreColor(scores[scores.length - 1])}`}>{scores[scores.length - 1]}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function AIAnalysisPanel({
  analysis,
  onAnalyse,
  loading,
  canAnalyse,
  canAnalyzeResult,
  queueMessage,
  analysisHistory,
  aiAnalysisHidden,
}) {
  if (aiAnalysisHidden) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(138,138,174,0.1)", border: "1px solid rgba(138,138,174,0.2)" }}>
          <span className="material-symbols-outlined text-3xl text-on-surface-variant">lock</span>
        </div>
        <h3 className="font-grotesk font-bold text-base text-on-surface mb-1">Analysis Hidden</h3>
        <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
          The author has chosen to keep the AI feedback for this project private.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <span className="material-symbols-outlined text-3xl text-violet-400">psychology</span>
        </div>
        <h3 className="font-grotesk font-bold text-lg text-on-surface mb-2">Get AI Feedback</h3>
        <p className="text-sm text-on-surface-variant mb-5 max-w-sm mx-auto">
          AI will review your project across 7 dimensions and give you an honest score.
        </p>

        {canAnalyse ? (
          <>
            {queueMessage && (
              <div className="rounded-xl mb-4 px-3 py-2 text-left" style={{ background: "rgba(109,40,217,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <p className="font-mono text-xs text-violet-300 flex items-start gap-1">
                  <span className="material-symbols-outlined text-sm flex-shrink-0">queue</span>
                  {queueMessage}
                </p>
              </div>
            )}
            <button onClick={onAnalyse} disabled={loading} className="btn-primary mx-auto">
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Analysing... (30–60s)
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  Analyse with AI →
                </>
              )}
            </button>
          </>
        ) : (
          <p className="label-mono text-on-surface-variant">
            {canAnalyzeResult?.can_analyze_reason || "Sign in as the project owner to analyse"}
          </p>
        )}
      </div>
    );
  }

  const {
    overall_score,
    score_label,
    project_tagline,
    dimensions,
    next_steps,
    brutal_honest_line,
    strengths,
  } = analysis;

  const canReanalyze = canAnalyzeResult?.can_analyze;
  const reanalyzeReason = canAnalyzeResult?.can_analyze_reason;

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(139,92,246,0.08)" }}>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-violet-400 text-xl">auto_awesome</span>
          <span className="font-mono font-bold uppercase text-sm text-on-surface">AI Analysis</span>
        </div>
        <span className="label-mono text-on-surface-variant">AI Powered</span>
      </div>

      <div className="p-5 space-y-6">
        {/* Score + label */}
        <div className="flex items-start justify-between gap-4 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <div className={`font-mono font-black text-5xl ${scoreColor(overall_score)}`}>
              {overall_score}
              <span className="text-lg text-on-surface-variant">/10</span>
            </div>
            <div className="font-mono text-xs uppercase text-on-surface-variant mt-1">{score_label}</div>
            {project_tagline && (
              <p className="text-sm italic text-on-surface mt-2 max-w-sm">"{project_tagline}"</p>
            )}
          </div>
          <div className="text-right">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center"
              style={{
                background: overall_score >= 8 ? "rgba(16,185,129,0.12)" : overall_score >= 6 ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.12)",
                border: `1px solid ${overall_score >= 8 ? "rgba(16,185,129,0.3)" : overall_score >= 6 ? "rgba(251,191,36,0.3)" : "rgba(248,113,113,0.3)"}`,
                boxShadow: `0 0 20px ${overall_score >= 8 ? "rgba(16,185,129,0.15)" : overall_score >= 6 ? "rgba(251,191,36,0.15)" : "rgba(248,113,113,0.15)"}`,
              }}>
              <span className={`font-mono font-black text-3xl ${scoreColor(overall_score)}`}>{overall_score}</span>
            </div>
          </div>
        </div>

        {/* History sparkline */}
        {analysisHistory && <HistoryMiniChart history={analysisHistory} />}

        {/* 7 Dimensions */}
        {dimensions && (
          <div>
            <p className="label-mono mb-3">7 Dimensions</p>
            <div className="space-y-1.5">
              {Object.entries(dimensions).map(([key, val]) => (
                <DimensionCard key={key} dim={key} data={val} />
              ))}
            </div>
          </div>
        )}

        {/* Brutal honest line */}
        {brutal_honest_line && (
          <div className="rounded-xl px-4 py-4" style={{ background: "rgba(109,40,217,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <p className="label-mono text-violet-400 mb-2">Honest take</p>
            <p className="font-grotesk font-bold text-base leading-snug text-on-surface">"{brutal_honest_line}"</p>
          </div>
        )}

        {/* Strengths */}
        {strengths && strengths.length > 0 && (
          <div>
            <p className="label-mono mb-2">Genuine Strengths</p>
            <ul className="space-y-1.5">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-emerald-400 text-base mt-0.5 flex-shrink-0">check_circle</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next steps */}
        {next_steps && next_steps.length > 0 && (
          <div>
            <p className="label-mono mb-2">Next Steps</p>
            <ol className="space-y-2">
              {next_steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                  <span className="font-mono font-bold text-violet-400 flex-shrink-0 mt-0.5">0{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Re-analyse */}
        {canAnalyse && (
          <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {canReanalyze ? (
              <>
                {queueMessage && (
                  <p className="font-mono text-xs text-violet-400 mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">queue</span>
                    {queueMessage}
                  </p>
                )}
                <button onClick={onAnalyse} disabled={loading} className="btn-secondary w-full justify-center">
                  {loading ? (
                    <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Re-analysing...</>
                  ) : (
                    <><span className="material-symbols-outlined text-base">refresh</span>Re-analyse</>
                  )}
                </button>
              </>
            ) : (
              <p className="font-mono text-xs text-on-surface-variant text-center">
                <span className="material-symbols-outlined text-sm align-middle mr-1">lock</span>
                {reanalyzeReason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
