create table if not exists public.goals (
  id text primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  product_url text,
  category text,
  priority text check (priority in ('Alta', 'Média', 'Baixa')),
  target_cents bigint not null check (target_cents > 0),
  saved_cents bigint not null default 0 check (saved_cents >= 0),
  due_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.income_sources (
  id text primary key,
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  kind text not null check (kind in ('salary', 'investment', 'other')),
  amount_cents bigint not null check (amount_cents > 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.piggy_bank_settings (
  family_id uuid primary key references public.families(id) on delete cascade,
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists goals_family_id_idx on public.goals (family_id, updated_at desc);
create index if not exists income_sources_family_id_idx on public.income_sources (family_id, updated_at desc);

alter table public.goals enable row level security;
alter table public.income_sources enable row level security;
alter table public.piggy_bank_settings enable row level security;

create policy "family members can read goals"
  on public.goals for select
  using (public.is_family_member(family_id));
create policy "family members can insert goals"
  on public.goals for insert
  with check (public.is_family_member(family_id));
create policy "family members can update goals"
  on public.goals for update
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy "family members can read income sources"
  on public.income_sources for select
  using (public.is_family_member(family_id));
create policy "family members can insert income sources"
  on public.income_sources for insert
  with check (public.is_family_member(family_id));
create policy "family members can update income sources"
  on public.income_sources for update
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create policy "family members can read piggy bank settings"
  on public.piggy_bank_settings for select
  using (public.is_family_member(family_id));
create policy "family members can insert piggy bank settings"
  on public.piggy_bank_settings for insert
  with check (public.is_family_member(family_id));
create policy "family members can update piggy bank settings"
  on public.piggy_bank_settings for update
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

create or replace function public.current_family_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select member.family_id
  from public.family_members member
  where member.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.list_family_goals()
returns table (
  id text,
  title text,
  product_url text,
  category text,
  priority text,
  target_cents bigint,
  saved_cents bigint,
  due_date date
)
language sql
stable
security invoker
set search_path = public
as $$
  select goal.id, goal.title, goal.product_url, goal.category, goal.priority,
    goal.target_cents, goal.saved_cents, goal.due_date
  from public.goals goal
  where goal.family_id = public.current_family_id()
  order by goal.updated_at desc;
$$;

create or replace function public.upsert_family_goal(
  client_id text,
  goal_title text,
  goal_product_url text,
  goal_category text,
  goal_priority text,
  goal_target_cents bigint,
  goal_saved_cents bigint,
  goal_due_date date
)
returns table (
  id text,
  title text,
  product_url text,
  category text,
  priority text,
  target_cents bigint,
  saved_cents bigint,
  due_date date
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_family uuid := public.current_family_id();
begin
  if current_family is null then raise exception 'family_not_found'; end if;
  if trim(client_id) = '' or trim(goal_title) = '' or goal_target_cents <= 0 or goal_saved_cents < 0 then
    raise exception 'invalid_goal';
  end if;
  if goal_priority is not null and goal_priority not in ('Alta', 'Média', 'Baixa') then
    raise exception 'invalid_goal_priority';
  end if;

  return query
  insert into public.goals as goal (
    id, family_id, title, product_url, category, priority, target_cents, saved_cents, due_date
  ) values (
    trim(client_id), current_family, trim(goal_title), nullif(trim(goal_product_url), ''),
    nullif(trim(goal_category), ''), goal_priority, goal_target_cents, goal_saved_cents, goal_due_date
  ) on conflict (id) do update set
    title = excluded.title,
    product_url = excluded.product_url,
    category = excluded.category,
    priority = excluded.priority,
    target_cents = excluded.target_cents,
    saved_cents = excluded.saved_cents,
    due_date = excluded.due_date,
    updated_at = now()
  where goal.family_id = current_family
  returning goal.id, goal.title, goal.product_url, goal.category, goal.priority,
    goal.target_cents, goal.saved_cents, goal.due_date;
end;
$$;

create or replace function public.list_family_income_sources()
returns table (id text, name text, kind text, amount_cents bigint, updated_at timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  select source.id, source.name, source.kind, source.amount_cents, source.updated_at
  from public.income_sources source
  where source.family_id = public.current_family_id()
  order by source.name;
$$;

create or replace function public.upsert_family_income_source(
  client_id text,
  source_name text,
  source_kind text,
  source_amount_cents bigint
)
returns table (id text, name text, kind text, amount_cents bigint, updated_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_family uuid := public.current_family_id();
begin
  if current_family is null then raise exception 'family_not_found'; end if;
  if trim(client_id) = '' or trim(source_name) = '' or source_amount_cents <= 0 then
    raise exception 'invalid_income_source';
  end if;
  if source_kind not in ('salary', 'investment', 'other') then
    raise exception 'invalid_income_source_kind';
  end if;

  return query
  insert into public.income_sources as source (id, family_id, name, kind, amount_cents)
  values (trim(client_id), current_family, trim(source_name), source_kind, source_amount_cents)
  on conflict (id) do update set
    name = excluded.name,
    kind = excluded.kind,
    amount_cents = excluded.amount_cents,
    updated_at = now()
  where source.family_id = current_family
  returning source.id, source.name, source.kind, source.amount_cents, source.updated_at;
end;
$$;

create or replace function public.get_family_piggy_bank_settings()
returns table (balance_cents bigint, updated_at timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  select settings.balance_cents, settings.updated_at
  from public.piggy_bank_settings settings
  where settings.family_id = public.current_family_id();
$$;

create or replace function public.upsert_family_piggy_bank_settings(next_balance_cents bigint)
returns table (balance_cents bigint, updated_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_family uuid := public.current_family_id();
begin
  if current_family is null then raise exception 'family_not_found'; end if;
  if next_balance_cents < 0 then raise exception 'invalid_piggy_bank_balance'; end if;

  return query
  insert into public.piggy_bank_settings as settings (family_id, balance_cents)
  values (current_family, next_balance_cents)
  on conflict (family_id) do update set
    balance_cents = excluded.balance_cents,
    updated_at = now()
  returning settings.balance_cents, settings.updated_at;
end;
$$;

revoke all on function public.current_family_id() from public;
revoke all on function public.list_family_goals() from public;
revoke all on function public.upsert_family_goal(text, text, text, text, text, bigint, bigint, date) from public;
revoke all on function public.list_family_income_sources() from public;
revoke all on function public.upsert_family_income_source(text, text, text, bigint) from public;
revoke all on function public.get_family_piggy_bank_settings() from public;
revoke all on function public.upsert_family_piggy_bank_settings(bigint) from public;

grant execute on function public.list_family_goals() to authenticated;
grant execute on function public.upsert_family_goal(text, text, text, text, text, bigint, bigint, date) to authenticated;
grant execute on function public.list_family_income_sources() to authenticated;
grant execute on function public.upsert_family_income_source(text, text, text, bigint) to authenticated;
grant execute on function public.get_family_piggy_bank_settings() to authenticated;
grant execute on function public.upsert_family_piggy_bank_settings(bigint) to authenticated;
grant execute on function public.current_family_id() to authenticated;
