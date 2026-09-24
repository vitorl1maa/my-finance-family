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
  previous_amount bigint := 0;
begin
  if current_family is null then raise exception 'family_not_found'; end if;
  if trim(client_id) = '' or trim(source_name) = '' or source_amount_cents <= 0 then
    raise exception 'invalid_income_source';
  end if;
  if source_kind not in ('salary', 'investment', 'other') then
    raise exception 'invalid_income_source_kind';
  end if;

  insert into public.wallet_settings (family_id)
  values (current_family)
  on conflict (family_id) do nothing;

  select source.amount_cents into previous_amount
  from public.income_sources source
  where source.id = trim(client_id) and source.family_id = current_family
  for update;

  insert into public.income_sources as source (id, family_id, name, kind, amount_cents)
  values (trim(client_id), current_family, trim(source_name), source_kind, source_amount_cents)
  on conflict (id) do update set
    name = excluded.name,
    kind = excluded.kind,
    amount_cents = excluded.amount_cents,
    updated_at = now()
  where source.family_id = current_family;

  update public.wallet_settings
  set balance_cents = balance_cents + source_amount_cents - previous_amount,
      updated_at = now()
  where family_id = current_family;

  return query
  select source.id, source.name, source.kind, source.amount_cents, source.updated_at
  from public.income_sources source
  where source.id = trim(client_id) and source.family_id = current_family;
end;
$$;

