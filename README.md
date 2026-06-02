# ReviewHub — Production-Ready Product Review Platform

A full-stack, scalable product review and rating platform built with Next.js 14, Express.js, Supabase, and Cloudinary.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | Next.js 14 App Router · TypeScript · Tailwind CSS |
| Backend    | Express.js · TypeScript · express-validator      |
| Database   | Supabase PostgreSQL · Row Level Security         |
| Auth       | Supabase Auth (email/password)                  |
| Media      | Cloudinary CDN                                  |
| Testing    | Jest · ts-jest                                  |
| Deployment | Vercel (frontend) · Render/Railway (backend)    |

---

## Features

- **Authentication** — Supabase Auth, protected routes, role-based access (user/moderator/admin)
- **Products** — CRUD, categories, images, search/filter/sort, rating aggregation
- **Reviews** — Create/edit/delete, pros/cons, image uploads, helpful votes, rating distribution
- **Spam Detection** — Heuristic scoring: link detection, repeated words, caps, velocity, bombing
- **Reports** — Flag reviews with reasons, auto-flag at 3+ reports, moderator review queue
- **Moderation** — Approve/reject/flag queue, moderation logs, spam score visualization
- **Admin Panel** — Analytics, user management, role assignment, product management
- **SEO** — Server-side rendering, OpenGraph, metadata API

---

## Project Structure

```
reviewhub/
├── frontend/          # Next.js 14 App Router
│   ├── app/           # Pages (App Router)
│   ├── components/    # UI, layout, feature components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API client, Supabase, utilities
│   └── types/         # TypeScript types
├── backend/           # Express.js API
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── middlewares/
│       ├── utils/
│       ├── validators/
│       └── tests/     # Jest tests
└── supabase/          # DB schema, RLS, seed data
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd reviewhub
npm run install:all
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Run `supabase/rls.sql` to set up Row Level Security
4. Run `supabase/seed.sql` to insert sample data
5. Copy your project URL, anon key, and service role key

### 3. Cloudinary Setup

1. Create an account at [cloudinary.com](https://cloudinary.com)
2. Copy your cloud name, API key, and API secret

### 4. Environment Variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
NODE_ENV=development
PORT=4000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

FRONTEND_URL=http://localhost:3000
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Run Development Servers

```bash
# Both servers concurrently (from root)
npm run dev

# Or individually
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:4000
```

### 6. Run Tests

```bash
npm run test:backend
# or with coverage
cd backend && npm run test:coverage
```

---

## Creating an Admin User

1. Register a new account via the UI
2. In Supabase SQL editor, run:

```sql
UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
```

---

## API Reference

| Method | Endpoint                              | Auth       | Description              |
|--------|---------------------------------------|------------|--------------------------|
| GET    | /api/auth/me                          | Required   | Get current user profile |
| GET    | /api/products                         | Optional   | List products (paginated)|
| GET    | /api/products/:id                     | Optional   | Get product + reviews    |
| POST   | /api/products                         | Admin      | Create product           |
| PATCH  | /api/products/:id                     | Admin      | Update product           |
| DELETE | /api/products/:id                     | Admin      | Delete product           |
| GET    | /api/products/:id/reviews             | Optional   | Get product reviews      |
| POST   | /api/products/:id/reviews             | Required   | Submit review            |
| PATCH  | /api/reviews/:id                      | Owner      | Edit review              |
| DELETE | /api/reviews/:id                      | Owner/Mod  | Delete review            |
| POST   | /api/reviews/:id/helpful              | Required   | Vote helpful             |
| POST   | /api/reports/reviews/:id/report       | Required   | Report review            |
| GET    | /api/reports                          | Mod/Admin  | List reports             |
| PATCH  | /api/reports/:id                      | Mod/Admin  | Update report status     |
| GET    | /api/moderation/reviews               | Mod/Admin  | Moderation queue         |
| PATCH  | /api/moderation/reviews/:id/approve   | Mod/Admin  | Approve review           |
| PATCH  | /api/moderation/reviews/:id/reject    | Mod/Admin  | Reject review            |
| PATCH  | /api/moderation/reviews/:id/flag      | Mod/Admin  | Flag review              |
| GET    | /api/moderation/stats                 | Mod/Admin  | Moderation stats         |
| GET    | /api/admin/analytics                  | Admin      | Platform analytics       |
| GET    | /api/admin/users                      | Admin      | List users               |
| PATCH  | /api/admin/users/:id/role             | Admin      | Update user role         |
| PATCH  | /api/admin/users/:id/ban              | Admin      | Ban/unban user           |
| POST   | /api/uploads/products/:productId      | Admin      | Upload product image     |
| POST   | /api/uploads/reviews/:reviewId        | Required   | Upload review image      |
| POST   | /api/uploads/avatar                   | Required   | Upload avatar            |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod
# Set environment variables in Vercel dashboard
```

### Backend → Render / Railway

1. Connect your GitHub repository
2. Set root directory to `backend/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all environment variables from `.env.example`

### Database → Supabase (already hosted)

---

## Spam Detection Logic

Each review is scored 0–100 on submission:

| Signal                   | Score |
|--------------------------|-------|
| Body < 20 chars          | +30   |
| 2+ URLs                  | +40   |
| 1 URL                    | +15   |
| Repeated characters      | +20   |
| Excessive caps           | +15   |
| Suspicious keywords (2+) | +35   |
| Word repetition > 30%    | +25   |
| High review velocity     | +20   |
| Review bombing (1★ x5+)  | +40   |
| Generic filler phrase    | +30   |

- Score 0–29  → `published` immediately
- Score 30–69 → `pending` (awaits moderator)
- Score 70+   → `flagged` (high priority queue)

---

## License

MIT — free for personal and commercial use.
