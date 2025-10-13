import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Upload from "./pages/Upload";
import Report from "./pages/Report";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function AnimatedPage({ children }) {
  const location = useLocation();
  return <div key={location.key} className="animated-page">{children}</div>;
}

const codeSnippet = `// Inefficient Sorting Example (O(n^2))
function heavySort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
`;

function Header() {
  return (
    <header className="topbar">
      <div className="container header-inner">
        {/* Only Logo */}
        <div className="logo-only">
          <img src="./logo.jpg" alt="App Logo" className="logo-img" />
        </div>

        <nav className="nav-actions">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/upload" className="nav-btn primary">Analyze</Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  const [typedCode, setTypedCode] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedCode(codeSnippet.slice(0, i));
      i++;
      if (i > codeSnippet.length) clearInterval(interval);
    }, 22);
    return () => clearInterval(interval);
  }, []);

  const energy = "0.045 kWh";
  const co2 = "0.018 kg";
  const score = 88;

  const scrollToImpact = () => {
    document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero container">
      <div className="hero-left">
        <h1 className="hero-title">Cleaner Code. Smaller Footprint.</h1>
        <p className="hero-lead">
          Inefficient code doesn’t just slow apps — it burns energy and produces CO₂.
          GreenStack connects code patterns to real environmental impact and shows prioritized fixes.
        </p>
        <div className="hero-ctas">
          <Link to="/upload" className="btn btn-cta">⚡ Analyze Your Code</Link>
          <button onClick={scrollToImpact} className="btn btn-ghost">🌍 Why This Matters</button>
        </div>
      </div>

      <div className="hero-right">
        <div className="card-preview">
          <div className="preview-top">
            <div className="traffic light" />
            <div className="traffic yellow" />
            <div className="traffic red" />
          </div>
          <div className="preview-body">
            <div className="preview-title">Sample analysis</div>
            <div className="preview-metrics">
              <div className="p-metric"><div className="p-label">Energy</div><div className="p-value">{energy}</div></div>
              <div className="p-metric"><div className="p-label">CO₂</div><div className="p-value">{co2}</div></div>
              <div className="p-metric"><div className="p-label">Score</div><div className="p-value">{score}</div></div>
            </div>
            <pre className="preview-code">{typedCode}<span className="cursor">|</span></pre>
          </div>
        </div>
      </div>
    </section>
  );
}

function ImpactStats() {
  return (
    <section id="impact" className="impact-section container">
      <h2 className="impact-title">🌱 Why Green Coding Matters</h2>
      <p className="impact-subtitle">
        Software is invisible — its energy use isn't. Small code wins multiply into big climate wins.
      </p>
      <div className="row text-center mt-4">
        <div className="col-md-3"><div className="impact-card"><h3>🌐 3.7%</h3><p>of global CO₂ emissions from ICT — like aviation.</p></div></div>
        <div className="col-md-3"><div className="impact-card"><h3>⚡ 200 TWh</h3><p>energy used yearly by data centers worldwide.</p></div></div>
        <div className="col-md-3"><div className="impact-card"><h3>💧 660B L</h3><p>water consumed annually cooling global servers.</p></div></div>
        <div className="col-md-3"><div className="impact-card"><h3>🌳 1M runs ≈ 20kg</h3><p>Optimizations = emissions saved like planting trees.</p></div></div>
      </div>
    </section>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<><Hero /><ImpactStats /></>} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/report" element={<Report />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell white-theme">
        <Header />
        <main className="main">
          <AnimatedPage>
            <AppRoutes />
          </AnimatedPage>
        </main>
      </div>
    </BrowserRouter>
  );
}
