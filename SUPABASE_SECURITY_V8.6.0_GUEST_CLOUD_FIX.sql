-- Workday Journey V8.6.0 - Guest to Cloud Economy Security Fix
-- ACTION: RUN THIS IN SUPABASE SQL EDITOR BEFORE DEPLOYING THE FRONTEND.
-- Prerequisite: SUPABASE_ECONOMY_SECURITY_V8.5.0.1.sql already applied.
-- Safe to re-run. Does not reset any balances, historical transactions or items.
-- Existing imported users retain their stored balances and inventory.

begin;

-- Leave the legacy function signature in place for compatibility with stale
-- browsers, but make its implementation deny ALL client-submitted balances.
-- Never trust a browser-supplied balance or inventory, including a "first" call.
create or replace function public.import_legacy_economy(
  p_balance bigint,
  p_lifetime_earned bigint,
  p_lifetime_spent bigint,
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'LEGACY_IMPORT_DISABLED_V860'
    using errcode = '42501',
          hint = 'Cloud Economy is server-owned. Contact the owner to review an old balance.';
end;
$$;

-- PUBLIC is a Postgres pseudo-role: revoking this prevents inherited access.
-- If a user tries invoking the RPC from DevTools or an old client, PostgREST
-- will reject it even before the function executes.
revoke all on function public.import_legacy_economy(bigint,bigint,bigint,jsonb)
  from public, anon, authenticated;

comment on function public.import_legacy_economy(bigint,bigint,bigint,jsonb)
  is 'DISABLED by Workday Journey V8.6.0: legacy client-origin Coin and inventory imports are forbidden.';

commit;

-- OPTIONAL ADMIN AUDIT (read-only, run as the SQL Editor admin role):
-- Inspect previous migrations because this patch does not retrospectively
-- distinguish legitimate historical balances from earlier fake imports.
-- select a.user_id, u.email, a.balance, a.lifetime_earned,
--        a.legacy_imported_at, a.updated_at
-- from public.work_coin_accounts a
-- join auth.users u on u.id = a.user_id
-- where a.legacy_imported_at is not null
-- order by a.legacy_imported_at desc;
--
-- Find newly registered accounts with historical import entries:
-- select u.email, u.created_at, tx.amount, tx.created_at as imported_at
-- from public.work_coin_transactions tx
-- join auth.users u on u.id=tx.user_id
-- where tx.source_key='migration:v8501'
-- order by tx.created_at desc;
