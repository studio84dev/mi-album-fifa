begin;
-- Catalogs are managed only by the system, never by ordinary authenticated users.
drop policy if exists "Users can create own albums" on public.albums;
revoke insert, update, delete on public.albums from anon, authenticated;
insert into public.albums (id, name, description, is_public, created_by)
values ('copa-america-2028', 'Copa América 2028', 'Catálogo de ejemplo: Argentina, Brasil y Chile. No oficial.', true, null)
on conflict (id) do update set name = excluded.name, description = excluded.description,
is_public = true, created_by = null;

create table if not exists public.user_albums (
  user_id uuid not null references auth.users(id) on delete cascade,
  album_id text not null references public.albums(id),
  created_at timestamptz not null default now(),
  primary key (user_id, album_id)
);
alter table public.user_albums enable row level security;
create policy "Read own albums" on public.user_albums for select using (auth.uid() = user_id);
create policy "Add system albums" on public.user_albums for insert
with check (auth.uid() = user_id and exists (
  select 1 from public.albums a where a.id = album_id and a.is_public and a.created_by is null
));
grant select, insert on public.user_albums to authenticated;
insert into public.user_albums (user_id, album_id)
select distinct user_id, album_id from public.sticker_collection
on conflict do nothing;
commit;

