import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function UserProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    api.get(`accounts/profile/${username}/`).then(r => { setProfile(r.data); setFollowing(r.data.is_following); }).catch(() => {});
    api.get("projects/").then(r => setProjects(r.data.filter(p => p.owner_name === username))).catch(() => {});
  }, [username]);

  const follow = async () => {
    const res = await api.post(`accounts/follow/${username}/`);
    setFollowing(res.data.following);
    api.get(`accounts/profile/${username}/`).then(r => setProfile(r.data)).catch(() => {});
  };

  const me = localStorage.getItem("username");
  const skills = profile?.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (!profile) return <div><Navbar /><div className="app-layout"><Sidebar /><main className="main-content"><div style={{ color: "var(--muted)" }}>Loading...</div></main></div></div>;

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="profile-header">
            <div className="profile-avatar-lg">{username[0].toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{username}</div>
              <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{profile.bio || ""}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 13, color: "var(--muted)", flexWrap: "wrap" }}>
                {profile.college && <span>🎓 {profile.college}</span>}
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.github_username && <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer">🐙 {profile.github_username}</a>}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 13 }}>
                <span><strong>{profile.followers_count}</strong> <span style={{ color: "var(--muted)" }}>followers</span></span>
                <span><strong>{profile.following_count}</strong> <span style={{ color: "var(--muted)" }}>following</span></span>
                <span><strong>{projects.length}</strong> <span style={{ color: "var(--muted)" }}>projects</span></span>
              </div>
            </div>
            {me !== username && (
              <button className={`btn ${following ? "btn-outline" : "btn-primary"}`} onClick={follow}>
                {following ? "✓ Following" : "+ Follow"}
              </button>
            )}
            {me === username && <Link to="/profile" className="btn btn-outline btn-sm">Edit Profile</Link>}
          </div>

          {skills.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 10 }}>Skills</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{skills.map(s => <span key={s} className="tag tag-purple">{s}</span>)}</div>
            </div>
          )}

          <div className="card-header" style={{ marginBottom: 12 }}>
            <span className="card-title">Projects ({projects.length})</span>
          </div>
          <div className="card-grid">
            {projects.map(p => (
              <div className="project-card" key={p.id}>
                <div className="project-card-title">{p.title}</div>
                <div className="project-card-desc">{p.description}</div>
                <div className="project-card-tags">{(p.tech_stack || "").split(",").filter(Boolean).map(s => <span key={s} className="tag tag-blue">{s.trim()}</span>)}</div>
                <div className="project-card-footer">
                  {p.github_link && <a href={p.github_link} target="_blank" rel="noreferrer">🐙 GitHub</a>}
                  {p.demo_link && <a href={p.demo_link} target="_blank" rel="noreferrer">🔗 Demo</a>}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UserProfile;
