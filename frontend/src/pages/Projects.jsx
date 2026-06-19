import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const STATUS_COLOR = { planning: "tag-gray", in_progress: "tag-blue", completed: "tag-green", on_hold: "tag-orange" };
const STATUS_LABEL = { planning: "Planning", in_progress: "In Progress", completed: "Completed", on_hold: "On Hold" };

function NewProjectModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", description: "", github_link: "", demo_link: "", tech_stack: "", status: "planning", is_team_project: false });
  const [members, setMembers] = useState([""]);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        github_link: form.github_link,
        demo_link: form.demo_link,
        tech_stack: form.tech_stack,
        status: form.status,
        is_team_project: form.is_team_project === true || form.is_team_project === "true",
        member_usernames: members.filter(m => m.trim())
      };
      await api.post("projects/", payload);
      onSave();
      onClose();
    } catch { alert("Failed to create project."); }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="card-header" style={{ marginBottom: 16 }}>
          <span className="card-title" style={{ fontSize: 16 }}>🗂️ Create New Project</span>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Project Title *</label>
            <input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Weather App, Portfolio Site..." />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What are you building?" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>GitHub Link</label>
              <input className="form-control" value={form.github_link} onChange={e => setForm({ ...form, github_link: e.target.value })} placeholder="https://github.com/..." />
            </div>
            <div className="form-group">
              <label>Live Demo</label>
              <input className="form-control" value={form.demo_link} onChange={e => setForm({ ...form, demo_link: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div className="form-group">
            <label>Tech Stack (comma separated)</label>
            <input className="form-control" value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Django, PostgreSQL..." />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
            <div className="form-group">
              <label>Project Type</label>
              <select className="form-control" value={form.is_team_project} onChange={e => setForm({ ...form, is_team_project: e.target.value === "true" })}>
                <option value="false">Solo Project</option>
                <option value="true">Team Project</option>
              </select>
            </div>
          </div>
          {form.is_team_project && (
            <div className="form-group">
              <label>Team Members (usernames)</label>
              {members.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                  <input className="form-control" placeholder="Username" value={m} onChange={e => { const a = [...members]; a[i] = e.target.value; setMembers(a); }} />
                  {members.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => setMembers(members.filter((_, j) => j !== i))}>✕</button>}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setMembers([...members, ""])}>+ Add Member</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Project"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.get("projects/").then(r => { setProjects(r.data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const deleteProject = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try { await api.delete(`projects/${id}/`); load(); } catch { alert("Failed to delete project."); }
  };

  const filtered = tab === "all" ? projects : projects.filter(p => p.status === tab);

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div className="page-title">🗂️ Projects</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
          </div>

          <div className="tabs">
            {[["all", "All"], ["in_progress", "In Progress"], ["planning", "Planning"], ["completed", "Completed"]].map(([val, label]) => (
              <div key={val} className={`tab ${tab === val ? "active" : ""}`} onClick={() => setTab(val)}>{label}
                {val === "all" ? ` (${projects.length})` : ` (${projects.filter(p => p.status === val).length})`}
              </div>
            ))}
          </div>

          {loading ? <div style={{ color: "var(--muted)" }}>Loading...</div> : filtered.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 1a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-4a.5.5 0 00-.5-.5h-13zm0 8a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-4a.5.5 0 00-.5-.5h-13z" /></svg>
              <h3>No projects yet</h3>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create your first project</button>
            </div>
          ) : (
            <div className="card-grid">
              {filtered.map(p => (
                <Link to={`/projects/${p.id}`} key={p.id} style={{ textDecoration: "none" }}>
                  <div className="project-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="project-card-title" style={{ flex: 1 }}>{p.title}</div>
                      {p.is_team_project && <span className="tag tag-purple" style={{ fontSize: 10 }}>Team</span>}
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: "2px 8px", fontSize: 11 }}
                        onClick={e => deleteProject(e, p.id)}
                        title="Delete project"
                      >🗑</button>
                    </div>
                    <div className="project-card-desc">{p.description || "No description"}</div>
                    <div className="project-card-tags">
                      {(p.tech_stack || "").split(",").filter(Boolean).map(s => <span key={s} className="tag tag-blue">{s.trim()}</span>)}
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
                        <span>Progress</span><span>{p.progress}%</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                    </div>
                    <div className="project-card-footer">
                      <span className={`tag ${STATUS_COLOR[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                      <span style={{ marginLeft: "auto" }}>
                        {p.tasks_count} tasks · {p.open_issues} issues
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {showModal && <NewProjectModal onClose={() => setShowModal(false)} onSave={load} />}
        </main>
      </div>
    </div>
  );
}

export default Projects;
