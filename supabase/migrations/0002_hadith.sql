-- Hadith bookmarks and reading progress — same shape as the Quran tables in
-- 0001_init.sql, scoped to (book, hadith_number) since hadith numbers are
-- unique within a collection across all its sections.
create table public.hadith_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book text not null,
  section_number smallint not null check (section_number > 0),
  hadith_number smallint not null check (hadith_number > 0),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, book, hadith_number)
);

alter table public.hadith_bookmarks enable row level security;

create index hadith_bookmarks_user_id_idx on public.hadith_bookmarks (user_id);

create policy "Hadith bookmarks are managed by their owner"
  on public.hadith_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table public.hadith_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book text not null,
  last_section_number smallint not null check (last_section_number > 0),
  last_hadith_number smallint not null check (last_hadith_number > 0),
  updated_at timestamptz not null default now(),
  unique (user_id, book)
);

alter table public.hadith_progress enable row level security;

create index hadith_progress_user_id_updated_at_idx
  on public.hadith_progress (user_id, updated_at desc);

create policy "Hadith progress is managed by its owner"
  on public.hadith_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_hadith_progress_updated_at
  before update on public.hadith_progress
  for each row execute procedure public.set_updated_at();
