<div align="center">
  <img src="https://img.icons8.com/color/96/000000/network--v1.png" alt="GraphSentinel Logo" />
  <h1>GraphSentinel</h1>
  <p><strong>Advanced Machine Learning Fraud Detection Platform</strong></p>
  
  <p>
    <a href="https://webapp-graph-sentinel.vercel.app/">Live Web App</a> • 
    <a href="https://webapp-graphsentinel.onrender.com/docs">API Docs</a> • 
    <a href="https://drive.google.com/drive/u/0/folders/1MQOKIqHLCUMt5Rm8bgUq4X4D_Vmsabsp">Video Walkthrough</a>
  </p>
</div>

---

## 📖 Overview

**GraphSentinel** is a robust, full-stack application designed to detect and analyze complex financial fraud rings using graph-based Machine Learning. By analyzing the relationships between accounts and their transactions, GraphSentinel identifies suspicious networks that traditional rule-based systems often miss.

## 🔗 Quick Links

- 🌐 **Live Application:** [https://webapp-graph-sentinel.vercel.app/](https://webapp-graph-sentinel.vercel.app/)
- 💻 **GitHub Repository:** [https://github.com/rahulkate173/Webapp-graphSentinel](https://github.com/rahulkate173/Webapp-graphSentinel)
- 🧠 **ML Server API:** [https://webapp-graphsentinel.onrender.com/](https://webapp-graphsentinel.onrender.com/)
- 📚 **API Documentation (Swagger):** [https://webapp-graphsentinel.onrender.com/docs](https://webapp-graphsentinel.onrender.com/docs)
- 🎥 **Video Demo / Walkthrough:** [Google Drive / YouTube Links](https://drive.google.com/drive/u/0/folders/1MQOKIqHLCUMt5Rm8bgUq4X4D_Vmsabsp)

---

## ✨ Key Features

- **🛡️ Secure Authentication:** Fully secured with cross-site, HTTP-Only cookies for enterprise-grade protection.
- **📊 Real-time Dashboard:** Interactive analytics featuring Recharts visualizations for total accounts analyzed, fraud rings detected, and suspicion scores.
- **☁️ Cloud Data Ingestion:** Upload bulk transaction and account CSV files directly to Cloudinary, triggering background ML pipelines.
- **🕸️ Graph Visualization:** Deep-dive into fraud rings to explore member accounts and the exact flow of illicit transactions.
- **⚙️ Live Job Monitoring:** Real-time progress updates on ML analysis jobs powered by Socket.IO.
- **📄 SAR Generation:** Automatically draft and export Suspicious Activity Reports (SAR) based on detected financial crimes.
- **🔑 API Key Management:** Generate and manage secure API keys for integrating GraphSentinel's inference engine into external services.

---

## 🛠️ Technology Stack

### Frontend
- **React.js (Vite)** – High-performance UI rendering
- **Redux Toolkit** – Global state management
- **React Router** – Secure, protected routing
- **Recharts** – Dynamic data visualization
- **Lucide React** – Beautiful, modern icon set

### Backend
- **Node.js & Express.js** – Scalable REST API architecture
- **MongoDB & Mongoose** – NoSQL database for persistent analysis history and user accounts
- **Socket.IO** – WebSockets for real-time, bi-directional job tracking
- **JWT & HTTP-Only Cookies** – Stateless, secure authentication

### ML Inference Engine
- **Python / FastAPI** – High-performance API server for ML predictions
- **Graph Neural Networks (GNN)** – Analyzes network topologies to flag coordinated fraud rings

---

## 🚀 Getting Started

To run GraphSentinel locally, you will need Node.js and MongoDB installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/rahulkate173/Webapp-graphSentinel.git
cd Webapp-graphSentinel
```

### 2. Setup the Backend
```bash
cd backend
npm install
# Ensure you create a .env file with your MONGO_URI, JWT_SECRET, and CLOUDINARY credentials
npm run dev
```

### 3. Setup the Frontend
```bash
cd frontend
npm install
# Ensure you create a .env file with VITE_API_URL set to your backend URL
npm run dev
```

