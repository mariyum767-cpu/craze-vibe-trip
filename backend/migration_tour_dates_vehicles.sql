-- =========================================================
-- Craze Vibe Trip — Upgrade: Vehicles/Coasters + Tour Dates
-- Run this ONCE in the Supabase SQL Editor.
-- Safe to re-run (IF NOT EXISTS guards throughout).
-- =========================================================

-- 1. VEHICLES / COASTERS — reusable, admin-manageable
create table if not exists public.vehicles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  vehicle_number text,
  total_seats int not null default 32,
  layout text not null default '2-2',
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

-- 2. TOUR DATES — a tour can now run on multiple departure dates,
--    each with its own assigned vehicle/coaster.
create table if not exists public.tour_dates (
  id uuid primary key default uuid_generate_v4(),
  tour_id uuid not null references public.tours(id) on delete cascade,
  start_date date not null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now()
);

-- 3. SEATS now belong to a specific tour_date (not just a tour),
--    since the same tour can run multiple times with different coasters.
alter table public.seats add column if not exists tour_date_id uuid references public.tour_dates(id) on delete cascade;
create unique index if not exists seats_tour_date_seat_number_key
  on public.seats(tour_date_id, seat_number) where tour_date_id is not null;

-- 4. BOOKINGS now record which specific departure date was booked.
alter table public.bookings add column if not exists tour_date_id uuid references public.tour_dates(id);

-- =========================================================
-- 5. Updated atomic booking function — seats are now locked
--    per tour_date, not per tour, so two different departure
--    dates of the same tour never fight over the same seat rows.
-- =========================================================
drop function if exists public.create_booking_with_seats;

create or replace function public.create_booking_with_seats(
  p_user_id uuid,
  p_tour_id uuid,
  p_tour_date_id uuid,
  p_pickup_point_id uuid,
  p_seat_ids uuid[],
  p_passenger_name text,
  p_passenger_phone text,
  p_passenger_email text,
  p_cnic text,
  p_number_of_passengers int,
  p_total_price numeric
) returns jsonb
language plpgsql
as $$
declare
  v_booking_id uuid;
  v_booking_code text;
  v_locked_count int;
begin
  -- Lock the requested seats so no concurrent request can touch them.
  -- (FOR UPDATE can't be combined directly with an aggregate in the same
  -- SELECT, so lock the rows in a subquery first, then count them.)
  select count(*) into v_locked_count
  from (
    select id from public.seats
    where id = any(p_seat_ids)
      and tour_date_id = p_tour_date_id
      and status = 'available'
    for update
  ) locked_seats;

  if v_locked_count <> array_length(p_seat_ids, 1) then
    return jsonb_build_object('success', false, 'error', 'one_or_more_seats_unavailable');
  end if;

  v_booking_code := 'CVT-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 99999)::text, 5, '0');

  insert into public.bookings (
    booking_id_string, user_id, tour_id, tour_date_id, pickup_point_id,
    passenger_name, passenger_phone, passenger_email, cnic,
    number_of_passengers, total_price, status
  ) values (
    v_booking_code, p_user_id, p_tour_id, p_tour_date_id, p_pickup_point_id,
    p_passenger_name, p_passenger_phone, p_passenger_email, p_cnic,
    p_number_of_passengers, p_total_price, 'confirmed'
  ) returning id into v_booking_id;

  insert into public.booking_seats (booking_id, seat_id)
  select v_booking_id, s from unnest(p_seat_ids) as s;

  update public.seats set status = 'booked' where id = any(p_seat_ids);

  return jsonb_build_object('success', true, 'booking_id', v_booking_id);
end;
$$;

-- =========================================================
-- Note: if `drop function if exists` above complains about multiple
-- overloads, run this first to see them, then drop each explicitly:
--   select proname, oid::regprocedure from pg_proc where proname = 'create_booking_with_seats';
-- =========================================================
