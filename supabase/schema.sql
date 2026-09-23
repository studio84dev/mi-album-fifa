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

-- 2. Album catalog table (system-managed; regular users cannot modify it)
create table if not exists public.albums (
  id text primary key,
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete cascade,
  is_public boolean not null default true,
  created_at timestamptz default now()
);

alter table public.albums enable row level security;
create policy "Users can read public or own albums" on public.albums for select
  using (is_public or auth.uid() = created_by);
-- Catalogs are managed only by the system (service role), never by ordinary authenticated users.
revoke insert, update, delete on public.albums from anon, authenticated;

insert into public.albums (id, name, description, is_public, created_by)
values
  ('fifa-world-cup-2026', 'Copa del Mundo 2026', 'Álbum FIFA World Cup 2026', true, null),
  ('copa-america-2028', 'Copa América 2028', 'Catálogo de ejemplo: Argentina, Brasil y Chile. No oficial.', true, null)
on conflict (id) do nothing;

-- 3. Sticker collection table
create table if not exists public.sticker_collection (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  album_id       text not null default 'fifa-world-cup-2026' references public.albums(id),
  country_code   text not null,
  sticker_number int  not null check (sticker_number between 0 and 20),
  repeated       int  not null default 0,
  updated_at     timestamptz default now(),
  unique (user_id, album_id, country_code, sticker_number)
  -- Note: presence of a row = sticker is collected. repeated > 0 means extra copies.
  -- sticker_number 0 is used for FWC 00 (Panini Logo).
);

-- Migration for databases created before multi-album support.
alter table public.sticker_collection add column if not exists album_id text;
update public.sticker_collection set album_id = 'fifa-world-cup-2026' where album_id is null;
alter table public.sticker_collection alter column album_id set default 'fifa-world-cup-2026';
alter table public.sticker_collection alter column album_id set not null;
alter table public.sticker_collection drop constraint if exists sticker_collection_user_id_country_code_sticker_number_key;
alter table public.sticker_collection add constraint sticker_collection_user_album_sticker_key unique (user_id, album_id, country_code, sticker_number);

alter table public.sticker_collection enable row level security;

create policy "Users can manage own stickers"
  on public.sticker_collection for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Per-user "albums in progress" membership.
-- Removing a row here only drops the association; the catalog and the
-- user's sticker_collection rows for that album are preserved.
create table if not exists public.user_albums (
  user_id    uuid not null references auth.users(id) on delete cascade,
  album_id   text not null references public.albums(id),
  created_at timestamptz not null default now(),
  primary key (user_id, album_id)
);

alter table public.user_albums enable row level security;

create policy "Users can read own albums"
  on public.user_albums for select
  using (auth.uid() = user_id);

create policy "Users can add public system albums"
  on public.user_albums for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.albums a
      where a.id = album_id and a.is_public and a.created_by is null
    )
  );

create policy "Users can remove own album memberships"
  on public.user_albums for delete
  using (auth.uid() = user_id);

grant select, insert, delete on public.user_albums to authenticated;

-- Backfill memberships from any pre-existing collection rows.
insert into public.user_albums (user_id, album_id)
select distinct user_id, album_id from public.sticker_collection
on conflict do nothing;

-- ============================================================
-- Supabase Dashboard steps (NOT SQL):
-- 1. Authentication > Providers > Google → enable, add Client ID + Secret
-- 2. Authentication > URL Configuration → add your site URL to Allowed Redirect URLs
-- 3. Deploy edge function: supabase functions deploy upsert-user
-- ============================================================
