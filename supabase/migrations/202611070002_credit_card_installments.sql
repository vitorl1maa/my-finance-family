alter table public.transactions
  add column if not exists purchase_date timestamptz,
  add column if not exists installment_count integer;

alter table public.transactions
  drop constraint if exists transactions_installment_count_check;
alter table public.transactions
  add constraint transactions_installment_count_check
  check (installment_count is null or installment_count > 0);

drop function if exists public.create_expense(text, uuid, bigint, timestamptz, text, text);
create function public.create_expense(
  expense_title text,
  expense_category_id uuid,
  expense_amount_cents bigint,
  expense_occurred_at timestamptz,
  expense_recurrence_rule text default 'none',
  expense_payment_method text default null,
  expense_purchase_date timestamptz default null,
  expense_installment_count integer default null
)
returns table (transaction_id uuid, family_id uuid, account_id uuid, category_id uuid)
language plpgsql security invoker set search_path = public as $$
declare current_family_id uuid; default_account_id uuid; new_transaction_id uuid;
begin
  if trim(expense_title) = '' or expense_amount_cents <= 0 then raise exception 'invalid_expense'; end if;
  if expense_recurrence_rule not in ('none', 'monthly', 'every-15-days') then raise exception 'invalid_recurrence_rule'; end if;
  if expense_payment_method not in ('credit_card', 'debit_card', 'pix', 'cash') then raise exception 'invalid_payment_method'; end if;
  if expense_payment_method = 'credit_card' and (expense_purchase_date is null or coalesce(expense_installment_count, 0) < 1) then raise exception 'invalid_credit_card_installment'; end if;
  select member.family_id into current_family_id from public.family_members member where member.user_id = auth.uid() limit 1;
  select account.id into default_account_id from public.accounts account where account.family_id = current_family_id and account.is_default = true limit 1;
  if current_family_id is null or default_account_id is null then raise exception 'family_not_found'; end if;
  insert into public.transactions (family_id, account_id, title, category, category_id, amount_cents, occurred_at, recurrence_rule, payment_method, payment_status, purchase_date, installment_count)
  select current_family_id, default_account_id, trim(expense_title), category.name, expense_category_id, -abs(expense_amount_cents), expense_occurred_at, expense_recurrence_rule, expense_payment_method, 'pending', expense_purchase_date, expense_installment_count from public.categories category where category.id = expense_category_id returning id into new_transaction_id;
  return query select new_transaction_id, current_family_id, default_account_id, expense_category_id;
end;
$$;

drop function if exists public.list_family_transactions();
create function public.list_family_transactions()
returns table (id uuid, account_id uuid, family_id uuid, title text, category text, category_id uuid, amount_cents bigint, occurred_at timestamptz, created_at timestamptz, recurrence_rule text, payment_method text, purchase_date timestamptz, installment_count integer, payment_status text, paid_at timestamptz, created_by uuid, creator_name text, creator_avatar_url text, creator_avatar_seed text)
language sql stable security definer set search_path = public, auth as $$
  select t.id, t.account_id, t.family_id, t.title, t.category, t.category_id, t.amount_cents, t.occurred_at, t.created_at, t.recurrence_rule, t.payment_method, t.purchase_date, t.installment_count, t.payment_status, t.paid_at, t.created_by,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), nullif(u.raw_user_meta_data ->> 'name', ''), nullif(split_part(coalesce(u.email, ''), '@', 1), ''), 'Membro'), u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'avatar_seed'
  from public.transactions t left join auth.users u on u.id = t.created_by where t.family_id = public.current_family_id() order by t.created_at desc;
$$;

create or replace function public.mark_family_expense_paid(expense_id uuid)
returns table (transaction_id uuid)
language plpgsql security invoker as $$
declare current_family_id uuid := public.current_family_id(); expense_amount bigint; wallet_balance bigint;
begin
  if current_family_id is null then raise exception 'family_not_found'; end if;
  select amount_cents into expense_amount from public.transactions where id = expense_id and family_id = current_family_id for update;
  if expense_amount is null then raise exception 'expense_not_found'; end if;
  insert into public.wallet_settings (family_id) values (current_family_id) on conflict (family_id) do nothing;
  select balance_cents into wallet_balance from public.wallet_settings where family_id = current_family_id for update;
  if coalesce(wallet_balance, 0) < abs(expense_amount) then raise exception 'insufficient_wallet_balance'; end if;
  update public.wallet_settings set balance_cents = wallet_balance - abs(expense_amount), updated_at = now() where family_id = current_family_id;
  update public.transactions set payment_status = 'paid', paid_at = now(), updated_at = now() where id = expense_id and family_id = current_family_id;
  return query select expense_id;
end;
$$;

grant execute on function public.create_expense(text, uuid, bigint, timestamptz, text, text, timestamptz, integer) to authenticated;
grant execute on function public.list_family_transactions() to authenticated;

drop function if exists public.update_family_expense(uuid, text, uuid, bigint, timestamptz, text, text);
create function public.update_family_expense(expense_id uuid, expense_title text, expense_category_id uuid, expense_amount_cents bigint, expense_occurred_at timestamptz, expense_recurrence_rule text default 'none', expense_payment_method text default null, expense_purchase_date timestamptz default null, expense_installment_count integer default null)
returns table (transaction_id uuid)
language plpgsql security invoker set search_path = public as $$
declare current_family_id uuid := public.current_family_id(); category_name text;
begin
  if current_family_id is null or trim(expense_title) = '' or expense_amount_cents <= 0 then raise exception 'invalid_expense'; end if;
  select name into category_name from public.categories where id = expense_category_id and family_id = current_family_id and is_active = true;
  if category_name is null then raise exception 'category_not_found'; end if;
  update public.transactions set title = trim(expense_title), category = category_name, category_id = expense_category_id, amount_cents = -abs(expense_amount_cents), occurred_at = expense_occurred_at, recurrence_rule = expense_recurrence_rule, payment_method = expense_payment_method, purchase_date = expense_purchase_date, installment_count = expense_installment_count, updated_at = now() where id = expense_id and family_id = current_family_id;
  if not found then raise exception 'expense_not_found'; end if;
  return query select expense_id;
end;
$$;
grant execute on function public.update_family_expense(uuid, text, uuid, bigint, timestamptz, text, text, timestamptz, integer) to authenticated;
