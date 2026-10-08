-- Workday Journey V8.6.0.1 - Server-authoritative Work Bank.
-- RUN AFTER V8.5.0.1 AND V8.6.0 SECURITY SQL, BEFORE DEPLOYING NEW FRONTEND.
-- Safe to re-run: never imports browser-supplied balances or changes existing savings.
-- IMPORTANT: Existing local-only bank balances are NOT imported. See INSTALL_V8.6.0.1.md.
begin;

create table if not exists public.work_bank_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  savings numeric(20,2) not null default 0 check (savings >= 0),
  opened_at timestamptz,
  boost_started_date date,
  last_interest_date date,
  streak_start_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.work_bank_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null,
  kind text not null check (kind in ('deposit','withdraw','interest')),
  amount numeric(20,2) not null check (amount <> 0),
  balance_after numeric(20,2) not null check (balance_after >= 0),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique(user_id,source_key)
);
create index if not exists work_bank_tx_user_time_idx
  on public.work_bank_transactions(user_id,created_at desc);

alter table public.work_bank_accounts enable row level security;
alter table public.work_bank_transactions enable row level security;
revoke all on public.work_bank_accounts from public,anon,authenticated;
revoke all on public.work_bank_transactions from public,anon,authenticated;
grant select on public.work_bank_accounts to authenticated;
grant select on public.work_bank_transactions to authenticated;
drop policy if exists bank_read_own_account on public.work_bank_accounts;
create policy bank_read_own_account on public.work_bank_accounts
  for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists bank_read_own_transactions on public.work_bank_transactions;
create policy bank_read_own_transactions on public.work_bank_transactions
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public._bank_ensure_account(p_uid uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.work_bank_accounts(user_id) values(p_uid)
  on conflict (user_id) do nothing;
end; $$;
revoke all on function public._bank_ensure_account(uuid) from public,anon,authenticated;

-- Accrues interest at most once per Bangkok calendar day. All dates and
-- accrual rates are derived server-side. The row lock prevents double claims.
create or replace function public._bank_settle_interest(p_uid uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_account public.work_bank_accounts%rowtype;
  v_today date := (now() at time zone 'Asia/Bangkok')::date;
  v_day date;
  v_tier_rate numeric;
  v_bonus_rate numeric;
  v_streak_days integer;
  v_rate numeric;
  v_interest numeric(20,2);
  v_loop integer := 0;
begin
  perform public._bank_ensure_account(p_uid);
  select * into v_account from public.work_bank_accounts
    where user_id = p_uid for update;
  if v_account.savings <= 0 or v_account.last_interest_date is null then
    update public.work_bank_accounts set last_interest_date=v_today,
      updated_at=now() where user_id=p_uid
      and last_interest_date is distinct from v_today;
    return;
  end if;
  v_day := v_account.last_interest_date;
  while v_day < v_today and v_loop < 3660 loop
    v_day := v_day + 1;
    v_loop := v_loop + 1;
    if v_account.savings <= 0 then exit; end if;
    v_tier_rate := case when v_account.savings >= 5000 then 0.0200
      when v_account.savings >= 1500 then 0.0150
      when v_account.savings >= 500 then 0.0125 else 0.0100 end;
    v_streak_days := case
      when v_account.streak_start_date is not null
        and v_day >= v_account.streak_start_date
      then (v_day - v_account.streak_start_date) + 1 else 0 end;
    v_bonus_rate := case when v_streak_days >= 14 then 0.0050
      when v_streak_days >= 7 then 0.0025
      when v_streak_days >= 3 then 0.0010 else 0 end;
    v_rate := v_tier_rate + v_bonus_rate;
    v_interest := round(least(150::numeric, v_account.savings * v_rate),2);
    if v_interest > 0 then
      v_account.savings := v_account.savings + v_interest;
      insert into public.work_bank_transactions(user_id,source_key,kind,amount,balance_after,created_at,metadata)
      values(p_uid,'interest:'||v_day::text,'interest',v_interest,v_account.savings,
        (v_day::timestamp at time zone 'Asia/Bangkok'),
        jsonb_build_object('date',v_day,'rate',v_rate,'streakDays',v_streak_days));
    end if;
  end loop;
  update public.work_bank_accounts set savings=v_account.savings,
    last_interest_date=v_day,updated_at=now() where user_id=p_uid;
end; $$;
revoke all on function public._bank_settle_interest(uuid) from public,anon,authenticated;

create or replace function public.get_my_bank()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_account public.work_bank_accounts%rowtype;
  v_tx jsonb;
  v_interest numeric(20,2);
begin
  if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  perform public._bank_settle_interest(v_uid);
  select * into v_account from public.work_bank_accounts where user_id=v_uid;
  select coalesce(sum(amount),0)::numeric(20,2) into v_interest
    from public.work_bank_transactions where user_id=v_uid and kind='interest';
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',x.source_key,'type',x.kind,'amount',x.amount,
    'createdAt',x.created_at,'meta',x.metadata) order by x.created_at desc,x.source_key desc),'[]'::jsonb)
    into v_tx
    from (select source_key,kind,amount,created_at,metadata
      from public.work_bank_transactions where user_id=v_uid
      order by created_at desc,source_key desc limit 300) x;
  return jsonb_build_object(
    'savings',v_account.savings,
    'interestEarned',v_interest,
    'state',jsonb_build_object(
      'openedAt',v_account.opened_at,
      'boostStartedDate',v_account.boost_started_date,
      'lastInterestDate',v_account.last_interest_date,
      'streakStartDate',v_account.streak_start_date),
    'transactions',v_tx);
