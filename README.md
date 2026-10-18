# Craze Vibes Trips — Tour & Travel Booking Platform

A complete full-stack tour booking web application for exploring the Northern Areas of Pakistan.

**Task 02 — Soft Codec Internship**

## Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** Supabase (Postgres)
- **Auth:** Custom JWT (bcrypt password hashing)

## Project Structure
```
craze-vibe-trip/
├── backend/          Express REST API
├── frontend/         Next.js website (user + admin)
└── RLS_RECOMMENDED.sql   Optional Supabase security hardening
```

## Quick Start

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in SUPABASE_SERVICE_ROLE_KEY (Supabase Dashboard → Settings → API → service_role)
# and a random JWT_SECRET
npm run dev
```
API runs at `http://localhost:5000`.

**Add real sample content (destinations, tours, images, FAQs, etc.):**
```bash
npm run seed
```
This fills your Supabase tables with 6 real Northern-Pakistan destinations (Hunza, Skardu, Naran, Fairy Meadows, Swat, Shogran) — each with a real photo, a matching tour (with itinerary + 32 auto-generated seats), gallery images, FAQs, and About/Contact/Terms/Privacy/Refund page content. Safe to re-run; it won't duplicate existing rows.

### Two one-time setup steps for the newest features

**0. Vehicles/Coasters + Multiple Tour Dates (upgrade)**
Run `backend/migration_tour_dates_vehicles.sql` once in the Supabase SQL Editor. This adds the `vehicles` table, the `tour_dates` table (a tour can now run on several departure dates, each with its own coaster), and updates the seat-booking function accordingly. Run it **before** `npm run seed` if you're setting up fresh.

**0b. Forgot / Reset Password**
Run `backend/migration_password_reset.sql` once in the Supabase SQL Editor. Without SMTP configured, the reset link is logged to the backend terminal and also returned in the API response (shown directly on the `/forgot-password` page) — no email service required to test it. To send real emails, fill in `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `.env` (Gmail app password works fine).

**1. Image upload (admin panel can now upload files, not just paste URLs)**
In Supabase Dashboard → **Storage**, create a new bucket named `images` and mark it **Public**. That's it — the "Upload File" button in every admin image field will work immediately.

**2. Admin "New Booking" (walk-in / phone bookings)**
The admin Bookings tab now has a **+ New Booking** button for creating a booking on behalf of a customer who isn't registered on the site. If you see an error mentioning `user_id` when using it, run this once in the Supabase SQL Editor:
```sql
ALTER TABLE public.bookings ALTER COLUMN user_id DROP NOT NULL;
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL should point to your backend, e.g. http://localhost:5000/api
npm run dev
```
Website runs at `http://localhost:3000`.

## Database
Your Supabase project (`Craze Vibe Trip`) already has all required tables:
`users, destinations, tour_durations, tours, tour_itineraries, pickup_points, seats, bookings, booking_seats, gallery, reviews, faqs, site_content`

An atomic Postgres function `create_booking_with_seats` handles booking creation with **row-level locking** — this is what prevents two users from ever booking the same seat.

## Creating your first Admin account
1. Register normally through the website (`/register`).
2. In Supabase → Table Editor → `users` table, change that row's `role` from `user` to `admin`.
3. Log out and log back in on the website — you'll be redirected to `/admin`.

## Features Implemented
- **Public site:** Home, Tours (with filters), Tour Details (itinerary, gallery, reviews, T&Cs), Destinations, Gallery, About, Contact, FAQ, Terms, Privacy, Cancellation & Refund
- **Booking flow:** Pickup Point → Seat Selection (visual coaster seat map) → Passenger Details → Summary → Confirmation, with a unique `CVT-YYYY-#####` booking ID
- **User Dashboard:** Profile editing, upcoming/previous trips, booking details
- **Admin Panel:** Dashboard stats, Tours (+ itinerary manager, auto seat generation), Durations, Destinations, Pickup Points, Seat management (block/unblock), Bookings (search/filter/status/delete), Gallery, Reviews (approve/reject), FAQs, Website Content (About/Contact/Terms/Privacy/Refund), Users (promote/demote admin)
- **Security:** JWT auth, bcrypt password hashing, admin-only route protection, environment-based secrets, service-role-only DB access

## Security Note
All Supabase tables currently have Row Level Security (RLS) **disabled**. The backend uses the `service_role` key which bypasses RLS regardless, so functionality is unaffected — but for defense-in-depth, run `RLS_RECOMMENDED.sql` in the Supabase SQL Editor. This locks every table to backend-only access.

## Deployment (single Vercel project)
Frontend (Next.js) and backend (Express) deploy together as **one Vercel project** on one domain. The root `vercel.json` builds `backend/api/index.js` as a serverless function and `frontend/` as a Next.js app, and routes `/api/*` to the backend and everything else to the frontend. Because both live on the same domain, no CORS or API URL setup is needed.

**1. Push to GitHub** (never commit `.env` files; they are gitignored).

**2. Create ONE Vercel project:**
- Vercel → Add New Project → import your repo
- **Root Directory: leave empty** (do not select `backend` or `frontend`)
- Framework Preset: **Other**
- Environment Variables (see `backend/.env.example`):
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN` (e.g. `7d`)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (required for real password-reset emails; on production the reset link is never returned in the API response)
- Do **not** set `NEXT_PUBLIC_API_URL` or `FRONTEND_URL` (the frontend calls `/api` on the same domain by default).
- Deploy.

**3. Verify:** open `https://<your-domain>.vercel.app/api/health` and expect `{"success":true,...}`, then test login, tours and booking.

**4. Image upload note:** `/api/upload` uses in-memory handling (no disk writes), so it works on serverless. Keep images under ~4MB (Vercel request body limit). The Supabase Storage bucket `images` must exist and be Public.

**Local development:** run backend (`npm run dev` in `backend/`, port 5000) and frontend (`npm run dev` in `frontend/`) separately, with `NEXT_PUBLIC_API_URL=http://localhost:5000/api` in `frontend/.env.local`.

## Not Yet Wired (left for you to extend)
- Live payment gateway (currently bookings are created with status `pending`; admin marks them `confirmed` manually — add JazzCash/EasyPaisa/Stripe here if needed)
- Transactional emails (booking confirmation email/SMS)
- Contact form on `/contact` is currently front-end only — wire it to an email service or a `contact_messages` table if you want submissions stored
