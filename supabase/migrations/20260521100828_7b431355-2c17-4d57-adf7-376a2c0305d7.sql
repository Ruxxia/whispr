
insert into storage.buckets (id, name, public) values
  ('post-images','post-images',true),
  ('post-backgrounds','post-backgrounds',true),
  ('avatars','avatars',true)
on conflict (id) do nothing;

-- Public read
create policy "diary buckets public read"
on storage.objects for select
using (bucket_id in ('post-images','post-backgrounds','avatars'));

-- Users write only inside their own {userId}/ prefix
create policy "diary buckets user insert"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('post-images','post-backgrounds','avatars')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "diary buckets user update"
on storage.objects for update to authenticated
using (
  bucket_id in ('post-images','post-backgrounds','avatars')
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "diary buckets user delete"
on storage.objects for delete to authenticated
using (
  bucket_id in ('post-images','post-backgrounds','avatars')
  and auth.uid()::text = (storage.foldername(name))[1]
);
