import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DevSphereLogo } from "../components/Icons";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", college: "", branch: "", year: 1 });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/accounts/register/", form);
      setSuccess(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(msgs.join(' | '));
      } else {
        setError("Registration failed. Is the backend running?");
      }
    }
  };

  return (
    <div className="auth-page">
      <div>
        <div className="auth-logo">
          <DevSphereLogo size={48} />
          <span>DevSphere</span>
        </div>

        <div className="auth-box" style={{ maxWidth: 420 }}>
          <h2>Create your account</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">Account created! Redirecting...</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" name="username" value={form.username} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handle} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label>College</label>
                <input className="form-control" name="college" value={form.college} onChange={handle} />
              </div>
              <div className="form-group">
                <label>Branch</label>
                <input className="form-control" name="branch" value={form.branch} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label>Year</label>
              <select className="form-control" name="year" value={form.year} onChange={handle}>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} type="submit">Create account</button>
          </form>
        </div>

        <div className="auth-footer">
          Already have an account? <Link to="/">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
