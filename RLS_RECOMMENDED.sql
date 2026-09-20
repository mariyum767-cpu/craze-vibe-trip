-- ============================================================================
-- OPTIONAL BUT RECOMMENDED: Row Level Security
-- ============================================================================
-- Right now, RLS is DISABLED on all your Supabase tables. Since this backend
-- always talks to Supabase using the service_role key (which bypasses RLS),
-- your app will work fine either way. BUT: if the anon/publishable key ever
-- leaks or gets used directly from a browser, anyone could read/write every
-- row in your database.
--
-- Run this in Supabase SQL Editor to lock tables down to backend-only access.
-- After running this, only requests using the service_role key (i.e. your
-- Express backend) can read/write these tables — the anon key gets nothing.
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_durations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- No policies are created here on purpose: with RLS enabled and zero
-- policies, the anon/authenticated roles get NO access at all, while the
-- service_role key (used only by your backend) still has full access.
-- This is the safest default for this architecture (backend-only DB access).
