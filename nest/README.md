# Susi Air Pilot API

NestJS (TypeScript) REST API for the Susi Air Pilot App. It serves the pilot profile, flight-hour limits with a server-side rolling sum, document expiry status and the monthly schedule, all from the provided mock JSON files loaded into memory at startup.

Setup, environment variables, the endpoint list and the reasoning behind the main decisions are in the [root README](../README.md).

```bash
npm install
cp .env.example .env     # optional: the defaults work locally
npm run start:dev        # http://localhost:3001, Swagger at /docs
```

| Script | Does |
|---|---|
| `npm run start:dev` | Run with reload |
| `npm run build` then `npm run start:prod` | Production build and run |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests against the real app and the mock data |
| `npm run lint` | Lint |

## Layout

```
src/
  auth/          login, JWT, global guard
  pilot/         GET /pilot/me
  flight-hours/  range query, rolling sum, limit cards
  documents/     expiry status
  schedules/     monthly schedule + legend
  core/          mock-data store and the fixed "today" clock
  common/        exception filter, validators, decorators, date utils
  config/        environment loading and validation
data/            the provided mock JSON files
```
