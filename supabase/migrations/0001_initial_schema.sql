-- =============================================================
-- ResumeForge — Initial Schema
-- supabase/migrations/0001_initial_schema.sql
--
-- Tables: resumes, plan_limits, ai_tailor_logs
-- Every table has RLS enabled. Users can only ever see their
-- own rows. The service role bypasses RLS as usual.
-- =============================================================

-- ── Helper: updated_at trigger ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- resumes
-- ─────────────────────────────────────────────────────────────

create table public.resumes (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid not null references auth.users(id) on delete cascade,
    title         text not null default 'Untitled Resume',
    resume_data   jsonb not null default '{}'::jsonb,
    theme_config  jsonb not null default '{}'::jsonb,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index resumes_user_id_idx on public.resumes (user_id, updated_at desc);

create trigger resumes_set_updated_at
    before update on public.resumes
    for each row execute function public.set_updated_at();

alter table public.resumes enable row level security;

create policy "resumes_select_own" on public.resumes
    for select using (auth.uid() = user_id);

create policy "resumes_insert_own" on public.resumes
    for insert with check (auth.uid() = user_id);

create policy "resumes_update_own" on public.resumes
    for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "resumes_delete_own" on public.resumes
    for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- plan_limits
-- ─────────────────────────────────────────────────────────────
-- One row per user. Tier and feature flags are written by the
-- Stripe webhook (or admin) using the service role. Users can
-- only read their own row.
-- ─────────────────────────────────────────────────────────────

create type public.subscription_tier as enum ('free', 'pro', 'team');

create table public.plan_limits (
    user_id        uuid primary key references auth.users(id) on delete cascade,
    tier           public.subscription_tier not null default 'free',
    ai_tailoring   boolean not null default false,
    ai_daily_limit integer not null default 0,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

create trigger plan_limits_set_updated_at
    before update on public.plan_limits
    for each row execute function public.set_updated_at();

alter table public.plan_limits enable row level security;

create policy "plan_limits_select_own" on public.plan_limits
    for select using (auth.uid() = user_id);

-- No insert/update/delete policies for end users. Only the
-- service role (Stripe webhook) writes here.

-- ── Default plan_limits row on signup ─────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.plan_limits (user_id, tier, ai_tailoring, ai_daily_limit)
    values (new.id, 'free', false, 0);
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- ai_tailor_logs
-- ─────────────────────────────────────────────────────────────
-- One row per AI tailoring call. Users can read their own logs
-- (for showing usage in UI) and insert their own (the route
-- handler runs with the user's session).
-- ─────────────────────────────────────────────────────────────

create table public.ai_tailor_logs (
    id           uuid primary key default gen_random_uuid(),
    user_id      uuid not null references auth.users(id) on delete cascade,
    match_score  integer,
    tier         public.subscription_tier not null,
    created_at   timestamptz not null default now()
);

create index ai_tailor_logs_user_day_idx
    on public.ai_tailor_logs (user_id, created_at desc);

alter table public.ai_tailor_logs enable row level security;

create policy "ai_tailor_logs_select_own" on public.ai_tailor_logs
    for select using (auth.uid() = user_id);

create policy "ai_tailor_logs_insert_own" on public.ai_tailor_logs
    for insert with check (auth.uid() = user_id);

-- No update/delete policies — logs are append-only.
