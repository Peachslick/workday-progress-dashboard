-- Workday Journey V8.6.0.3 - legacy recovery approval workflow.
-- Requires V8.5.0.1 security, V8.6.0 security, V8.6.0.1 bank SQL.
-- Run BEFORE deploying v8603.js. Safe to re-run (never re-applies reviews).
-- WARNING: A browser snapshot is UNTRUSTED evidence; there is NO automatic credit.
begin;

create table if not exists public.wdj_legacy_recovery_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot_fingerprint text not null,
  snapshot jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  owner_note text,
  approved_bank_amount bigint not null default 0,
  bank_mode text,
  approved_stocks boolean not null default false,
  unique(user_id,snapshot_fingerprint)
);
create index if not exists wdj_legacy_recovery_status_idx
  on public.wdj_legacy_recovery_requests(status,created_at desc);
create index if not exists wdj_legacy_recovery_user_idx
  on public.wdj_legacy_recovery_requests(user_id,created_at desc);

create table if not exists public.wdj_legacy_exchange_recovered (
  user_id uuid primary key references auth.users(id) on delete cascade,
  request_id uuid not null unique references public.wdj_legacy_recovery_requests(id),
  trades jsonb not null,
  approved_at timestamptz not null default now()
);

alter table public.wdj_legacy_recovery_requests enable row level security;
alter table public.wdj_legacy_exchange_recovered enable row level security;
revoke all on public.wdj_legacy_recovery_requests from public,anon,authenticated;
revoke all on public.wdj_legacy_exchange_recovered from public,anon,authenticated;
-- Clients MUST use the RPCs; they cannot insert/edit/delete recovery rows.

create or replace function public.wdj_submit_legacy_recovery(p_snapshot jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_hash text;
  v_id uuid;
  v_status text;
  v_day_count integer;
  v_size integer;
  v_trades jsonb;
  v_ledger jsonb;
begin
  if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  if jsonb_typeof(p_snapshot) <> 'object' then raise exception 'INVALID_RECOVERY_SNAPSHOT'; end if;
  v_size := octet_length(p_snapshot::text);
  if v_size > 75000 then raise exception 'RECOVERY_TOO_LARGE'; end if;
  v_trades := p_snapshot->'trades';
  v_ledger := p_snapshot->'bank'->'ledger';
  if v_trades is not null and jsonb_typeof(v_trades) <> 'array' then raise exception 'INVALID_TRADES'; end if;
  if v_ledger is not null and jsonb_typeof(v_ledger) <> 'array' then raise exception 'INVALID_BANK_LEDGER'; end if;
  if coalesce(jsonb_array_length(v_trades),0) > 250
    or coalesce(jsonb_array_length(v_ledger),0) > 250 then raise exception 'RECOVERY_TOO_MANY_ROWS'; end if;
  if coalesce(jsonb_array_length(v_trades),0)=0
    and coalesce(jsonb_array_length(v_ledger),0)=0 then raise exception 'EMPTY_RECOVERY'; end if;
  -- Fingerprint is for idempotency, NOT evidence of integrity.
  v_hash := md5(p_snapshot::text);
  select id,status into v_id,v_status
    from public.wdj_legacy_recovery_requests
    where user_id=v_uid and snapshot_fingerprint=v_hash;
  if found then return jsonb_build_object('id',v_id,'status',v_status,'duplicate',true); end if;
  -- Prevent creating an unlimited queue from browser scripts.
  select count(*) into v_day_count from public.wdj_legacy_recovery_requests
    where user_id=v_uid and created_at > now()-interval '24 hours';
  if v_day_count >= 2 then raise exception 'RECOVERY_DAILY_LIMIT'; end if;
  if (select count(*) from public.wdj_legacy_recovery_requests
       where user_id=v_uid and status='pending') >= 2 then
    raise exception 'RECOVERY_PENDING_LIMIT'; end if;
  insert into public.wdj_legacy_recovery_requests(user_id,snapshot_fingerprint,snapshot)
    values(v_uid,v_hash,p_snapshot) returning id into v_id;
  return jsonb_build_object('id',v_id,'status','pending','duplicate',false);
end; $$;
revoke all on function public.wdj_submit_legacy_recovery(jsonb) from public,anon;
grant execute on function public.wdj_submit_legacy_recovery(jsonb) to authenticated;

create or replace function public.wdj_get_my_legacy_recovery()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',id,'status',status,'createdAt',created_at,'reviewedAt',reviewed_at,
    'bankAmount',approved_bank_amount,'stocksApproved',approved_stocks,
    'note',coalesce(owner_note,'')) order by created_at desc)
    from (select * from public.wdj_legacy_recovery_requests
      where user_id=v_uid order by created_at desc limit 10) r),'[]'::jsonb);
