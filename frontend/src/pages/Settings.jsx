import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

function Settings() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    api.get("accounts/profile/").then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const saveTheme = async () => {
    try {
      await api.post("accounts/theme/", { theme });
      alert("Theme saved!");
    } catch {}
  };

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div className="page-title">⚙️ Settings</div>
            <button className="btn btn-danger" onClick={logout}>Sign Out</button>
          </div>

          <div style={{ maxWidth: 600 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 14 }}>Appearance</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Theme</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Current: {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={toggle}>
                    {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={saveTheme}>Save</button>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 14 }}>Account</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Profile Information</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Update your bio, skills, and contact info</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate("/profile")}>Edit Profile</button>
                </div>
                
                <hr style={{ margin: "4px 0" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Portfolio</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Manage your public portfolio</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate("/portfolio")}>Manage</button>
                </div>
                
                <hr style={{ margin: "4px 0" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>Resume</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Download your auto-generated resume</div>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate("/resume")}>Download</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Data & Privacy</div>
              <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
                <div>• Your profile data is stored securely</div>
                <div>• GitHub data is synced only when you connect</div>
                <div>• Portfolio is public only when you publish it</div>
                <div>• All uploaded files are private by default</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;