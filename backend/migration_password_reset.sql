-- Run once in Supabase SQL Editor: adds password-reset support.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token_hash text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reset_token_expires timestamptz;