end; $$;
revoke all on function public.wdj_get_my_legacy_recovery() from public,anon;
grant execute on function public.wdj_get_my_legacy_recovery() to authenticated;

create or replace function public.wdj_get_my_recovered_trades()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  return (select jsonb_build_object('trades',trades,'approvedAt',approved_at)
    from public.wdj_legacy_exchange_recovered where user_id=v_uid);
end; $$;
revoke all on function public.wdj_get_my_recovered_trades() from public,anon;
grant execute on function public.wdj_get_my_recovered_trades() to authenticated;

create or replace function public.wdj_owner_list_legacy_recovery(p_status text default 'pending')
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not public.is_workday_owner() then
    raise exception 'OWNER_ONLY'; end if;
  if p_status not in ('pending','approved','rejected','all') then
    raise exception 'INVALID_STATUS_FILTER'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',r.id,'userId',r.user_id,'email',coalesce(u.email,''),
    'status',r.status,'createdAt',r.created_at,'snapshot',r.snapshot,
    'reviewedAt',r.reviewed_at,'note',coalesce(r.owner_note,''),
    'bankApproved',r.approved_bank_amount,'stocksApproved',r.approved_stocks)
    order by r.created_at desc)
    from (select * from public.wdj_legacy_recovery_requests
      where p_status='all' or status=p_status
      order by created_at desc limit 50) r
    left join auth.users u on u.id=r.user_id),'[]'::jsonb);
end; $$;
revoke all on function public.wdj_owner_list_legacy_recovery(text) from public,anon;
grant execute on function public.wdj_owner_list_legacy_recovery(text) to authenticated;

