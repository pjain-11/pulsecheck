# PulseCheck

PulseCheck is a lightweight API uptime and health monitoring platform designed to monitor HTTP endpoints, track response times, detect downtime, record incidents, and calculate uptime.

> **Status:** Phase 2 — MySQL database schema (Sequelize models + migrations). API endpoints and monitoring logic are still to come. The features below are planned and will be implemented in later phases.

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
│   └── src/
│       ├── config/       # env + Sequelize configuration
│       ├── models/       # Sequelize models (Monitor, HealthCheck, Incident)
│       └── migrations/   # Sequelize migrations
├── README.md
└── .gitignore
```

## Database Schema

```text
                  monitors
                     │
             ┌───────┴───────┐
             ▼               ▼
       health_checks      incidents
```

- **monitors** — one row per HTTP endpoint being watched. Holds the request
  config (`url`, `method`, `expected_status_code`, `timeout`), the schedule
  (`check_interval`, in minutes), the current `status`
  (`UP` / `DOWN` / `UNKNOWN`), and an `is_active` flag.
- **health_checks** — one row per check performed against a monitor. Records
  the outcome (`status` `UP` / `DOWN`), the HTTP `status_code`, the
  `response_time` in milliseconds, any `error_message`, and `checked_at`.
- **incidents** — one row per downtime period for a monitor. Tracks `status`
  (`OPEN` / `RESOLVED`), the `reason`, `started_at`, and `resolved_at`.

Relationships:

- `Monitor` has many `HealthCheck` and many `Incident` (foreign key `monitor_id`).
- `HealthCheck` and `Incident` each belong to one `Monitor`.
- Foreign keys use `ON DELETE CASCADE` / `ON UPDATE CASCADE`, so removing a
  monitor removes its checks and incidents.

## Database Setup

```text
Database:      MySQL
Database name: pulsecheck
```

The database itself is not created automatically. Create it once:

```sql
CREATE DATABASE pulsecheck;
```

Then, from `backend/` (with `.env` configured), run the migrations:

```bash
npx sequelize-cli db:migrate
```

Roll back the most recent migration:

```bash
npx sequelize-cli db:migrate:undo
```

Migration status:

```bash
npx sequelize-cli db:migrate:status
```

After migrating, the `pulsecheck` database contains `monitors`,
`health_checks`, `incidents`, and Sequelize's own `SequelizeMeta` table.

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

The intended local database name is `pulsecheck`. See **Database Setup** above for creating the database and running migrations.
