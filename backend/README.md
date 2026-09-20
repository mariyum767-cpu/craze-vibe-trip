# Craze Vibes Trips — Backend API

Node.js + Express REST API for the Craze Vibes Trips tour booking platform, backed by Supabase (Postgres).

## Tech Stack
- Node.js + Express.js
- Supabase (Postgres) via service-role key
- JWT authentication (custom, bcrypt password hashing)

## Setup

```bash
npm install
cp .env.example .env
# edit .env and fill in SUPABASE_SERVICE_ROLE_KEY and JWT_SECRET
npm run dev
```

Get your `SUPABASE_SERVICE_ROLE_KEY` from: Supabase Dashboard → Project Settings → API → `service_role` key (secret, backend-only, never expose to frontend).

## Environment Variables
See `.env.example`.

## Making the first Admin user
1. Register a normal user via `POST /api/auth/register`.
2. In Supabase Table Editor, open `users` table and change that row's `role` from `user` to `admin`.
3. Log in again to get a token with `role: admin`.

## API Overview

| Area | Base path |
|---|---|
| Auth | `/api/auth` (register, login, me) |
| Tours | `/api/tours` |
| Durations | `/api/durations` |
| Destinations | `/api/destinations` |
| Pickup Points | `/api/pickup-points` |
| Seats | `/api/seats` |
| Bookings | `/api/bookings` |
| Gallery | `/api/gallery` |
| Reviews | `/api/reviews` |
| FAQs | `/api/faqs` |
| Site Content (About/Contact/Terms/Privacy/Refund) | `/api/site-content` |
| Users (admin) | `/api/users` |
| Dashboard Stats (admin) | `/api/stats` |

Admin-only routes require a JWT from an account with `role: admin`, sent as `Authorization: Bearer <token>`.

## Seat Booking — Double-Booking Prevention
Bookings are created through the Postgres function `create_booking_with_seats`, which row-locks the requested seats (`FOR UPDATE`) inside a single transaction before marking them booked. If two users try to book the same seat simultaneously, only one succeeds — the other gets a clear "seat just taken" error.

## Security Notes
- All Supabase tables currently have **Row Level Security (RLS) disabled**. This backend uses the `service_role` key, which bypasses RLS, so the API works regardless. However, if you ever query Supabase directly from the frontend, enable RLS with proper policies first (see `RLS_RECOMMENDED.sql` in the project root).
- Never commit your real `.env` file or service role key to GitHub.
