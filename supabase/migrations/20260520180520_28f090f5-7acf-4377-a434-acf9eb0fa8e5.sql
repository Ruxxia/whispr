
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  accent_color text default '#8b7355',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by authenticated users"
  on public.profiles for select to authenticated using (true);
create policy "users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);

-- MOODS enum
create type public.mood as enum (
  'lonely','tired','healing','grateful','anxious','hopeful','happy','overthinking'
);

create type public.paper_style as enum (
  'hvs','notebook','torn','vintage','dotted','crumpled','perforated','sticky','scrapbook'
);

create type public.visibility as enum ('public','private');

-- POSTS
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  content text not null,
  mood public.mood,
  paper_style public.paper_style not null default 'hvs',
  paper_color text not null default '#faf8f5',
  paper_texture text,
  background_image text,
  font_family text not null default 'serif',
  rotation real not null default 0,
  is_anonymous boolean not null default false,
  visibility public.visibility not null default 'public',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_author_idx on public.posts(author_id);
create index posts_created_idx on public.posts(created_at desc);
create index posts_mood_idx on public.posts(mood);

alter table public.posts enable row level security;

create policy "public posts are viewable by authenticated users"
  on public.posts for select to authenticated
  using (visibility = 'public' or author_id = auth.uid());
create policy "users insert own posts"
  on public.posts for insert to authenticated
  with check (auth.uid() = author_id);
create policy "users update own posts"
  on public.posts for update to authenticated using (auth.uid() = author_id);
create policy "users delete own posts"
  on public.posts for delete to authenticated using (auth.uid() = author_id);

-- POST STICKERS
create table public.post_stickers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  sticker_key text not null,
  x real not null default 0,
  y real not null default 0,
  scale real not null default 1,
  rotation real not null default 0,
  z_index int not null default 1
);
create index post_stickers_post_idx on public.post_stickers(post_id);
alter table public.post_stickers enable row level security;
create policy "stickers viewable with post"
  on public.post_stickers for select to authenticated
  using (exists (select 1 from public.posts p where p.id = post_id
    and (p.visibility = 'public' or p.author_id = auth.uid())));
create policy "author manages stickers"
  on public.post_stickers for all to authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()))
  with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

-- REACTIONS
create type public.reaction_kind as enum ('relate','strong','support');

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id, kind)
);
create index reactions_post_idx on public.reactions(post_id);
alter table public.reactions enable row level security;
create policy "reactions viewable"
  on public.reactions for select to authenticated using (true);
create policy "users react"
  on public.reactions for insert to authenticated with check (auth.uid() = user_id);
create policy "users remove own reactions"
  on public.reactions for delete to authenticated using (auth.uid() = user_id);

-- FOLLOWS
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table public.follows enable row level security;
create policy "follows viewable" on public.follows for select to authenticated using (true);
create policy "users follow" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "users unfollow" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- BOOKMARKS
create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
alter table public.bookmarks enable row level security;
create policy "users see own bookmarks" on public.bookmarks for select to authenticated using (auth.uid() = user_id);
create policy "users add bookmarks" on public.bookmarks for insert to authenticated with check (auth.uid() = user_id);
create policy "users remove bookmarks" on public.bookmarks for delete to authenticated using (auth.uid() = user_id);

-- updated_at trigger
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_set_updated before update on public.profiles
  for each row execute function public.tg_set_updated_at();
create trigger posts_set_updated before update on public.posts
  for each row execute function public.tg_set_updated_at();

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  i int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1),
    'whisper_' || substr(new.id::text, 1, 6)
  );
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '', 'g');
  if length(base_username) < 3 then base_username := 'whisper_' || substr(new.id::text, 1, 6); end if;
  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    i := i + 1;
    final_username := base_username || i::text;
  end loop;
  insert into public.profiles (id, username, display_name)
  values (new.id, final_username, coalesce(new.raw_user_meta_data->>'display_name', final_username));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
