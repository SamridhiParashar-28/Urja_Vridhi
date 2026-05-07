# 🛠️ WattWise – Local Setup Instructions

This guide will help you configure the environment and prepare the platform for execution.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) — [Download here](https://nodejs.org)
- **npm** (included with Node.js)
- **Python 3.x** (optional, for `run.py`)

---

## ⚙️ Configuration

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd Watt-Wise
   ```

2. **Environment Variables**:
   Navigate to the backend directory and create a `.env` file:
   ```bash
   cd Project-root/backend
   ```
   Create a file named `.env` and add the following:
   ```env
   PORT=5000
   JWT_SECRET=your_secure_secret_key_2026
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
   *Note: You can get a Gemini API key from the [Google AI Studio](https://aistudio.google.com/).*

3. **Backend Initialization**:
   The `run.py` script at the root will handle dependency installation and server startup. If you prefer manual installation:
   ```bash
   npm install
   ```

---
