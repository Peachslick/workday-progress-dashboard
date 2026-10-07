-- Workday Journey V8.5.0.1 - Economy Security Hardening
-- Run ONCE in Supabase SQL Editor AFTER the V8.4.8.1 Reward Code setup.
-- Safe to re-run: objects use IF NOT EXISTS / CREATE OR REPLACE.

create extension if not exists pgcrypto;

create table if not exists public.work_coin_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  lifetime_earned bigint not null default 0 check (lifetime_earned >= 0),
  lifetime_spent bigint not null default 0 check (lifetime_spent >= 0),
  legacy_imported_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.work_coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null,
  amount bigint not null,
  kind text not null default 'system',
  label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, source_key)
);

create table if not exists public.user_reward_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_type text not null,
  reward_id text not null,
  source_key text not null,
  acquired_at timestamptz not null default now(),
  primary key(user_id, reward_type, reward_id)
);

create table if not exists public.reward_catalog (
  reward_type text not null,
  reward_id text not null,
  price integer not null,
  active boolean not null default true,
  code_exclusive boolean not null default false,
  primary key(reward_type, reward_id)
);

insert into public.reward_catalog(reward_type,reward_id,price,active,code_exclusive) values
('mascot','chick',0,true,false),('mascot','cat',100,true,false),('mascot','bear',200,true,false),('mascot','bunny',300,true,false),('mascot','ghost',500,true,false),('mascot','hamster',450,true,false),('mascot','fox',650,true,false),('mascot','penguin',900,true,false),('mascot','dragon',1500,true,false),('mascot','developerChick',-1,true,true),
('accessory','none',0,true,false),('accessory','glasses',120,true,false),('accessory','headphones',180,true,false),('accessory','laptop',250,true,false),('accessory','crown',500,true,false),('accessory','developerCrown',-1,true,true),
('frame','none',0,true,false),('frame','neonBlue',200,true,false),('frame','sakuraFrame',300,true,false),('frame','auroraFrame',450,true,false),('frame','championGold',750,true,false),('frame','founderFrame',-1,true,true),
('theme','default',0,true,false),('theme','sakura',150,true,false),('theme','aurora',250,true,false),('theme','golden',400,true,false),('theme','midnight',400,true,false),('theme','sakuraNight',600,true,false),('theme','auroraGalaxy',900,true,false),('theme','goldenExecutive',1200,true,false),('theme','secretGalaxy',-1,true,true),
('effect','none',0,true,false),('effect','sparkle',120,true,false),('effect','halo',200,true,false),('effect','celebration',350,true,false),('effect','fallingStars',350,true,false),('effect','fireflies',500,true,false),('effect','galaxyTrail',750,true,false),('effect','legendaryCelebration',1000,true,false),('effect','coinRain',-1,true,true)
on conflict(reward_type,reward_id) do update set price=excluded.price,active=excluded.active,code_exclusive=excluded.code_exclusive;

alter table public.work_coin_accounts enable row level security;
alter table public.work_coin_transactions enable row level security;
alter table public.user_reward_inventory enable row level security;
alter table public.reward_catalog enable row level security;

revoke all on public.work_coin_accounts from anon, authenticated;
revoke all on public.work_coin_transactions from anon, authenticated;
revoke all on public.user_reward_inventory from anon, authenticated;
revoke all on public.reward_catalog from anon, authenticated;
grant select on public.work_coin_accounts to authenticated;
grant select on public.work_coin_transactions to authenticated;
grant select on public.user_reward_inventory to authenticated;
grant select on public.reward_catalog to authenticated;

drop policy if exists coin_account_read_own on public.work_coin_accounts;
create policy coin_account_read_own on public.work_coin_accounts for select to authenticated using(user_id=auth.uid());
drop policy if exists coin_tx_read_own on public.work_coin_transactions;
create policy coin_tx_read_own on public.work_coin_transactions for select to authenticated using(user_id=auth.uid());
drop policy if exists reward_inventory_read_own on public.user_reward_inventory;
create policy reward_inventory_read_own on public.user_reward_inventory for select to authenticated using(user_id=auth.uid());
drop policy if exists reward_catalog_read on public.reward_catalog;
create policy reward_catalog_read on public.reward_catalog for select to authenticated using(true);

