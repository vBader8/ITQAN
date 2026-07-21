-- Profiles: one row per authenticated user, created on signup via trigger.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by their owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Creates a profile row automatically whenever a new auth.users row appears.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, locale)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'locale', 'en'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- Bookmarks: a user can bookmark any (surah, ayah) once, with an optional note.
create table public.quran_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  surah_number smallint not null check (surah_number between 1 and 114),
  ayah_number smallint not null check (ayah_number > 0),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, surah_number, ayah_number)
);

alter table public.quran_bookmarks enable row level security;

create index quran_bookmarks_user_id_idx on public.quran_bookmarks (user_id);

create policy "Bookmarks are managed by their owner"
  on public.quran_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Reading progress: one row per (user, surah) tracking the last ayah read,
-- so "continue reading" can point at the most recently updated surah.
create table public.quran_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  surah_number smallint not null check (surah_number between 1 and 114),
  last_ayah_number smallint not null check (last_ayah_number > 0),
  updated_at timestamptz not null default now(),
  unique (user_id, surah_number)
);

alter table public.quran_progress enable row level security;

create index quran_progress_user_id_updated_at_idx
  on public.quran_progress (user_id, updated_at desc);

create policy "Progress is managed by its owner"
  on public.quran_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_quran_progress_updated_at
  before update on public.quran_progress
  for each row execute procedure public.set_updated_at();