end; $$;
revoke all on function public.get_my_bank() from public,anon;
grant execute on function public.get_my_bank() to authenticated;

-- Single atomic transaction: Wallet debit/credit and Savings credit/debit.
-- Caller can choose the direction, integer amount and an idempotency UUID;
-- the DB checks balances, enforces access control and locks concurrent transfers.
create or replace function public.bank_move_secure(
  p_direction text,p_amount bigint,p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_coin public.work_coin_accounts%rowtype;
  v_bank public.work_bank_accounts%rowtype;
  v_key text;
  v_signed numeric(20,2);
  v_old public.work_bank_transactions%rowtype;
begin
  if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  if p_direction not in ('deposit','withdraw') or p_direction is null then
    raise exception 'INVALID_BANK_DIRECTION'; end if;
  if p_amount is null or p_amount < 1 or p_amount > 1000000000 then
    raise exception 'INVALID_BANK_AMOUNT'; end if;
  if p_request_id is null then raise exception 'BANK_REQUEST_ID_REQUIRED'; end if;
  v_key := 'bank:'||p_request_id::text;
  perform public._economy_ensure_account(v_uid);
  -- Consistent lock order: Wallet first, Bank second.
  select * into v_coin from public.work_coin_accounts
    where user_id=v_uid for update;
  perform public._bank_settle_interest(v_uid);
  select * into v_bank from public.work_bank_accounts
    where user_id=v_uid for update;
  select * into v_old from public.work_bank_transactions
    where user_id=v_uid and source_key=v_key;
  if found then
    if v_old.kind <> p_direction or abs(v_old.amount) <> p_amount then
      raise exception 'BANK_REQUEST_ID_REUSED'; end if;
    return jsonb_build_object('bank',public.get_my_bank(),'economy',public.get_my_economy());
  end if;
  if p_direction='deposit' then
    if v_coin.balance < p_amount then raise exception 'INSUFFICIENT_COINS'; end if;
    v_signed := p_amount;
    update public.work_coin_accounts set balance=balance-p_amount,
      updated_at=now() where user_id=v_uid;
  else
    if v_bank.savings < p_amount then raise exception 'INSUFFICIENT_SAVINGS'; end if;
    v_signed := -p_amount;
    update public.work_coin_accounts set balance=balance+p_amount,
      updated_at=now() where user_id=v_uid;
  end if;
  v_bank.savings := v_bank.savings + v_signed;
  if p_direction='deposit' then
    if v_bank.opened_at is null then v_bank.opened_at:=now(); end if;
    if v_bank.boost_started_date is null then
      v_bank.boost_started_date:=(now() at time zone 'Asia/Bangkok')::date; end if;
    if v_bank.streak_start_date is null or v_bank.savings = v_signed then
      v_bank.streak_start_date:=(now() at time zone 'Asia/Bangkok')::date; end if;
  else
    v_bank.streak_start_date := case when v_bank.savings > 0
      then (now() at time zone 'Asia/Bangkok')::date else null end;
  end if;
  v_bank.last_interest_date := (now() at time zone 'Asia/Bangkok')::date;
  update public.work_bank_accounts set savings=v_bank.savings,
    opened_at=v_bank.opened_at,boost_started_date=v_bank.boost_started_date,
    streak_start_date=v_bank.streak_start_date,
    last_interest_date=v_bank.last_interest_date,updated_at=now()
    where user_id=v_uid;
  insert into public.work_bank_transactions(user_id,source_key,kind,amount,balance_after)
    values(v_uid,v_key,p_direction,v_signed,v_bank.savings);
  insert into public.work_coin_transactions(user_id,source_key,amount,kind,label,metadata)
    values(v_uid,v_key,-v_signed::bigint,'bank_transfer','Work Bank '||p_direction,
      jsonb_build_object('bankRequestId',p_request_id::text,'direction',p_direction));
  return jsonb_build_object('bank',public.get_my_bank(),'economy',public.get_my_economy());
end; $$;
revoke all on function public.bank_move_secure(text,bigint,uuid) from public,anon;
grant execute on function public.bank_move_secure(text,bigint,uuid) to authenticated;

comment on function public.bank_move_secure(text,bigint,uuid) is
  'V8.6.0.1: Atomic, authenticated, idempotent Work Bank deposit/withdraw.';
commit;
