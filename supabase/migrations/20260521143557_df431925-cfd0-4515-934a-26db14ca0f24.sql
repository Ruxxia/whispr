-- Product kinds
create type public.product_kind as enum ('sticker_pack', 'paper_theme', 'profile_theme', 'collection');
create type public.product_status as enum ('draft', 'published', 'archived');

-- Marketplace items
create table public.marketplace_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kind public.product_kind not null,
  title text not null,
  description text,
  cover_url text,
  price_cents integer not null default 0,
  is_free boolean not null default true,
  season text,
  status public.product_status not null default 'published',
  creator_id uuid references public.profiles(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index marketplace_items_kind_idx on public.marketplace_items(kind, status, created_at desc);
create index marketplace_items_season_idx on public.marketplace_items(season) where season is not null;

alter table public.marketplace_items enable row level security;

create policy "published items viewable by all auth"
  on public.marketplace_items for select to authenticated
  using (status = 'published' or creator_id = auth.uid());

create policy "creators insert own items"
  on public.marketplace_items for insert to authenticated
  with check (creator_id = auth.uid());

create policy "creators update own items"
  on public.marketplace_items for update to authenticated
  using (creator_id = auth.uid());

create policy "creators delete own items"
  on public.marketplace_items for delete to authenticated
  using (creator_id = auth.uid());

create trigger marketplace_items_set_updated
before update on public.marketplace_items
for each row execute function public.tg_set_updated_at();

-- User library: owned items + equipped state
create table public.user_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  item_id uuid not null references public.marketplace_items(id) on delete cascade,
  acquired_at timestamptz not null default now(),
  equipped boolean not null default false,
  unique (user_id, item_id)
);

create index user_library_user_idx on public.user_library(user_id, equipped);

alter table public.user_library enable row level security;

create policy "owner reads own library"
  on public.user_library for select to authenticated
  using (auth.uid() = user_id);

create policy "owner inserts library entries"
  on public.user_library for insert to authenticated
  with check (auth.uid() = user_id);

create policy "owner updates library entries"
  on public.user_library for update to authenticated
  using (auth.uid() = user_id);

create policy "owner deletes library entries"
  on public.user_library for delete to authenticated
  using (auth.uid() = user_id);

-- Claim helper: free items only; restricts paid claims server-side
create or replace function public.claim_free_item(_item_id uuid)
returns public.user_library
language plpgsql
security definer
set search_path = public
as $$
declare
  _item public.marketplace_items;
  _row public.user_library;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into _item from public.marketplace_items
    where id = _item_id and status = 'published';
  if not found then
    raise exception 'Item not available';
  end if;
  if not _item.is_free then
    raise exception 'Item requires purchase';
  end if;

  insert into public.user_library (user_id, item_id)
  values (auth.uid(), _item_id)
  on conflict (user_id, item_id) do update set acquired_at = public.user_library.acquired_at
  returning * into _row;

  return _row;
end;
$$;

revoke execute on function public.claim_free_item(uuid) from anon;
grant execute on function public.claim_free_item(uuid) to authenticated;

-- Seed some launch items (free) — sticker packs, paper themes, profile themes, a collection
insert into public.marketplace_items (slug, kind, title, description, price_cents, is_free, season, featured, payload) values
  ('cottagecore-essentials', 'sticker_pack', 'Cottagecore Essentials', 'Mushrooms, ferns, bees, and dried flowers for soft pages.', 0, true, null, true,
   '{"stickers":["mushroom","fern","bee","dried-flower","wildflower","leaf"]}'::jsonb),
  ('celestial-dreams', 'sticker_pack', 'Celestial Dreams', 'Moons, stars, and constellations for late-night whispers.', 0, true, null, true,
   '{"stickers":["crescent-moon","star","constellation","comet","sparkle","planet"]}'::jsonb),
  ('stationery-club', 'sticker_pack', 'Stationery Club', 'Washi tape, paper clips, and tabs.', 0, true, null, false,
   '{"stickers":["washi-pink","paperclip","tab-yellow","sticky-note","pencil","stamp"]}'::jsonb),
  ('warm-linen', 'paper_theme', 'Warm Linen', 'Soft cream linen paper with a hand-torn edge.', 0, true, null, true,
   '{"paper_style":"linen","paper_color":"#f5efe4","font_family":"serif"}'::jsonb),
  ('midnight-parchment', 'paper_theme', 'Midnight Parchment', 'Deep navy parchment for confessions after dark.', 0, true, null, false,
   '{"paper_style":"parchment","paper_color":"#1c2238","font_family":"serif"}'::jsonb),
  ('sun-bleached', 'paper_theme', 'Sun Bleached', 'Vintage yellow notebook lines.', 0, true, null, false,
   '{"paper_style":"notebook","paper_color":"#fbf5d9","font_family":"hand"}'::jsonb),
  ('rose-quartz', 'profile_theme', 'Rose Quartz', 'Soft pink accent and warm header.', 0, true, null, true,
   '{"accent_color":"#c97f8b"}'::jsonb),
  ('sage-grove', 'profile_theme', 'Sage Grove', 'Muted sage accent for grounded vibes.', 0, true, null, false,
   '{"accent_color":"#7d9b76"}'::jsonb),
  ('ember-glow', 'profile_theme', 'Ember Glow', 'Warm amber accent.', 0, true, null, false,
   '{"accent_color":"#c1654a"}'::jsonb),
  ('autumn-2026', 'collection', 'Autumn 2026', 'Limited drop: amber papers + falling leaves stickers + warm profile theme.', 0, true, 'autumn-2026', true,
   '{"includes":["cottagecore-essentials","warm-linen","ember-glow"]}'::jsonb);
