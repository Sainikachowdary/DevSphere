import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const STATUS_COLOR = { pending: "tag-gray", in_progress: "tag-blue", completed: "tag-green" };
const PRIORITY_COLOR = { low: "tag-green", medium: "tag-orange", high: "tag-red" };

// Predefined roadmap steps for common milestone types
const ROADMAP_PRESETS = {
  frontend: ["HTML", "CSS", "JavaScript", "React", "State Management", "UI/UX Design", "Responsive Layout", "Testing"],
  backend: ["Setup Server", "Database Design", "Models", "REST APIs", "Authentication", "Authorization", "Validation", "Testing"],
  fullstack: ["Planning", "Frontend UI", "Backend APIs", "Database", "Integration", "Testing", "Deployment"],
  database: ["Schema Design", "Migrations", "Seeding", "Queries", "Optimization", "Backup Strategy"],
  devops: ["Dockerize", "CI/CD Pipeline", "Environment Config", "Deployment", "Monitoring", "SSL/Domain"],
  design: ["Wireframes", "Mockups", "Color Palette", "Typography", "Component Library", "Prototype"],
  testing: ["Unit Tests", "Integration Tests", "E2E Tests", "Bug Fixes", "Performance Testing", "Code Review"],
  deployment: ["Build Optimization", "Environment Variables", "Server Setup", "Domain Config", "SSL", "Go Live"],
};

const PRESET_LABELS = {
  frontend: "🎨 Frontend", backend: "⚙️ Backend", fullstack: "🔀 Full Stack",
  database: "🗄️ Database", devops: "🚀 DevOps", design: "🖌️ Design",
  testing: "🧪 Testing", deployment: "🌐 Deployment"
};

