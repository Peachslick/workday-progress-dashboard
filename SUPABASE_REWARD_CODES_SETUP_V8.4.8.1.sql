-- Workday Journey V8.4.8.1
-- Reward Codes + Developer Control Center
-- Run once in Supabase SQL Editor.
-- IMPORTANT: set owner_email in the bootstrap block near the bottom before running.

create extension if not exists pgcrypto;

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin')),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null default 'Reward Code',
  reward jsonb not null default '{"coins":0,"items":[],"chests":[]}'::jsonb,
  active boolean not null default true,
  per_user_limit integer not null default 1 check (per_user_limit between 1 and 50),
  max_uses integer check (max_uses is null or max_uses > 0),
  total_uses integer not null default 0 check (total_uses >= 0),
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reward_codes_code_format check (code ~ '^[A-Z0-9_-]{3,32}$'),
  constraint reward_codes_reward_object check (jsonb_typeof(reward) = 'object')
);

create table if not exists public.reward_code_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.reward_codes(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,
  code_snapshot text not null,
  title_snapshot text not null,
  reward_snapshot jsonb not null,
  redeemed_at timestamptz not null default now()
);

create index if not exists reward_codes_active_idx
  on public.reward_codes (active, expires_at);
create index if not exists reward_code_redemptions_user_idx
  on public.reward_code_redemptions (user_id, redeemed_at desc);
create index if not exists reward_code_redemptions_code_idx
  on public.reward_code_redemptions (code_id, redeemed_at desc);

create or replace function public.is_workday_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_admins a
    where a.user_id = auth.uid()
      and a.enabled = true
      and a.role in ('owner','admin')
  );
$$;

revoke all on function public.is_workday_owner() from public;
grant execute on function public.is_workday_owner() to authenticated;

create or replace function public.normalize_reward_code_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.code := upper(trim(new.code));
  new.updated_at := now();
  if new.created_by is null then new.created_by := auth.uid(); end if;
  return new;
end;
$$;

drop trigger if exists trg_reward_codes_normalize on public.reward_codes;
create trigger trg_reward_codes_normalize
before insert or update on public.reward_codes
for each row execute function public.normalize_reward_code_row();

alter table public.app_admins enable row level security;
alter table public.reward_codes enable row level security;
alter table public.reward_code_redemptions enable row level security;

-- Recreate policies safely.
drop policy if exists app_admins_read_self_or_owner on public.app_admins;
create policy app_admins_read_self_or_owner
on public.app_admins for select
to authenticated
using (user_id = auth.uid() or public.is_workday_owner());

drop policy if exists app_admins_owner_manage on public.app_admins;
create policy app_admins_owner_manage
on public.app_admins for all
to authenticated
using (public.is_workday_owner())
with check (public.is_workday_owner());

drop policy if exists reward_codes_owner_select on public.reward_codes;
create policy reward_codes_owner_select
on public.reward_codes for select
to authenticated
using (public.is_workday_owner());

drop policy if exists reward_codes_owner_insert on public.reward_codes;
create policy reward_codes_owner_insert
on public.reward_codes for insert
to authenticated
with check (public.is_workday_owner());

drop policy if exists reward_codes_owner_update on public.reward_codes;
create policy reward_codes_owner_update
on public.reward_codes for update
to authenticated
using (public.is_workday_owner())
with check (public.is_workday_owner());

drop policy if exists reward_codes_owner_delete on public.reward_codes;
create policy reward_codes_owner_delete
on public.reward_codes for delete
to authenticated
using (public.is_workday_owner());

drop policy if exists reward_redemptions_read_own_or_owner on public.reward_code_redemptions;
create policy reward_redemptions_read_own_or_owner
on public.reward_code_redemptions for select
to authenticated
using (user_id = auth.uid() or public.is_workday_owner());

