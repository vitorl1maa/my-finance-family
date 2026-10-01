create or replace function public.update_family_expense(
  expense_id uuid,
  expense_title text,
  expense_category_id uuid,
  expense_amount_cents bigint,
  expense_occurred_at timestamptz,
  expense_recurrence_rule text default 'none',
  expense_payment_method text default null
)
returns table (transaction_id uuid)
language plpgsql security invoker as $$
declare
  current_family_id uuid := public.current_family_id();
  old_amount bigint;
  old_payment_status text;
  new_amount bigint := -abs(expense_amount_cents);
  wallet_balance bigint;
  category_name text;
begin
  if current_family_id is null then raise exception 'family_not_found'; end if;
  if trim(expense_title) = '' or expense_amount_cents <= 0 then raise exception 'invalid_expense'; end if;
  if expense_recurrence_rule not in ('none', 'monthly', 'every-15-days') then raise exception 'invalid_recurrence_rule'; end if;
  if expense_payment_method not in ('credit_card', 'debit_card', 'pix', 'cash') then raise exception 'invalid_payment_method'; end if;

  select transaction.amount_cents, transaction.payment_status
  into old_amount, old_payment_status
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

  if old_payment_status = 'paid' then
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
  end if;

  update public.transactions
  set title = trim(expense_title),
      category = category_name,
      category_id = expense_category_id,
      amount_cents = new_amount,
      occurred_at = expense_occurred_at,
      recurrence_rule = expense_recurrence_rule,
      payment_method = expense_payment_method,
      updated_at = now()
  where id = expense_id and family_id = current_family_id;

  return query select expense_id;
end;
$$;

create or replace function public.delete_family_expense(expense_id uuid)
returns void
language plpgsql security invoker as $$
declare
  current_family_id uuid := public.current_family_id();
  old_amount bigint;
  old_payment_status text;
begin
  if current_family_id is null then raise exception 'family_not_found'; end if;

  select transaction.amount_cents, transaction.payment_status
  into old_amount, old_payment_status
  from public.transactions transaction
  where transaction.id = expense_id and transaction.family_id = current_family_id
  for update;
  if old_amount is null then return; end if;

  if old_payment_status = 'paid' then
    insert into public.wallet_settings (family_id)
    values (current_family_id)
    on conflict (family_id) do nothing;
    update public.wallet_settings
    set balance_cents = balance_cents + abs(old_amount), updated_at = now()
    where family_id = current_family_id;
  end if;

  delete from public.transactions where id = expense_id and family_id = current_family_id;
end;
$$;

grant execute on function public.update_family_expense(uuid, text, uuid, bigint, timestamptz, text, text) to authenticated;
grant execute on function public.delete_family_expense(uuid) to authenticated;
