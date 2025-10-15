# 🌱 GreenStack AI – Sustainable Code Intelligence
**_AI that analyzes, predicts, and reduces the environmental footprint of your code._**



---

## 🚀 Overview

**GreenStack AI** is an intelligent system that evaluates the *environmental impact of your code* — estimating **CO₂ emissions**, **energy usage**, **water consumption**, and **hardware strain** caused by algorithmic inefficiencies.  

It empowers developers to **code sustainably** by analyzing computational complexity and suggesting greener optimizations.

---

## 💡 Problem Statement

Every line of code consumes real-world energy when executed.  
Inefficient algorithms → higher CPU usage → increased electricity → more CO₂ emissions → faster hardware wear → **e-waste**.  

Yet, developers rarely see how their code affects the planet. 🌍  

**GreenStack AI** bridges this gap — translating code efficiency into tangible environmental impact metrics.

---

## 🧠 Solution

GreenStack provides:  
- 🌍 **Carbon footprint estimation** for code execution.  
- ⚡ **Energy consumption** prediction (kWh).  
- 💧 **Water used in cooling** estimation.  
- 🧩 **E-waste impact projection** based on device strain.  
- 🤖 **AI-powered code optimization** suggestions.  
- 📊 **Multi-run simulation** – see impact scaling with repeated executions.  
- 🖥️ **Device awareness** – detects system specs and predicts hardware wear.

---

## 🧩 Tech Stack

| Layer | Technology | Purpose |
|-------|-------------|----------|
| **Frontend** | React.js + Bootstrap + Animate.css | Interactive sustainability report dashboard |
| **Backend** | Node.js (Express) | API handling and AI communication |
| **ML Model** | Python (Scikit-learn + AST Parser) | Code complexity + energy regression |
| **Model Serving** | FastAPI / Flask | Local inference microservice for predictions |
| **Data** | Custom + Synthetic code profiling dataset | For model training and evaluation |

---

## 🧪 Core AI Pipeline

### 1️⃣ Feature Extraction (from code)
- Parses code using Python’s **AST (Abstract Syntax Tree)**.
- Extracts features: loops, recursion, calls, nesting depth, etc.

### 2️⃣ Model Training
Two ML models:
- **Complexity Classifier** → Predicts algorithmic complexity (O(n), O(n²)…).  
- **Energy Regressor** → Predicts kWh used per execution.

### 3️⃣ Environmental Impact Mapping
```
CO₂ Emission = Energy (kWh) × 0.4 kgCO₂/kWh  
Water Used = Energy × 2.5 litres/kWh  
Trees Required = CO₂ × 0.04
```

### 4️⃣ Visualization
A beautiful animated React dashboard:
- Multi-run slider with dynamic gradient background.  
- AI Suggestions panel.  
- Device health & battery drain estimation.  
- One-click “Download Sustainability Report”.

---

## 🧰 Setup Instructions

### 1️⃣ Clone the repo
```bash
git clone https://github.com/Subash-G-S/GreenStack.git
cd greenstack
```

### 2️⃣ Install dependencies

#### Backend:
```bash
cd greenstack
npm install
```

#### Frontend:
```bash
cd client
npm install
```

#### ML Model:
```bash
cd ml-model
pip install -r requirements.txt
```

### 3️⃣ Run services

npm run dev

---

## 🌿 Patent-worthy Innovations

1. 🔍 *Environmental impact prediction* directly from source code.  
2. 🧠 *Dual AI system* (Complexity classifier + Energy regressor).  
3. 💻 *Hardware-aware sustainability simulation* tied to local device metrics.  
4. 🌍 *Real-time visualization of code footprint*.  
5. ♻️ *Integration of software efficiency → e-waste reduction estimation*.

---

## 🧠 Future Plans

- Train a **CodeBERT fine-tuned model** for cross-language prediction.  
- Integrate **real hardware telemetry** (CPU/GPU sensors).  
- Add **live “Green Coding Assistant”** (browser plugin).  
- Extend to **software companies for carbon audit compliance**.  

---

## 🧑‍💻 Authors

**Team GreenStack**  
Built with 💚 by  
**G.S. Subash Chandra Bose(BACKEND) , Arun Pavin(FRONTEND) , Moule Kishan(UI/UX) , Sridev MR(FRONTEND & UI)**
👨‍💻 AI | Sustainability | Software Engineering  

---

## 🏆 Achievements

🏅 Developed during an **AI Hackathon**  
💬 Judge feedback: *“Apply for patent — unique and practical idea.”*  
🔋 Inspires developers to build **sustainable, eco-conscious software**.
