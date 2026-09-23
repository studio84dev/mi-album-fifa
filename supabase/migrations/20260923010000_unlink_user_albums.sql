begin;
grant delete on public.user_albums to authenticated;
create policy "Unlink own albums" on public.user_albums
  for delete using (auth.uid() = user_id);
-- Removing a membership intentionally leaves the catalog and sticker collection intact.
commit;