create or replace function public.delete_family_income_source(client_id text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_family uuid := public.current_family_id();
  source_amount bigint;
begin
  if current_family is null then raise exception 'family_not_found'; end if;

  select source.amount_cents into source_amount
  from public.income_sources source
  where source.id = trim(client_id) and source.family_id = current_family
  for update;

  if source_amount is null then return; end if;

  update public.wallet_settings
  set balance_cents = greatest(0, balance_cents - source_amount), updated_at = now()
  where family_id = current_family;

  delete from public.income_sources
  where id = trim(client_id) and family_id = current_family;
end;
$$;

drop function if exists public.create_expense(text, uuid, bigint, timestamptz, text);

create or replace function public.create_expense(
  expense_title text,
  expense_category_id uuid,
  expense_amount_cents bigint,
  expense_occurred_at timestamptz,
  expense_recurrence_rule text default 'none'
)
returns table (transaction_id uuid, family_id uuid, account_id uuid, category_id uuid)
language plpgsql security invoker
as $$
declare
  current_family_id uuid;
  default_account_id uuid;
  new_transaction_id uuid;
  current_wallet_balance bigint;
begin
  if trim(expense_title) = '' or expense_amount_cents <= 0 then
    raise exception 'invalid_expense';
  end if;
  if expense_recurrence_rule not in ('none', 'monthly', 'every-15-days') then
    raise exception 'invalid_recurrence_rule';
  end if;

  select member.family_id into current_family_id
  from public.family_members member
  where member.user_id = auth.uid()
  limit 1;
  if current_family_id is null then raise exception 'family_not_found'; end if;

  select account.id into default_account_id
  from public.accounts account
  where account.family_id = current_family_id and account.is_default = true
  limit 1;
  if default_account_id is null then raise exception 'default_account_not_found'; end if;

  if not exists (
    select 1 from public.categories category
    where category.id = expense_category_id
      and category.family_id = current_family_id
      and category.is_active = true
  ) then raise exception 'category_not_found'; end if;

  insert into public.wallet_settings (family_id)
  values (current_family_id)
  on conflict (family_id) do nothing;
  select wallet.balance_cents into current_wallet_balance
  from public.wallet_settings wallet
  where wallet.family_id = current_family_id
  for update;
  if current_wallet_balance < expense_amount_cents then
    raise exception 'insufficient_wallet_balance';
  end if;

  update public.wallet_settings
  set balance_cents = current_wallet_balance - expense_amount_cents, updated_at = now()
  where family_id = current_family_id;

  insert into public.transactions (family_id, account_id, title, category, category_id, amount_cents, occurred_at, recurrence_rule)
  select current_family_id, default_account_id, trim(expense_title), category.name, expense_category_id,
    -abs(expense_amount_cents), expense_occurred_at, expense_recurrence_rule
  from public.categories category
  where category.id = expense_category_id
  returning id into new_transaction_id;

  return query select new_transaction_id, current_family_id, default_account_id, expense_category_id;
end;
$$;

create or replace function public.update_family_expense(
  expense_id uuid,
  expense_title text,
  expense_category_id uuid,
  expense_amount_cents bigint,
  expense_occurred_at timestamptz,
  expense_recurrence_rule text default 'none'
)
returns table (transaction_id uuid)
language plpgsql security invoker
as $$
declare
  current_family_id uuid := public.current_family_id();
  old_amount bigint;
  new_amount bigint := -abs(expense_amount_cents);
  wallet_balance bigint;
  category_name text;
begin
  if current_family_id is null then raise exception 'family_not_found'; end if;
  if trim(expense_title) = '' or expense_amount_cents <= 0 then raise exception 'invalid_expense'; end if;
  if expense_recurrence_rule not in ('none', 'monthly', 'every-15-days') then raise exception 'invalid_recurrence_rule'; end if;

  select transaction.amount_cents into old_amount
  from public.transactions transaction
  where transaction.id = expense_id and transaction.family_id = current_family_id
  for update;
  if old_amount is null or old_amount >= 0 then raise exception 'expense_not_found'; end if;

  select category.name into category_name
  from public.categories category
  where category.id = expense_category_id
    and category.family_id = current_family_id
    and category.is_active = true;
  if category_name is null then raise exception 'category_not_found'; end if;

  insert into public.wallet_settings (family_id)
  values (current_family_id)
  on conflict (family_id) do nothing;
  select wallet.balance_cents into wallet_balance
  from public.wallet_settings wallet
  where wallet.family_id = current_family_id
  for update;
  if wallet_balance + new_amount - old_amount < 0 then raise exception 'insufficient_wallet_balance'; end if;

  update public.wallet_settings
  set balance_cents = wallet_balance + new_amount - old_amount, updated_at = now()
  where family_id = current_family_id;
  update public.transactions
  set title = trim(expense_title), category = category_name, category_id = expense_category_id,
      amount_cents = new_amount, occurred_at = expense_occurred_at,
      recurrence_rule = expense_recurrence_rule, updated_at = now()
  where id = expense_id and family_id = current_family_id;

  return query select expense_id;
end;
$$;

create or replace function public.delete_family_expense(expense_id uuid)
returns void
language plpgsql security invoker
as $$
declare
  current_family_id uuid := public.current_family_id();
  old_amount bigint;
begin
  if current_family_id is null then raise exception 'family_not_found'; end if;

  select transaction.amount_cents into old_amount
  from public.transactions transaction
  where transaction.id = expense_id and transaction.family_id = current_family_id
  for update;
  if old_amount is null then return; end if;

  insert into public.wallet_settings (family_id)
  values (current_family_id)
  on conflict (family_id) do nothing;
  update public.wallet_settings
  set balance_cents = balance_cents + abs(old_amount), updated_at = now()
  where family_id = current_family_id;
  delete from public.transactions where id = expense_id and family_id = current_family_id;
end;
$$;

revoke all on function public.delete_family_income_source(text) from public;
revoke all on function public.update_family_expense(uuid, text, uuid, bigint, timestamptz, text) from public;
revoke all on function public.delete_family_expense(uuid) from public;
grant execute on function public.delete_family_income_source(text) to authenticated;
grant execute on function public.update_family_expense(uuid, text, uuid, bigint, timestamptz, text) to authenticated;
grant execute on function public.delete_family_expense(uuid) to authenticated;
