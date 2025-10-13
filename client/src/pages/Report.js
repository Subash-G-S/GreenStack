import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "./report.css";

export default function Report() {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report;

  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [runs, setRuns] = useState(1);

  const score = report?.efficiency_score || 0;
  const co2 = report?.environmental_impact?.co2_kg || 0;
  const energy = report?.environmental_impact?.energy_kwh || 0;
  const water = report?.environmental_impact?.water_litres || 0;
  const trees = report?.trees_required || 0;

  const aiSuggestion =
    report?.suggestions
      ?.map((s) => `🌿 ${s.title}: ${s.description}`)
      .join("\n") || "";

  useEffect(() => {
    if (!report) {
      navigate("/upload");
      return;
    }
    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current <= score) setProgress(current);
      else clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [report, navigate, score]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedText(aiSuggestion.slice(0, i));
      i++;
      if (i > aiSuggestion.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [aiSuggestion]);

  const badge =
    score > 85
      ? "🌟 Green Hero"
      : score > 70
      ? "⚡ Efficient Coder"
      : score > 50
      ? "🌱 Needs Improvement"
      : "🔥 High Energy Consumption";

  const scaledCO2 = (co2 * runs).toFixed(2);
  const scaledWater = (water * runs).toFixed(2);

  function interpolateColor(color1, color2, factor) {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 0xff,
      g1 = (c1 >> 8) & 0xff,
      b1 = c1 & 0xff;

    const r2 = (c2 >> 16) & 0xff,
      g2 = (c2 >> 8) & 0xff,
      b2 = c2 & 0xff;

    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));

    return `rgb(${r}, ${g}, ${b})`;
  }

  const getSimulationBg = (runs) => {
    const maxRuns = 1000;
    const ratio = runs / maxRuns;

    const stops = [
      { color: "#bbf7d0", pos: 0 }, // green
      { color: "#fde047", pos: 0.33 }, // yellow
      { color: "#fb923c", pos: 0.66 }, // orange
      { color: "#f87171", pos: 1 }, // red
    ];

    let c1, c2, localRatio = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      if (ratio >= stops[i].pos && ratio <= stops[i + 1].pos) {
        c1 = stops[i];
        c2 = stops[i + 1];
        localRatio = (ratio - c1.pos) / (c2.pos - c1.pos);
        break;
      }
    }

    const bgColor = interpolateColor(c1.color, c2.color, localRatio);
    return {
      background: `linear-gradient(135deg, ${bgColor}, white)`,
      transition: "background 0.4s ease",
    };
  };

  const simulationBg = getSimulationBg(runs);

  
  const handleDownload = () => {
    window.print();
  };

  if (!report) return null;

  return (
    <div className="report-wrapper py-5">
    
      <div className="report-title animate__animated animate__fadeInDown mb-4">
        <img src="./logo.jpg" alt="GreenStack Logo" />
        <h2 className="fw-bold ms-3">Sustainability Report</h2>
      </div>

      <div className="d-flex justify-content-center mb-4 position-relative">
        <div
          className={`earth-circle ${score > 70 ? "earth-happy" : "earth-sad"}`}
        >
          <h2 className="fw-bold">{progress}%</h2>
        </div>
      </div>
      <div className="text-center mb-4">
        <span className="efficiency-badge">{badge}</span>
      </div>

      <div className="row text-center mb-4">
        <div className="col-md-3 mb-3">
          <div className="metric-card co2-card shadow-sm">
            <h5>🌍 CO₂ Emitted</h5>
            <p>{co2} kg / run</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="metric-card energy-card shadow-sm">
            <h5>⚡ Energy Consumed</h5>
            <p>{energy} kWh / run</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="metric-card water-card shadow-sm">
            <h5>💧 Water Used</h5>
            <p>{water} litres / run</p>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="metric-card trees-card shadow-sm">
            <h5>🌳 Trees Required</h5>
            <p>{trees} trees / 1M runs</p>
          </div>
        </div>
      </div>

      <div
        className="card shadow-sm mb-4 p-4 simulate-card text-center"
        style={simulationBg}
      >
        <h5 className="mb-3">Multi-run Simulation</h5>
        <input
          type="range"
          min="1"
          max="1000"
          value={runs}
          onChange={(e) => setRuns(e.target.value)}
          className="form-range"
        />
        <p>Runs: {runs}</p>

        <div className="simulation-stats d-flex justify-content-center gap-4 mt-3">
          <div className="highlight-box co2-box">
            <strong>{scaledCO2}</strong>
            <span className="unit"> kg CO₂</span>
          </div>
          <div className="highlight-box water-box">
            <strong>{scaledWater}</strong>
            <span className="unit"> litres water</span>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4 suggestion-card">
        <div className="card-body">
          <h5 className="card-title">AI Suggestions</h5>
          <p style={{ whiteSpace: "pre-line" }}>{typedText}</p>
        </div>
      </div>

      {report.code_examples && report.code_examples.length > 0 && (
        <div className="row">
          {report.code_examples.map((ex, i) => (
            <div key={i} className="col-md-6">
              <div className="card code-card shadow-sm mb-4">
                <div className="card-body">
                  <h5>Input Snippet {i + 1}</h5>
                  <pre className="bg-dark text-light p-3 rounded">
                    <code>{ex.input_snippet}</code>
                  </pre>
                  <h5 className="mt-3">Optimized Snippet {i + 1}</h5>
                  <pre className="bg-dark text-light p-3 rounded">
                    <code>{ex.optimized_snippet}</code>
                  </pre>
                  <p className="mt-2">{ex.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {report.detailed_explanation && (
        <div className="card shadow-sm mb-4 explanation-card">
          <div className="card-body">
            <h5>Detailed Explanation</h5>
            <ul>
              {report.detailed_explanation.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="card shadow-sm mb-4 summary-card">
        <div className="card-body">
          <h5>Summary</h5>
          <p>{report.summary}</p>
          <h6>Project Overview</h6>
          <p>{report.project_overview}</p>
          <h6>Assumptions</h6>
          <p>{report.environmental_impact?.assumptions}</p>
        </div>
      </div>
      <div className="card shadow-sm mb-4 ewaste-card">
        <div className="card-body">
          <h5>♻️ E-Waste Impact</h5>
          <ul>
            <li>Frequent hardware stress from inefficient algorithms can shorten the lifespan of CPUs/GPUs.</li>
            <li>Shorter device life directly increases e-waste as components are replaced sooner.</li>
            <li>Optimized code reduces device heating, extending hardware longevity.</li>
            <li>Every year, millions of tonnes of e-waste are generated globally — sustainable coding can reduce this.</li>
            <li>By writing efficient code, developers indirectly help minimize electronic waste and conserve resources.</li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-4">
        <button
          className="btn btn-success px-4 py-2 fw-bold"
          onClick={handleDownload}
        >
          Download Report
        </button>
      </div>
    </div>
  );
}
