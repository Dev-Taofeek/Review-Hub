# ReviewHub

A full-stack product review platform built for trust — community-moderated, spam-filtered, and designed to help shoppers make confident purchase decisions.

**Live:** [review-hub-lilac.vercel.app](https://review-hub-lilac.vercel.app)  
**Backend API:** [review-hub-production.up.railway.app/health](https://review-hub-production.up.railway.app/health)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password, session cookies) |
| Images | Cloudinary |
| Frontend hosting | Vercel |
| Backend hosting | Railway |

---

## Project Structure

```
reviewplatform/
├── frontend/                  # Next.js 16 app
│   ├── app/                   # App Router pages + layouts
│   │   ├── (auth)/            # Login / register (hides navbar/footer)
│   │   ├── admin/             # Admin-only pages + error boundary
│   │   ├── categories/        # Category browser + slug pages
│   │   ├── dashboard/         # User dashboard + error boundary
│   │   ├── moderation/        # Moderator queue
│   │   ├── products/          # Product listing, detail, create + loading/error
│   │   ├── error.tsx          # Global error boundary (try again + go home)
│   │   ├── loading.tsx        # Global route loading skeleton
│   │   ├── robots.ts          # robots.txt generation (Next.js route)
│   │   └── sitemap.ts         # sitemap.xml generation (dynamic, revalidated)
│   ├── components/
│   │   ├── admin/             # StatsCard, UserTable, UserDetailModal
│   │   ├── layout/            # Navbar, Footer, Sidebar, ConditionalShell
│   │   ├── moderation/        # ModerationCard
│   │   ├── products/          # ProductCard, ProductFilters, RatingDistribution
│   │   ├── reviews/           # ReviewCard, ReviewForm, ReportModal
│   │   └── ui/                # Button, Input, Modal, Avatar, Badge, StarRating…
│   ├── hooks/                 # useAuth, useProducts, useReviews
│   ├── lib/                   # api.ts, utils.ts, supabase.ts, theme.tsx
│   ├── __tests__/             # Jest + React Testing Library tests
│   │   ├── lib/utils.test.ts
│   │   └── components/
│   │       ├── Button.test.tsx
│   │       └── StarRating.test.tsx
│   └── types/                 # Shared TypeScript interfaces
│
└── backend/                   # Express.js API
    └── src/
        ├── controllers/       # Route handlers
        ├── services/          # Business logic layer
        ├── routes/            # Express route definitions
        ├── middlewares/       # Auth, rate limiting, validation, errors
        ├── validators/        # express-validator schemas
        ├── utils/             # spamDetection, ratingCalculator, apiResponse, pagination
        ├── config/            # Supabase + Cloudinary clients
        ├── types/             # Shared types
        └── tests/             # Jest tests (7 suites, ~60 test cases)
```

---

## Features

- **Product catalog** — Browse, search, filter and sort products by category, brand, price, rating
- **Category pages** — Explore products by category with product counts and full filter support
- **Community reviews** — Submit reviews with star ratings, pros/cons, image uploads
- **Automatic spam detection** — 10-signal scoring system with three outcome tiers (publish / pending / flagged)
- **Moderation queue** — Moderators approve/reject/flag content with reason logging
- **Report system** — Users report suspicious reviews; moderators resolve or dismiss
- **Admin panel** — Platform analytics, user management (role, ban, verify, vote permissions)
- **User dashboard** — Review stats, health donut chart, activity feed, quick actions
- **Role-based access** — `user` / `moderator` / `admin` with middleware-level and DB-level protection
- **Dark mode** — System-aware with manual toggle
- **Full responsiveness** — Works from smartwatch (360px) to 4K desktop with `xs` breakpoint
- **SEO** — Dynamic `generateMetadata`, Open Graph, Twitter cards, JSON-LD structured data, sitemap, robots.txt
- **Error handling** — Global + route-specific error boundaries with "Try again" recovery
- **Loading states** — Route-level `loading.tsx` skeletons for instant perceived performance

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Supabase project (free tier works)
- Cloudinary account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/Dev-Taofeek/Review-Hub.git
cd reviewplatform

cd frontend && pnpm install
cd ../backend && pnpm install
```

### 2. Environment variables

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=4000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # NEVER expose this to the browser

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Supabase setup

Run this in **Supabase → SQL Editor** to add any missing columns:

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_vote    BOOLEAN NOT NULL DEFAULT true;
```

Then **Supabase → Settings → API → Reload schema** to clear the PostgREST cache.

### 4. Run

```bash
# Terminal 1
cd backend && pnpm dev

# Terminal 2
cd frontend && pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Scripts

### Frontend (`cd frontend`)

| Command | Description |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Run Jest tests |
| `pnpm test:watch` | Jest watch mode |
| `pnpm test:coverage` | Jest with coverage |

### Backend (`cd backend`)

| Command | Description |
|---|---|
| `pnpm dev` | Express dev server (hot-reload) |
| `pnpm build` | Compile TypeScript → `dist/` |
| `pnpm start` | Start compiled server |
| `pnpm test` | Run all Jest suites |
| `pnpm test:coverage` | Jest with coverage |
| `pnpm lint` | ESLint |

---

## Testing

### Backend (7 suites, ~60 tests)

```bash
cd backend
pnpm test
pnpm test:coverage
```

Covers: spam detection, rating calculations, pagination, RBAC permissions, report logic, review validation, API response formatting.

### Frontend (3 suites, ~50 tests)

```bash
cd frontend
pnpm install   # installs @testing-library packages
pnpm test
pnpm test:coverage
```

Covers: utility functions (30+ cases), Button component (12 cases), StarRating component (8 cases).

---

## Spam Detection

Reviews are automatically scored 0–100 across 10 signals:

| Signal | Score |
|---|---|
| Body under 20 characters | +30 |
| 2+ URLs in text | +40 |
| 1 URL in text | +15 |
| Repeated characters (`aaaaa`) | +20 |
| Excessive caps | +15 |
| Known profanity | +25 |
| 2+ suspicious keywords (`buy now`, `dm me`…) | +35 |
| 1 suspicious keyword | +15 |
| >30% repeated words | +25 |
| Review bombing (1-star + ≥5 recent) | +50 |
| High velocity (≥3 reviews recently) | +20 |
| Generic filler phrase | +30 |

**Score → Status:**  `< 70` → published · `70–89` → pending · `≥ 90` → flagged

---

## Deployment

### Frontend → Vercel

Vercel auto-detects `frontend/` as the root directory.

Set these **Environment Variables** in Vercel → Project → Settings:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_API_URL      ← your Railway backend URL (with https://)
NEXT_PUBLIC_SITE_URL     ← your Vercel URL
```

### Backend → Railway

1. Connect GitHub repo on Railway
2. Set **Root Directory** to `backend`
3. Railway uses `backend/railway.toml` + `backend/nixpacks.toml` automatically

Set these **Variables** in Railway → Service → Variables:

```
NODE_ENV=production
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
FRONTEND_URL     ← your Vercel URL (e.g. https://review-hub-lilac.vercel.app)
```

> Any `*.vercel.app` domain is automatically CORS-allowed (covers preview deployments).

---

## User Roles

| Role | Capabilities |
|---|---|
| `user` | Browse, review, vote, report |
| `moderator` | All user + approve/reject/flag reviews, resolve reports |
| `admin` | All moderator + manage users, view platform analytics |

---

## API Overview

Base URL: `https://review-hub-production.up.railway.app/api`

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/products` | Optional | List/search/filter products |
| GET | `/products/categories` | Public | Categories with product counts |
| POST | `/products` | Required | Create product |
| GET | `/products/:id` | Optional | Product + rating distribution |
| GET | `/products/:id/reviews` | Optional | Reviews for product |
| POST | `/products/:id/reviews` | Required | Submit review (auto spam-checked) |
| GET | `/auth/me/stats` | Required | User review statistics |
| PATCH | `/auth/profile` | Required | Update profile |
| GET | `/admin/analytics` | Admin | Platform analytics |
| GET | `/moderation/reviews` | Mod+ | Pending moderation queue |

---

## Security

- All secrets stored as environment variables — never committed
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only (server-side Express only)
- Supabase RLS provides row-level database access control
- Rate limiting on all sensitive endpoints (auth, uploads, review submission)
- CORS restricted to `FRONTEND_URL` + `*.vercel.app`
- Helmet.js security headers on all responses
- Input validated with express-validator before reaching business logic

---

## License

MIT © ReviewHub
