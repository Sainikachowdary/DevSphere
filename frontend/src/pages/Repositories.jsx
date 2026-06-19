import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const langColor = {
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#2b7489",
  Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c", Go: "#00ADD8",
  "C++": "#f34b7d", Ruby: "#701516", Rust: "#dea584", Swift: "#fa7343",
};

function Repositories() {
  const [repos, setRepos] = useState([]);
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [syncMsg, setSyncMsg] = useState("");

  const loadRepos = () =>
    api.get("github/repositories/").then(r => setRepos(r.data)).catch(() => {});

  useEffect(() => {
    api.get("accounts/profile/").then(r => setGithub(r.data.github_username || "")).catch(() => {});
    loadRepos().finally(() => setLoading(false));
  }, []);

  const sync = async () => {
    setError("");
    setSyncMsg("");
    setSyncing(true);
    try {
      const res = await api.post("github/sync/");
      setSyncMsg(res.data.message);
      await loadRepos();
    } catch (err) {
      setError(err.response?.data?.error || "Sync failed. Check your GitHub username in Profile.");
    }
    setSyncing(false);
  };

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <div className="page-title">Repositories</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {github ? `github.com/${github}` : "No GitHub username set — add it in Profile"}
              </div>
            </div>
            <button className="btn btn-outline" onClick={sync} disabled={syncing}>
              {syncing ? "Syncing..." : "🔄 Sync GitHub"}
            </button>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {syncMsg && <div className="alert alert-success">{syncMsg}</div>}

          {loading ? (
            <div style={{ color: "var(--muted)" }}>Loading repositories...</div>
          ) : repos.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <h3>No repositories yet</h3>
              <p style={{ fontSize: 13, marginBottom: 16 }}>
                {github
                  ? "Click \"Sync GitHub\" to import your repositories."
                  : <>Add your GitHub username in <a href="/profile">Profile</a> then sync.</>}
              </p>
              <button className="btn btn-primary" onClick={sync} disabled={syncing}>
                {syncing ? "Syncing..." : "🔄 Sync Now"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
              {repos.map((r, i) => (
                <div key={i} style={{ padding: "14px 16px", borderBottom: i < repos.length - 1 ? "1px solid var(--border)" : "none", background: "var(--surface)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a href={r.github_url} target="_blank" rel="noreferrer" style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</a>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{r.description || "No description"}</div>
                      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--muted)", alignItems: "center", flexWrap: "wrap" }}>
                        {r.language && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: langColor[r.language] || "#888", display: "inline-block" }} />
                            {r.language}
                          </span>
                        )}
                        <span>⭐ {r.stars}</span>
                        <span>🍴 {r.forks}</span>
                      </div>
                    </div>
                    <a href={r.github_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }}>
                      View →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Repositories;
