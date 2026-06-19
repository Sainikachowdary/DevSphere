import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const STATUS_COLOR = { planning: "var(--muted)", active: "var(--blue)", completed: "var(--green)", on_hold: "var(--orange)" };
const STATUS_LABEL = { planning: "Planning", active: "Active", completed: "Done", on_hold: "On Hold" };

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.2 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function ProjectRow({ p }) {
  const status = p.status || "active";
  return (
    <Link to={`/projects/${p.id}`} style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}
        className="dashboard-row">
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, var(--blue), var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
          {p.title?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${p.progress ?? 0}%`, height: "100%", background: "var(--accent)", borderRadius: 2, transition: "width .4s" }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{p.progress ?? 0}%</span>
          </div>
        </div>
        <span style={{ fontSize: 11, color: STATUS_COLOR[status], background: `${STATUS_COLOR[status]}18`, border: `1px solid ${STATUS_COLOR[status]}40`, borderRadius: 20, padding: "2px 9px", flexShrink: 0 }}>
          {STATUS_LABEL[status] ?? status}
        </span>
      </div>
    </Link>
  );
}

function Dashboard() {
  const [data, setData] = useState({ repositories: 0, projects: 0, certificates: 0, developer_score: 0, recent_projects: [] });
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username") || "Developer";

  useEffect(() => {
    Promise.all([
      api.get("dashboard/").then(r => setData(r.data)),
      api.get("accounts/profile/").then(r => setProfile(r.data))
    ]).finally(() => setLoading(false));
  }, []);

  const skills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const score = data.developer_score ?? 0;
  const level = Math.floor(score / 10) + 1;
  const scoreProgress = score % 10 * 10;

  const achievements = [
    data.projects >= 1 && { icon: "🚀", label: "First Launch", desc: "Created your first project" },
    skills.length >= 5 && { icon: "⚡", label: "Multi-Skilled", desc: "Added 5+ skills" },
    score >= 50 && { icon: "🏆", label: "Rising Star", desc: "Dev score reached 50" },
    data.repositories >= 5 && { icon: "📦", label: "Repo Master", desc: "5+ repositories synced" },
    data.certificates >= 1 && { icon: "🎓", label: "Certified", desc: "Added a certificate" },
  ].filter(Boolean);

  if (loading) return (
    <div><Navbar /><div className="app-layout"><Sidebar />
      <main className="main-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⚡</div>
          <div>Loading dashboard...</div>
        </div>
      </main>
    </div></div>
  );

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">

          {/* Page Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Welcome back, {username} 👋</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Here's what's happening with your developer profile.</div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
            <StatCard icon="🚀" label="Projects" value={data.projects} color="var(--blue)" sub="Total built" />
            <StatCard icon="📦" label="Repositories" value={data.repositories} color="var(--purple)" sub="GitHub synced" />
            <StatCard icon="🎓" label="Certificates" value={data.certificates} color="var(--orange)" sub="Earned so far" />
            <StatCard icon="🏆" label="Dev Score" value={score} color="var(--green)" sub={`Level ${level} Developer`} />
          </div>

          {/* Main Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>

            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Active Projects */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🎯 Active Projects</span>
                  <Link to="/projects" style={{ fontSize: 12, color: "var(--muted)" }}>View all →</Link>
                </div>
                {data.recent_projects.length === 0 ? (
                  <div className="empty-state" style={{ padding: "32px 0" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🎨</div>
                    <h3 style={{ fontSize: 14 }}>No projects yet</h3>
                    <Link to="/projects" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>+ New Project</Link>
                  </div>
                ) : (
                  <div>
                    {data.recent_projects.map(p => <ProjectRow key={p.id} p={p} />)}
                    <div style={{ paddingTop: 2, borderTop: "none" }} />
                  </div>
                )}
              </div>

              {/* Developer Score Progress */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>📈 Developer Score</div>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                    <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="8" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--blue)" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - scoreProgress / 100)}`}
                        strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "var(--blue)" }}>
                      {score}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Level {level} Developer</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
                      {10 - (score % 10)} more points to reach Level {level + 1}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        { label: "Projects", val: data.projects, max: 10 },
                        { label: "Repos", val: data.repositories, max: 20 },
                        { label: "Skills", val: skills.length, max: 15 },
                      ].map(({ label, val, max }) => (
                        <div key={label} style={{ flex: 1, minWidth: 80 }}>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>{label} <span style={{ color: "var(--text)" }}>{val}/{max}</span></div>
                          <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(val / max * 100, 100)}%`, height: "100%", background: "var(--accent)", borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>⚡ Quick Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { to: "/projects", icon: "🚀", label: "New Project" },
                    { to: "/teams", icon: "👥", label: "Create Team" },
                    { to: "/certificates", icon: "🎓", label: "Add Certificate" },
                    { to: "/resume", icon: "📄", label: "View Resume" },
                    { to: "/portfolio", icon: "🌐", label: "My Portfolio" },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} className="btn btn-outline" style={{ justifyContent: "flex-start", gap: 10 }}>
                      <span>{icon}</span> {label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="card">
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <span className="card-title">🧠 Skills</span>
                  <Link to="/profile" style={{ fontSize: 12, color: "var(--muted)" }}>Edit →</Link>
                </div>
                {skills.length === 0 ? (
                  <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", padding: "16px 0" }}>
                    No skills added yet.<br />
                    <Link to="/profile" style={{ fontSize: 12 }}>Add skills to your profile</Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skills.map(s => (
                      <span key={s} className="tag tag-blue">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>🏅 Achievements</div>
                {achievements.length === 0 ? (
                  <div style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", padding: "16px 0" }}>
                    Start building to unlock achievements!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {achievements.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "rgba(35,134,54,0.08)", border: "1px solid rgba(35,134,54,0.2)", borderRadius: 6 }}>
                        <span style={{ fontSize: 18 }}>{a.icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green)" }}>{a.label}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{a.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .dashboard-row:hover { background: rgba(88,166,255,0.04); border-radius: 6px; }
        .dashboard-row:last-child { border-bottom: none !important; }
      `}</style>
    </div>
  );
}

export default Dashboard;
