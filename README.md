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

## Deployment (both on Vercel)
This project deploys as **two separate Vercel projects** — one for the frontend, one for the backend (Vercel doesn't run a single long-lived Express server, so the backend is set up to run as serverless functions via `backend/vercel.json` + `backend/api/index.js`).

**1. Push to GitHub first** (Vercel deploys from a Git repo).

**2. Backend project:**
- Vercel → Add New Project → import your repo
- Root Directory: `backend`
- Framework Preset: Other
- Environment Variables: add everything from `backend/.env.example` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL`, and the `SMTP_*` ones if using real email)
- Deploy → you'll get a URL like `https://craze-vibe-trip-backend.vercel.app`
- Test it: `https://craze-vibe-trip-backend.vercel.app/api/health`

**3. Frontend project:**
- Vercel → Add New Project → import the **same repo again** (Vercel allows multiple projects from one repo)
- Root Directory: `frontend`
- Environment Variables: `NEXT_PUBLIC_API_URL` = `https://craze-vibe-trip-backend.vercel.app/api`
- Deploy → you'll get your live site URL, e.g. `https://craze-vibe-trip.vercel.app`

**4. Go back to the backend project's env vars** and set `FRONTEND_URL` to your new frontend URL, then redeploy the backend (so CORS only allows your real live site).

**5. Image upload note:** the `/api/upload` endpoint uses in-memory file handling (no disk writes), so it works fine on Vercel's serverless functions — just keep uploaded images under ~4MB (Vercel's request body limit on the free tier).

## Not Yet Wired (left for you to extend)
- Live payment gateway (currently bookings are created with status `pending`; admin marks them `confirmed` manually — add JazzCash/EasyPaisa/Stripe here if needed)
- Transactional emails (booking confirmation email/SMS)
- Contact form on `/contact` is currently front-end only — wire it to an email service or a `contact_messages` table if you want submissions stored
