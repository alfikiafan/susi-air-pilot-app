# Susi Air Pilot App (web)

Nuxt 3 + Pinia + SCSS (TypeScript) mobile-first web app: sign in, the Home dashboard (hours to limit, trend chart, documents) and the monthly Schedule. Every value comes from the API; nothing is mocked here.

Setup, environment variables and the reasoning behind the main decisions are in the [root README](../README.md).

```bash
npm install
cp .env.example .env     # optional: defaults to the API at http://localhost:3001
npm run dev              # http://localhost:3000
```

| Script              | Does                         |
| ------------------- | ---------------------------- |
| `npm run dev`       | Dev server                   |
| `npm run build`     | Production build             |
| `npm run preview`   | Preview the production build |
| `npm run typecheck` | Type check                   |
| `npm test`          | Unit tests for `utils/`      |
| `npm run lint`      | Lint (oxlint)                |
| `npm run format`    | Format (Prettier)            |

| Environment variable   | Default                 | Purpose             |
| ---------------------- | ----------------------- | ------------------- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:3001` | Base URL of the API |

## Layout

```
pages/        login, index (Home), schedule, schedule/[date], logbook, more
components/   LimitCard, FlightHoursChart (SVG), RangeToggle, ScheduleCalendar, DutyLegend, ...
stores/       Pinia: auth, pilot, flightHours, documents, schedule, network
composables/  useApi: $fetch with the bearer token, slow-request tracking and 401 handling
middleware/   auth.global: guards every page except /login
assets/scss/  design tokens (CSS custom properties) and SCSS tools
types/        API response types
```
