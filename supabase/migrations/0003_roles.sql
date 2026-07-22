-- Role foundation for future admin/moderation/scholar-approval workflows.
-- No new RLS policies are granted on other tables yet — those land together
-- with the admin/CMS UI that will actually use them (see docs/adr/0001).
alter table public.profiles
  add column role text not null default 'member'
    check (role in ('member', 'moderator', 'scholar', 'admin'));

create index profiles_role_idx on public.profiles (role);

-- Reusable in future RLS policies, e.g.:
--   using (auth.uid() = user_id or public.has_role('admin'))
create function public.has_role(required_role text)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = required_role
  );
$$;
