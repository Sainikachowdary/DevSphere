import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const PATHS = {
  "Full Stack Developer": ["HTML", "CSS", "JavaScript", "React", "Node.js / Django", "PostgreSQL", "REST APIs", "Deployment (Docker / Heroku)"],
  "Frontend Developer": ["HTML & CSS", "JavaScript (ES6+)", "TypeScript", "React / Vue / Angular", "State Management", "CSS Frameworks", "Web Accessibility", "Performance Optimization"],
  "Backend Developer": ["Programming Language (Python/Java/Go)", "Databases (SQL & NoSQL)", "REST APIs", "Authentication & Authorization", "Caching (Redis)", "Message Queues", "Microservices", "Cloud Deployment"],
  "Data Scientist": ["Python", "NumPy / Pandas", "Data Visualization", "Machine Learning", "Scikit-learn", "Deep Learning", "NLP", "Model Deployment"],
  "Machine Learning Engineer": ["Python", "Math (Linear Algebra / Stats)", "Data Preprocessing", "ML Algorithms", "TensorFlow / PyTorch", "Model Evaluation", "MLOps", "Deployment & Monitoring"],
  "AI Engineer": ["Python", "Machine Learning Fundamentals", "Deep Learning", "LLMs & Prompt Engineering", "Vector Databases", "RAG Pipelines", "AI APIs (OpenAI / Gemini)", "AI App Deployment"],
  "DevOps Engineer": ["Linux", "Git", "Docker", "CI/CD Pipelines", "Kubernetes", "AWS / GCP", "Monitoring", "Infrastructure as Code"],
  "Cloud Engineer": ["Cloud Fundamentals", "AWS / Azure / GCP", "Networking Basics", "IAM & Security", "Storage & Databases", "Serverless", "Infrastructure as Code (Terraform)", "Cost Optimization"],
  "Cybersecurity Engineer": ["Networking Fundamentals", "Linux & Scripting", "Cryptography", "Web Security (OWASP)", "Penetration Testing", "SIEM Tools", "Incident Response", "Compliance & Governance"],
  "Android Developer": ["Java / Kotlin", "Android Studio", "XML Layouts", "Jetpack Compose", "REST APIs", "Firebase", "Play Store Deployment", "Testing"],
  "iOS Developer": ["Swift", "Xcode", "UIKit / SwiftUI", "Auto Layout", "Networking & APIs", "Core Data", "App Store Deployment", "Testing & Debugging"],
  "Game Developer": ["Programming (C++ / C#)", "Game Engine (Unity / Unreal)", "2D / 3D Graphics", "Physics & Collision", "Audio Integration", "Game AI", "Multiplayer Networking", "Publishing"],
  "Blockchain Developer": ["Blockchain Fundamentals", "Cryptography Basics", "Solidity / Rust", "Smart Contracts", "Ethereum / Solana", "Web3.js / Ethers.js", "DeFi Concepts", "dApp Deployment"],
  "Embedded Systems Engineer": ["C / C++", "Microcontrollers (Arduino / STM32)", "Digital Electronics", "RTOS", "Communication Protocols (I2C, SPI, UART)", "Sensors & Actuators", "PCB Design Basics", "Debugging Tools"],
  "QA Engineer": ["Testing Fundamentals", "Manual Testing", "Test Case Design", "Automation (Selenium / Cypress)", "API Testing (Postman)", "Performance Testing", "CI/CD Integration", "Bug Tracking"],
  "UI/UX Designer": ["Design Principles", "Wireframing", "Figma / Adobe XD", "Prototyping", "User Research", "Usability Testing", "Design Systems", "Handoff to Developers"],
  "Data Engineer": ["Python / Scala", "SQL & NoSQL Databases", "ETL Pipelines", "Apache Spark", "Data Warehousing", "Airflow / Orchestration", "Cloud Data Platforms", "Data Governance"],
  "Site Reliability Engineer": ["Linux & Scripting", "Networking", "Monitoring & Alerting", "Incident Management", "Docker & Kubernetes", "CI/CD", "Capacity Planning", "Chaos Engineering"],
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function initStreak() {
  const stored = localStorage.getItem("roadmap_streak");
  const today = getToday();
  if (!stored) {
    const data = { count: 1, lastVisit: today };
    localStorage.setItem("roadmap_streak", JSON.stringify(data));
    return data.count;
  }
  const { count, lastVisit } = JSON.parse(stored);
  if (lastVisit === today) return count;
  const diff = (new Date(today) - new Date(lastVisit)) / 86400000;
  const newCount = diff === 1 ? count + 1 : 1;
  localStorage.setItem("roadmap_streak", JSON.stringify({ count: newCount, lastVisit: today }));
  return newCount;
}

function Roadmap() {
  const [selected, setSelected] = useState("Full Stack Developer");
  const [allDone, setAllDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem("roadmap_done")) || {}; } catch { return {}; }
  });
  const [streak, setStreak] = useState(0);

  useEffect(() => { setStreak(initStreak()); }, []);

  const toggle = (step) => {
    setAllDone(prev => {
      const current = prev[selected] || [];
      const updated = { ...prev, [selected]: current.includes(step) ? current.filter(s => s !== step) : [...current, step] };
      localStorage.setItem("roadmap_done", JSON.stringify(updated));
      return updated;
    });
  };

  const steps = PATHS[selected];
  const done = allDone[selected] || [];
  const progress = Math.round((done.length / steps.length) * 100);

  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header">
            <div className="page-title">🗺️ Learning Roadmap</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {Object.keys(PATHS).map(p => (
              <button key={p} className={`btn ${selected === p ? "btn-primary" : "btn-outline"}`} onClick={() => setSelected(p)}>{p}</button>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 280px", gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">{selected}</span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{done.length}/{steps.length} completed</span>
              </div>

              <div style={{ height: 6, background: "var(--border)", borderRadius: 3, marginBottom: 16 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 3, transition: "width .3s" }} />
              </div>

              {steps.map((step, i) => {
                const isDone = done.includes(step);
                const isActive = !isDone && i === done.length;
                return (
                  <div className="roadmap-item" key={step} style={{ cursor: "pointer" }} onClick={() => toggle(step)}>
                    <div className={`roadmap-step ${isDone ? "done" : isActive ? "active" : ""}`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: isDone ? 400 : 600, color: isDone ? "var(--muted)" : "var(--text)" }}>{step}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>{isDone ? "Completed" : isActive ? "Up next" : "Not started"}</div>
                    </div>
                    {isDone && <span className="tag done" style={{ marginLeft: "auto" }}>✓ Done</span>}
                    {isActive && <span className="tag progress" style={{ marginLeft: "auto" }}>In Progress</span>}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 8 }}>Progress</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: progress === 100 ? "var(--accent-hover)" : "var(--blue)" }}>{progress}%</div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>{progress === 100 ? "🎉 Roadmap Complete!" : `${steps.length - done.length} steps remaining`}</div>
              </div>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 8 }}>Current Streak</div>
                <div className="streak-box">🔥 {streak} {streak === 1 ? "Day" : "Days"}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Visit daily to keep your streak!</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Roadmap;
