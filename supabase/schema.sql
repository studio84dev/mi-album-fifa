-- ============================================================
-- Schema for worldcup-album-index
-- Run these in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Public profiles table (upserted on every login by the edge function)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  display_name text,
  last_login  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Note: the edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely,
-- so no extra policy is needed for it.

-- 2. Sticker collection table
create table if not exists public.sticker_collection (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  country_code   text not null,
  sticker_number int  not null check (sticker_number between 0 and 20),
  repeated       int  not null default 0,
  updated_at     timestamptz default now(),
  unique (user_id, country_code, sticker_number)
  -- Note: presence of a row = sticker is collected. repeated > 0 means extra copies.
  -- sticker_number 0 is used for FWC 00 (Panini Logo).
);

alter table public.sticker_collection enable row level security;

create policy "Users can manage own stickers"
  on public.sticker_collection for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Supabase Dashboard steps (NOT SQL):
-- 1. Authentication > Providers > Google → enable, add Client ID + Secret
-- 2. Authentication > URL Configuration → add your site URL to Allowed Redirect URLs
-- 3. Deploy edge function: supabase functions deploy upsert-user
-- ============================================================