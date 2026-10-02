-- Workday Journey V8 - Cloud Sync table
-- Run this once in Supabase > SQL Editor.

create table if not exists public.workday_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  client_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.workday_user_state enable row level security;

-- Only signed-in users need access. The browser uses a publishable/anon key + user session.
revoke all on table public.workday_user_state from anon, authenticated;
grant select, insert, update, delete on table public.workday_user_state to authenticated;

drop policy if exists "workday_state_select_own" on public.workday_user_state;
create policy "workday_state_select_own"
on public.workday_user_state for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "workday_state_insert_own" on public.workday_user_state;
create policy "workday_state_insert_own"
on public.workday_user_state for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "workday_state_update_own" on public.workday_user_state;
create policy "workday_state_update_own"
on public.workday_user_state for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "workday_state_delete_own" on public.workday_user_state;
create policy "workday_state_delete_own"
on public.workday_user_state for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.set_workday_state_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workday_state_updated_at on public.workday_user_state;
create trigger workday_state_updated_at
before update on public.workday_user_state
for each row execute function public.set_workday_state_updated_at();
