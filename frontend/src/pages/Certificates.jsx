import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function Certificates() {
  const [certs, setCerts] = useState([]);
  const [exp, setExp] = useState([]);
  const [tab, setTab] = useState("Certificates");
  const [showForm, setShowForm] = useState(false);
  const [certForm, setCertForm] = useState({ title: "", issuer: "", issue_date: "", credential_url: "", icon: "🏆" });
  const [expForm, setExpForm] = useState({ role: "", company: "", duration: "", description: "", is_current: false });
  const fileRef = useRef();
  const [certFile, setCertFile] = useState(null);

  const load = () => {
    api.get("resume/certificates/").then(r => setCerts(r.data)).catch(() => {});
    api.get("resume/experience/").then(r => setExp(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const addCert = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(certForm).forEach(([k, v]) => fd.append(k, v));
    if (certFile) fd.append("file", certFile);
    await api.post("resume/certificates/", fd, { headers: { "Content-Type": "multipart/form-data" } });
    setCertForm({ title: "", issuer: "", issue_date: "", credential_url: "", icon: "🏆" });
    setCertFile(null); setShowForm(false); load();
  };

  const addExp = async (e) => {
    e.preventDefault();
    await api.post("resume/experience/", expForm);
    setExpForm({ role: "", company: "", duration: "", description: "", is_current: false });
    setShowForm(false); load();
  };

  const deleteCert = async (id) => { await api.delete(`resume/certificates/${id}/`); load(); };
  const deleteExp = async (id) => { await api.delete(`resume/experience/${id}/`); load(); };

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div className="page-title">🏆 Certificates & Experience</div>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add</button>
          </div>

          <div className="tabs">
            {["Certificates", "Experience"].map(t => (
              <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setShowForm(false); }}>{t}</div>
            ))}
          </div>

          {showForm && tab === "Certificates" && (
            <form onSubmit={addCert} className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Add Certificate</div>
              <div className="grid-2">
                <div className="form-group"><label>Title *</label><input className="form-control" value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} required /></div>
                <div className="form-group"><label>Issuer *</label><input className="form-control" value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} required /></div>
                <div className="form-group"><label>Date</label><input className="form-control" placeholder="e.g. Jan 2024" value={certForm.issue_date} onChange={e => setCertForm({ ...certForm, issue_date: e.target.value })} /></div>
                <div className="form-group"><label>Icon (emoji)</label><input className="form-control" value={certForm.icon} onChange={e => setCertForm({ ...certForm, icon: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Credential URL</label><input className="form-control" type="url" value={certForm.credential_url} onChange={e => setCertForm({ ...certForm, credential_url: e.target.value })} /></div>
              <div className="form-group">
                <label>Certificate File (PDF / Image)</label>
                <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.png,.jpg,.jpeg" onChange={e => setCertFile(e.target.files[0])} />
                <div className="upload-area" onClick={() => fileRef.current.click()}>{certFile ? `📎 ${certFile.name}` : "📎 Click to upload PDF or Image"}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {showForm && tab === "Experience" && (
            <form onSubmit={addExp} className="card" style={{ marginBottom: 16 }}>
              <div className="card-title" style={{ marginBottom: 12 }}>Add Experience</div>
              <div className="grid-2">
                <div className="form-group"><label>Role *</label><input className="form-control" value={expForm.role} onChange={e => setExpForm({ ...expForm, role: e.target.value })} required /></div>
                <div className="form-group"><label>Company *</label><input className="form-control" value={expForm.company} onChange={e => setExpForm({ ...expForm, company: e.target.value })} required /></div>
              </div>
              <div className="form-group"><label>Duration</label><input className="form-control" placeholder="e.g. Jun 2024 – Aug 2024" value={expForm.duration} onChange={e => setExpForm({ ...expForm, duration: e.target.value })} /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} /></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {tab === "Certificates" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {certs.length === 0 ? <div className="empty-state"><h3>No certificates yet</h3><p style={{fontSize:13}}>Add your certifications from Coursera, AWS, Google, etc.</p></div>
              : certs.map(c => {
                const fileUrl = c.file_url || null;
                return (
                <div className="cert-card" key={c.id}>
                  <div className="cert-icon">{c.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: "var(--blue)" }}>{c.issuer}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{c.issue_date}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      {c.credential_url && <a href={c.credential_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">🔗 Credential</a>}
                      {fileUrl && <button onClick={() => window.open(fileUrl, '_blank')} className="btn btn-outline btn-sm">📄 View File</button>}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteCert(c.id)}>✕</button>
                </div>
                );
              })}
            </div>
          )}

          {tab === "Experience" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {exp.length === 0 ? <div className="empty-state"><h3>No experience added</h3><p style={{fontSize:13}}>Add internships, jobs, or open source contributions.</p></div>
              : exp.map(e => (
                <div className="card" key={e.id}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 6, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>💼</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{e.role}</div>
                      <div style={{ fontSize: 13, color: "var(--blue)" }}>{e.company}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{e.duration}</div>
                      {e.description && <div style={{ fontSize: 13, marginTop: 6 }}>{e.description}</div>}
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteExp(e.id)}>✕</button>
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

export default Certificates;
