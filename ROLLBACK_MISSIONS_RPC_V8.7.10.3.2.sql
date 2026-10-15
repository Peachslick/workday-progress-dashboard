-- Optional rollback for V8.7.10.3.2 RPCs ONLY.
-- Restore original V8.7.10.3 mission thresholds (reflection 20 chars, focus 20 min).
-- Does not delete ANY user data, claims, or chests. Run only if reverting frontend too.
begin;
create or replace function public.get_my_unified_missions_secure()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_uid uuid := auth.uid();
 v_day date := (now() at time zone 'Asia/Bangkok')::date;
 v_week date; v_started timestamptz; v_reflected timestamptz;
 v_claims jsonb; v_count int; v_week_count int;
 v_daily boolean; v_weekly boolean;
begin
 if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
 v_week := v_day - (extract(isodow from v_day)::int - 1);
 select checked_in_at,reflected_at into v_started,v_reflected from public.work_daily_sessions
   where user_id=v_uid and day=v_day;
 select coalesce(jsonb_agg(mission_id),'[]'::jsonb),count(*) into v_claims,v_count
   from public.work_mission_claims where user_id=v_uid and day=v_day;
 select exists(select 1 from public.work_chest_inventory where user_id=v_uid
   and source_key='mission:daily:'||v_day::text) into v_daily;
 select exists(select 1 from public.work_chest_inventory where user_id=v_uid
   and source_key='mission:weekly:'||v_week::text) into v_weekly;
 select count(*) into v_week_count from public.work_chest_inventory
   where user_id=v_uid and source_type='mission' and kind='daily'
     and source_key like 'mission:daily:%'
     and substring(source_key from 15 for 10)::date between v_week and (v_week+6);
 return jsonb_build_object('day',v_day,'weekStart',v_week,'claimed',v_claims,
   'claimedCount',v_count,'checkedInAt',v_started,'hasReflection',v_reflected is not null,
   'focusMinutes',case when v_started is null then 0
      else greatest(0,floor(extract(epoch from (now()-v_started))/60)::int) end,
   'focusTargetMinutes',20,'dailyIssued',v_daily,'weeklyIssued',v_weekly,
   'weeklyDailyCount',v_week_count,'serverNow',now());
end; $$;
revoke all on function public.get_my_unified_missions_secure() from public,anon,authenticated;
grant execute on function public.get_my_unified_missions_secure() to authenticated;

create or replace function public.claim_unified_mission_secure(
 p_mission_id text, p_reflection text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
 v_uid uuid := auth.uid(); v_day date := (now() at time zone 'Asia/Bangkok')::date;
 v_week date; v_started timestamptz; v_count int; v_week_count int;
 v_coins int; v_added text[] := array[]::text[]; v_inserted int;
 v_old boolean := false;
begin
 if v_uid is null then raise exception 'LOGIN_REQUIRED'; end if;
 if p_mission_id not in ('checkin','reflection','focus') then raise exception 'INVALID_MISSION'; end if;
 perform public._economy_ensure_account(v_uid);
 -- Serialize claims from multiple tabs and simultaneous chest issues.
 perform 1 from public.work_coin_accounts where user_id=v_uid for update;
 v_week := v_day - (extract(isodow from v_day)::int - 1);
 insert into public.work_daily_sessions(user_id,day) values(v_uid,v_day)
   on conflict do nothing;
 if exists(select 1 from public.work_mission_claims
     where user_id=v_uid and day=v_day and mission_id=p_mission_id) then
   return jsonb_build_object('alreadyClaimed',true,'board',public.get_my_unified_missions_secure(),
     'economy',public.get_my_economy(),'addedChests',to_jsonb(v_added));
 end if;
 select checked_in_at into v_started from public.work_daily_sessions
   where user_id=v_uid and day=v_day for update;
 if p_mission_id='checkin' then
   update public.work_daily_sessions set checked_in_at=coalesce(checked_in_at,now())
   where user_id=v_uid and day=v_day;
   v_coins:=5;
 elsif p_mission_id='reflection' then
   if v_started is null then raise exception 'CHECKIN_FIRST'; end if;
   if char_length(btrim(coalesce(p_reflection,'')))<20 or char_length(coalesce(p_reflection,''))>500 then
     raise exception 'REFLECTION_LENGTH_20_TO_500'; end if;
   update public.work_daily_sessions set reflection=btrim(p_reflection),reflected_at=now()
   where user_id=v_uid and day=v_day;
   v_coins:=10;
 else
   if v_started is null or now() < v_started+interval '20 minutes' then raise exception 'FOCUS_NOT_READY'; end if;
   v_coins:=15;
 end if;
 insert into public.work_mission_claims(user_id,day,mission_id,coins)
   values(v_uid,v_day,p_mission_id,v_coins) on conflict do nothing;
 get diagnostics v_inserted = row_count;
 if v_inserted<>1 then raise exception 'ALREADY_CLAIMED'; end if;
 insert into public.work_coin_transactions(user_id,source_key,amount,kind,label,metadata)
   values(v_uid,'mission:v8610:'||v_day::text||':'||p_mission_id,v_coins,'mission',
     'Verified Daily Mission',jsonb_build_object('missionId',p_mission_id,'day',v_day));
 update public.work_coin_accounts set balance=balance+v_coins,
   lifetime_earned=lifetime_earned+v_coins,updated_at=now() where user_id=v_uid;

 select count(*) into v_count from public.work_mission_claims where user_id=v_uid and day=v_day;
 if v_count=3 then
   -- If the old secure mission chest was already opened, do not mint another copy.
   if pg_catalog.to_regclass('public.work_chest_claims') is not null then
     execute 'select exists(select 1 from public.work_chest_claims where user_id=$1 and kind=''daily'' and period_start=$2)'
       into v_old using v_uid,v_day;
   end if;
   if not v_old then
     insert into public.work_chest_inventory(user_id,kind,source_type,source_key)
       values(v_uid,'daily','mission','mission:daily:'||v_day::text)
       on conflict(user_id,source_key) do nothing;
     get diagnostics v_inserted = row_count;
     if v_inserted=1 then v_added:=array_append(v_added,'daily'); end if;
   end if;
 end if;
 select count(*) into v_week_count from public.work_chest_inventory
   where user_id=v_uid and source_type='mission' and kind='daily'
     and substring(source_key from 15 for 10)::date between v_week and (v_week+6);
 if v_week_count>=5 then
   v_old:=false;
   if pg_catalog.to_regclass('public.work_chest_claims') is not null then
     execute 'select exists(select 1 from public.work_chest_claims where user_id=$1 and kind=''weekly'' and period_start=$2)'
       into v_old using v_uid,v_week;
   end if;
   if not v_old then
     insert into public.work_chest_inventory(user_id,kind,source_type,source_key)
       values(v_uid,'weekly','mission','mission:weekly:'||v_week::text)
       on conflict(user_id,source_key) do nothing;
     get diagnostics v_inserted = row_count;
     if v_inserted=1 then v_added:=array_append(v_added,'weekly'); end if;
   end if;
 end if;
 return jsonb_build_object('alreadyClaimed',false,'coins',v_coins,
   'board',public.get_my_unified_missions_secure(),
   'economy',public.get_my_economy(),'addedChests',to_jsonb(v_added));
end; $$;
revoke all on function public.claim_unified_mission_secure(text,text) from public,anon,authenticated;
grant execute on function public.claim_unified_mission_secure(text,text) to authenticated;

commit;
