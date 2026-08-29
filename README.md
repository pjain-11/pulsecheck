# PulseCheck

PulseCheck is a lightweight API uptime and health monitoring platform designed to monitor HTTP endpoints, track response times, detect downtime, record incidents, and calculate uptime.

> **Status:** Phase 1 — project setup only. The features below are planned and will be implemented in later phases.

## Planned Features

These are planned features and will be implemented in later phases:

- API monitoring
- Manual health checks
- Automated health checks
- HTTP status monitoring
- Response-time tracking
- Uptime calculation
- Incident detection
- Incident resolution
- Health-check history
- Monitoring dashboard

## Tech Stack

```text
Frontend:
Next.js
JavaScript
React

Backend:
Node.js
Express
JavaScript

Database:
MySQL

ORM:
Sequelize

Scheduler:
node-cron
```

`node-cron` will be introduced in a later phase (automated health checks).

## Architecture

```text
Next.js Frontend
       │
       ▼
Node.js + Express
       │
       ▼
Sequelize
       │
       ▼
MySQL
```

## Project Structure

```text
pulsecheck/
├── frontend/      # Next.js application (App Router, JavaScript)
├── backend/       # Express application (JavaScript)
├── README.md
└── .gitignore
```

## Local Setup

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the normal Next.js development URL (http://localhost:3000).

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

Health check:

```text
GET http://localhost:5000/api/health
```

Response:

```json
{
  "success": true,
  "message": "PulseCheck API is running"
}
```

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and adjust as needed:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=pulsecheck
DB_USER=root
DB_PASSWORD=
```

The intended local database name is `pulsecheck`. No database, tables, models, or migrations are created in Phase 1.
