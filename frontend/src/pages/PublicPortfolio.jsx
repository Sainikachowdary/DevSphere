import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

/* ── Theme configs ─────────────────────────────────────────────────── */
const THEMES = {
  developer: {
    bg: "#0d1117", surface: "#161b22", border: "#30363d",
    text: "#e6edf3", muted: "#8b949e", accent: "#58a6ff",
    accentBg: "rgba(88,166,255,0.1)", tag: "rgba(88,166,255,0.15)",
    tagText: "#58a6ff", hero: "linear-gradient(135deg,#0d1117 60%,#0d2137)",
    cardHover: "rgba(88,166,255,0.07)",
  },
  minimal: {
    bg: "#ffffff", surface: "#f6f8fa", border: "#d0d7de",
    text: "#24292f", muted: "#57606a", accent: "#0969da",
    accentBg: "rgba(9,105,218,0.08)", tag: "#ddf4ff",
    tagText: "#0550ae", hero: "#ffffff",
    cardHover: "rgba(9,105,218,0.04)",
  },
  creative: {
    bg: "#0f0c29", surface: "#1a1535", border: "#2d2850",
    text: "#f0eeff", muted: "#9e93d0", accent: "#a78bfa",
    accentBg: "rgba(167,139,250,0.12)", tag: "rgba(167,139,250,0.18)",
    tagText: "#c4b5fd", hero: "linear-gradient(135deg,#0f0c29,#302b63,#24243e)",
    cardHover: "rgba(167,139,250,0.08)",
  },
};

/* ── Small helpers ─────────────────────────────────────────────────── */
function Avatar({ name, size = 96, accent }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${accent},${accent}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      flexShrink: 0, boxShadow: `0 0 0 4px ${accent}33`,
    }}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function Tag({ label, t }) {
  return (
    <span style={{
      background: t.tag, color: t.tagText, border: `1px solid ${t.accent}44`,
      borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500,
    }}>{label}</span>
  );
}

function SectionHeading({ title, t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  );
}

function ProjectCard({ p, t }) {
  const techs = (p.tech_stack || "").split(",").map(s => s.trim()).filter(Boolean);
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 12,
      transition: "transform .2s, box-shadow .2s, border-color .2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.boxShadow = `0 8px 24px ${t.accent}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: t.accent }}>{p.title}</div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {p.github_link && (
            <a href={p.github_link} target="_blank" rel="noreferrer" style={{ color: t.muted, fontSize: 13, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = t.accent}
              onMouseLeave={e => e.currentTarget.style.color = t.muted}>
              GitHub ↗
            </a>
          )}
          {p.demo_link && (
            <a href={p.demo_link} target="_blank" rel="noreferrer" style={{ color: t.muted, fontSize: 13, textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color = t.accent}
              onMouseLeave={e => e.currentTarget.style.color = t.muted}>
              Demo ↗
            </a>
          )}
        </div>
      </div>
      {p.description && <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, margin: 0 }}>{p.description}</p>}
      {techs.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: "auto" }}>
          {techs.map(s => <Tag key={s} label={s} t={t} />)}
        </div>
      )}
    </div>
  );
}

function ExperienceItem({ e, t, last }) {
  return (
    <div style={{ display: "flex", gap: 20, paddingBottom: last ? 0 : 28 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.accent, flexShrink: 0, marginTop: 4 }} />
        {!last && <div style={{ width: 2, flex: 1, background: t.border, marginTop: 4 }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: t.text }}>{e.role}</div>
        <div style={{ fontSize: 13, color: t.accent, marginTop: 2 }}>{e.company}</div>
        {e.duration && <div style={{ fontSize: 12, color: t.muted, marginTop: 2 }}>{e.duration}</div>}
        {e.description && <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>{e.description}</p>}
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function PublicPortfolio() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`portfolio/${slug}/`)
      .then(r => setData(r.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#8b949e" }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <div style={{ fontSize: 20, fontWeight: 600, color: "#e6edf3" }}>Portfolio not found</div>
        <div style={{ fontSize: 14 }}>This portfolio doesn't exist or hasn't been published yet.</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #30363d", borderTopColor: "#58a6ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { portfolio, profile, projects = [], experiences = [], certificates = [] } = data;
  const t = THEMES[portfolio.theme] || THEMES.developer;
  const skills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
  const username = profile.username || portfolio.username || slug;
  const headline = portfolio.headline || profile.bio || "Developer";

  const socialLinks = [
    profile.github_username && { label: "GitHub", href: `https://github.com/${profile.github_username}`, icon: "⌥" },
    profile.linkedin_url && { label: "LinkedIn", href: profile.linkedin_url, icon: "in" },
    profile.website && { label: "Website", href: profile.website, icon: "🌐" },
  ].filter(Boolean);

  return (
    <div style={{ background: t.bg, minHeight: "100vh", color: t.text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ background: t.hero, borderBottom: `1px solid ${t.border}`, padding: "80px 24px 64px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
          <Avatar name={username} size={110} accent={t.accent} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5, color: t.text, lineHeight: 1.2 }}>{username}</div>
            <div style={{ fontSize: 17, color: t.accent, marginTop: 8, fontWeight: 500 }}>{headline}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 18px", marginTop: 12, fontSize: 13, color: t.muted }}>
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.college && <span>🎓 {profile.college}{profile.branch ? ` · ${profile.branch}` : ""}</span>}
            </div>
            {socialLinks.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                {socialLinks.map(l => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer" style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "7px 16px", borderRadius: 8, border: `1px solid ${t.border}`,
                    background: t.surface, color: t.text, fontSize: 13, fontWeight: 500,
                    textDecoration: "none", transition: "border-color .15s, color .15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.text; }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{l.icon}</span> {l.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>

        {/* About */}
        {profile.bio && (
          <section style={{ marginBottom: 60 }}>
            <SectionHeading title="About" t={t} />
            <p style={{ fontSize: 15, color: t.muted, lineHeight: 1.8, maxWidth: 680, margin: 0 }}>{profile.bio}</p>
          </section>
        )}

        {/* Skills */}
        {portfolio.show_skills && skills.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <SectionHeading title="Skills" t={t} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map(s => <Tag key={s} label={s} t={t} />)}
            </div>
          </section>
        )}

        {/* Experience */}
        {portfolio.show_experience && experiences.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <SectionHeading title="Experience" t={t} />
            <div style={{ paddingLeft: 4 }}>
              {experiences.map((e, i) => (
                <ExperienceItem key={e.id} e={e} t={t} last={i === experiences.length - 1} />
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {portfolio.show_projects && projects.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <SectionHeading title="Projects" t={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
              {projects.map(p => <ProjectCard key={p.id} p={p} t={t} />)}
            </div>
          </section>
        )}

        {/* Certifications */}
        {portfolio.show_certificates && certificates.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <SectionHeading title="Certifications" t={t} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
              {certificates.map(c => (
                <div key={c.id} style={{
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 10, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <span style={{ fontSize: 26 }}>{c.icon || "🏆"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: t.muted, marginTop: 3 }}>{c.issuer}{c.issue_date && ` · ${c.issue_date}`}</div>
                    {c.credential_url && (
                      <a href={c.credential_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: t.accent, marginTop: 4, display: "inline-block" }}>
                        View credential ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${t.border}`, padding: "24px", textAlign: "center", fontSize: 12, color: t.muted }}>
        Built with <span style={{ color: t.accent }}>DevSphere</span> · {new Date().getFullYear()}
      </div>
    </div>
  );
}
