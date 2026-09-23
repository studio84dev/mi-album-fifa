create table if not exists public.albums (
  id text primary key,
  name text not null,
  description text,
  created_by uuid references auth.users(id) on delete cascade,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.albums enable row level security;

drop policy if exists "Users can read public or own albums" on public.albums;
create policy "Users can read public or own albums"
  on public.albums for select
  using (is_public or auth.uid() = created_by);

drop policy if exists "Users can create own albums" on public.albums;
create policy "Users can create own albums"
  on public.albums for insert
  with check (auth.uid() = created_by);

insert into public.albums (id, name, description)
values ('fifa-world-cup-2026', 'Copa del Mundo 2026', 'Álbum FIFA World Cup 2026')
on conflict (id) do nothing;

alter table public.sticker_collection
  add column if not exists album_id text;

update public.sticker_collection
set album_id = 'fifa-world-cup-2026'
where album_id is null;

alter table public.sticker_collection
  alter column album_id set default 'fifa-world-cup-2026',
  alter column album_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sticker_collection_album_id_fkey'
      and conrelid = 'public.sticker_collection'::regclass
  ) then
    alter table public.sticker_collection
      add constraint sticker_collection_album_id_fkey
      foreign key (album_id) references public.albums(id);
  end if;
end $$;

alter table public.sticker_collection
  drop constraint if exists sticker_collection_user_id_country_code_sticker_number_key;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sticker_collection_user_album_sticker_key'
      and conrelid = 'public.sticker_collection'::regclass
  ) then
    alter table public.sticker_collection
      add constraint sticker_collection_user_album_sticker_key
      unique (user_id, album_id, country_code, sticker_number);
  end if;
end $$;
