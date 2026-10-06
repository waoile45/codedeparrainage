-- ─────────────────────────────────────────────────────────────────────────────
-- Forum communautaire : tables attendues par src/app/forum/page.tsx et
-- src/app/forum/[id]/page.tsx (forum_posts, forum_replies, forum_likes,
-- forum_reply_likes). Elles n'existaient pas en base : le forum n'affichait
-- que des posts démo hardcodés (retirés le 6 septembre 2026).
--
-- À exécuter dans le SQL Editor Supabase. Tant que ce script n'est pas passé,
-- le forum est vide et reste hors index (robots noindex dans forum/layout.tsx).
-- Une fois de vraies discussions publiées : retirer ce `robots` et remettre
-- /forum dans src/app/sitemap.ts.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.forum_posts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 3 and 120),
  content     text not null check (char_length(content) between 10 and 2000),
  category    text not null default 'Général',
  likes       integer not null default 0 check (likes >= 0),
  created_at  timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.forum_posts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 2000),
  likes       integer not null default 0 check (likes >= 0),
  created_at  timestamptz not null default now()
);

create table if not exists public.forum_likes (
  post_id     uuid not null references public.forum_posts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.forum_reply_likes (
  reply_id    uuid not null references public.forum_replies (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (reply_id, user_id)
);

create index if not exists forum_posts_created_idx   on public.forum_posts (created_at desc);
create index if not exists forum_replies_post_idx    on public.forum_replies (post_id, created_at);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.forum_posts       enable row level security;
alter table public.forum_replies     enable row level security;
alter table public.forum_likes       enable row level security;
alter table public.forum_reply_likes enable row level security;

-- Lecture publique (le forum est visible sans compte)
create policy "forum_posts_read"       on public.forum_posts       for select using (true);
create policy "forum_replies_read"     on public.forum_replies     for select using (true);
create policy "forum_likes_read"       on public.forum_likes       for select using (true);
create policy "forum_reply_likes_read" on public.forum_reply_likes for select using (true);

-- Écriture : uniquement en son nom
create policy "forum_posts_insert" on public.forum_posts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "forum_posts_delete" on public.forum_posts
  for delete to authenticated using (auth.uid() = user_id);

create policy "forum_replies_insert" on public.forum_replies
  for insert to authenticated with check (auth.uid() = user_id);
create policy "forum_replies_delete" on public.forum_replies
  for delete to authenticated using (auth.uid() = user_id);

create policy "forum_likes_insert" on public.forum_likes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "forum_likes_delete" on public.forum_likes
  for delete to authenticated using (auth.uid() = user_id);

create policy "forum_reply_likes_insert" on public.forum_reply_likes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "forum_reply_likes_delete" on public.forum_reply_likes
  for delete to authenticated using (auth.uid() = user_id);

-- ── Compteur de likes tenu par trigger ───────────────────────────────────────
-- Le client faisait `update forum_posts set likes = likes ± 1` lui-même : avec
-- RLS, n'importe quel connecté pourrait fixer le compteur d'un post qui n'est
-- pas le sien. Le compteur est désormais dérivé des lignes de forum_likes.
create or replace function public.forum_sync_post_likes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.forum_posts p
     set likes = (select count(*) from public.forum_likes l where l.post_id = p.id)
   where p.id = coalesce(new.post_id, old.post_id);
  return null;
end $$;

create or replace function public.forum_sync_reply_likes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.forum_replies r
     set likes = (select count(*) from public.forum_reply_likes l where l.reply_id = r.id)
   where r.id = coalesce(new.reply_id, old.reply_id);
  return null;
end $$;

drop trigger if exists forum_likes_sync on public.forum_likes;
create trigger forum_likes_sync after insert or delete on public.forum_likes
  for each row execute function public.forum_sync_post_likes();

drop trigger if exists forum_reply_likes_sync on public.forum_reply_likes;
create trigger forum_reply_likes_sync after insert or delete on public.forum_reply_likes
  for each row execute function public.forum_sync_reply_likes();

-- Aucune policy UPDATE sur forum_posts/forum_replies : les `update({likes})`
-- envoyés par le client sont ignorés (0 ligne), le trigger fait foi.
