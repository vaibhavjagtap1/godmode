# BehindTheEmail

BehindTheEmail is a full-stack OSINT SaaS platform for email-to-identity intelligence.

## Monorepo structure

- `apps/api` — Express + TypeScript API, Prisma, Redis, BullMQ
- `apps/web` — Next.js 14 App Router frontend with tactical dark UI
- `docker-compose.yml` — PostgreSQL, Redis, API, and Web services

## Quick start

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```
2. Start dependencies:
   ```bash
   docker compose up -d postgres redis
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma client:
   ```bash
   npm --workspace @behindtheemail/api run prisma:generate
   ```
5. Run development servers:
   ```bash
   npm run dev
   ```

## API endpoints

- `POST /api/v1/lookup`
- `GET /api/v1/searches`
- `GET /api/v1/searches/:id`
- `DELETE /api/v1/searches/:id`
- `POST /api/v1/bulk`
- `GET /api/v1/bulk/:jobId`
- `GET /api/v1/bulk/:jobId/export`
- `GET /api/v1/profile/export/:id`
- `POST /api/v1/keys`
- `GET /api/v1/keys`
- `DELETE /api/v1/keys/:id`
- `GET /api/v1/usage`
- `GET /api/health`
- `POST /api/webhooks/stripe`
- `POST /optout`

Swagger/OpenAPI metadata is available at `GET /api/v1/docs`.

## Privacy disclaimer

Every report must include this statement:

> This report contains only publicly available information. Use responsibly and in accordance with applicable laws.
