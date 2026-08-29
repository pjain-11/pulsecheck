# PulseCheck

PulseCheck is a lightweight API uptime and health monitoring platform designed to monitor HTTP endpoints, track response times, detect downtime, record incidents, and calculate uptime.

> **Status:** Phase 3 — Monitor CRUD REST API (create / read / update / delete / activate). Actual HTTP health checking, scheduling and incident logic are still to come. The features below are planned and will be implemented in later phases.

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

Validation:
Joi

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
│       ├── config/        # env + Sequelize configuration
│       ├── models/        # Sequelize models (Monitor, HealthCheck, Incident)
│       ├── migrations/    # Sequelize migrations
│       ├── routes/        # Express routers
│       ├── controllers/   # HTTP layer (request -> service -> response)
│       ├── services/      # business / persistence logic
│       ├── validations/   # Joi request schemas
│       ├── middlewares/   # validation + error handling
│       └── utils/         # small shared helpers
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

## Monitor API

Base path: `/api/monitors`

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/monitors` | Create a monitor |
| `GET` | `/api/monitors` | List all monitors (newest first) |
| `GET` | `/api/monitors/:id` | Get a single monitor |
| `PUT` | `/api/monitors/:id` | Replace a monitor's editable configuration |
| `DELETE` | `/api/monitors/:id` | Delete a monitor (cascades to its health checks and incidents) |
| `PATCH` | `/api/monitors/:id/status` | Activate / deactivate a monitor (`is_active` only) |

### Responses

All responses use a consistent envelope:

```json
{ "success": true, "message": "...", "data": {} }
```

```json
{ "success": false, "message": "..." }
```

```json
{ "success": false, "message": "Validation failed", "errors": [
  { "field": "url", "message": "url must be a valid HTTP or HTTPS URL" }
] }
```

### Create a monitor

`POST /api/monitors`

```json
{
  "name": "GitHub API",
  "url": "https://api.github.com",
  "method": "GET",
  "expected_status_code": 200,
  "check_interval": 5,
  "timeout": 10000
}
```

Only `name` and `url` are required. `method` (`GET`), `expected_status_code`
(`200`), `check_interval` (`5` minutes) and `timeout` (`10000` ms) default if
omitted. `status`, `is_active` and the timestamps are set by the backend and
cannot be supplied by the client.

Response — `201 Created`:

```json
{
  "success": true,
  "message": "Monitor created successfully",
  "data": {
    "id": 1,
    "name": "GitHub API",
    "url": "https://api.github.com",
    "method": "GET",
    "expected_status_code": 200,
    "status": "UNKNOWN",
    "is_active": true,
    "check_interval": 5,
    "timeout": 10000
  }
}
```

A new monitor's `status` is always `UNKNOWN`. It stays `UNKNOWN` until the
health-check engine (Phase 4) runs a real check against the URL and sets it to
`UP` or `DOWN`.

### Update semantics

`PUT /api/monitors/:id` replaces the full editable configuration, so **all six
editable fields** (`name`, `url`, `method`, `expected_status_code`,
`check_interval`, `timeout`) are required. To only toggle active state, use
`PATCH /api/monitors/:id/status` with `{ "is_active": true | false }`.

### Validation rules

| Field | Rules |
| --- | --- |
| `name` | required, 1–150 chars |
| `url` | required, valid `http`/`https` URL, ≤ 2048 chars (other protocols rejected) |
| `method` | one of `GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS` (upper-cased before storing) |
| `expected_status_code` | integer 100–599 |
| `check_interval` | integer 1–1440 (minutes) |
| `timeout` | integer 1–120000 (milliseconds) |

Deleting responds with `200 OK` and `{ "success": true, "message": "Monitor deleted successfully" }`.
Unknown IDs return `404`; non-numeric IDs return `400`.

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
