import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const TEMPLATES = [
  { id: "classic",    name: "Classic",        desc: "Clean two-column header, traditional sections" },
  { id: "modern",     name: "Modern",         desc: "Bold accent header with colored section bars" },
  { id: "minimal",    name: "Minimal",        desc: "Pure whitespace, thin lines, elegant simplicity" },
  { id: "tech",       name: "Tech / Dev",     desc: "GitHub-style, emphasises projects & stack" },
  { id: "academic",   name: "Academic",       desc: "Formal layout for research & higher studies" },
  { id: "creative",   name: "Creative",       desc: "Left sidebar with accent block, bold name" },
  { id: "executive",  name: "Executive",      desc: "Compact, dense, suited for senior roles" },
  { id: "compact",    name: "Compact",        desc: "One page optimised, maximum info in less space" },
];

const COLORS = [
  { id: "blue",   hex: "#0969da", name: "Blue" },
  { id: "green",  hex: "#1a7f37", name: "Green" },
  { id: "purple", hex: "#8250df", name: "Purple" },
  { id: "red",    hex: "#cf222e", name: "Red" },
  { id: "orange", hex: "#bc4c00", name: "Orange" },
  { id: "teal",   hex: "#1b7f79", name: "Teal" },
  { id: "slate",  hex: "#32383f", name: "Slate" },
  { id: "rose",   hex: "#b91c1c", name: "Rose" },
];

/* ── Live Preview Components ─────────────────────────────────────────── */

function PreviewHeader({ username, profile, color, template }) {
  const contacts = [
    profile.email,
    profile.location,
    profile.college && `${profile.college}${profile.branch ? ` · ${profile.branch}` : ""}${profile.year ? ` · Year ${profile.year}` : ""}`,
    profile.github_username && `github.com/${profile.github_username}`,
    profile.linkedin_url,
    profile.website,
  ].filter(Boolean);

  if (template === "creative") {
    return (
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ width: 180, background: color, padding: "24px 16px", flexShrink: 0, borderRadius: "6px 0 0 0" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
            {username[0]?.toUpperCase()}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
            {contacts.map((c, i) => <div key={i}>{c}</div>)}
          </div>
        </div>
        <div style={{ flex: 1, padding: "24px 20px", background: "#fff", borderRadius: "0 6px 0 0" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>{username}</div>
          {profile.bio && <div style={{ fontSize: 11, color: "#555", lineHeight: 1.5 }}>{profile.bio}</div>}
        </div>
      </div>
    );
  }

  if (template === "modern") {
    return (
      <div style={{ background: color, padding: "24px 28px", borderRadius: "6px 6px 0 0" }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>{username}</div>
        {profile.bio && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 4, lineHeight: 1.5 }}>{profile.bio}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.9)" }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      borderBottom: template === "minimal" ? `1px solid #ccc` : `3px solid ${color}`,
      paddingBottom: 14, marginBottom: 16,
      background: template === "executive" ? "#f8f8f8" : "#fff",
      padding: template === "executive" ? "16px 20px" : "0 0 14px"
    }}>
      <div style={{ fontSize: template === "compact" ? 20 : template === "academic" ? 22 : 26, fontWeight: 700, color: "#1a1a1a" }}>{username}</div>
      <div style={{ fontSize: 10, color: "#555", marginTop: 4, display: "flex", flexWrap: "wrap", gap: "2px 12px" }}>
        {contacts.map((c, i) => <span key={i}>{c}</span>)}
      </div>
      {profile.bio && template !== "compact" && (
        <div style={{ fontSize: 11, color: "#444", marginTop: 6, lineHeight: 1.5 }}>{profile.bio}</div>
      )}
    </div>
  );
}

function SectionTitle({ title, color, template }) {
  if (template === "modern") return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
      <div style={{ width: 4, height: 16, background: color, borderRadius: 2 }} />
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1a1a1a" }}>{title}</div>
    </div>
  );
  if (template === "minimal") return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", margin: "16px 0 6px" }}>{title}</div>
  );
  if (template === "creative") return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: color, borderBottom: `2px solid ${color}`, paddingBottom: 3, marginBottom: 8, marginTop: 16 }}>{title}</div>
  );
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: color, borderBottom: `1px solid #e0e0e0`, paddingBottom: 3, margin: "14px 0 8px" }}>{title}</div>
  );
}

