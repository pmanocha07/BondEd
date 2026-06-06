# BondEd — Student-Alumni Mentorship Platform

A REST API-backed web platform that connects students with alumni mentors through a weighted matching algorithm, connection requests, and profile-driven discovery.

**Live demo:** https://bonded-eug1.onrender.com

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | PostgreSQL (hosted on Render) |
| ORM | Prisma 6 |
| Auth | JSON Web Tokens + bcrypt |
| Security | express-rate-limit, configurable CORS allowlist |
| Frontend | HTML, Tailwind CSS, vanilla JavaScript |

---

## Features

- **Role-based accounts** — separate student and alumni roles with distinct permissions enforced at every endpoint
- **Weighted matching** — algorithm scores alumni by domain overlap (+3), shared interests (+1 each), and graduation-year proximity (+1 within a configurable range); results are sorted by score then alphabetically
- **Connection lifecycle** — students send requests; alumni accept or decline; duplicate prevention at both the database and application layer
- **Alumni directory** — filterable list with individual profile lookup
- **Profile management** — authenticated users can view and update their own profile
- **Rate limiting** — 30 requests per 15 minutes on auth endpoints to resist brute-force attempts

---

## Architecture Overview

BondEd is a two-tier application: a static HTML/CSS/JS frontend and a Node.js REST API that talks to a PostgreSQL database via Prisma.

### How the three core systems fit together

**Auth** issues a signed JWT on signup/login. Every protected route passes the token through the `auth` middleware, which verifies the signature and attaches the full user record (including profile) to `req.user`. Role guards sit on top of `auth` and short-circuit requests from the wrong role before they reach the controller.

**Matching** is student-only. When a student hits `GET /api/match`, the controller fetches all alumni, passes each alumni profile through `scoreMatch()` alongside the student's own profile, then returns the ranked list. Scores are computed in memory — no extra DB round-trips.

**Connections** are a simple state machine: `pending → accepted | declined`. Students create requests; only the target alumnus can update the status. A composite unique index on `(studentId, alumniId)` prevents duplicate requests at the database level.

```mermaid
flowchart TD
    Client([Browser / Frontend])

    subgraph Express API
        Auth[auth middleware\nJWT verify + DB lookup]
        RoleGuard[requireRole guard]
        subgraph Controllers
            AC[authController\nsignup · login]
            PC[profileController\ngetMe · updateMe · listAlumni]
            MC[matchController\ngetMatches]
            CC[connectionController\ncreate · update · list]
        end
    end

    subgraph Data
        Prisma[Prisma ORM]
        PG[(PostgreSQL)]
    end

    Client -->|POST /api/auth/*| AC
    Client -->|Bearer token| Auth
    Auth --> RoleGuard
    RoleGuard --> PC
    RoleGuard --> MC
    RoleGuard --> CC
    AC --> Prisma
    PC --> Prisma
    MC -->|scoreMatch| Prisma
    CC --> Prisma
    Prisma --> PG
```

### Data model (simplified)

```
User ──< Profile      (one-to-one, cascades on delete)
User ──< Connection   (as student, relation "StudentConnections")
User ──< Connection   (as alumni,  relation "AlumniConnections")
Connection: pending | accepted | declined
```

---

## Local Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or remote)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/pmanocha07/BondEd.git
cd BondEd/backend

# 2. Install dependencies
npm install

# 3. Create .env
cp .env.example .env
# Fill in the values (see Environment Variables below)

# 4. Run migrations and generate Prisma client
npx prisma migrate dev
npm run prisma:generate

# 5. (Optional) Seed the database
npm run seed

# 6. Start the dev server
npm run dev
# API is now running at http://localhost:3000
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/bonded` |
| `JWT_SECRET` | Secret used to sign tokens | any long random string |
| `CORS_ORIGIN` | Comma-separated list of allowed origins | `http://localhost:8080,https://yourdomain.com` |
| `PORT` | Port the server listens on (optional, defaults to 3000) | `3000` |
| `MATCH_GRAD_YEAR_RANGE` | Max year gap for the graduation-year match bonus (optional, defaults to 3) | `3` |

---

## API Endpoints

All protected routes require `Authorization: Bearer <token>`.

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Liveness check |

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Register a new student or alumni |
| POST | `/api/auth/login` | — | Authenticate and receive a JWT |

**Rate limit:** 30 requests / 15 min on both auth routes.

### Profile

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/profile/me` | Required | Get your own profile |
| PUT | `/api/profile/me` | Required | Update your own profile |

### Alumni Directory

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/alumni` | Required | List all alumni (supports `domain`, `minYear`, `maxYear` query params) |
| GET | `/api/alumni/:id` | Required | Get a single alumni profile by user ID |

### Matching

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/api/match` | Required | `student` only |

Query params: `domain`, `minYear`, `maxYear`. Returns alumni ranked by match score descending.

### Connections

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/connections` | Required | Send a connection request (student → alumni) |
| PATCH | `/api/connections/:id` | Required | Accept or decline a request (alumni only) |
| GET | `/api/connections` | Required | List your connections; filter by `?status=pending\|accepted\|declined` |

---

## What I Would Build Next

1. **Email notifications** — send a transactional email when a connection is accepted, using Resend or Nodemailer
2. **In-app messaging** — a simple threaded message channel between connected student-alumni pairs (WebSocket or polling)
3. **Pagination on list endpoints** — cursor-based pagination on `/api/alumni` and `/api/connections` before the dataset grows
4. **Availability / office-hours scheduling** — let alumni set open slots; students book a 30-minute call directly from their profile
5. **Richer matching signals** — add university, geographic region, and current company to the score so matches are more targeted
6. **Admin dashboard** — moderation view to manage users, flag accounts, and see connection activity at a glance
