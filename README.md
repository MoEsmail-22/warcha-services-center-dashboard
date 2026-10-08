# Warsha — Service Center Dashboard

Dashboard for car service workshops: bookings, jobs board, quotes, services & pricing, reviews and settings. Bilingual (English / Arabic, with RTL).

**Stack:** React 19 · Vite · Tailwind CSS 4 · React Router 7 · react-i18next · axios

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env
npm run dev
```

| Script            | What it does              |
| ----------------- | ------------------------- |
| `npm run dev`     | Start the dev server      |
| `npm run build`   | Production build → `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint`    | Run ESLint                |

## Environment variables

See [`.env.example`](.env.example).

| Variable                | Purpose                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `VITE_API_BASE_URL`     | API base path (default `/api/v1`, proxied to the backend)    |
| `VITE_ENABLE_DEV_AUTH`  | `true` to log in with `VITE_DEV_ACCESS_TOKEN` (local only)   |
| `VITE_MAPTILER_API_KEY` | MapTiler key for the location map in Settings                |

## Backend

The API is the Warsha .NET backend at `http://warshaa.runasp.net/api/v1`. Requests go to `/api/...` and are proxied:

- **Development:** Vite proxy in [`vite.config.js`](vite.config.js)
- **Production (Vercel):** rewrite in [`vercel.json`](vercel.json)

Responses use the envelope `{ isSuccess, message, data }`. The axios client in [`src/API/client.js`](src/API/client.js) attaches the JWT and refreshes it once on a 401.

## Project structure

```
public/locales/{en,ar}/   Translation files, one JSON per namespace
src/
  API/                    API calls (auth, services, settings)
  components/             ui/ primitives, layout/, widgets/, feature components
  contexts/               One Context provider per feature (state + actions)
  mocks/                  Mock JSON used by demo mode and pages not yet on the API
  pages/                  Route pages (lazy-loaded)
  routes/                 Router config and auth guard
```

## Languages

Every route is prefixed with the language: `/en/...` or `/ar/...`. Switching language rewrites the URL and flips the layout direction. To add text, put the key in both `public/locales/en/<namespace>.json` and `public/locales/ar/<namespace>.json`.

## Demo mode

The **Demo** button on the login page stores `demo_mode` in localStorage. In demo mode no requests reach the backend and pages use the data in `src/mocks/`.
