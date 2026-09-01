# PulseCheck

**PulseCheck** is a lightweight API uptime and health monitoring platform.

It allows users to add HTTP endpoints, manually check their health, monitor response times, view uptime statistics, and maintain health-check history.

🎥 **Demo Video:** `https://youtu.be/2uaZrBS4Wqc`

## Features

* Add, edit and delete monitors
* Activate/deactivate monitors
* Manual health checks
* `UP` / `DOWN` / `UNKNOWN` status
* HTTP status code monitoring
* Response-time tracking
* Health-check history
* Uptime statistics
* Response-time trends
* Basic SSRF protection
* Web dashboard

> **Note:** Automatic/scheduled monitoring is planned for a future phase. Currently, health checks are triggered manually using **Check Now**.

## Tech Stack

```text
Frontend:
Next.js
React
JavaScript
Tailwind CSS

Backend:
Node.js
Express
JavaScript

Database:
MySQL

ORM:
Sequelize

Validation:
Joi

Planned:
node-cron
```

## Architecture

```text
        Next.js Frontend
               |
               | REST API
               v
        Node.js + Express
               |
               v
           Sequelize
               |
               v
             MySQL
```

The frontend communicates with the backend through REST APIs.
The backend handles business logic and database operations.

## Database

PulseCheck uses three main tables:

```text
             monitors
             /      \
            /        \
           v          v
   health_checks   incidents
```

* **monitors** — stores monitored endpoint configuration and current status
* **health_checks** — stores every health-check result
* **incidents** — stores downtime incidents

## Project Structure

```text
pulsecheck/
│
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # UI components
│   ├── services/         # API communication
│   └── lib/              # Helpers
│
├── backend/
│   └── src/
│       ├── config/       # Configuration
│       ├── models/       # Database models
│       ├── migrations/   # Database migrations
│       ├── routes/       # API routes
│       ├── controllers/  # Request handling
│       ├── services/     # Business logic
│       ├── validations/  # Joi validation
│       ├── middlewares/  # Middleware
│       └── utils/        # Utilities
│
└── README.md
```

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd pulsecheck
```

### 2. Setup Database

Create a MySQL database:

```sql
CREATE DATABASE pulsecheck;
```

### 3. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configure your database details in `.env`, then run:

```bash
npx sequelize-cli db:migrate
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 4. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

## Environment Variables

### Backend

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=pulsecheck
DB_USER=root
DB_PASSWORD=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Current Status

🚧 **Phase 5 — Web Dashboard**

Completed:

* Backend REST APIs
* MySQL database
* Monitor CRUD
* Manual health checks
* Health-check history
* Uptime statistics
* Next.js dashboard
* Monitor management UI
* Basic SSRF protection

### Next

* Automated scheduled health checks
* Incident detection and resolution
* Notifications
* Background processing

## Why I Built This

PulseCheck was built as a portfolio project to demonstrate practical experience with:

* Node.js & Express
* REST API development
* MySQL & Sequelize
* Service/controller architecture
* API validation
* HTTP monitoring
* Next.js
* Frontend/backend integration
* Basic security considerations

## License

This project is built for educational and portfolio purposes.
