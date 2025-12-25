# ⚠️ IMPORTANT: READ THIS BEFORE EVALUATION ⚠️

" TO GET REAL WORLD EXPERIANCE, i have trained this model with "i5 8gen cpu" (**NO GPU USED**)
with "320p"(now if we provide high quality images it detaects ) with only "10 epochs" and i got maxim of 0.8 mAP50
it worked great but my idea is to **integrate the model with duality falcun ai** so 
when a new item is added my model will ask the falcon ai to generate the images and train itself and 
where it has less mop50 it will train again in that certain part and improve it self continuesly "

# 🛰️ Orbital Watch: AI Safety Auditor
# it is YOLO (you can look once) type model trained
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
