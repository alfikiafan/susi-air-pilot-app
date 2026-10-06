# Susi Air Pilot App

A small piece of the Susi Air Pilot App: a mobile-first web app where a pilot signs in, sees their duty limits and documents, and browses their monthly schedule.

- **`/nest`**: REST API (NestJS, TypeScript)
- **`/nuxt`**: web app (Nuxt 3, Pinia, SCSS, TypeScript)

|                    | URL                                              |
| ------------------ | ------------------------------------------------ |
| Web app            | https://susi-air-pilot-app.vercel.app            |
| API                | https://susi-air-pilot-app.onrender.com          |
| API docs (Swagger) | https://susi-air-pilot-app.onrender.com/docs     |
| Repository         | https://github.com/alfikiafan/susi-air-pilot-app |

**Sign in with** username `johndoe` and password `susiairtest`.

> The API is hosted on a free tier that sleeps when idle, so the first request after a quiet period can take up to a minute. The app shows a "Waking up the server…" banner while it waits.

---

## Run it locally

Developed and tested on Node.js 24. You need two terminals.

```bash
# 1. API  ->  http://localhost:3001  (Swagger at /docs)
cd nest
npm install
cp .env.example .env        # optional: the defaults already work locally
npm run start:dev

# 2. Web app  ->  http://localhost:3000
cd nuxt
npm install
cp .env.example .env        # optional: the default already points at localhost:3001
npm run dev
```

### Checks

```bash
cd nest
npm test              # unit tests
npm run test:e2e      # end-to-end tests against the real app and the mock data
npm run lint
npm run build

cd nuxt
npm test              # unit tests for the date, format and error helpers
npm run typecheck
npm run lint
npm run build
```

## Environment variables

**API (`nest/.env`)**

| Variable                 | Default                 | Purpose                                                                                           |
| ------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------- |
| `PORT`                   | `3001`                  | Port the API listens on                                                                           |
| `TODAY`                  | `2026-05-15`            | The app's "today" (`YYYY-MM-DD`). See [Decisions](#decisions-and-why)                             |
| `JWT_SECRET`             | dev-only value          | Signs access tokens. **Required** when `NODE_ENV=production`; the API refuses to start without it |
| `JWT_EXPIRES_IN_SECONDS` | `43200` (12 h)          | Token lifetime                                                                                    |
| `CORS_ORIGIN`            | `http://localhost:3000` | Allowed web app origin(s), comma separated                                                        |
| `DATA_DIR`               | `data`                  | Folder with the mock JSON files                                                                   |

**Web app (`nuxt/.env`)**

| Variable               | Default                 | Purpose             |
| ---------------------- | ----------------------- | ------------------- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Base URL of the API |

## API

Every endpoint except `POST /auth/login` requires `Authorization: Bearer <token>`.

| Method | Path                                             | Purpose                                                                   |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------------- |
| POST   | `/auth/login`                                    | `{ username, password }` returns an access token                          |
| GET    | `/pilot/me`                                      | Name, total flight hours, avatar URL, and the server's `today`            |
| GET    | `/flight-hours?from&to`                          | Daily hours in the range (gaps filled with 0)                             |
| GET    | `/flight-hours/summary?range=1w\|1m\|3m\|6m\|1y` | Rolling-sum series for the chart, plus the four limit cards               |
| GET    | `/documents`                                     | Documents with `daysRemaining` and `status` (`expired` / `soon` / `safe`) |
| GET    | `/schedules?year&month`                          | Schedule entries for one month, plus the duty legend                      |

All errors share one shape:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": ["month must not be greater than 12"],
  "path": "/schedules?year=2026&month=13",
  "timestamp": "2026-10-05T02:42:47.563Z"
}
```

`code` is machine-readable (for example `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `VALIDATION_ERROR`), so the web app never branches on message text.

## How it is built

**API.** One module per feature (`auth`, `pilot`, `flight-hours`, `documents`, `schedules`), each with controller, service and DTOs. A global `ValidationPipe` validates query and body input, a global exception filter produces the error shape above, and a global `AuthGuard` protects everything except routes marked `@Public()` (only login). The mock JSON files are loaded once at boot into an in-memory store; there is no database. The rolling sum is the `rollingWindowBluffing()` method of [`FlightHoursService`](nest/src/flight-hours/flight-hours.service.ts), named as the brief requires, with its own unit tests.

**Web app.** Client-rendered SPA (`ssr: false`): it is a signed-in tool talking to a separate API, so server rendering would add nothing. Pinia stores own all server data (`auth`, `pilot`, `flightHours`, `documents`, `schedule`); components only render. Nothing is mocked or hardcoded on the client, and the client does no rolling-sum maths: the chart draws what the API returns. The chart is plain SVG, so there is no charting dependency.

## Decisions and why

**"Today" is fixed at 15 May 2026 and comes from one place.** The brief says to treat today as 15 May, but `mock-documents.json` says 31 May. I use a single `TODAY` setting (default 15 May) for every endpoint and ignore the `today` field inside the JSON files, so documents, limits and the calendar always agree. The web app reads today from `/pilot/me` and never from the device clock.

**Rolling sum.** The value for a date is the total hours over the last N days _ending on that date_, inclusive (N = 7 / 30 / 90 / 180 / 365 for 1w / 1m / 3m / 6m / 1y; the Weekly, Monthly and Annual cards use 7 / 30 / 365, Daily uses today only). Three edge cases the brief asks us to decide:

