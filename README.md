# Sunrise OS — Web Console

Vercel-deployable Next.js 14 companion to the Sunrise OS mobile app.
Same backend, same design language (claymorphism), everything **except attendance marking**.
Attendance is available as **reports** (daily / weekly / monthly / quarterly / yearly) with PDF download.

## Modules
- **Login** — Phone + Password JWT (same as mobile)
- **Dashboard** — Role-aware overview
- **Attendance Reports** — Multi-period PDF export
- **Employees** — Directory + detail
- **Machines** — Inventory + detail
- **Projects** — List + detail
- **Aether Copilot** — AI chat grounded in live plant data

## Setup

```bash
cd web
yarn install
cp .env.example .env.local  # already provided
yarn dev                     # dev server on http://localhost:3100
yarn build && yarn start     # production build
```

## Environment

Only one env var is needed:

```
NEXT_PUBLIC_API_URL=https://golden-neumorphism.emergent.host/api
```

Point this at your deployed Sunrise OS backend.

## Deploy to Vercel

**Option A — CLI**
```bash
cd web
npx vercel --prod
```
Set the `NEXT_PUBLIC_API_URL` env var when prompted (or in the Vercel dashboard).

**Option B — Import from GitHub**
1. Push this `/web` folder as its own repo (or use monorepo import with root = `web`).
2. Framework preset: **Next.js**
3. Root Directory: **`web`** (if monorepo) or repo root (if standalone)
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://golden-neumorphism.emergent.host/api`
5. Click **Deploy**. No build overrides needed.

## Design System
Claymorphism — soft warm surfaces, dual inset+outset shadows, warm amber palette matching the mobile app. See `app/globals.css`:
- `.clay` — main card surface
- `.clay-sm` — compact card
- `.clay-inset` — inset-well surface
- `.clay-btn` — primary action button
- `.clay-input` — form input
- `.clay-nav-link` — sidebar nav link

## Auth
JWT stored in `localStorage` under `sunrise_token`. User object under `sunrise_user`.
The `apiFetch` helper attaches `Authorization: Bearer <token>` automatically.
401 responses auto-logout and redirect to `/login`.

## PDF Export
Client-side using `jspdf` + `jspdf-autotable`. Zero server dependency; runs entirely in the browser.
Reports include a Sunrise-branded header, summary stats, and a full detail table.
