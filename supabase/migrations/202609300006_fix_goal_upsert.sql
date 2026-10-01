-- `id` is an output column of this PL/pgSQL function.  Use the named primary
-- key constraint so the upsert doesn't collide with that output variable.
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
  ) on conflict on constraint goals_pkey do update set
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

revoke all on function public.upsert_family_goal(text, text, text, text, text, bigint, bigint, date) from public;
grant execute on function public.upsert_family_goal(text, text, text, text, text, bigint, bigint, date) to authenticated;
