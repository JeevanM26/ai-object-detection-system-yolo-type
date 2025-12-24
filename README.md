# 🛰️ Orbital Watch: AI Safety Auditor

### 🚀 Overview
Orbital Watch is an automated facility safety monitor. Using **YOLOv8** for object detection and **Falcon 2 VLM** for contextual reasoning, it identifies safety equipment and generates real-time compliance audits.

### 🛠️ The Tech Stack
- **Vision:** YOLOv8 (Ultralytics) trained on custom safety datasets.
- **LLM Bonus:** Falcon 2 11B VLM for smart safety reporting.
- **Hosting:** Roboflow Hosted Inference API.
- **Frontend:** React + Tailwind CSS via Lovable.dev.

### 🤖 Detected Categories
Our model is specialized for 7 critical facility items:
`OxygenTank`, `NitrogenTank`, `FirstAidBox`, `FireAlarm`, `SafetySwitchPanel`, `EmergencyPhone`, `FireExtinguisher`.

### 💻 How to Run Locally
1. Clone the repo: `git clone https://github.com/JeevanM26/orbital-watch.git`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