create or replace function public._economy_ensure_account(p_uid uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.work_coin_accounts(user_id) values(p_uid) on conflict(user_id) do nothing;
end; $$;
revoke all on function public._economy_ensure_account(uuid) from public, anon, authenticated;

create or replace function public.get_my_economy()
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_account public.work_coin_accounts%rowtype; v_items jsonb;
begin
  if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  perform public._economy_ensure_account(v_uid);
  select * into v_account from public.work_coin_accounts where user_id=v_uid;
  select coalesce(jsonb_agg(jsonb_build_object('type',reward_type,'id',reward_id)),'[]'::jsonb) into v_items from public.user_reward_inventory where user_id=v_uid;
  return jsonb_build_object('balance',v_account.balance,'lifetimeEarned',v_account.lifetime_earned,'lifetimeSpent',v_account.lifetime_spent,'legacyImported',v_account.legacy_imported_at is not null,'items',v_items);
end; $$;
revoke all on function public.get_my_economy() from public, anon;
grant execute on function public.get_my_economy() to authenticated;

-- One-time compatibility import for users that existed before V8.5.0.1.
-- The server permanently closes this import after the first successful call.
create or replace function public.import_legacy_economy(p_balance bigint, p_lifetime_earned bigint, p_lifetime_spent bigint, p_items jsonb default '[]'::jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_now timestamptz:=now(); x jsonb; v_balance bigint; v_earned bigint; v_spent bigint;
begin
  if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  perform public._economy_ensure_account(v_uid);
  if exists(select 1 from public.work_coin_accounts where user_id=v_uid and legacy_imported_at is not null) then return public.get_my_economy(); end if;
  v_balance:=greatest(0,least(coalesce(p_balance,0),1000000));
  v_earned:=greatest(v_balance,least(greatest(0,coalesce(p_lifetime_earned,0)),5000000));
  v_spent:=greatest(0,least(coalesce(p_lifetime_spent,0),5000000));
  update public.work_coin_accounts set balance=v_balance,lifetime_earned=v_earned,lifetime_spent=v_spent,legacy_imported_at=v_now,updated_at=v_now where user_id=v_uid;
  insert into public.work_coin_transactions(user_id,source_key,amount,kind,label,metadata) values(v_uid,'migration:v8501',v_balance,'migration','V8.5.0.1 legacy balance import',jsonb_build_object('earned',v_earned,'spent',v_spent)) on conflict do nothing;
  if jsonb_typeof(coalesce(p_items,'[]'::jsonb))='array' then
    for x in select value from jsonb_array_elements(p_items) loop
      if exists(select 1 from public.reward_catalog c where c.reward_type=x->>'type' and c.reward_id=x->>'id') then
        insert into public.user_reward_inventory(user_id,reward_type,reward_id,source_key) values(v_uid,x->>'type',x->>'id','migration:v8501') on conflict do nothing;
      end if;
    end loop;
  end if;
  return public.get_my_economy();
end; $$;
revoke all on function public.import_legacy_economy(bigint,bigint,bigint,jsonb) from public, anon;
grant execute on function public.import_legacy_economy(bigint,bigint,bigint,jsonb) to authenticated;

create or replace function public.purchase_reward_secure(p_reward_type text,p_reward_id text,p_source text default 'shop',p_discount_pct integer default 0)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_item public.reward_catalog%rowtype; v_account public.work_coin_accounts%rowtype; v_price bigint; v_discount int; v_key text;
begin
 if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
 select * into v_item from public.reward_catalog where reward_type=p_reward_type and reward_id=p_reward_id and active=true;
 if not found or v_item.price<=0 or v_item.code_exclusive then raise exception 'REWARD_NOT_PURCHASABLE'; end if;
 if exists(select 1 from public.user_reward_inventory where user_id=v_uid and reward_type=p_reward_type and reward_id=p_reward_id) then return public.get_my_economy(); end if;
 v_discount:=case when p_source in ('daily','weekly') then greatest(0,least(coalesce(p_discount_pct,0),50)) else 0 end;
 v_price:=greatest(1,round(v_item.price*(100-v_discount)/100.0));
 perform public._economy_ensure_account(v_uid);
 select * into v_account from public.work_coin_accounts where user_id=v_uid for update;
 if v_account.balance<v_price then raise exception 'INSUFFICIENT_COINS'; end if;
 v_key:='purchase:'||p_reward_type||':'||p_reward_id;
 update public.work_coin_accounts set balance=balance-v_price,lifetime_spent=lifetime_spent+v_price,updated_at=now() where user_id=v_uid;
 insert into public.work_coin_transactions(user_id,source_key,amount,kind,label,metadata) values(v_uid,v_key,-v_price,'purchase','Reward Shop purchase',jsonb_build_object('type',p_reward_type,'id',p_reward_id,'source',p_source,'discountPct',v_discount,'catalogPrice',v_item.price)) on conflict do nothing;
 insert into public.user_reward_inventory(user_id,reward_type,reward_id,source_key) values(v_uid,p_reward_type,p_reward_id,v_key) on conflict do nothing;
 return public.get_my_economy();
end; $$;
revoke all on function public.purchase_reward_secure(text,text,text,integer) from public, anon;
grant execute on function public.purchase_reward_secure(text,text,text,integer) to authenticated;

create or replace function public.owner_grant_secure(p_coins bigint default 0,p_items jsonb default '[]'::jsonb,p_label text default 'Owner Grant')
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_coins bigint; x jsonb; v_key text:='owner:'||gen_random_uuid()::text;
begin
 if v_uid is null or not public.is_workday_owner() then raise exception 'OWNER_REQUIRED'; end if;
 perform public._economy_ensure_account(v_uid); v_coins:=greatest(0,least(coalesce(p_coins,0),1000000));
 if v_coins>0 then update public.work_coin_accounts set balance=balance+v_coins,lifetime_earned=lifetime_earned+v_coins,updated_at=now() where user_id=v_uid; insert into public.work_coin_transactions(user_id,source_key,amount,kind,label) values(v_uid,v_key||':coins',v_coins,'owner',p_label); end if;
 if jsonb_typeof(coalesce(p_items,'[]'::jsonb))='array' then for x in select value from jsonb_array_elements(p_items) loop if exists(select 1 from public.reward_catalog c where c.reward_type=x->>'type' and c.reward_id=x->>'id') then insert into public.user_reward_inventory(user_id,reward_type,reward_id,source_key) values(v_uid,x->>'type',x->>'id',v_key) on conflict do nothing; end if; end loop; end if;
 return public.get_my_economy();
end; $$;
revoke all on function public.owner_grant_secure(bigint,jsonb,text) from public, anon;
grant execute on function public.owner_grant_secure(bigint,jsonb,text) to authenticated;

-- Replace Reward Code redemption: redemption + durable rewards are one DB transaction.
drop function if exists public.redeem_reward_code(text);
create or replace function public.redeem_reward_code(p_code text)
returns table(redemption_id uuid,code text,title text,reward jsonb,redeemed_at timestamptz,economy jsonb)
language plpgsql security definer set search_path=public as $$
declare v_uid uuid:=auth.uid(); v_code public.reward_codes%rowtype; v_user_uses integer; v_redemption public.reward_code_redemptions%rowtype; v_coins bigint; x jsonb; v_source text;
begin
 if v_uid is null then raise exception 'REWARD_CODE_LOGIN_REQUIRED'; end if;
 select rc.* into v_code from public.reward_codes rc where rc.code=upper(trim(coalesce(p_code,''))) for update;
 if not found then raise exception 'REWARD_CODE_NOT_FOUND'; end if;
 if not v_code.active then raise exception 'REWARD_CODE_INACTIVE'; end if;
 if v_code.expires_at is not null and now()>=v_code.expires_at then raise exception 'REWARD_CODE_EXPIRED'; end if;
 if v_code.max_uses is not null and v_code.total_uses>=v_code.max_uses then raise exception 'REWARD_CODE_MAX_USES'; end if;
 select count(*)::integer into v_user_uses from public.reward_code_redemptions r where r.code_id=v_code.id and r.user_id=v_uid;
 if v_user_uses>=v_code.per_user_limit then
   if v_code.per_user_limit=1 then raise exception 'REWARD_CODE_ALREADY_USED'; else raise exception 'REWARD_CODE_USER_LIMIT'; end if;
 end if;
 insert into public.reward_code_redemptions(code_id,user_id,user_email,code_snapshot,title_snapshot,reward_snapshot) values(v_code.id,v_uid,nullif(auth.jwt()->>'email',''),v_code.code,v_code.title,v_code.reward) returning * into v_redemption;
 update public.reward_codes set total_uses=total_uses+1,updated_at=now() where id=v_code.id;
 perform public._economy_ensure_account(v_uid); v_source:='reward-code:'||v_redemption.id::text; v_coins:=greatest(0,least(coalesce((v_code.reward->>'coins')::bigint,0),1000000));
 if v_coins>0 then update public.work_coin_accounts set balance=balance+v_coins,lifetime_earned=lifetime_earned+v_coins,updated_at=now() where user_id=v_uid; insert into public.work_coin_transactions(user_id,source_key,amount,kind,label,metadata) values(v_uid,v_source||':coins',v_coins,'reward_code','Reward Code · '||v_code.code,jsonb_build_object('codeId',v_code.id)); end if;
 if jsonb_typeof(coalesce(v_code.reward->'items','[]'::jsonb))='array' then for x in select value from jsonb_array_elements(v_code.reward->'items') loop if exists(select 1 from public.reward_catalog c where c.reward_type=x->>'type' and c.reward_id=x->>'id') then insert into public.user_reward_inventory(user_id,reward_type,reward_id,source_key) values(v_uid,x->>'type',x->>'id',v_source) on conflict do nothing; end if; end loop; end if;
 return query select v_redemption.id,v_redemption.code_snapshot,v_redemption.title_snapshot,v_redemption.reward_snapshot,v_redemption.redeemed_at,public.get_my_economy();
end; $$;
revoke all on function public.redeem_reward_code(text) from public, anon;
grant execute on function public.redeem_reward_code(text) to authenticated;
