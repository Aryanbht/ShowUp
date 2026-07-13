import { useState } from "react";
import Navbar from "../components/Navbar";
import SkillsInput from "../components/SkillsInput";
import { studentsApi } from "../api";
import { Link } from "react-router-dom";

export default function FindTeammatePage() {
  const [hackathonType, setHackathonType] = useState("Online");
  const [region, setRegion] = useState("");
  const [skills, setSkills] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await studentsApi.findTeammates({
        type: hackathonType,
        region: hackathonType === "Offline" ? region : "",
        skills: skills,
      });
      if (res.data.success) {
        setResults(res.data.data);
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Navbar />
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <header className="sticky top-0 z-20 border-b-2 border-ink px-6 py-4 bg-surface">
          <h1 className="font-grotesk font-bold text-xl text-on-surface">Find Teammate</h1>
          <p className="label-mono text-on-surface-variant mt-0.5">Find the perfect partner for your next hackathon</p>
        </header>

        <div className="p-6 max-w-4xl mx-auto">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="card-brutal p-6 mb-8">
            <h2 className="font-grotesk font-bold text-lg mb-4 uppercase">Search Criteria</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="label-mono block mb-1.5">Type of Hackathon</label>
                <div className="relative">
                  <select
                    value={hackathonType}
                    onChange={(e) => setHackathonType(e.target.value)}
                    className="input-brutal w-full appearance-none cursor-pointer pr-10"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    arrow_drop_down
                  </span>
                </div>
              </div>

              {hackathonType === "Offline" && (
                <div>
                  <label className="label-mono block mb-1.5">State / Region</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="input-brutal w-full"
                    placeholder="e.g. Maharashtra, Bangalore, Delhi"
                    required
                  />
                </div>
              )}
            </div>

            <div className="mb-6">
              <SkillsInput value={skills} onChange={setSkills} />
              <p className="text-xs text-on-surface-variant mt-2 font-mono">Minimum skills needed in your partner</p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-base">search</span>
              )}
              SEARCH
            </button>
          </form>

          {/* Results Area */}
          {hasSearched && (
            <div>
              <h2 className="font-grotesk font-bold text-lg mb-4 uppercase flex items-center gap-2">
                <span className="material-symbols-outlined">group</span>
                Matched Profiles ({results.length})
              </h2>

              {results.length === 0 ? (
                <div className="text-center p-10 border-2 border-dashed border-ink text-on-surface-variant font-mono text-sm bg-surface-container">
                  No teammates found matching your criteria. Try loosening your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((student) => (
                    <div key={student.id} className="card-brutal p-5 flex flex-col bg-surface">
                      <div className="flex items-start gap-4 mb-3">
                        {student.avatar_url ? (
                          <img src={student.avatar_url} alt={student.name} className="w-12 h-12 brutalist-border object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-primary-container border-2 border-ink flex items-center justify-center">
                            <span className="font-mono font-bold text-lg text-on-primary-container">
                              {student.name?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{student.name}</h3>
                          <p className="text-xs font-mono text-on-surface-variant truncate">{student.college}</p>
                          {student.location && (
                            <p className="text-xs text-on-surface mt-1 flex items-center gap-1 font-mono font-bold">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {student.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="flex-1 mb-4">
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {student.skills.slice(0, 5).map((sk) => {
                            const isMatch = student.matched_skills?.includes(sk.toLowerCase());
                            return (
                              <span key={sk} className={`text-[10px] px-1.5 py-0.5 border border-ink ${isMatch ? 'bg-[#4f378a] text-white font-bold' : 'bg-surface-container text-on-surface-variant'}`}>
                                {sk}
                              </span>
                            );
                          })}
                          {student.skills.length > 5 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-on-surface-variant border border-transparent font-mono font-bold">
                              +{student.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-3 border-t-2 border-ink border-dashed">
                        <div className="text-xs font-mono text-on-surface-variant">
                          Score: <span className="font-bold text-on-surface">{student.credibility_score}</span>
                        </div>
                        <Link to={`/u/${student.id}`} className="text-xs font-bold uppercase hover:text-primary transition-colors flex items-center gap-1">
                          View Profile <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
