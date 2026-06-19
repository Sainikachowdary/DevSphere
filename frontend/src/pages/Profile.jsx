import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({});
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("overview");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [projects, setProjects] = useState([]);
  const avatarRef = useRef();
  const username = localStorage.getItem("username") || "Developer";

  const load = () => {
    api.get("accounts/profile/").then(r => { setProfile(r.data); setForm(r.data); }).catch(() => {});
    api.get("accounts/followers/").then(r => setFollowers(r.data)).catch(() => {});
    api.get("accounts/following/").then(r => setFollowing(r.data)).catch(() => {});
    api.get("projects/").then(r => setProjects(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined && k !== "avatar") fd.append(k, v); });
      await api.patch("accounts/profile/", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg("Profile updated!"); setEdit(false); load();
    } catch { setMsg("Update failed."); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("avatar", file);
    await api.patch("accounts/profile/", fd, { headers: { "Content-Type": "multipart/form-data" } });
    load();
  };

  const skills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {/* Profile header */}
          <div className="profile-header">
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => avatarRef.current.click()}>
              <div className="profile-avatar-lg">
                {profile.avatar ? <img src={`http://127.0.0.1:8000${profile.avatar}`} alt="avatar" /> : username[0].toUpperCase()}
              </div>
              <div style={{ position: "absolute", bottom: 0, right: 0, background: "var(--border)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>📷</div>
              <input ref={avatarRef} type="file" style={{ display: "none" }} accept="image/*" onChange={uploadAvatar} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{username}</div>
              <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{profile.bio || "No bio yet"}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--muted)", flexWrap: "wrap" }}>
                {profile.college && <span>🎓 {profile.college}</span>}
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer">🌐 Website</a>}
                {profile.github_username && <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer">🐙 {profile.github_username}</a>}
                {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noreferrer">💼 LinkedIn</a>}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13 }}>
                <span style={{ cursor: "pointer" }} onClick={() => setTab("followers")}><strong>{profile.followers_count || 0}</strong> <span style={{ color: "var(--muted)" }}>followers</span></span>
                <span style={{ cursor: "pointer" }} onClick={() => setTab("following")}><strong>{profile.following_count || 0}</strong> <span style={{ color: "var(--muted)" }}>following</span></span>
                <span><strong>{projects.length}</strong> <span style={{ color: "var(--muted)" }}>projects</span></span>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => setEdit(!edit)}>{edit ? "Cancel" : "Edit Profile"}</button>
          </div>

          {msg && <div className="alert alert-success">{msg}</div>}

          {edit ? (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 14 }}>Edit Profile</div>
              <div className="grid-2">
                {[["bio", "Bio", "textarea"], ["college", "College"], ["branch", "Branch"], ["location", "Location"], ["github_username", "GitHub Username"], ["linkedin_url", "LinkedIn URL"], ["website", "Website URL"], ["skills", "Skills (comma separated)"]].map(([name, label, type]) => (
                  <div className="form-group" key={name} style={name === "bio" || name === "skills" ? { gridColumn: "span 2" } : {}}>
                    <label>{label}</label>
                    {type === "textarea"
                      ? <textarea className="form-control" value={form[name] || ""} onChange={e => setForm({ ...form, [name]: e.target.value })} />
                      : <input className="form-control" value={form[name] || ""} onChange={e => setForm({ ...form, [name]: e.target.value })} />}
                  </div>
                ))}
                <div className="form-group">
                  <label>Year</label>
                  <select className="form-control" value={form.year || 1} onChange={e => setForm({ ...form, year: e.target.value })}>
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" onClick={save}>Save Changes</button>
            </div>
          ) : (
            <>
              <div className="tabs">
                {["overview", "projects", "followers", "following"].map(t => (
                  <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</div>
                ))}
              </div>

              {tab === "overview" && (
                <div className="grid-2">
                  <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>Skills</div>
                    {skills.length === 0 ? <span style={{ color: "var(--muted)", fontSize: 13 }}>No skills added yet. <span style={{ cursor: "pointer", color: "var(--blue)" }} onClick={() => setEdit(true)}>Add skills →</span></span>
                    : <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{skills.map(s => <span key={s} className="tag tag-purple">{s}</span>)}</div>}
                  </div>
                  <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>Education</div>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{profile.college || "—"}</div>
                      <div style={{ color: "var(--muted)", marginTop: 2 }}>{profile.branch} {profile.year ? `· Year ${profile.year}` : ""}</div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "projects" && (
                <div className="card-grid">
                  {projects.length === 0 ? <div className="empty-state"><h3>No projects yet</h3><Link to="/projects" className="btn btn-primary">Create Project</Link></div>
                  : projects.map(p => (
                    <Link to={`/projects/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
                      <div className="project-card">
                        <div className="project-card-title">{p.title}</div>
                        <div className="project-card-desc">{p.description}</div>
                        <div className="project-card-tags">{(p.tech_stack || "").split(",").filter(Boolean).map(s => <span key={s} className="tag tag-blue">{s.trim()}</span>)}</div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {tab === "followers" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {followers.length === 0 ? <div className="empty-state"><h3>No followers yet</h3></div>
                  : followers.map(u => (
                    <div className="user-card" key={u.id}>
                      <div className="user-card-avatar">{u.username[0].toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{u.username}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.profile?.bio || u.profile?.college || ""}</div>
                      </div>
                      <Link to={`/user/${u.username}`} className="btn btn-outline btn-sm">View</Link>
                    </div>
                  ))}
                </div>
              )}

              {tab === "following" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {following.length === 0 ? <div className="empty-state"><h3>Not following anyone yet</h3><Link to="/search" className="btn btn-outline">Explore Developers</Link></div>
                  : following.map(u => (
                    <div className="user-card" key={u.id}>
                      <div className="user-card-avatar">{u.username[0].toUpperCase()}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{u.username}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.profile?.bio || u.profile?.college || ""}</div>
                      </div>
                      <Link to={`/user/${u.username}`} className="btn btn-outline btn-sm">View</Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Profile;
