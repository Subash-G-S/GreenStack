
require("dotenv").config();
console.log("Loaded key:", process.env.OPENAI_API_KEY?.slice(-4));

const { execSync } = require("child_process");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const os = require("os");
const AdmZip = require("adm-zip");
const { v4: uuidv4 } = require("uuid");
const { OpenAI } = require("openai");


const PORT = process.env.PORT || 4000;
if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY not set. Put it in .env");
}


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

//Multer
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB


function extractJSON(str) {
  if (!str || typeof str !== "string") return null;
  const start = str.indexOf("{");
  const end = str.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try {
      return JSON.parse(str.slice(start, end + 1));
    } catch (e) { /* ignore */ }
  }
  try { return JSON.parse(str); } catch (e) { return null; }
}


app.get("/", (req, res) => {
  res.send("GreenStack backend running. POST /api/analyze");
});

async function callOpenAI(systemPrompt, userPrompt, max_tokens = 2500) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens,
      temperature: 0.0
    });
    const text = completion.choices?.[0]?.message?.content ?? "";
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}


app.post("/api/analyze", upload.single("file"), async (req, res) => {
  console.log(`[${new Date().toISOString()}] /api/analyze called`);

  try {
    // ---------- CASE 1: GitHub repo URL ----------
    if (req.body && req.body.repoUrl) {
      const repoUrl = String(req.body.repoUrl).trim();
      const tmpDir = path.join(os.tmpdir(), "greenstack-repo-" + uuidv4());

      console.log("Cloning repo:", repoUrl);
      try {
        execSync(`git clone --depth 1 ${repoUrl} ${tmpDir}`, { stdio: "ignore" });
      } catch (err) {
        console.error(" Git clone failed:", err);
        return res.status(400).json({ error: "Failed to clone repo", detail: String(err) });
      }

      function walkDir(dir, out = []) {
        for (const name of fs.readdirSync(dir)) {
          const full = path.join(dir, name);
          const st = fs.statSync(full);
          if (st.isDirectory()) walkDir(full, out);
          else out.push({ path: full, size: st.size });
        }
        return out;
      }

      const allFiles = walkDir(tmpDir);
      const SOURCE_EXTS = [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".c", ".cpp", ".h", ".go", ".rs", ".php", ".rb"];
      const sourceFiles = allFiles.filter(f =>
        SOURCE_EXTS.includes(path.extname(f.path).toLowerCase())
      );

      if (sourceFiles.length === 0) {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
        return res.status(400).json({ error: "No supported source files found in repo" });
      }

      sourceFiles.sort((a, b) => b.size - a.size);
      const selected = sourceFiles.slice(0, 5);

      const parts = [];
      const filesAnalyzed = [];
      for (const f of selected) {
        try {
          const content = fs.readFileSync(f.path, "utf8");
          const rel = path.relative(tmpDir, f.path);
          parts.push(`=== FILE: ${rel} (size:${f.size}) ===\n${content}\n\n`);
          filesAnalyzed.push({ name: rel, size: f.size });
        } catch {}
      }

      const combinedCode = parts.join("\n\n");
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}

      const systemPromptRepo = `
You are an expert software engineer and sustainability analyst.
Analyze the provided GitHub repository and return JSON ONLY:

{
  "summary": string,
  "project_overview": string,
  "files_analyzed": [{ "name": string, "size": number, "notes": string }],
  "complexity": { "overall_time": string, "overall_space": string },
  "environmental_impact": {
    "explanation": string,
    "assumptions": string,
    "energy_kwh": number,
    "co2_kg": number,
    "water_litres": number
  },
  "efficiency_score": number,
  "suggestions": [{ "title": string, "description": string, "estimated_cpu_reduction_pct": number }],
  "code_examples": [
    { "input_snippet": string, "optimized_snippet": string, "explanation": string }
  ],
  "detailed_explanation": [string],
  "trees_required": number,
  "confidence": string
}
Guidelines:
- Always return at least 4 code_examples if possible.
- Detailed explanation must be long (10–15 sentences).
- Return detailed_explanation as an array of 5–7 bullet points.
- Trees_required = trees needed to offset 100000000000 runs.if the efficiency score is low, atleast keep one tree.
`;

      const userPromptRepo = `Analyze this repo code:\n\n${combinedCode}`;
      const open = await callOpenAI(systemPromptRepo, userPromptRepo, 3000);
      if (!open.ok) return res.status(500).json({ error: open.error });

      const parsed = extractJSON(open.text);
      if (!parsed) return res.json({ parse_error: true, raw: open.text, files_analyzed });
      parsed.files_analyzed = parsed.files_analyzed || filesAnalyzed;
      return res.json({ analysis: parsed });
    }

    // ---------- CASE 2: No file or code ----------
    if (!req.file && (!req.body || !req.body.code)) {
      return res.status(400).json({ error: "No file, repo, or code provided" });
    }

    // ---------- Prompt for single file/code ----------
    const systemPromptSingle = `
You are an expert software engineer and sustainability analyst.
Analyze the provided source code and return JSON ONLY:

{
  "summary": string,
  "project_overview": string,
  "complexity": {
    "overall_time": string,
    "overall_space": string,
    "functions": [{ "name": string, "time": string, "space": string, "notes": string }]
  },
  "environmental_impact": {
    "explanation": string,
    "assumptions": string,
    "energy_kwh": number,
    "co2_kg": number,
    "water_litres": number
  },
  "efficiency_score": number,
  "suggestions": [{ "title": string, "description": string, "estimated_cpu_reduction_pct": number }],
  "code_examples": [
    { "input_snippet": string, "optimized_snippet": string, "explanation": string }
  ],
  "detailed_explanation": [string],
  "trees_required": number,
  "confidence": string
}
Guidelines:
- Always include at least 4 code_examples if possible.
- Detailed explanation must be 12-13 sentences minimum, as an array of bullet points.
- Trees_required = trees needed to offset 10000000 runs.if the efficiency score is low (<60), atleast keep one tree.
- In tthe code snippet explanation, also include how the carbon emisssion is reduced due to that code optimization.
Default assumptions (unless stated otherwise in "assumptions"):
- CPU average power: 50W (0.05 kW)
- Runtime: estimate per single run (no arbitrary hours).
- Grid emission factor: 400 gCO₂ per kWh (0.4 kgCO₂/kWh).
- Do not assume batch runs; only calculate per-run impact.

`;

    // ---------- CASE 3: Raw code in JSON body ----------
    if (!req.file) {
      const codeContent = String(req.body.code || "");
      const userPrompt = `=== START CODE ===\n${codeContent}\n=== END CODE ===`;
      const open = await callOpenAI(systemPromptSingle, userPrompt, 2500);
      if (!open.ok) return res.status(500).json({ error: open.error });

      const parsed = extractJSON(open.text);
      if (!parsed) return res.json({ parse_error: true, raw: open.text });
      return res.json({ analysis: parsed });
    }

    // ---------- CASE 4: Uploaded single file or zip ----------
    const uploadedPath = path.resolve(req.file.path);
    const ext = path.extname(req.file.originalname || "").toLowerCase();

    // Non-zip file
    if (ext !== ".zip") {
      let code = "";
      try {
        code = fs.readFileSync(uploadedPath, "utf8");
      } catch {
        try { fs.unlinkSync(uploadedPath); } catch {}
        return res.status(400).json({ error: "File cannot be read" });
      }
      try { fs.unlinkSync(uploadedPath); } catch {}
      const userPrompt = `=== START CODE ===\n${code}\n=== END CODE ===`;
      const open = await callOpenAI(systemPromptSingle, userPrompt, 2500);
      if (!open.ok) return res.status(500).json({ error: open.error });

      const parsed = extractJSON(open.text);
      if (!parsed) return res.json({ parse_error: true, raw: open.text });
      return res.json({ analysis: parsed });
    }

    // Zip handling
    const tmpDir = path.join(os.tmpdir(), "greenstack-" + uuidv4());
    fs.mkdirSync(tmpDir, { recursive: true });
    try {
      const zip = new AdmZip(uploadedPath);
      zip.extractAllTo(tmpDir, true);
    } catch {
      try { fs.unlinkSync(uploadedPath); } catch {}
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
      return res.status(400).json({ error: "Failed to extract zip" });
    }
    try { fs.unlinkSync(uploadedPath); } catch {}

    function walkDir(dir, out = []) {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) walkDir(full, out);
        else out.push({ path: full, size: st.size });
      }
      return out;
    }

    const allFiles = walkDir(tmpDir);
    const sourceFiles = allFiles.filter(f =>
      [".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".c", ".cpp", ".h", ".go", ".rs", ".php", ".rb"]
        .includes(path.extname(f.path).toLowerCase())
    );

    if (sourceFiles.length === 0) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
      return res.status(400).json({ error: "No supported source files in zip" });
    }

    sourceFiles.sort((a, b) => b.size - a.size);
    const selected = sourceFiles.slice(0, 5);

    const parts = [];
    for (const f of selected) {
      try {
        const content = fs.readFileSync(f.path, "utf8");
        const rel = path.relative(tmpDir, f.path);
        parts.push(`=== FILE: ${rel} (size:${f.size}) ===\n${content}\n\n`);
      } catch {}
    }
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}

    const combinedCode = parts.join("\n\n");
    const userPromptZip = `Analyze project files:\n\n${combinedCode}`;
    const open = await callOpenAI(systemPromptSingle, userPromptZip, 3000);
    if (!open.ok) return res.status(500).json({ error: open.error });

    const parsed = extractJSON(open.text);
    if (!parsed) return res.json({ parse_error: true, raw: open.text });
    return res.json({ analysis: parsed });

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error", detail: String(err) });
  }
});




// ---- Start server ----
app.listen(PORT, () => {
  console.log(`✅ GreenStack backend listening on http://localhost:${PORT}`);
});
