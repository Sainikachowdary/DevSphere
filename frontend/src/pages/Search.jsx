import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Search() {
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followed, setFollowed] = useState({});

  const search = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`accounts/search/?q=${query}&skill=${skill}`);
      setResults(res.data);
    } catch {}
    setLoading(false);
  };

  const follow = async (username) => {
    try {
      const res = await api.post(`accounts/follow/${username}/`);
      setFollowed(f => ({ ...f, [username]: res.data.following }));
    } catch {}
  };

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-title" style={{ marginBottom: 20 }}>🔍 Explore Developers</div>

          <form onSubmit={search} style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
            <input className="form-control" style={{ flex: 2, minWidth: 180 }} placeholder="Search by username..." value={query} onChange={e => setQuery(e.target.value)} />
            <input className="form-control" style={{ flex: 1, minWidth: 140 }} placeholder="Filter by skill (e.g. Python)" value={skill} onChange={e => setSkill(e.target.value)} />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {loading && <div style={{ color: "var(--muted)" }}>Searching...</div>}

          {results.length === 0 && !loading && (
            <div className="empty-state">
              <h3>Search for developers</h3>
              <p style={{ fontSize: 13 }}>Find developers by username or skill to follow them.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {results.map(u => {
              const isFollowing = followed[u.username] !== undefined ? followed[u.username] : u.profile?.is_following;
              const skills = u.profile?.skills ? u.profile.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
              return (
                <div className="user-card" key={u.id}>
                  <div className="user-card-avatar">{u.username[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{u.profile?.bio || u.profile?.college || ""}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
                      {skills.slice(0, 5).map(s => <span key={s} className="tag tag-purple" style={{ fontSize: 10 }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link to={`/user/${u.username}`} className="btn btn-outline btn-sm">View</Link>
                    <button className={`btn btn-sm ${isFollowing ? "btn-outline" : "btn-primary"}`} onClick={() => follow(u.username)}>
                      {isFollowing ? "Following" : "+ Follow"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Search;
