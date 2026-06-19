import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function CreateTeamModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [members, setMembers] = useState([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("teams/", {
        name: form.name,
        description: form.description,
        member_usernames: members.filter(m => m.trim())
      });
      onSave(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data ? JSON.stringify(err.response.data) : "Failed to create team");
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="card-header">
          <span className="card-title">Create Team</span>
          <button className="btn btn-outline btn-sm" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Team Name *</label>
            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Frontend Team, AI Squad..." />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this team work on?" />
          </div>
          <div className="form-group">
            <label>Add Members by Username</label>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>Enter exact usernames of people registered on DevSphere</div>
            {members.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <input className="form-control" placeholder="e.g. john_doe" value={m} onChange={e => { const a = [...members]; a[i] = e.target.value; setMembers(a); }} />
                {members.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => setMembers(members.filter((_, j) => j !== i))}>✕</button>}
              </div>
            ))}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setMembers([...members, ""])}>+ Add Another</button>
          </div>
          {error && <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 8 }}>{error}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating..." : "Create Team"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Teams() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [tab, setTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [files, setFiles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", priority: "medium", deadline: "" });
  const [issueForm, setIssueForm] = useState({ title: "", description: "", priority: "medium" });
  const [addMemberUsername, setAddMemberUsername] = useState("");
  const [addMemberError, setAddMemberError] = useState("");
  const fileRef = useRef();
  const currentUser = localStorage.getItem("username");

  const loadTeams = (selectTeam) => {
    api.get("teams/").then(r => {
      setTeams(r.data);
      if (selectTeam) {
        setSelectedTeam(selectTeam);
      } else if (selectedTeam) {
        const updated = r.data.find(t => t.id === selectedTeam.id);
        setSelectedTeam(updated || (r.data.length ? r.data[0] : null));
      } else if (r.data.length) {
        setSelectedTeam(r.data[0]);
      }
    });
  };

  const loadTeamData = (teamId) => {
    api.get(`teams/${teamId}/tasks/`).then(r => setTasks(r.data)).catch(() => {});
    api.get(`teams/${teamId}/issues/`).then(r => setIssues(r.data)).catch(() => {});
    api.get(`teams/${teamId}/files/`).then(r => setFiles(r.data)).catch(() => {});
  };

  useEffect(() => { loadTeams(); }, []);
  useEffect(() => { if (selectedTeam) loadTeamData(selectedTeam.id); }, [selectedTeam?.id]);

  const deleteTeam = async () => {
    if (!confirm(`Delete team "${selectedTeam.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`teams/${selectedTeam.id}/`);
      setSelectedTeam(null);
      api.get("teams/").then(r => { setTeams(r.data); if (r.data.length) setSelectedTeam(r.data[0]); });
    } catch { alert("Failed to delete team"); }
  };

  const deleteFile = async (fileId) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`teams/${selectedTeam.id}/files/${fileId}/`);
      loadTeamData(selectedTeam.id);
    } catch { alert("Failed to delete file"); }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`teams/${selectedTeam.id}/tasks/`, taskForm);
      setTaskForm({ title: "", priority: "medium", deadline: "" });
      setShowTaskForm(false);
      loadTeamData(selectedTeam.id);
    } catch { alert("Failed to add task"); }
  };

  const addIssue = async (e) => {
    e.preventDefault();
    try {
      await api.post(`teams/${selectedTeam.id}/issues/`, issueForm);
      setIssueForm({ title: "", description: "", priority: "medium" });
      setShowIssueForm(false);
      loadTeamData(selectedTeam.id);
    } catch { alert("Failed to add issue"); }
  };

  const updateTask = async (id, status) => {
    await api.patch(`teams/${selectedTeam.id}/tasks/${id}/`, { status });
    loadTeamData(selectedTeam.id);
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("note", file.name);
    try {
      await api.post(`teams/${selectedTeam.id}/files/`, fd);
      loadTeamData(selectedTeam.id);
    } catch { alert("Upload failed"); }
    e.target.value = "";
  };

  const addMember = async (e) => {
    e.preventDefault();
    setAddMemberError("");
    try {
      await api.post(`teams/${selectedTeam.id}/members/`, { username: addMemberUsername.trim() });
      setAddMemberUsername("");
      loadTeams();
    } catch (err) {
      setAddMemberError(err.response?.data?.error || "User not found");
    }
  };

  const removeMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await api.delete(`teams/${selectedTeam.id}/members/`, { data: { user_id: userId } });
      loadTeams();
    } catch { alert("Failed to remove member"); }
  };

  const STATUS_TAG = { pending: "tag-gray", in_progress: "tag-blue", completed: "tag-green", open: "tag-red", closed: "tag-green" };
  const PRIORITY_TAG = { low: "tag-green", medium: "tag-orange", high: "tag-red" };
  const isOwner = selectedTeam?.created_by_name === currentUser;

  if (!selectedTeam) {
    return (
      <div>
        <Navbar />
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <div className="page-header">
              <div className="page-title">👥 Teams</div>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ Create Team</button>
            </div>
            <div className="empty-state">
              <h3>No teams yet</h3>
              <p style={{ fontSize: 13 }}>Create a team to collaborate with others</p>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create Your First Team</button>
            </div>
            {showCreateModal && <CreateTeamModal onClose={() => setShowCreateModal(false)} onSave={(t) => loadTeams(t)} />}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div>
              <div className="page-title">👥 {selectedTeam.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{selectedTeam.members_data?.length || 0} members · {selectedTeam.tasks_count || 0} tasks</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="form-control" style={{ width: 180 }} value={selectedTeam.id} onChange={e => setSelectedTeam(teams.find(t => t.id == e.target.value))}>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>+ New Team</button>
              {isOwner && <button className="btn btn-danger" onClick={deleteTeam}>🗑 Delete Team</button>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 16 }}>
            {/* Members sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Members</div>
                {(selectedTeam.members_data || []).map(m => (
                  <div className="member-row" key={m.id}>
                    <div className="member-avatar">{m.username[0].toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.username}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{m.username === selectedTeam.created_by_name ? "Owner" : "Member"}</div>
                    </div>
                    {isOwner && m.username !== currentUser && (
                      <button className="btn btn-danger btn-sm" style={{ fontSize: 10, padding: "2px 6px" }} onClick={() => removeMember(m.id)}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {isOwner && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 10 }}>Add Member</div>
                  <form onSubmit={addMember}>
                    <input
                      className="form-control"
                      placeholder="Enter username"
                      value={addMemberUsername}
                      onChange={e => { setAddMemberUsername(e.target.value); setAddMemberError(""); }}
                      required
                      style={{ marginBottom: 8 }}
                    />
                    {addMemberError && <div style={{ color: "#ef4444", fontSize: 11, marginBottom: 6 }}>{addMemberError}</div>}
                    <button type="submit" className="btn btn-primary btn-sm" style={{ width: "100%" }}>Add</button>
                  </form>
                </div>
              )}
            </div>

            {/* Main content */}
            <div>
              <div className="tabs">
                {[["tasks", `Tasks (${tasks.length})`], ["issues", `Issues (${issues.length})`], ["files", `Files (${files.length})`]].map(([key, label]) => (
                  <div key={key} className={`tab ${tab === key ? "active" : ""}`} onClick={() => setTab(key)}>{label}</div>
                ))}
              </div>

              {tab === "tasks" && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Tasks</span>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowTaskForm(!showTaskForm)}>+ Add Task</button>
                  </div>
                  {showTaskForm && (
                    <form onSubmit={addTask} style={{ marginBottom: 16, padding: 16, background: "var(--bg)", borderRadius: 6 }}>
                      <div className="grid-2">
                        <div className="form-group">
                          <label>Task Title *</label>
                          <input className="form-control" placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                        </div>
                        <div className="form-group">
                          <label>Deadline</label>
                          <input type="date" className="form-control" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select className="form-control" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="submit" className="btn btn-primary btn-sm">Add</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowTaskForm(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                  {tasks.length === 0
                    ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No tasks yet.</div>
                    : tasks.map(t => (
                      <div className="task-item" key={t.id}>
                        <input type="checkbox" checked={t.status === "completed"} onChange={() => updateTask(t.id, t.status === "completed" ? "pending" : "completed")} />
                        <div style={{ flex: 1, textDecoration: t.status === "completed" ? "line-through" : "none", fontSize: 13 }}>{t.title}</div>
                        <span className={`tag ${PRIORITY_TAG[t.priority]}`}>{t.priority}</span>
                        <span className={`tag ${STATUS_TAG[t.status]}`}>{t.status.replace("_", " ")}</span>
                        {t.deadline && <span style={{ fontSize: 11, color: "var(--muted)" }}>📅 {t.deadline}</span>}
                      </div>
                    ))
                  }
                </div>
              )}

              {tab === "issues" && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Issues</span>
                    <button className="btn btn-danger btn-sm" onClick={() => setShowIssueForm(!showIssueForm)}>+ Report</button>
                  </div>
                  {showIssueForm && (
                    <form onSubmit={addIssue} style={{ marginBottom: 16, padding: 16, background: "var(--bg)", borderRadius: 6 }}>
                      <div className="form-group">
                        <label>Title *</label>
                        <input className="form-control" value={issueForm.title} onChange={e => setIssueForm({ ...issueForm, title: e.target.value })} required placeholder="Describe the issue..." />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-control" value={issueForm.description} onChange={e => setIssueForm({ ...issueForm, description: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select className="form-control" value={issueForm.priority} onChange={e => setIssueForm({ ...issueForm, priority: e.target.value })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="submit" className="btn btn-danger btn-sm">Report</button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowIssueForm(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                  {issues.length === 0
                    ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No issues. 🎉</div>
                    : issues.map(i => (
                      <div className="task-item" key={i.id}>
                        <span>{i.status === "closed" ? "✅" : "🔴"}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{i.title}</div>
                          {i.description && <div style={{ fontSize: 11, color: "var(--muted)" }}>{i.description}</div>}
                        </div>
                        <span className={`tag ${PRIORITY_TAG[i.priority]}`}>{i.priority}</span>
                        <span className={`tag ${STATUS_TAG[i.status]}`}>{i.status}</span>
                      </div>
                    ))
                  }
                </div>
              )}

              {tab === "files" && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Files</span>
                    <button className="btn btn-primary btn-sm" onClick={() => fileRef.current.click()}>📎 Upload</button>
                    <input ref={fileRef} type="file" style={{ display: "none" }} onChange={uploadFile} />
                  </div>
                  {files.length === 0
                    ? <div style={{ color: "var(--muted)", fontSize: 13 }}>No files uploaded yet.</div>
                    : files.map(f => {
                        const url = f.file_url || "";
                        return (
                          <div className="file-item" key={f.id}>
                            <span className="file-icon">{f.filename?.match(/\.pdf$/i) ? "📄" : f.filename?.match(/\.(png|jpg|jpeg|gif)$/i) ? "🖼️" : "📎"}</span>
                            <span style={{ flex: 1 }}>{f.filename}</span>
                            <button onClick={() => window.open(url, '_blank')} className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>👁 View</button>
                            <a href={url} download={f.filename} className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>⬇</a>
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>{f.uploaded_by_name}</span>
                            <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }} onClick={() => deleteFile(f.id)}>🗑</button>
                          </div>
                        );
                      })
                  }
                </div>
              )}
            </div>
          </div>

          {showCreateModal && <CreateTeamModal onClose={() => setShowCreateModal(false)} onSave={(t) => loadTeams(t)} />}
        </main>
      </div>
    </div>
  );
}

export default Teams;
