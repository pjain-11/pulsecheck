# PulseCheck

PulseCheck is a lightweight API uptime and health monitoring platform designed to monitor HTTP endpoints, track response times, detect downtime, record incidents, and calculate uptime.

> **Status:** Phase 5 — web dashboard. PulseCheck is now fully usable from the browser: add/edit/delete monitors, run manual health checks, and view per-monitor history and statistics.
>
> **Automatic monitoring is intentionally not implemented yet. Health checks are triggered manually using the "Check Now" button** (no cron, scheduler, or background workers).

## Features

Available now:

- Monitoring dashboard (totals, per-monitor status, recent activity)
- Monitor CRUD (create, edit, delete, activate/deactivate) from the UI
- Manual health checks — real HTTP request, response-time measurement, `UP`/`DOWN`
- HTTP status monitoring against an exact expected status code
- Response-time tracking with a per-monitor trend
- Health-check history
- Uptime and check statistics per monitor

Planned for later phases:

- Automated (scheduled) health checks via `node-cron`
- Incident detection and resolution

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
Next.js Frontend  (App Router, client components)
       │
       │  HTTP / REST   (NEXT_PUBLIC_API_URL)
       ▼
Node.js + Express  (routes → controllers → services)
       │
       ▼
Sequelize
       │
       ▼
MySQL
```

The frontend never talks to MySQL directly — every read and write goes
through the Express API. All API calls live in `frontend/services/api.js`.

## Project Structure

```text
pulsecheck/
├── frontend/                 # Next.js application (App Router, JavaScript)
│   ├── app/                  # routes: / , /monitors , /monitors/new , /monitors/[id](/edit)
│   ├── components/           # StatusBadge, MonitorForm, CheckNowButton, HealthHistory, ...
│   ├── services/api.js       # the only place that calls the backend
│   └── lib/                  # formatting + data-loading helpers
├── backend/                  # Express application (JavaScript)
│   └── src/
│       ├── config/           # env + Sequelize configuration
│       ├── models/           # Sequelize models (Monitor, HealthCheck, Incident)
│       ├── migrations/       # Sequelize migrations
│       ├── routes/           # Express routers
│       ├── controllers/      # HTTP layer (request -> service -> response)
│       ├── services/         # monitor CRUD + health-check engine + read models
│       ├── validations/      # Joi request schemas
│       ├── middlewares/      # validation + error handling
│       └── utils/            # helpers (ApiError, urlGuard, ...)
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

Run the backend first, then the frontend, in two terminals.

### Backend

```bash
cd backend
npm install
cp .env.example .env        # then set DB_PASSWORD etc.
npx sequelize-cli db:migrate
npm run dev
```

The backend runs on http://localhost:5000.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # NEXT_PUBLIC_API_URL defaults to the local backend
npm run dev
```

The frontend runs on http://localhost:3000. Open it in a browser, add a
monitor, and use **Check Now**.

### API health check

```text
GET http://localhost:5000/api/health
→ { "success": true, "message": "PulseCheck API is running" }
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

## Health Check API

```text
POST /api/monitors/:id/check
```

