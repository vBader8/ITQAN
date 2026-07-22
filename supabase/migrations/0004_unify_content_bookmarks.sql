-- Replaces the per-content-type quran_*/hadith_* bookmark and progress
-- tables with generic ones addressed by (content_type, content_key), per
-- docs/adr/0001-content-architecture.md. This is the addressing scheme
-- every future content type (including CMS-authored content) will reuse,
-- rather than a fourth bespoke pair of tables.
--
-- content_key is an opaque per-type identifier:
--   quran_ayah -> "{surah_number}:{ayah_number}"          e.g. "2:255"
--   quran      -> "{surah_number}"                         e.g. "2"
--   hadith     -> "{book}:{hadith_number}" (bookmarks)
--                 or "{book}" (progress)                   e.g. "bukhari:1"
-- `data` carries whatever a content type needs beyond the key to render or
-- navigate to it (e.g. hadith bookmarks store the section number, since a
-- hadith number alone doesn't tell you which chapter it's in).

create table public.content_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_type text not null check (content_type in ('quran_ayah', 'hadith')),
  content_key text not null,
  data jsonb not null default '{}'::jsonb,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, content_type, content_key)
);

alter table public.content_bookmarks enable row level security;

create index content_bookmarks_user_id_idx on public.content_bookmarks (user_id);
create index content_bookmarks_user_id_created_at_idx
  on public.content_bookmarks (user_id, created_at desc);

create policy "Content bookmarks are managed by their owner"
  on public.content_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.content_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_type text not null check (content_type in ('quran', 'hadith')),
  content_key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (user_id, content_type, content_key)
);

alter table public.content_progress enable row level security;

create index content_progress_user_id_updated_at_idx
  on public.content_progress (user_id, updated_at desc);

create policy "Content progress is managed by its owner"
  on public.content_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_content_progress_updated_at
  before update on public.content_progress
  for each row execute procedure public.set_updated_at();

-- Backfill from the tables being replaced (a no-op on a fresh database with
-- no rows yet, but safe to run against a deployed one with real user data).
insert into public.content_bookmarks (user_id, content_type, content_key, note, created_at)
select user_id, 'quran_ayah', surah_number || ':' || ayah_number, note, created_at
from public.quran_bookmarks
on conflict do nothing;

insert into public.content_bookmarks (user_id, content_type, content_key, data, note, created_at)
select
  user_id,
  'hadith',
  book || ':' || hadith_number,
  jsonb_build_object('sectionNumber', section_number),
  note,
  created_at
from public.hadith_bookmarks
on conflict do nothing;

insert into public.content_progress (user_id, content_type, content_key, data, updated_at)
select
  user_id,
  'quran',
  surah_number::text,
  jsonb_build_object('lastAyahNumber', last_ayah_number),
  updated_at
from public.quran_progress
on conflict do nothing;

insert into public.content_progress (user_id, content_type, content_key, data, updated_at)
select
  user_id,
  'hadith',
  book,
  jsonb_build_object(
    'lastSectionNumber', last_section_number,
    'lastHadithNumber', last_hadith_number
  ),
  updated_at
from public.hadith_progress
on conflict do nothing;

drop table public.quran_bookmarks;
drop table public.quran_progress;
drop table public.hadith_bookmarks;
drop table public.hadith_progress;
