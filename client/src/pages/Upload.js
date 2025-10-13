import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUploadFile = async () => {
    setError("");
    if (!file) return setError("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const url = "http://localhost:4000/api/analyze";
      const res = await fetch(url, { method: "POST", body: formData });

      const responseText = await res.text();
      if (!res.ok) throw new Error(`Server error ${res.status}: ${responseText}`);

      const data = JSON.parse(responseText);
      if (data.analysis) {
        navigate("/report", { state: { report: data.analysis } });
      } else {
        setError("Unexpected server response");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRepo = async () => {
    setError("");
    if (!repoUrl) return setError("Please enter a GitHub repo URL.");

    setLoading(true);
    try {
      const url = "http://localhost:4000/api/analyze";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });

      const responseText = await res.text();
      if (!res.ok) throw new Error(`Server error ${res.status}: ${responseText}`);

      const data = JSON.parse(responseText);
      if (data.analysis) {
        navigate("/report", { state: { report: data.analysis } });
      } else {
        setError("Unexpected server response");
      }
    } catch (err) {
      console.error("Repo analysis failed:", err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 text-center">
      <h3 className="upp">Analyze Your Project</h3>

      <div className="card p-4 mb-4 shadow-sm">
        <h5>Upload Files/Zip</h5>
        <input type="file" onChange={handleFileChange} className="form-control my-3" />
        <button
          className="btn btn-success"
          onClick={handleUploadFile}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze File"}
        </button>
      </div>

      <div className="my-3">OR</div>

      <div className="card p-4 shadow-sm">
        <h5>Analyze from GitHub</h5>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter GitHub repo URL (e.g. https://github.com/user/repo)"
          className="form-control my-3"
        />
        <button
          className="btn btn-primary"
          onClick={handleAnalyzeRepo}
          disabled={loading}
        >
          {loading ? "Cloning & Analyzing..." : "Analyze from GitHub"}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger mt-3" style={{ whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      )}
    </div>
  );
}