Performs a **manual** health check against the configured monitor URL. It
makes one HTTP request (using the monitor's `method` and `timeout`), measures
the response time, decides `UP` / `DOWN`, then:

- inserts a new row into `health_checks` with
  `status`, `status_code`, `response_time` (ms), `error_message`, `checked_at`
- updates `monitors.status` to the result (`is_active` is never changed)

The health-check row and the monitor status update are written in a single
database transaction. The outbound HTTP request happens **before** the
transaction is opened.

### UP vs DOWN

- **UP** — the response status code exactly equals `expected_status_code`.
  (A 2xx that is not the expected code is still `DOWN`.)
- **DOWN** — the status code does not match, or the request fails
  (DNS failure, connection refused, TLS error) or times out.

### Response

A completed check always returns `200 OK`, even when the target is `DOWN` —
PulseCheck successfully determined the target's health. `4xx`/`5xx` are only
used when PulseCheck cannot run the check at all.

```json
{
  "success": true,
  "message": "Health check completed",
  "data": {
    "monitor_id": 1,
    "status": "UP",
    "status_code": 200,
    "response_time": 182,
    "checked_at": "2026-08-30T03:00:00.000Z",
    "error_message": null
  }
}
```

| Situation | HTTP | Body |
| --- | --- | --- |
| Check ran (target UP or DOWN) | `200` | `data` with the result |
| Monitor `is_active = false` | `400` | `{ "success": false, "message": "Monitor is inactive" }` (no `health_checks` row) |
| Monitor does not exist | `404` | `{ "success": false, "message": "Monitor not found" }` |
| Non-numeric id | `400` | validation error |
| URL blocked by SSRF guard | `400` | `{ "success": false, "message": "Monitor URL is not allowed: ..." }` |

### Request details & SSRF note

Every request sends `User-Agent: PulseCheck/1.0` and no authentication
headers. The response body is **not** stored — only the status code, timing,
and outcome.

Before each request the URL is screened by a lightweight guard
(`src/utils/urlGuard.js`): `http`/`https` only, and literal `localhost` /
loopback / private / link-local addresses are rejected. **HTTP redirects are
not followed** (`redirect: "manual"`), so a redirect cannot bounce the
request to an internal target; a `3xx` response is compared to
`expected_status_code` as-is. This is an MVP guard — it does not resolve DNS,
so a public hostname pointing at a private address still passes. A production
deployment needs DNS-resolution checks, connection pinning, and network-level
egress controls.

> Automatic scheduled monitoring will be added in a later phase; for now
> checks only run when you call this endpoint.

## Read Endpoints (dashboard / detail page)

| Method | Path | Returns |
| --- | --- | --- |
| `GET` | `/api/monitors/:id/checks` | recent `health_checks` for the monitor, newest first (`?limit=`, default 50, max 200) |
| `GET` | `/api/monitors/:id/incidents` | incidents for the monitor, newest first (empty until incident tracking lands) |
| `GET` | `/api/monitors/:id/stats` | `total_checks`, `successful_checks`, `failed_checks`, `uptime_percentage`, `average_response_time`, `current_status`, `last_check` |
| `GET` | `/api/activity` | most recent health checks across **all** monitors, each with `monitor_name` (`?limit=`, default 20, max 100) |

`GET /api/monitors` and `GET /api/monitors/:id` also include a `last_check`
summary object (or `null`).

## Frontend (web dashboard)

The Next.js app in `frontend/` is a client-rendered dashboard over the Express
API. Pages:

| Route | Purpose |
| --- | --- |
| `/` | Dashboard — monitor counts (total / up / down / unknown), monitor list, recent activity feed |
| `/monitors` | All monitors: status, last response time, last checked, active toggle, **Check Now**, view/edit/delete |
| `/monitors/new` | Add-monitor form (client-side validation mirroring the backend) |
| `/monitors/[id]` | Details: status, config, uptime & check stats, response-time trend, health-check history, incidents, **Check Now**, edit / activate / delete |
| `/monitors/[id]/edit` | Edit the monitor's configuration |

Reusable components: `StatusBadge`, `StatCard`, `MonitorForm`, `CheckNowButton`,
`HealthHistory`, `ResponseSparkline`, `IncidentList`, `ConfirmDialog`,
`States` (loading / empty / error). Every backend call goes through
`frontend/services/api.js`.

**Manual health-check flow:** open a monitor → click **Check Now** → the button
shows *Checking…* → the frontend calls `POST /api/monitors/:id/check` → the
backend requests the target URL → the result (`UP`/`DOWN`, HTTP status,
response time, checked-at, error) is shown and the history / stats refresh.
There is no polling or auto-refresh.

## Environment Variables

### Backend — `backend/.env` (copy from `backend/.env.example`)

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=pulsecheck
DB_USER=root
DB_PASSWORD=
```

The intended local database name is `pulsecheck`. See **Database Setup** above for creating the database and running migrations.

### Frontend — `frontend/.env.local` (copy from `frontend/.env.example`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Base URL of the Express API. `.env.local` is git-ignored; `.env.example` is
committed.
