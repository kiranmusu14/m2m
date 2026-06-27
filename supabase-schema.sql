create table if not exists public.community_circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references public.community_circles(id) on delete cascade,
  circle text not null,
  text text not null,
  replies integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.community_posts
add column if not exists community_id uuid references public.community_circles(id) on delete cascade;

alter table public.community_posts
add column if not exists circle text not null default 'General';

alter table public.community_posts
add column if not exists replies integer not null default 0;

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

alter table public.community_circles enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;

drop policy if exists "community_circles_read_public" on public.community_circles;
create policy "community_circles_read_public"
on public.community_circles
for select
to anon
using (true);

drop policy if exists "community_circles_insert_public" on public.community_circles;
create policy "community_circles_insert_public"
on public.community_circles
for insert
to anon
with check (
  length(trim(name)) between 2 and 80
  and length(trim(description)) <= 220
);

drop policy if exists "community_posts_read_public" on public.community_posts;
create policy "community_posts_read_public"
on public.community_posts
for select
to anon
using (true);

drop policy if exists "community_posts_insert_public" on public.community_posts;
create policy "community_posts_insert_public"
on public.community_posts
for insert
to anon
with check (
  community_id is not null
  and length(trim(circle)) between 1 and 80
  and length(trim(text)) between 3 and 900
);

drop policy if exists "community_replies_read_public" on public.community_replies;
create policy "community_replies_read_public"
on public.community_replies
for select
to anon
using (true);

drop policy if exists "community_replies_insert_public" on public.community_replies;
create policy "community_replies_insert_public"
on public.community_replies
for insert
to anon
with check (
  post_id is not null
  and length(trim(text)) between 2 and 700
);
