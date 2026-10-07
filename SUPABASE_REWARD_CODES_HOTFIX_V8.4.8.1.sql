-- Workday Journey V8.4.8.1
-- Reward Code Redemption Hotfix
-- Safe to run on an existing V8.4.8 database.
-- This file does NOT drop tables and does NOT delete Reward Codes or redemption history.

begin;

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

  -- V8.4.8.1: qualify reward_codes.code explicitly.
  -- The RPC also returns an output column named code, so an unqualified
  -- WHERE code = ... is ambiguous inside PL/pgSQL.
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
  from public.reward_code_redemptions as r
  where r.code_id = v_code.id
    and r.user_id = v_uid;

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

commit;
