import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { DevSphereLogo } from "./Icons";

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const username = localStorage.getItem("username") || "Dev";

  const logout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <DevSphereLogo size={22} />
        DevSphere
      </div>

      <div className="navbar-search">
        <input placeholder="Search users, projects, skills..." />
      </div>

      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/search">Explore</Link>
        <button className="theme-btn" onClick={toggle} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div className="avatar" title={`${username} · Click for menu`} onClick={() => navigate("/settings")}>
          {username[0].toUpperCase()}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