-- Least privilege: remove any default table grants first, then add only what
-- the browser application actually needs. RLS remains the final row-level guard.
revoke all on public.app_admins from anon, authenticated;
revoke all on public.reward_codes from anon, authenticated;
revoke all on public.reward_code_redemptions from anon, authenticated;

grant select on public.app_admins to authenticated;
grant select, insert, update, delete on public.reward_codes to authenticated;
grant select on public.reward_code_redemptions to authenticated;

create or replace function public.redeem_reward_code(p_code text)
returns table (
  redemption_id uuid,
  code text,
  title text,
  reward jsonb,
  redeemed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_code public.reward_codes%rowtype;
  v_user_uses integer;
  v_redemption public.reward_code_redemptions%rowtype;
begin
  if v_uid is null then
    raise exception 'REWARD_CODE_LOGIN_REQUIRED';
  end if;

  select rc.* into v_code
  from public.reward_codes as rc
  where rc.code = upper(trim(coalesce(p_code,'')))
  for update;

  if not found then
    raise exception 'REWARD_CODE_NOT_FOUND';
  end if;
  if not v_code.active then
    raise exception 'REWARD_CODE_INACTIVE';
  end if;
  if v_code.expires_at is not null and now() >= v_code.expires_at then
    raise exception 'REWARD_CODE_EXPIRED';
  end if;
  if v_code.max_uses is not null and v_code.total_uses >= v_code.max_uses then
    raise exception 'REWARD_CODE_MAX_USES';
  end if;

  select count(*)::integer into v_user_uses
  from public.reward_code_redemptions r
  where r.code_id = v_code.id and r.user_id = v_uid;

  if v_user_uses >= v_code.per_user_limit then
    if v_code.per_user_limit = 1 then
      raise exception 'REWARD_CODE_ALREADY_USED';
    end if;
    raise exception 'REWARD_CODE_USER_LIMIT';
  end if;

  insert into public.reward_code_redemptions (
    code_id, user_id, user_email, code_snapshot, title_snapshot, reward_snapshot
  ) values (
    v_code.id,
    v_uid,
    nullif(auth.jwt() ->> 'email',''),
    v_code.code,
    v_code.title,
    v_code.reward
  )
  returning * into v_redemption;

  update public.reward_codes as rc
  set total_uses = rc.total_uses + 1,
      updated_at = now()
  where rc.id = v_code.id;

  return query
  select v_redemption.id,
         v_redemption.code_snapshot,
         v_redemption.title_snapshot,
         v_redemption.reward_snapshot,
         v_redemption.redeemed_at;
end;
$$;

revoke all on function public.redeem_reward_code(text) from public;
grant execute on function public.redeem_reward_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- OWNER BOOTSTRAP
-- 1) Replace the empty owner_email below with the email of YOUR Supabase account.
-- 2) Run this whole SQL file.
-- Example: owner_email text := 'you@example.com';
-- ---------------------------------------------------------------------------
do $$
declare
  owner_email text := '';
  owner_id uuid;
begin
  if trim(owner_email) = '' then
    raise notice 'V8.4.8 tables/functions installed. Set owner_email in OWNER BOOTSTRAP and run this block again to enable Developer Control Center.';
    return;
  end if;

  select id into owner_id
  from auth.users
  where lower(email) = lower(trim(owner_email))
  order by created_at asc
  limit 1;

  if owner_id is null then
    raise exception 'Owner email % was not found in Authentication > Users', owner_email;
  end if;

  insert into public.app_admins (user_id, role, enabled)
  values (owner_id, 'owner', true)
  on conflict (user_id) do update
  set role = excluded.role,
      enabled = true;

  raise notice 'Owner enabled for %', owner_email;
end $$;

-- Optional checks after setup:
-- select * from public.app_admins;
-- select id, code, title, active, total_uses from public.reward_codes order by created_at desc;
-- select code_snapshot, user_email, redeemed_at from public.reward_code_redemptions order by redeemed_at desc;