- _Days with no flights_ count as 0 and are never skipped, so a window always spans exactly N calendar days.
- _Windows reaching before the first record (27 Dec 2024)_ count the missing days as 0, because no flying is on record for them. Those points are flagged `partialWindow` and the chart shows a short note. With today at 15 May 2026 this never happens in the visible range (even the 1-year window only starts in May 2025), but the rule is covered by unit tests, and setting `TODAY=2025-01-05` shows it on every range.
- _Future dates (after today)_ are summed the same way, using the hours already in the dataset for those days, which I read as planned flying. They are flagged `projected` and drawn dashed and labelled "Planned", so the pilot can see where the current plan takes them. The dataset runs to 31 May, so this is meaningful for the 7 days after today.

**Values above the limit.** Between 18 and 21 May the 1-week total goes over the 40 h limit. Those points turn red, the readout says "Over by x h", and the axis keeps the configured maximum (45 h for 1w). If a value ever exceeded the axis maximum, the axis grows to fit instead of clipping, and the API returns the `peak` so this does not depend on the data.

**Limit cards.** Green below 80% of the limit, amber from 80%, red above 100%. The bar stops at 100% so it never overflows; the figures show the exact amount.

**Schedule fields keep the names from the JSON** (`duty_date`, `base_color`, `count_logbooks`, …) because the brief refers to them by name. The other endpoints use camelCase, as their source files do, so the API is not uniform on purpose: each resource keeps its source's naming. The API adds `remaining` and `is_complete` so the client does not have to derive them.

**Duty codes come from the data.** The brief lists codes such as `DUTY`, `RL`, `TR`, `TX`, `UL`; the JSON legend uses `DTY`, `RLV`, `TRD`, `TRX`, `ULV`. I treat the JSON as the source of truth: cell colours come from `base_color` and the legend from the `legend` array, so the app does not depend on a hardcoded code list. (One entry, id `97041`, is a `TRX` day whose `base_color` differs from its legend colour; the cell uses the entry's own `base_color`, as the brief says.)

**Auth.** A signed JWT (12 h) checked by a global guard. The pilot account is hardcoded, as the brief asks. The token is kept in a `SameSite=Strict` cookie so it survives a reload, and a 401 from the API signs the pilot out. Credentials are compared in constant time and a wrong username and a wrong password give the same error.

**Avatar.** The data has no photo, so `/pilot/me` returns an initials image (ui-avatars.com, in brand colours). If it fails to load, the app falls back to initials drawn locally.

**Document status is computed on the server** (`expired` if ≤ 0 days, `soon` if within `warningDays`, else `safe`), and the badge simply reflects it.

**Swagger (`/docs`) is public.** It documents the API and serves no data, and it lets a reviewer try the endpoints. Every data endpoint is still guarded.

**Logbook and More.** The brief lists them in the bottom navigation but does not describe them, so Logbook is a "coming soon" page, and More holds the profile and a Sign out button (the only way to sign out).

**Colour follows the brief exactly.** All ten colours in the brief's palette are used as given (text, backgrounds, buttons, bars, badges). The only additions are three neutral greys for dividers, muted backgrounds and the loading shimmer, and translucent tints of the brief's colours behind badges. The brief sets no contrast requirement, but I held the app to WCAG AA (4.5:1 for small text) as my own bar, and some of the brief's colours fall short of it as small text on the page background: the success green and warning amber measure 2.1 to 2.4:1, the brand red 4.2:1, and the secondary grey 4.47:1. I kept the brief's values rather than darken them.

The calendar day text is white, which the brief does not specify; it is my own choice, for a consistent look across every duty colour. Against the lighter ones (On Duty green, Training amber, Travel Day) it measures roughly 2 to 3.8:1 across six of the ten duty colours, below the same AA bar. Each day's duty type is also in its accessible label, so colour is not the only carrier of meaning. Apart from colour contrast, an axe-core scan (WCAG 2.2 AA) of every page reported nothing, and the app was checked in a browser at 320, 390, 768 and 1280px wide.

## Deployment

- **Web app:** Vercel, root directory `nuxt`, environment variable `NUXT_PUBLIC_API_BASE` set to the API URL.
- **API:** Render (free tier), root directory `nest`, build command `npm ci --include=dev && npm run build`, start command `npm run start:prod`, with `NODE_ENV=production`, `JWT_SECRET` and `CORS_ORIGIN` (the web app's URL) set.

## What I would change with more time

- **Persistence and real accounts.** Replace the in-memory store with PostgreSQL (the data is relational and already date-keyed), and the hardcoded account with real users, hashed passwords, refresh tokens and an `httpOnly` cookie set by the API instead of a client-readable one.
- **Rate limiting** on `/auth/login`.
- **Caching** of the summary on the server, and an index by date for long ranges.
- **Logbook and duty detail screens**, which the navigation and calendar already point to.
- **More frontend tests:** the pure helpers in `nuxt/utils` have unit tests, but the pages, stores and chart do not. I would add component tests for the chart geometry and calendar, and a Playwright smoke test for the login and schedule flows (I checked these by hand in a browser at phone, tablet and desktop widths).
- **Shared API types.** The web app's types in `nuxt/types/api.ts` are written by hand to match the DTOs; generating them from the Swagger document would remove the chance of drift.
- **Observability:** request logging with a correlation id, and a health endpoint (left out so that login stays the only unguarded route).
