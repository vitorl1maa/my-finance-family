-- Output columns of create_expense include family_id, which makes
-- `on conflict (family_id)` ambiguous inside PL/pgSQL.
create or replace function public.create_expense(
  expense_title text,
  expense_category_id uuid,
  expense_amount_cents bigint,
  expense_occurred_at timestamptz,
  expense_recurrence_rule text default 'none',
  expense_payment_method text default null
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
  if trim(expense_title) = '' or expense_amount_cents <= 0 then raise exception 'invalid_expense'; end if;
  if expense_recurrence_rule not in ('none', 'monthly', 'every-15-days') then raise exception 'invalid_recurrence_rule'; end if;
  if expense_payment_method not in ('credit_card', 'debit_card', 'pix', 'cash') then raise exception 'invalid_payment_method'; end if;
  select member.family_id into current_family_id from public.family_members member where member.user_id = auth.uid() limit 1;
  if current_family_id is null then raise exception 'family_not_found'; end if;
  select account.id into default_account_id from public.accounts account where account.family_id = current_family_id and account.is_default = true limit 1;
  if default_account_id is null then raise exception 'default_account_not_found'; end if;
  if not exists (select 1 from public.categories category where category.id = expense_category_id and category.family_id = current_family_id and category.is_active = true) then raise exception 'category_not_found'; end if;
  insert into public.wallet_settings (family_id) values (current_family_id) on conflict on constraint wallet_settings_pkey do nothing;
  select wallet.balance_cents into current_wallet_balance from public.wallet_settings wallet where wallet.family_id = current_family_id for update;
  current_wallet_balance := coalesce(current_wallet_balance, 0);
  if current_wallet_balance < expense_amount_cents then raise exception 'insufficient_wallet_balance'; end if;
  update public.wallet_settings as wallet set balance_cents = current_wallet_balance - expense_amount_cents, updated_at = now() where wallet.family_id = current_family_id;
  insert into public.transactions (family_id, account_id, title, category, category_id, amount_cents, occurred_at, recurrence_rule, payment_method)
  select current_family_id, default_account_id, trim(expense_title), category.name, expense_category_id, -abs(expense_amount_cents), expense_occurred_at, expense_recurrence_rule, expense_payment_method from public.categories category where category.id = expense_category_id
  returning id into new_transaction_id;
  return query select new_transaction_id, current_family_id, default_account_id, expense_category_id;
end;
$$;

grant execute on function public.create_expense(text, uuid, bigint, timestamptz, text, text) to authenticated;
