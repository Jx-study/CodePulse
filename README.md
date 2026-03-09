# CodePulse
---
<div align="center">

### 程式與演算法視覺化教學平台

**Visualize code. Understand algorithms. Learn by seeing.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![CI](https://img.shields.io/badge/CI-coming_soon-lightgrey)](https://github.com/Jx-study/CodePulse)

[Report Bug](https://github.com/Jx-study/CodePulse/issues) · [Request Feature](https://github.com/Jx-study/CodePulse/issues)

</div>

---

---

## Features

- **Algorithm Animation** — Step-by-step visualization of sorting, searching, graph algorithms and more
- **Code Explorer** — Paste any Python code and watch it execute line by line
- **Variable Snapshot** — Real-time display of variable states and memory references
- **Knowledge Map** — Interactive graph connecting algorithm concepts and prerequisites
- **AI Algorithm Detection** — Automatically identifies the algorithm in your code (powered by Gemini API)
- **Progress Tracking** — XP system, achievements, and leaderboard to keep you motivated

---

## Tech Stack

<div align="center">

### Frontend
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![D3.js](https://img.shields.io/badge/D3.js-F9A03C?style=for-the-badge&logo=d3dotjs&logoColor=white)](https://d3js.org/)

### Backend
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

---

## Getting Started

### Prerequisites

**Docker (recommended)**
- [Docker](https://www.docker.com/get-started) & Docker Compose

**Local Development**
- [Node.js](https://nodejs.org/) 18+
- [Python](https://python.org/) 3.11+

### Installation (Docker)

```bash
# 1. Clone the repo
git clone https://github.com/Jx-study/CodePulse.git
cd CodePulse

# 2. Set up environment variables
cp .env.example .env
# Edit .env: set DATABASE_URL and SECRET_KEY

# 3. Start with Docker
docker compose up

# Frontend → http://localhost:5173
# Backend  → http://localhost:5000
```

> **Windows users:** Run `docker-start.bat` for an interactive startup script with smart build detection.

### Local Development (without Docker)

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (separate terminal)
cd backend
pip install -r requirements.txt
python app.py
```
---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Jx-study/CodePulse&type=Date)](https://star-history.com/#Jx-study/CodePulse&Date)

---

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.