function ResumePreview({ username, profile, skills, exp, projects, certs, template, color, showSkills, showProjects, showCerts }) {
  const accentHex = COLORS.find(c => c.id === color)?.hex || "#0969da";
  const isCreative = template === "creative";
  const bodyPad = isCreative ? "0" : "20px 28px";

  return (
    <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 6, boxShadow: "0 2px 16px rgba(0,0,0,0.15)", minHeight: 800, fontFamily: template === "academic" ? "Georgia, serif" : "-apple-system, sans-serif", overflow: "hidden" }}>
      <PreviewHeader username={username} profile={profile} color={accentHex} template={template} />
      <div style={{ padding: isCreative ? 0 : "0 28px 28px" }}>
        {isCreative ? (
          <div style={{ display: "flex" }}>
            {/* Creative left column continue */}
            <div style={{ width: 180, background: "#f5f5f5", padding: "16px", flexShrink: 0 }}>
              {skills.length > 0 && showSkills && (
                <>
                  <SectionTitle title="Skills" color={accentHex} template={template} />
                  {skills.map(s => (
                    <div key={s} style={{ fontSize: 10, padding: "2px 0", color: "#444" }}>▪ {s}</div>
                  ))}
                </>
              )}
              {certs.length > 0 && showCerts && (
                <>
                  <SectionTitle title="Certs" color={accentHex} template={template} />
                  {certs.map(c => (
                    <div key={c.id} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#222" }}>{c.title}</div>
                      <div style={{ fontSize: 9, color: "#666" }}>{c.issuer}{c.issue_date && ` · ${c.issue_date}`}</div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {/* Creative right column */}
            <div style={{ flex: 1, padding: "16px 20px" }}>
              {exp.length > 0 && (
                <>
                  <SectionTitle title="Experience" color={accentHex} template={template} />
                  {exp.map(e => (
                    <div key={e.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{e.role} <span style={{ color: accentHex }}>@ {e.company}</span></div>
                      <div style={{ fontSize: 10, color: "#666" }}>{e.duration}</div>
                      {e.description && <div style={{ fontSize: 10, color: "#444", marginTop: 3, lineHeight: 1.5 }}>{e.description}</div>}
                    </div>
                  ))}
                </>
              )}
              {projects.length > 0 && showProjects && (
                <>
                  <SectionTitle title="Projects" color={accentHex} template={template} />
                  {projects.map(p => (
                    <div key={p.id} style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: accentHex }}>{p.title}</div>
                      {p.description && <div style={{ fontSize: 10, color: "#444", lineHeight: 1.5 }}>{p.description}</div>}
                      {p.tech_stack && <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>Stack: {p.tech_stack}</div>}
                    </div>
                  ))}
                </>
              )}
              <SectionTitle title="Education" color={accentHex} template={template} />
              <div style={{ fontSize: 12, fontWeight: 600 }}>{profile.college || "—"}</div>
              <div style={{ fontSize: 10, color: "#666" }}>{[profile.branch, profile.year && `Year ${profile.year}`].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
        ) : (
          <>
            {skills.length > 0 && showSkills && (
              <>
                <SectionTitle title="Skills" color={accentHex} template={template} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {skills.map(s => (
                    <span key={s} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${accentHex}`, color: accentHex, background: `${accentHex}10` }}>{s}</span>
                  ))}
                </div>
              </>
            )}

            {exp.length > 0 && (
              <>
                <SectionTitle title="Experience" color={accentHex} template={template} />
                {exp.map(e => (
                  <div key={e.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{e.role}</div>
                      <div style={{ fontSize: 10, color: "#666" }}>{e.duration}</div>
                    </div>
                    <div style={{ fontSize: 11, color: accentHex }}>{e.company}</div>
                    {e.description && <div style={{ fontSize: 10, color: "#555", marginTop: 3, lineHeight: 1.5 }}>{e.description}</div>}
                  </div>
                ))}
              </>
            )}

            {projects.length > 0 && showProjects && (
              <>
                <SectionTitle title="Projects" color={accentHex} template={template} />
                {projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: accentHex }}>{p.title}{p.github_link && <span style={{ fontWeight: 400, fontSize: 9, color: "#888", marginLeft: 6 }}>↗ github</span>}</div>
                    {p.description && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>{p.description}</div>}
                    {p.tech_stack && <div style={{ fontSize: 9, color: "#777", marginTop: 2 }}>Stack: {p.tech_stack}</div>}
                  </div>
                ))}
              </>
            )}

            {certs.length > 0 && showCerts && (
              <>
                <SectionTitle title="Certifications" color={accentHex} template={template} />
                {certs.map(c => (
                  <div key={c.id} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{c.title}</div>
                    <div style={{ fontSize: 10, color: "#666" }}>{c.issuer}{c.issue_date && ` · ${c.issue_date}`}</div>
                  </div>
                ))}
              </>
            )}

            <SectionTitle title="Education" color={accentHex} template={template} />
            <div style={{ fontWeight: 600, fontSize: 12 }}>{profile.college || "—"}</div>
            <div style={{ fontSize: 10, color: "#666", marginTop: 2 }}>{[profile.branch, profile.year && `Year ${profile.year}`].filter(Boolean).join(" · ")}</div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────── */

export default function Resume() {
  const [profile, setProfile]   = useState({});
  const [projects, setProjects] = useState([]);
  const [certs, setCerts]       = useState([]);
  const [exp, setExp]           = useState([]);
  const [tmpl, setTmpl]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [downloading, setDownloading] = useState(false);
  const username = localStorage.getItem("username") || "Developer";

  useEffect(() => {
    Promise.all([
      api.get("accounts/profile/").then(r => setProfile(r.data)).catch(() => {}),
      api.get("projects/").then(r => setProjects(r.data)).catch(() => {}),
      api.get("resume/certificates/").then(r => setCerts(r.data)).catch(() => {}),
      api.get("resume/experience/").then(r => setExp(r.data)).catch(() => {}),
      api.get("resume/template/").then(r => setTmpl(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const save = async (updates) => {
    if (!tmpl) return;
    setSaveErr("");
    setSaving(true);
    // Optimistic update so UI reflects immediately
    setTmpl(prev => ({ ...prev, ...updates }));
    try {
      const r = await api.patch("resume/template/", updates);
      setTmpl(r.data);
    } catch (e) {
      // Rollback optimistic update on failure
      setTmpl(prev => ({ ...prev, ...Object.fromEntries(Object.keys(updates).map(k => [k, tmpl[k]])) }));
      setSaveErr(e?.response?.data ? JSON.stringify(e.response.data) : "Save failed — check console");
    } finally {
      setSaving(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/resume/generate/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { alert("Download failed. Make sure the backend is running."); }
    setDownloading(false);
  };

  const skills      = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const tmplId      = tmpl?.template_type || "classic";
  const colorId     = tmpl?.color_scheme || "blue";
  const selColor    = COLORS.find(c => c.id === colorId) || COLORS[0];
  const selTmpl     = TEMPLATES.find(t => t.id === tmplId) || TEMPLATES[0];
  const showSkills  = tmpl ? tmpl.show_skills_bar !== false : true;
  const showProjects = tmpl ? tmpl.show_projects !== false : true;
  const showCerts   = tmpl ? tmpl.show_certifications !== false : true;

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div className="page-title">📄 Resume Builder</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {saving && <span style={{ fontSize: 12, color: "var(--muted)" }}>Saving...</span>}
              <button className="btn btn-primary" onClick={downloadPDF} disabled={downloading}>
                {downloading ? "⏳ Generating..." : "⬇️ Download PDF"}
              </button>
            </div>
          </div>

          {saveErr && <div className="alert alert-error" style={{ marginBottom: 12 }}>⚠️ {saveErr}</div>}

          <div className="tabs">
            {[["preview","👁️ Preview"],["templates","📋 Templates"],["customize","🎨 Customize"]].map(([id, label]) => (
              <div key={id} className={`tab ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</div>
            ))}
          </div>

          {loading ? <div style={{ color: "var(--muted)", padding: 24 }}>Loading your data...</div> : (
            <>
              {/* PREVIEW TAB */}
              {activeTab === "preview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
                  <ResumePreview
                    username={username} profile={profile} skills={skills}
                    exp={exp} projects={projects} certs={certs}
                    template={selTmpl.id} color={selColor.id}
                    showSkills={showSkills} showProjects={showProjects} showCerts={showCerts}
                  />
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="card">
                      <div className="card-title" style={{ marginBottom: 10 }}>Active Template</div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{selTmpl.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{selTmpl.desc}</div>
                      <div style={{ marginTop: 10, display: "inline-block", background: selColor.hex, color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 11 }}>{selColor.name}</div>
                    </div>
                    <div className="card">
                      <div className="card-title" style={{ marginBottom: 10 }}>Resume Data</div>
                      {[
                        ["Skills", skills.length],
                        ["Experience", exp.length],
                        ["Projects", projects.length],
                        ["Certificates", certs.length],
                      ].map(([label, count]) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ color: "var(--muted)" }}>{label}</span>
                          <span style={{ fontWeight: 600, color: count > 0 ? "var(--green)" : "var(--muted)" }}>{count}</span>
                        </div>
                      ))}
                      {skills.length === 0 && exp.length === 0 && (
                        <div style={{ fontSize: 11, color: "var(--orange)", marginTop: 8 }}>⚠️ Fill your profile with skills, experience & projects for a complete resume.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TEMPLATES TAB */}
              {activeTab === "templates" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {TEMPLATES.map(t => (
                    <div
                      key={t.id}
                      onClick={() => tmpl && save({ template_type: t.id })}
                      style={{
                        border: `2px solid ${tmplId === t.id ? selColor.hex : "var(--border)"}`,
                        borderRadius: 8, padding: 16, cursor: "pointer",
                        background: tmplId === t.id ? `${selColor.hex}12` : "var(--surface)",
                        transition: "all .15s"
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t.name}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.desc}</div>
                      {tmplId === t.id && (
                        <div style={{ marginTop: 8, fontSize: 11, color: selColor.hex, fontWeight: 600 }}>✓ Selected</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* CUSTOMIZE TAB */}
              {activeTab === "customize" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="card">
                      <div className="card-title" style={{ marginBottom: 12 }}>Color Scheme</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                        {COLORS.map(c => (
                          <div key={c.id} onClick={() => tmpl && save({ color_scheme: c.id })} style={{ cursor: "pointer", textAlign: "center" }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%", background: c.hex, margin: "0 auto 4px",
                              border: colorId === c.id ? `3px solid var(--text)` : "3px solid transparent",
                              display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                              {colorId === c.id && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--muted)" }}>{c.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-title" style={{ marginBottom: 12 }}>Sections</div>
                      {[
                        ["show_skills_bar", "Skills", skills.length > 0],
                        ["show_projects", "Projects", projects.length > 0],
                        ["show_certifications", "Certifications", certs.length > 0],
                      ].map(([key, label, hasData]) => (
                        <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
                            {!hasData && <div style={{ fontSize: 11, color: "var(--orange)" }}>No data yet</div>}
                          </div>
                          <label style={{ position: "relative", display: "inline-block", width: 36, height: 20, cursor: "pointer" }}>
                            <input type="checkbox" style={{ opacity: 0, width: 0, height: 0, position: "absolute" }}
                              checked={tmpl?.[key] !== false}
                              disabled={!hasData}
                              onChange={e => save({ [key]: e.target.checked })} />
                            <span style={{
                              position: "absolute", inset: 0, borderRadius: 20,
                              background: tmpl?.[key] !== false && hasData ? selColor.hex : "var(--border)",
                              transition: ".2s"
                            }} />
                            <span style={{
                              position: "absolute", top: 3, left: tmpl?.[key] !== false && hasData ? 19 : 3,
                              width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: ".2s"
                            }} />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live mini preview */}
                  <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 600 }}>Live Preview</div>
                    <div style={{ transform: "scale(0.55)", transformOrigin: "top left", width: "182%", pointerEvents: "none" }}>
                      <ResumePreview
                        username={username} profile={profile} skills={skills}
                        exp={exp} projects={projects} certs={certs}
                        template={selTmpl.id} color={selColor.id}
                        showSkills={showSkills} showProjects={showProjects} showCerts={showCerts}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
