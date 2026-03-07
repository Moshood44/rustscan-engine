# RustScan

A high-performance, cross-chain analytics utility allowing real-time forensic
scanning of Ethereum & Solana wallet addresses utilizing Alchemy RPC technology.

## Monorepo Architecture

This workspace utilizes a decoupled Monorepo structure prioritizing cloud
deployment:

- `/frontend` - React application built on Vite, styled with Tailwind v4.
  Designed for rapid edge deployments (e.g., Vercel, Netlify).
- `/backend` - Safe, blazing-fast Rust API utilizing Axum and Reqwest.
  Dockerized and optimized for high-performance platform endpoints (e.g.,
  Railway, Render).

---

## 🛠 Local Development Setup

### 1. Variables & API Keys

Ensure you create the necessary environment files in their respective folders:

**Backend (`backend/.env`)**

```env
# Required for querying EVM and Solana chains
ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY_HERE
```

**Frontend (`frontend/.env.local` - Optional for Local)**

```env
# Tells Vite to route API scans targeting the local Rust Server.
# Only required if changing the backend's local binding port.
VITE_API_URL=http://localhost:8080
```

### 2. Running Both Servers Concurrenty

To run this application locally, you must run both pieces of the stack
simultaneously.

**Rust Backend (Port 8080 default):**

```bash
cd backend
cargo run
```

**React Frontend (Port 5173 default):**

```bash
cd frontend
npm install
npm run dev
```

Access the application UI by visiting `http://localhost:5173`.

---

## 🚀 Cloud Deployment

### Deploying the Frontend (Vercel)

Deploying the Vite React application is simple:

1. Connect your repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Add the `VITE_API_URL` Environment Variable, pointing it to your deployed
   Railway backend URL (e.g. `https://rustscan-api.up.railway.app`).
4. Click Deploy.

### Deploying the Backend (Railway / Docker)

The backend utilizes a slim, multi-stage `Dockerfile`.

1. Connect your repository to Railway.
2. Set the Root Directory to `backend`. Railway will automatically execute the
   `Dockerfile`.
3. Set your `ALCHEMY_API_KEY` under the Railway Variables tab.
4. Railway automatically provides the `PORT` inject natively at runtime. No
   config is needed.
