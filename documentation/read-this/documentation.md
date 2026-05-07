# 📖 WattWise – Project Documentation

This document provides a detailed overview of the features, technology stack, and planning phase of the WattWise platform.

---

## 🚀 Key Features

### 🔐 1. Advanced Security & E2EE
- **User Authentication**: Secure JWT-based registration and login with `bcryptjs` hashing.
- **End-to-End Encryption (E2EE)**: Sensitive dataset entries are encrypted client-side using AES-256-GCM before being stored in the database.
- **Secure Sharing**: Access to datasets and custom "Blocks" is managed via **10-character OTP passkeys** valid for 24 hours.

### 📊 2. Real-Time Monitoring & Visualization
- **Live Consumption Tracking**: Monitor energy usage across different Environment blocks (Blocks, Facility, Admin) in real-time.
- **Interactive Dashboards**: High-fidelity charts powered by **Chart.js v4** showing 7-day trends and block-wise analysis.
- **Dynamic Blocks Manager**: Admins can create and manage custom Environment environments (blocks) dynamically.

### 🤖 3. Intelligent AI Assistant
- **Gemini-Powered AI**: A multi-turn conversational AI assistant that provides deep insights into Environment energy usage.
- **Context-Aware**: The AI understands the specific Environment layout and historical data to provide actionable energy-saving recommendations.

### 🔮 4. Predictive Forecasting
- **Hybrid ML Model**: Integrates **LSTM + XGBoost** for next-day energy forecasting with over **94% accuracy**.
- **Confidence Scores**: Every prediction comes with a confidence metric and historical model performance data.
- **Custom Predictions**: Users can run predictions on their own uploaded datasets.

### 🚨 5. Anomaly Detection & Billing
- **Automated Alerts**: Intelligent detection of unusual consumption patterns with severity-based visual alerts.
- **Billing Simulation**: Real-time budget tracking and billing simulation with visual progress bars.

### 🎨 6. Premium Cyberpunk UI
- **Dynamic Themes**: Seamless switching between **Cyberpunk Dark** and **Modern Light** modes.
- **Responsive Design**: Fully optimized for mobile and desktop with a scrollable sidebar and smooth micro-animations.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 (Custom Design System), Chart.js.
- **Backend**: Node.js, Express.js (v5) — handles both API and static file hosting.
- **Single Origin**: Entire platform is served from `http://localhost:5000`, eliminating cross-origin (CORS) and `file://` security issues.
- **Database**: Native `node:sqlite` for high-performance, zero-config persistent storage.
- **Security**: JWT, bcryptjs, AES-256-GCM (for E2EE).
- **AI**: Google Gemini API (integrated via secure proxy).
- **Automation**: Windows Batch (`run.bat`) and Python (`run.py`) for automated startup.

---

## 📸 Planning & Design Phase

WattWise was developed with meticulous planning. Here are some of the initial design and workflow sketches:

| Planning Phase | Workflow Prototype | Data Schema |
| :---: | :---: | :---: |
| ![Main Plan](../documentation/planing-notes-img/main%20dahsboard%20final%20plan.jpeg) | ![Workflow](../documentation/planing-notes-img/explained%20work%20flow%20of%20the%20dashboard.jpg) | ![Dataset Schema](../documentation/planing-notes-img/coloumns%20in%20the%20dataset.jpg) |

---
