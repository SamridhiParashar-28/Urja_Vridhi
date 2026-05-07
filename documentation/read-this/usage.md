# 🚦 WattWise – Usage Instructions

This guide explains how to run the platform and test its core features.

---

## 🚦 How to Run

### 1. Automated Startup (Recommended)
The easiest way to start the entire platform (Backend + Landing Page) is using the provided automation scripts at the root:

- **Windows**: Double-click `run.bat`
- **Other/Python**: Run `python run.py` (Starts backend only)

The `run.bat` script will:
1. Install necessary backend dependencies (`npm install`).
2. Start the Node.js server in a separate window.
3. Automatically open the **Welcome Page** in your default browser.

### 2. Manual Startup
If you prefer to start the server manually:
1. Open a terminal in `Project-root/backend`.
2. Run `npm install`.
3. Run `node server.js`.
4. Open your browser and navigate to `http://localhost:5000`.

---

## 🧪 Testing Workflow

### 🔐 Authentication
1. **Register**: Click "Sign Up" and create a new account (min 6-char password).
2. **Login**: Use your credentials to enter the main dashboard.

### 📊 Monitoring & AI
1. **Explore Blocks**: Navigate through GH, BH, AB1, AB2, and Admin blocks to see real-time usage.
2. **AI Assistant**: Open the AI Assistant and ask questions like *"What is the projected usage for Facility Block 1 tomorrow?"* or *"How can we save energy in the Blocks?"*
3. **Forecasting**: Visit the Forecasting dashboard to see LSTM-based predictions and confidence levels.

### ⚙️ Admin Features
1. **Blocks Manager**: Create a custom block, set a description, and generate an OTP passkey to share access with other users.
2. **Theme Toggle**: Switch between **Cyberpunk Dark** and **Modern Light** modes using the toggle button in the header.

---

## 📝 Troubleshooting
- **API Error**: If the AI assistant doesn't respond, double-check your `GEMINI_API_KEY` in the `.env` file.
- **Port Conflict**: If port 5000 is occupied, update the `PORT` in the `.env` file and restart the server.
