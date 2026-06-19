import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Repositories from "./pages/Repositories";
import Portfolio from "./pages/Portfolio";
import PublicPortfolio from "./pages/PublicPortfolio";
import Resume from "./pages/Resume";
import Roadmap from "./pages/Roadmap";
import Certificates from "./pages/Certificates";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import UserProfile from "./pages/UserProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectWorkspace />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/search" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/p/:slug" element={<PublicPortfolio />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
