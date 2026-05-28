# Press Start — Server

A RESTful API for video game discovery and personal collection management. Press Start lets users browse and filter games sourced from the [IGDB](https://www.igdb.com/) database, track their personal game library, and manage their account with secure authentication.

## Tech Stack

**Backend**

![Backend](https://skillicons.dev/icons?i=nodejs,express,ts,postgres,prisma)

- **Runtime:** Node.js with Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** JWT + bcrypt
- **Email:** Resend
- **External API:** IGDB (Internet Game Database)
- **Background Jobs:** node-cron

**Frontend**

![Frontend](https://skillicons.dev/icons?i=react,ts,vite,tailwind)

> [👉🏻 Frontend Repo](https://github.com/janessaperry/press-start-client)

## Features

**Game Discovery**
- Browse games with rich filtering: platform, genre, theme, franchise, game type, ESRB rating, rating thresholds, time-to-beat ranges, and release status
- Full-text game search
- Pagination and sorting

**Collection Management**
- Add games to a personal library with status tracking: Wishlist, Want to Play, Playing, Played, Completed, Dropped

**Authentication**
- Register and log in with email and password
- JWT-based sessions (30-day expiry)
- Secure password reset flow with time-bound, bcrypt-hashed tokens and rate limiting

**Admin / Data Sync**
- Sync game data from IGDB in batches with checksum-based change detection

## Project Structure

```
src/
├── config/          # Environment, database, and IGDB configuration
├── controllers/     # HTTP request handlers
├── routes/          # Express route definitions
├── services/        # Business logic and data access
├── jobs/            # Scheduled background tasks
├── middlewares/     # Express middleware
├── utils/           # Validation and date helpers
└── db/              # Prisma client
prisma/
├── schema.prisma    # Data model
├── migrations/      # Migration history
└── seed.ts          # Database seed script
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- [IGDB API credentials](https://api-docs.igdb.com/#getting-started) (Client ID and Access Token)
- [Resend](https://resend.com/) API key (for password reset emails)

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/janessaperry/press-start-server.git
   cd press-start-server
   npm install
   ```

2. Copy the environment template and fill in your values:

   ```bash
   cp .env.example .env
   ```

3. Apply database migrations and generate the Prisma client:

   ```bash
   npm run reset
   npm run generate
   ```

4. (Optional) Seed the database:

   ```bash
   npm run seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

### Environment Variables

| Variable        | Description                               |
|-----------------|-------------------------------------------|
| `SERVER_PORT`   | Port the server listens on (default: 8080) |
| `CORS_ORIGIN`   | Allowed origin for CORS                   |
| `FRONTEND_URL`  | Frontend base URL (used in email links)   |
| `CLIENT_ID`     | IGDB API client ID                        |
| `CLIENT_SECRET` | IGDB API client secret                    |
| `ACCESS_TOKEN`  | IGDB API access token                     |
| `RESEND_KEY`    | Resend API key for transactional email    |
| `JWT_SECRET`    | Secret for signing JWT tokens             |
| `DATABASE_URL`  | PostgreSQL connection string              |

## API Endpoints

### Auth

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | `/auth/register`                | Create a new user account      |
| POST   | `/auth/login`                   | Log in and receive a JWT       |
| POST   | `/auth/password-reset/request`  | Request a password reset email |
| POST   | `/auth/password-reset/reset`    | Complete a password reset      |

### Games

| Method | Endpoint               | Description                              |
|--------|------------------------|------------------------------------------|
| GET    | `/games`               | Browse games with filters and pagination |
| GET    | `/games/search/:query` | Search games by name                     |
| GET    | `/games/:gameId`       | Get a single game with full details      |

**Supported query parameters for `GET /games`:**

`platformFamily`, `platform`, `genre`, `gameType`, `theme`, `franchise`, `timeToBeat`, `esrbRating`, `totalRating`, `releaseStatus`, `limit`, `offset`, `sort`, `order`

### Collection

| Method | Endpoint                    | Description                       |
|--------|-----------------------------|-----------------------------------|
| GET    | `/users/:userId/collection` | Get a user's game collection      |
| POST   | `/users/:userId/collection` | Add a game to a user's collection |

### Filters

| Method | Endpoint   | Description                                 |
|--------|------------|---------------------------------------------|
| GET    | `/filters` | Get all available filter options for the UI |

### Admin

| Method | Endpoint                         | Description                          |
|--------|----------------------------------|--------------------------------------|
| POST   | `/admin/igdb-sync/all`           | Sync all data from IGDB              |
| POST   | `/admin/igdb-sync/games`         | Sync games                           |
| POST   | `/admin/igdb-sync/platforms`     | Sync platforms and platform families |
| POST   | `/admin/igdb-sync/genres`        | Sync genres                          |
| POST   | `/admin/igdb-sync/themes`        | Sync themes                          |
| POST   | `/admin/igdb-sync/franchises`    | Sync franchises                      |
| POST   | `/admin/igdb-sync/collections`   | Sync collections                     |
| POST   | `/admin/igdb-sync/game-types`    | Sync game types                      |
| POST   | `/admin/igdb-sync/time-to-beat`  | Sync time-to-beat data               |

### General

| Method | Endpoint  | Description   |
|--------|-----------|---------------|
| GET    | `/`       | Welcome       |
| GET    | `/health` | Health check  |

## Scripts

| Script             | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start dev server with hot reload         |
| `npm run build`    | Compile TypeScript to `dist/`            |
| `npm start`        | Start production server from `dist/`     |
| `npm run migrate`  | Create a new Prisma migration            |
| `npm run reset`    | Reset database and apply all migrations  |
| `npm run seed`     | Seed the database                        |
| `npm run generate` | Generate the Prisma client               |