function MilestoneBlock({ milestone, projectId, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [steps, setSteps] = useState([]);
  const [showAddStep, setShowAddStep] = useState(false);
  const [newStep, setNewStep] = useState("");
  const fileRef = useRef();

  // Sync steps from server on initial mount only
  useEffect(() => {
    try {
      const parsed = JSON.parse(milestone.description || "[]");
      setSteps(Array.isArray(parsed) ? parsed : []);
    } catch { setSteps([]); }
  }, []);

  const loadFiles = () => {
    api.get(`projects/${projectId}/files/`)
      .then(r => {
        const filtered = r.data.filter(f => Number(f.milestone) === Number(milestone.id));
        setFiles(filtered);
      })
      .catch(() => {});
  };

  useEffect(() => { loadFiles(); }, [milestone.id, projectId]);

  const isRoadmapMode = steps.length > 0 && typeof steps[0] === "object";
  const completedSteps = isRoadmapMode ? steps.filter(s => s.done).length : 0;
  const stepProgress = isRoadmapMode && steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  const toggleStep = async (idx) => {
    const updated = steps.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
    setSteps(updated);
    const allDone = updated.every(s => s.done);
    const newStatus = allDone ? "completed" : updated.some(s => s.done) ? "in_progress" : "pending";
    api.patch(`projects/${projectId}/milestones/${milestone.id}/`, {
      description: JSON.stringify(updated),
      status: newStatus
    }).catch(() => alert("Failed to save step"));
    // No onRefresh() — steps are managed locally, no need to reload
  };

  const addStep = async () => {
    if (!newStep.trim()) return;
    const updated = [...steps, { label: newStep.trim(), done: false }];
    setSteps(updated);
    setNewStep("");
    setShowAddStep(false);
    api.patch(`projects/${projectId}/milestones/${milestone.id}/`, { description: JSON.stringify(updated) })
      .catch(() => alert("Failed to save step"));
    // No onRefresh() — no need to reload just for adding a step
  };

  const applyPreset = async (presetKey) => {
    const presetSteps = ROADMAP_PRESETS[presetKey].map(label => ({ label, done: false }));
    setSteps(presetSteps);
    api.patch(`projects/${projectId}/milestones/${milestone.id}/`, {
      description: JSON.stringify(presetSteps),
      status: "pending"
    }).catch(() => alert("Failed to apply preset"));
    // No onRefresh()
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("milestone", milestone.id);
    fd.append("note", file.name);
    try {
      await api.post(`projects/${projectId}/files/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      await loadFiles();
      onRefresh();
    } catch (err) {
      alert("Upload failed: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
    setUploading(false);
    e.target.value = "";
  };

  const updateStatus = async (status) => {
    await api.patch(`projects/${projectId}/milestones/${milestone.id}/`, { status });
    onRefresh();
  };

  const dotColor = { pending: "var(--muted)", in_progress: "var(--blue)", completed: "var(--green)" };

  return (
    <div className="milestone-card" style={{ marginBottom: 16 }}>
      {/* Milestone Header */}
      <div className="milestone-header">
        <div className="milestone-status-dot" style={{ background: dotColor[milestone.status] }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{milestone.title}</div>
          {isRoadmapMode && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {completedSteps}/{steps.length} steps · {stepProgress}% complete
            </div>
          )}
        </div>
        {milestone.due_date && <span style={{ fontSize: 11, color: "var(--muted)" }}>📅 {milestone.due_date}</span>}
        <select
          className="form-control"
          style={{ width: 130, padding: "3px 8px", fontSize: 12 }}
          value={milestone.status}
          onChange={e => updateStatus(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Progress bar when steps exist */}
      {isRoadmapMode && steps.length > 0 && (
        <div style={{ padding: "0 22px 8px" }}>
          <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${stepProgress}%`, background: "linear-gradient(90deg, var(--blue), var(--green))", borderRadius: 3, transition: "width 0.4s" }} />
          </div>
        </div>
      )}

      {/* Roadmap Steps */}
      <div style={{ paddingLeft: 22 }}>
        {isRoadmapMode ? (
          <div className="roadmap-steps">
            {steps.map((step, i) => (
              <div
                key={i}
                className="roadmap-step-item"
                onClick={() => toggleStep(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                  marginBottom: 6, border: "1px solid var(--border)",
                  background: step.done ? "var(--green-bg, rgba(16,185,129,0.08))" : "var(--bg)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: "50%", border: `2px solid ${step.done ? "var(--green)" : "var(--border)"}`,
                  background: step.done ? "var(--green)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s"
                }}>
                  {step.done && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                  {!step.done && <span style={{ color: "var(--muted)", fontSize: 10 }}>{i + 1}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    textDecoration: step.done ? "line-through" : "none",
                    color: step.done ? "var(--muted)" : "var(--text)"
                  }}>{step.label}</div>
                </div>
                {step.done && <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>Done ✓</span>}
                {!step.done && i === steps.findIndex(s => !s.done) && (
                  <span style={{ fontSize: 10, color: "var(--blue)", background: "rgba(59,130,246,0.1)", padding: "2px 7px", borderRadius: 10 }}>Up next</span>
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {showAddStep ? (
                <div style={{ display: "flex", gap: 6, flex: 1 }}>
                  <input
                    className="form-control" autoFocus
                    placeholder="Step name e.g. React Router"
                    value={newStep}
                    onChange={e => setNewStep(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addStep()}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={addStep}>Add</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddStep(false)}>✕</button>
                </div>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddStep(true)}>+ Add Step</button>
              )}
            </div>
          </div>
        ) : (
          // No steps yet — show preset picker
          <div style={{ padding: "12px 0" }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Choose a roadmap template or add custom steps:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {Object.entries(PRESET_LABELS).map(([key, label]) => (
                <button key={key} className="btn btn-outline btn-sm" style={{ fontSize: 11 }} onClick={() => applyPreset(key)}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {showAddStep ? (
                <>
                  <input
                    className="form-control" autoFocus
                    placeholder="Custom step name"
                    value={newStep}
                    onChange={e => setNewStep(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addStep()}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={addStep}>Add</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddStep(false)}>✕</button>
                </>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setShowAddStep(true)}>+ Custom Step</button>
              )}
            </div>
          </div>
        )}

        {/* File upload */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <input ref={fileRef} type="file" style={{ display: "none" }} onChange={uploadFile} />
          <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "📎 Upload File"}
          </button>
          {files.length === 0 && !uploading && (
            <span style={{ fontSize: 11, color: "var(--muted)" }}>No files yet</span>
          )}
          {files.map(f => {
            const url = f.file_url || '';
            const icon = f.filename?.match(/\.pdf$/i) ? "📄" : f.filename?.match(/\.(png|jpg|jpeg|gif)$/i) ? "🖼️" : "📎";
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => window.open(url, '_blank')} className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>
                  {icon} {f.filename}
                </button>
                <a href={url} download={f.filename} className="btn btn-outline btn-sm" style={{ fontSize: 10, padding: "2px 6px" }} title="Download">
                  ⬇
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TeamTab({ project, projectId, onRefresh }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUser = localStorage.getItem("username");
  const isOwner = project.owner_name === currentUser;

  const addMember = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post(`projects/${projectId}/members/`, { username });
      setUsername("");
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add member.");
    }
    setLoading(false);
  };

  const removeMember = async (memberId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await api.delete(`projects/${projectId}/members/`, { data: { user_id: memberId } });
      onRefresh();
    } catch {
      alert("Failed to remove member.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {isOwner && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>➕ Add Member</div>
          <form onSubmit={addMember} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <input
              className="form-control"
              placeholder="Enter username..."
              value={username}
              onChange={e => { setUsername(e.target.value); setError(""); }}
              required
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
          </form>
          {error && <div className="alert alert-error" style={{ marginTop: 8, marginBottom: 0 }}>{error}</div>}
        </div>
      )}

      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>👥 Members ({1 + (project.members_data?.length || 0)})</div>
        <div className="member-row">
          <div className="member-avatar" style={{ background: "var(--accent)" }}>{project.owner_name?.[0]?.toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{project.owner_name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Owner</div>
          </div>
          <span className="tag tag-green">Owner</span>
        </div>
        {(project.members_data || []).map(m => (
          <div className="member-row" key={m.id}>
            <div className="member-avatar">{m.username?.[0]?.toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{m.username}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Member</div>
            </div>
            {isOwner && (
              <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.id)}>Remove</button>
            )}
          </div>
        ))}
        {project.members_data?.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 13, paddingTop: 8 }}>No members yet. Add collaborators above.</div>
        )}
      </div>
    </div>
  );
}

function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [tab, setTab] = useState("workspace");
  const [newMilestone, setNewMilestone] = useState({ title: "", due_date: "" });
  const [newTask, setNewTask] = useState({ title: "", status: "pending", priority: "medium", deadline: "" });
  const [newIssue, setNewIssue] = useState({ title: "", description: "", priority: "medium" });
  const [showMForm, setShowMForm] = useState(false);
  const [showTForm, setShowTForm] = useState(false);
  const [showIForm, setShowIForm] = useState(false);

  const load = async () => {
    try {
      const [pRes, mRes, tRes, iRes, fRes] = await Promise.all([
        api.get(`projects/${id}/`),
        api.get(`projects/${id}/milestones/`),
        api.get(`projects/${id}/tasks/`),
        api.get(`projects/${id}/issues/`),
        api.get(`projects/${id}/files/`),
      ]);
      setProject(pRes.data);
      setMilestones(mRes.data);
      setTasks(tRes.data);
      setIssues(iRes.data);
      setAllFiles(fRes.data);
    } catch {}
  };

  useEffect(() => { load(); }, [id]);

  const addMilestone = async (e) => {
    e.preventDefault();
    const payload = { title: newMilestone.title, description: "[]", order: milestones.length };
    if (newMilestone.due_date) payload.due_date = newMilestone.due_date;
    try {
      await api.post(`projects/${id}/milestones/`, payload);
      setNewMilestone({ title: "", due_date: "" });
      setShowMForm(false);
      load();
    } catch (err) {
      alert("Failed to create milestone: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    await api.post(`projects/${id}/tasks/`, newTask);
    setNewTask({ title: "", status: "pending", priority: "medium", deadline: "" });
    setShowTForm(false);
    load();
  };

  const addIssue = async (e) => {
    e.preventDefault();
    await api.post(`projects/${id}/issues/`, newIssue);
    setNewIssue({ title: "", description: "", priority: "medium" });
    setShowIForm(false);
    load();
  };

  const updateTask = async (taskId, status) => {
    await api.patch(`projects/${id}/tasks/${taskId}/`, { status });
    load();
  };

  const updateIssue = async (issueId, status) => {
    await api.patch(`projects/${id}/issues/${issueId}/`, { status });
    load();
  };

  const deleteProject = async () => {
    if (!confirm("Delete this project permanently? This cannot be undone.")) return;
    try { await api.delete(`projects/${id}/`); navigate("/projects"); } catch { alert("Failed to delete project."); }
  };

  if (!project) return <div><Navbar /><div className="app-layout"><Sidebar /><main className="main-content"><div style={{ color: "var(--muted)" }}>Loading project...</div></main></div></div>;

  const progress = project.progress || 0;
  const tech = (project.tech_stack || "").split(",").filter(Boolean);

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {/* Project Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
              <Link to="/projects">Projects</Link> / {project.title}
            </div>
            <div className="page-header">
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="page-title">{project.title}</div>
                  {project.is_team_project && <span className="tag tag-purple">Team</span>}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 3 }}>{project.description}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {project.github_link && <a href={project.github_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">🐙 GitHub</a>}
                {project.demo_link && <a href={project.demo_link} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">🔗 Demo</a>}
                <button className="btn btn-danger btn-sm" onClick={deleteProject}>🗑 Delete</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
                  <span>Overall Progress</span><span style={{ color: "var(--text)", fontWeight: 600 }}>{progress}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {tech.map(t => <span key={t} className="tag tag-blue">{t.trim()}</span>)}
              </div>
            </div>
          </div>

          <div className="tabs">
            {[["workspace", "📋 Workspace"], ["tasks", `✅ Tasks (${tasks.length})`], ["issues", `🐛 Issues (${issues.filter(i => i.status === "open").length} open)`], ["files", `📎 Files (${allFiles.length})`], ["team", "👥 Team"]].map(([val, label]) => (
              <div key={val} className={`tab ${tab === val ? "active" : ""}`} onClick={() => setTab(val)}>{label}</div>
            ))}
          </div>

          {/* WORKSPACE TAB — Milestones */}
          {tab === "workspace" && (
            <div>
              <div className="card-header" style={{ marginBottom: 12 }}>
                <span className="card-title">Milestones · {milestones.filter(m => m.status === "completed").length}/{milestones.length} done</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowMForm(!showMForm)}>+ Add Milestone</button>
              </div>

              {showMForm && (
                <form onSubmit={addMilestone} className="card" style={{ marginBottom: 14 }}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Milestone Title *</label>
                      <input className="form-control" value={newMilestone.title} onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })} required placeholder="e.g. Frontend, Backend, Deployment..." />
                    </div>
                    <div className="form-group">
                      <label>Due Date</label>
                      <input type="date" className="form-control" value={newMilestone.due_date} onChange={e => setNewMilestone({ ...newMilestone, due_date: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
                    💡 After creating, you can pick a roadmap template (Frontend, Backend, etc.) or add custom steps.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-primary btn-sm">Create</button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowMForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              {milestones.length === 0 ? (
                <div className="empty-state">
                  <h3>No milestones yet</h3>
                  <p style={{ fontSize: 13 }}>Add milestones to track your project progress. Upload files to each milestone as you complete work.</p>
                  <button className="btn btn-primary" onClick={() => setShowMForm(true)}>Add First Milestone</button>
                </div>
              ) : milestones.map(m => (
                <MilestoneBlock key={m.id} milestone={m} projectId={id} onRefresh={load} />
              ))}
            </div>
          )}

          {/* TASKS TAB */}
          {tab === "tasks" && (
            <div>
              <div className="card-header" style={{ marginBottom: 12 }}>
                <span className="card-title">Tasks</span>
                <button className="btn btn-primary btn-sm" onClick={() => setShowTForm(!showTForm)}>+ Add Task</button>
              </div>

              {showTForm && (
                <form onSubmit={addTask} className="card" style={{ marginBottom: 14 }}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Task Title *</label>
                      <input className="form-control" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Deadline</label>
                      <input type="date" className="form-control" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Status</label>
                      <select className="form-control" value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Priority</label>
                      <select className="form-control" value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-primary btn-sm">Add</button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowTForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="card">
                {tasks.length === 0 ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No tasks yet.</div> : tasks.map(t => (
                  <div className="task-item" key={t.id}>
                    <input type="checkbox" checked={t.status === "completed"} onChange={() => updateTask(t.id, t.status === "completed" ? "pending" : "completed")} style={{ cursor: "pointer" }} />
                    <div style={{ flex: 1, textDecoration: t.status === "completed" ? "line-through" : "none", color: t.status === "completed" ? "var(--muted)" : "var(--text)", fontSize: 13 }}>{t.title}</div>
                    <span className={`tag ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                    <span className={`tag ${STATUS_COLOR[t.status]}`}>{t.status.replace("_", " ")}</span>
                    {t.deadline && <span style={{ fontSize: 11, color: "var(--muted)" }}>📅 {t.deadline}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ISSUES TAB */}
          {tab === "issues" && (
            <div>
              <div className="card-header" style={{ marginBottom: 12 }}>
                <span className="card-title">Issues</span>
                <button className="btn btn-danger btn-sm" onClick={() => setShowIForm(!showIForm)}>+ Report Issue</button>
              </div>

              {showIForm && (
                <form onSubmit={addIssue} className="card" style={{ marginBottom: 14 }}>
                  <div className="form-group">
                    <label>Issue Title *</label>
                    <input className="form-control" value={newIssue.title} onChange={e => setNewIssue({ ...newIssue, title: e.target.value })} required placeholder="Describe the bug or issue..." />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-control" value={newIssue.description} onChange={e => setNewIssue({ ...newIssue, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select className="form-control" value={newIssue.priority} onChange={e => setNewIssue({ ...newIssue, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" className="btn btn-danger btn-sm">Report</button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowIForm(false)}>Cancel</button>
                  </div>
                </form>
              )}

              <div className="card">
                {issues.length === 0 ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No issues reported. 🎉</div> : issues.map(i => (
                  <div className="task-item" key={i.id}>
                    <span style={{ fontSize: 16 }}>{i.status === "closed" ? "✅" : "🔴"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: i.status === "closed" ? "var(--muted)" : "var(--text)", textDecoration: i.status === "closed" ? "line-through" : "none" }}>{i.title}</div>
                      {i.description && <div style={{ fontSize: 11, color: "var(--muted)" }}>{i.description}</div>}
                    </div>
                    <span className={`tag ${PRIORITY_COLOR[i.priority]}`}>{i.priority}</span>
                    <select className="form-control" style={{ width: 120, padding: "3px 8px", fontSize: 12 }} value={i.status} onChange={e => updateIssue(i.id, e.target.value)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILES TAB */}
          {tab === "files" && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>All Project Files</div>
              {allFiles.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: 13 }}>No files uploaded yet. Upload files from the Workspace tab within each milestone.</div>
              ) : allFiles.map(f => {
                const url = f.file_url || '';
                return (
                  <div className="file-item" key={f.id}>
                    <span className="file-icon">{f.filename?.match(/\.(png|jpg|jpeg|gif)$/i) ? "🖼️" : f.filename?.match(/\.pdf$/i) ? "📄" : f.filename?.match(/\.(zip|rar)$/i) ? "📦" : "📎"}</span>
                    <span style={{ flex: 1 }}>{f.filename}</span>
                    <button onClick={() => window.open(url, '_blank')} className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>👁 View</button>
                    <a href={url} download={f.filename} className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>⬇ Download</a>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{f.uploaded_by_name}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{new Date(f.uploaded_at).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* TEAM TAB */}
          {tab === "team" && (
            <TeamTab project={project} projectId={id} onRefresh={load} />
          )}
        </main>
      </div>
    </div>
  );
}

export default ProjectWorkspace;
