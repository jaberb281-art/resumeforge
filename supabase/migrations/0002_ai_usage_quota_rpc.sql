-- =============================================================
-- ResumeForge - Atomic AI usage quota reservations
--
-- Reservations prevent concurrent AI requests from all seeing the
-- same pre-call usage count. Successful calls are completed; failed
-- calls are released by the route handler. Very old incomplete rows
-- are ignored by the limiter as stale reservations.
-- =============================================================

alter table public.ai_tailor_logs
    add column if not exists feature text not null default 'tailor',
    add column if not exists completed_at timestamptz;

alter table public.ai_tailor_logs
    drop constraint if exists ai_tailor_logs_feature_check;

alter table public.ai_tailor_logs
    add constraint ai_tailor_logs_feature_check
    check (feature in ('tailor', 'cover_letter'));

update public.ai_tailor_logs
set completed_at = created_at
where completed_at is null;

create index if not exists ai_tailor_logs_quota_idx
    on public.ai_tailor_logs (user_id, created_at desc, completed_at);

create or replace function public.reserve_ai_usage(p_feature text)
returns table (
    allowed boolean,
    reason text,
    log_id uuid,
    daily_limit integer,
    used_today integer,
    remaining integer,
    tier public.subscription_tier
)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_limits public.plan_limits%rowtype;
    v_used integer := 0;
    v_log_id uuid;
    v_day_start timestamptz := date_trunc('day', now());
    v_day_end timestamptz := date_trunc('day', now()) + interval '1 day';
begin
    if v_user_id is null then
        return query select false, 'unauthorized', null::uuid, 0, 0, 0, null::public.subscription_tier;
        return;
    end if;

    if p_feature not in ('tailor', 'cover_letter') then
        return query select false, 'invalid_feature', null::uuid, 0, 0, 0, null::public.subscription_tier;
        return;
    end if;

    select *
    into v_limits
    from public.plan_limits
    where user_id = v_user_id
    for update;

    if not found or not v_limits.ai_tailoring then
        return query select false, 'feature_disabled', null::uuid, coalesce(v_limits.ai_daily_limit, 0), 0, 0, v_limits.tier;
        return;
    end if;

    select count(*)::integer
    into v_used
    from public.ai_tailor_logs
    where user_id = v_user_id
      and created_at >= v_day_start
      and created_at < v_day_end
      and (
          completed_at is not null
          or created_at >= now() - interval '10 minutes'
      );

    if v_limits.ai_daily_limit > 0 and v_used >= v_limits.ai_daily_limit then
        return query select false, 'quota_exceeded', null::uuid, v_limits.ai_daily_limit, v_used, 0, v_limits.tier;
        return;
    end if;

    insert into public.ai_tailor_logs (user_id, tier, feature)
    values (v_user_id, v_limits.tier, p_feature)
    returning id into v_log_id;

    return query select
        true,
        'reserved',
        v_log_id,
        v_limits.ai_daily_limit,
        v_used + 1,
        case
            when v_limits.ai_daily_limit > 0 then greatest(v_limits.ai_daily_limit - v_used - 1, 0)
            else null::integer
        end,
        v_limits.tier;
end;
$$;

create or replace function public.complete_ai_usage(p_log_id uuid, p_match_score integer default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_updated integer;
begin
    if v_user_id is null then
        return false;
    end if;

    update public.ai_tailor_logs
    set
        match_score = p_match_score,
        completed_at = now()
    where id = p_log_id
      and user_id = v_user_id
      and completed_at is null;

    get diagnostics v_updated = row_count;
    return v_updated = 1;
end;
$$;

create or replace function public.release_ai_usage_reservation(p_log_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid := auth.uid();
    v_deleted integer;
begin
    if v_user_id is null then
        return false;
    end if;

    delete from public.ai_tailor_logs
    where id = p_log_id
      and user_id = v_user_id
      and completed_at is null;

    get diagnostics v_deleted = row_count;
    return v_deleted = 1;
end;
$$;

revoke all on function public.reserve_ai_usage(text) from public;
revoke all on function public.complete_ai_usage(uuid, integer) from public;
revoke all on function public.release_ai_usage_reservation(uuid) from public;

grant execute on function public.reserve_ai_usage(text) to authenticated;
grant execute on function public.complete_ai_usage(uuid, integer) to authenticated;
grant execute on function public.release_ai_usage_reservation(uuid) to authenticated;
