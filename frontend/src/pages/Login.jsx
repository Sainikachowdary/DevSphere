import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DevSphereLogo } from "../components/Icons";

function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login/", form);
      localStorage.setItem("token", res.data.access);
      localStorage.setItem("username", form.username);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="auth-page">
      <div>
        <div className="auth-logo">
          <DevSphereLogo size={48} />
          <span>DevSphere</span>
        </div>

        <div className="auth-box">
          <h2>Sign in to DevSphere</h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" name="username" value={form.username} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handle} required />
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} type="submit">Sign in</button>
          </form>
        </div>

        <div className="auth-footer">
          New to DevSphere? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