-- The Owner explicitly selects an amount, mode, and whether stocks are verified.
-- wallet_transfer preserves total Coins (recommended); verified_compensation
-- creates Bank savings ONLY with an audit reason and Owner approval.
create or replace function public.wdj_owner_review_legacy_recovery(
  p_request_id uuid, p_decision text,
  p_bank_amount bigint default 0,
  p_bank_mode text default 'wallet_transfer',
  p_restore_stocks boolean default false,
  p_reason text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := (select auth.uid());
  v_row public.wdj_legacy_recovery_requests%rowtype;
  v_coins public.work_coin_accounts%rowtype;
  v_bank public.work_bank_accounts%rowtype;
  v_claim numeric;
  v_trades jsonb;
  v_verified boolean;
begin
  if v_owner is null or not public.is_workday_owner() then raise exception 'OWNER_ONLY'; end if;
  if p_decision not in ('approve','reject') then raise exception 'INVALID_DECISION'; end if;
  if length(btrim(coalesce(p_reason,''))) < 10 or length(p_reason) > 1000 then
    raise exception 'OWNER_REASON_REQUIRED'; end if;
  select * into v_row from public.wdj_legacy_recovery_requests
    where id=p_request_id for update;
  if not found then raise exception 'RECOVERY_NOT_FOUND'; end if;
  if v_row.status <> 'pending' then raise exception 'RECOVERY_ALREADY_REVIEWED'; end if;
  if p_decision='reject' then
    update public.wdj_legacy_recovery_requests set status='rejected',
      reviewed_by=v_owner,reviewed_at=now(),owner_note=btrim(p_reason)
      where id=v_row.id;
    return jsonb_build_object('status','rejected','id',v_row.id);
  end if;
  if p_bank_amount is null or p_bank_amount < 0 or p_bank_amount > 1000000
     or p_bank_mode not in ('wallet_transfer','verified_compensation') then
    raise exception 'INVALID_BANK_RECOVERY'; end if;
  if p_bank_amount > 0 then
    -- A bound is NOT proof; the Owner must separately inspect transaction history.
    select coalesce(sum((x.item->>'amount')::numeric),0) into v_claim
      from jsonb_array_elements(coalesce(v_row.snapshot->'bank'->'ledger','[]'::jsonb)) x(item)
      where jsonb_typeof(x.item)='object' and
        (x.item->>'amount') ~ '^-?[0-9]{1,10}(\.[0-9]{1,2})?$';
    if v_claim < p_bank_amount then raise exception 'BANK_AMOUNT_EXCEEDS_CLAIM'; end if;
  end if;
  v_trades := coalesce(v_row.snapshot->'trades','[]'::jsonb);
  if p_restore_stocks then
    if jsonb_array_length(v_trades)=0 then raise exception 'NO_TRADES_TO_RESTORE'; end if;
    if exists(select 1 from public.wdj_legacy_exchange_recovered
      where user_id=v_row.user_id) then raise exception 'EXCHANGE_ALREADY_RESTORED'; end if;
    -- Basic structural safety; the human reviewer must verify genuine trades.
    v_verified := not exists(select 1 from jsonb_array_elements(v_trades) x(t)
      where jsonb_typeof(x.t)<>'object'
        or coalesce(x.t->>'side','') not in ('buy','sell')
        or coalesce(x.t->>'symbol','') !~ '^[A-Z0-9]{1,12}$'
        or coalesce(x.t->>'qty','') !~ '^[0-9]{1,6}$'
        or (x.t->>'qty')::int <= 0
        or coalesce(x.t->>'price','') !~ '^[0-9]{1,8}(\.[0-9]{1,4})?$');
    if not v_verified then raise exception 'INVALID_TRADE_EVIDENCE'; end if;
  end if;
  if p_bank_amount > 0 then
    perform public._economy_ensure_account(v_row.user_id);
    select * into v_coins from public.work_coin_accounts where user_id=v_row.user_id for update;
    -- Serialize competing reviews of multiple cases from the same account.
    if exists(select 1 from public.wdj_legacy_recovery_requests
      where user_id=v_row.user_id and id<>v_row.id and status='approved'
        and approved_bank_amount>0) then raise exception 'BANK_ALREADY_RECOVERED'; end if;
    if p_bank_mode='wallet_transfer' and v_coins.balance < p_bank_amount then
      raise exception 'RECOVERY_INSUFFICIENT_WALLET'; end if;
    perform public._bank_settle_interest(v_row.user_id);
    select * into v_bank from public.work_bank_accounts where user_id=v_row.user_id for update;
    if p_bank_mode='wallet_transfer' then
      update public.work_coin_accounts set balance=balance-p_bank_amount,updated_at=now()
        where user_id=v_row.user_id;
      insert into public.work_coin_transactions(user_id,source_key,amount,kind,label,metadata)
        values(v_row.user_id,'legacy-recovery:'||v_row.id::text,-p_bank_amount,
          'bank_transfer','Approved legacy bank transfer',
          jsonb_build_object('caseId',v_row.id,'approvedBy',v_owner));
    end if;
    update public.work_bank_accounts set savings=savings+p_bank_amount,
      opened_at=coalesce(opened_at,now()),
      boost_started_date=coalesce(boost_started_date,(now() at time zone 'Asia/Bangkok')::date),
      streak_start_date=coalesce(streak_start_date,(now() at time zone 'Asia/Bangkok')::date),
      last_interest_date=(now() at time zone 'Asia/Bangkok')::date,
      updated_at=now() where user_id=v_row.user_id;
    insert into public.work_bank_transactions(user_id,source_key,kind,amount,balance_after,metadata)
      values(v_row.user_id,'legacy-recovery:'||v_row.id::text,'deposit',p_bank_amount,
        v_bank.savings+p_bank_amount,
        jsonb_build_object('caseId',v_row.id,'mode',p_bank_mode,
          'approvedBy',v_owner,'ownerReason',btrim(p_reason)));
  end if;
  if p_restore_stocks then
    insert into public.wdj_legacy_exchange_recovered(user_id,request_id,trades)
      values(v_row.user_id,v_row.id,v_trades);
  end if;
  update public.wdj_legacy_recovery_requests set status='approved',
    reviewed_by=v_owner,reviewed_at=now(),owner_note=btrim(p_reason),
    approved_bank_amount=p_bank_amount,bank_mode=p_bank_mode,
    approved_stocks=p_restore_stocks where id=v_row.id;
  return jsonb_build_object('status','approved','id',v_row.id,
    'bankAmount',p_bank_amount,'stocksApproved',p_restore_stocks);
end; $$;
revoke all on function public.wdj_owner_review_legacy_recovery(uuid,text,bigint,text,boolean,text)
  from public,anon;
grant execute on function public.wdj_owner_review_legacy_recovery(uuid,text,bigint,text,boolean,text)
  to authenticated;

comment on table public.wdj_legacy_recovery_requests is
  'Untrusted old-browser snapshots queued for human Owner approval; never auto-credited.';
commit;
