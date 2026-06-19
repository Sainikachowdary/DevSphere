import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [profile, setProfile] = useState({});
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [exp, setExp] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const username = localStorage.getItem("username") || "Developer";

  useEffect(() => {
    Promise.all([
      api.get("portfolio/").then(r => setPortfolio(r.data)).catch(() => {}),
      api.get("accounts/profile/").then(r => setProfile(r.data)).catch(() => {}),
      api.get("projects/").then(r => setProjects(r.data)).catch(() => {}),
      api.get("resume/certificates/").then(r => setCerts(r.data)).catch(() => {}),
      api.get("resume/experience/").then(r => setExp(r.data)).catch(() => {}),
    ]);
  }, []);

  const save = async (updates) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.patch("portfolio/", updates);
      setPortfolio(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const skills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const publicUrl = portfolio ? `${window.location.origin}/p/${portfolio.slug}` : "";

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <div className="page-title">🌐 Portfolio</div>
              {portfolio?.is_published
                ? <div style={{ fontSize: 12, color: "var(--green)", marginTop: 2 }}>✅ Live · <a href={publicUrl} target="_blank" rel="noreferrer">{publicUrl}</a></div>
                : <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Not published yet</div>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {saved && <span style={{ fontSize: 12, color: "var(--green)", alignSelf: "center" }}>✓ Saved</span>}
              {portfolio?.is_published && (
                <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">👁 View Live</a>
              )}
              {portfolio && (
                <button
                  className={`btn ${portfolio.is_published ? "btn-danger" : "btn-primary"}`}
                  onClick={() => save({ is_published: !portfolio.is_published })}
                  disabled={saving}
                >
                  {saving ? "..." : portfolio.is_published ? "Unpublish" : "🚀 Publish"}
                </button>
              )}
            </div>
          </div>

          {portfolio && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Left col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 14 }}>Portfolio Settings</div>
                  <div className="form-group">
                    <label>Headline</label>
                    <input
                      className="form-control"
                      value={portfolio.headline || ""}
                      onChange={e => setPortfolio({ ...portfolio, headline: e.target.value })}
                      placeholder="e.g. Full Stack Developer & Open Source Enthusiast"
                    />
                  </div>
                  <div className="form-group">
                    <label>Public URL Slug</label>
                    <input
                      className="form-control"
                      value={portfolio.slug || ""}
                      onChange={e => setPortfolio({ ...portfolio, slug: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Theme</label>
                    <select className="form-control" value={portfolio.theme || "developer"} onChange={e => setPortfolio({ ...portfolio, theme: e.target.value })}>
                      <option value="developer">Developer (Dark)</option>
                      <option value="minimal">Minimal (Light)</option>
                      <option value="creative">Creative (Gradient)</option>
                    </select>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => save({ headline: portfolio.headline, theme: portfolio.theme, slug: portfolio.slug })}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                </div>

                <div className="card">
                  <div className="card-title" style={{ marginBottom: 8 }}>Stats</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>👁 {portfolio.views} views</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>📅 Updated {new Date(portfolio.updated_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Right col */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 12 }}>Sections to show</div>
                  {[
                    ["show_projects", `Projects`, projects.length],
                    ["show_skills", `Skills`, skills.length],
                    ["show_experience", `Experience`, exp.length],
                    ["show_certificates", `Certificates`, certs.length],
                  ].map(([key, label, count]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8 }}>{count} items</span>
                      </div>
                      <label style={{ position: "relative", display: "inline-block", width: 36, height: 20, cursor: "pointer" }}>
                        <input type="checkbox" style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                          checked={!!portfolio[key]}
                          onChange={e => { const u = { ...portfolio, [key]: e.target.checked }; setPortfolio(u); save({ [key]: e.target.checked }); }} />
                        <span style={{
                          position: "absolute", inset: 0, borderRadius: 20,
                          background: portfolio[key] ? "var(--accent)" : "var(--border)", transition: ".2s"
                        }} />
                        <span style={{
                          position: "absolute", top: 3, left: portfolio[key] ? 19 : 3,
                          width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: ".2s"
                        }} />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div className="card-title" style={{ marginBottom: 10 }}>Profile Data</div>
                  {[
                    ["Name", username],
                    ["Bio", profile.bio || "—"],
                    ["Location", profile.location || "—"],
                    ["GitHub", profile.github_username ? `@${profile.github_username}` : "—"],
                    ["LinkedIn", profile.linkedin_url || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", gap: 8, fontSize: 12, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--muted)", width: 70, flexShrink: 0 }}>{k}</span>
                      <span style={{ color: "var(--text)", wordBreak: "break-all" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
                    Edit this info in <a href="/profile">Profile Settings</a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Portfolio;
