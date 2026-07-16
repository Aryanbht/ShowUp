import { Link } from "react-router-dom";
import TechPill from "./TechPill";

export default function ProjectCard({ project }) {
  const { id, title, description, tech_stack, screenshot_url, view_count, ai_analysis, ai_analysis_used, student, created_at } = project;

  const score = ai_analysis?.overall_score;

  // Score badge color (dark theme)
  const scoreBadge =
    score >= 8
      ? { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.35)", text: "#6EE7B7" }
      : score >= 6
      ? { bg: "rgba(251, 191, 36, 0.12)", border: "rgba(251, 191, 36, 0.35)", text: "#FCD34D" }
      : { bg: "rgba(248, 113, 113, 0.12)", border: "rgba(248, 113, 113, 0.35)", text: "#FCA5A5" };

  return (
    <Link to={`/project/${id}`} className="block group">
      <article className="glass-card h-full flex flex-col">
        {/* Screenshot */}
        <div className="relative overflow-hidden aspect-video"
          style={{ background: "#0D0D1A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {screenshot_url ? (
            <img
              src={screenshot_url}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-30">image</span>
            </div>
          )}

          {/* Gradient overlay on screenshot */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* AI Score Badge */}
          {ai_analysis_used && score !== undefined && (
            <div
              className="absolute top-2.5 right-2.5 font-mono font-bold text-xs px-2.5 py-1 rounded-full"
              style={{ background: scoreBadge.bg, border: `1px solid ${scoreBadge.border}`, color: scoreBadge.text }}
            >
              AI {score}/10
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-2.5">
          {/* Student info */}
          {student && (
            <div className="flex items-center gap-2">
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.name}
                  className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
                  style={{ border: "1px solid rgba(255,255,255,0.12)" }}
                />
              ) : (
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
                  <span className="font-mono font-bold text-[10px] text-white">
                    {student.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0">
                <span className="font-semibold text-xs text-on-surface truncate block">{student.name}</span>
                <span className="font-mono text-[10px] text-on-surface-variant truncate block">{student.college}</span>
              </div>
            </div>
          )}

          {/* Title */}
          <h3 className="font-grotesk font-bold text-base text-on-surface leading-tight line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-on-surface-variant line-clamp-2 flex-1 leading-relaxed">
              {description}
            </p>
          )}

          {/* Tech stack */}
          {tech_stack && tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tech_stack.slice(0, 4).map((tag) => (
                <TechPill key={tag} tag={tag} />
              ))}
              {tech_stack.length > 4 && (
                <span className="tech-pill text-on-surface-variant">+{tech_stack.length - 4}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="flex items-center gap-1 font-mono text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">visibility</span>
              {view_count?.toLocaleString() || 0}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              {created_at ? new Date(created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
