alter table public.transactions
  add column if not exists payment_method text;

alter table public.transactions
  drop constraint if exists transactions_payment_method_check;

alter table public.transactions
  add constraint transactions_payment_method_check
  check (payment_method is null or payment_method in ('credit_card', 'debit_card', 'pix', 'cash'));

drop function if exists public.create_expense(text, uuid, bigint, timestamptz, text);

create function public.create_expense(
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
  insert into public.wallet_settings (family_id) values (current_family_id) on conflict (family_id) do nothing;
  select wallet.balance_cents into current_wallet_balance from public.wallet_settings wallet where wallet.family_id = current_family_id for update;
  if current_wallet_balance < expense_amount_cents then raise exception 'insufficient_wallet_balance'; end if;
  update public.wallet_settings set balance_cents = current_wallet_balance - expense_amount_cents, updated_at = now() where family_id = current_family_id;
  insert into public.transactions (family_id, account_id, title, category, category_id, amount_cents, occurred_at, recurrence_rule, payment_method)
  select current_family_id, default_account_id, trim(expense_title), category.name, expense_category_id, -abs(expense_amount_cents), expense_occurred_at, expense_recurrence_rule, expense_payment_method from public.categories category where category.id = expense_category_id
  returning id into new_transaction_id;
  return query select new_transaction_id, current_family_id, default_account_id, expense_category_id;
end;
$$;

drop function if exists public.update_family_expense(uuid, text, uuid, bigint, timestamptz, text);

create function public.update_family_expense(
  expense_id uuid, expense_title text, expense_category_id uuid, expense_amount_cents bigint,
  expense_occurred_at timestamptz, expense_recurrence_rule text default 'none', expense_payment_method text default null
)
returns table (transaction_id uuid)
language plpgsql security invoker
as $$
declare
  current_family_id uuid := public.current_family_id(); old_amount bigint; new_amount bigint := -abs(expense_amount_cents); wallet_balance bigint; category_name text;
begin
  if current_family_id is null then raise exception 'family_not_found'; end if;
  if trim(expense_title) = '' or expense_amount_cents <= 0 then raise exception 'invalid_expense'; end if;
  if expense_recurrence_rule not in ('none', 'monthly', 'every-15-days') then raise exception 'invalid_recurrence_rule'; end if;
  if expense_payment_method not in ('credit_card', 'debit_card', 'pix', 'cash') then raise exception 'invalid_payment_method'; end if;
  select transaction.amount_cents into old_amount from public.transactions transaction where transaction.id = expense_id and transaction.family_id = current_family_id for update;
  if old_amount is null or old_amount >= 0 then raise exception 'expense_not_found'; end if;
  select category.name into category_name from public.categories category where category.id = expense_category_id and category.family_id = current_family_id and category.is_active = true;
  if category_name is null then raise exception 'category_not_found'; end if;
  insert into public.wallet_settings (family_id) values (current_family_id) on conflict (family_id) do nothing;
  select wallet.balance_cents into wallet_balance from public.wallet_settings wallet where wallet.family_id = current_family_id for update;
  if wallet_balance + new_amount - old_amount < 0 then raise exception 'insufficient_wallet_balance'; end if;
  update public.wallet_settings set balance_cents = wallet_balance + new_amount - old_amount, updated_at = now() where family_id = current_family_id;
  update public.transactions set title = trim(expense_title), category = category_name, category_id = expense_category_id, amount_cents = new_amount, occurred_at = expense_occurred_at, recurrence_rule = expense_recurrence_rule, payment_method = expense_payment_method, updated_at = now() where id = expense_id and family_id = current_family_id;
  return query select expense_id;
end;
$$;

drop function if exists public.list_family_transactions();

create function public.list_family_transactions()
returns table (id uuid, account_id uuid, family_id uuid, title text, category text, category_id uuid, amount_cents bigint, occurred_at timestamptz, created_at timestamptz, recurrence_rule text, payment_method text, created_by uuid, creator_name text, creator_avatar_url text, creator_avatar_seed text)
language sql stable security definer set search_path = public, auth
as $$
  select transaction.id, transaction.account_id, transaction.family_id, transaction.title, transaction.category, transaction.category_id, transaction.amount_cents, transaction.occurred_at, transaction.created_at, transaction.recurrence_rule, transaction.payment_method, transaction.created_by,
    coalesce(nullif(user_account.raw_user_meta_data ->> 'full_name', ''), nullif(user_account.raw_user_meta_data ->> 'name', ''), nullif(split_part(coalesce(user_account.email, ''), '@', 1), ''), 'Membro'), user_account.raw_user_meta_data ->> 'avatar_url', user_account.raw_user_meta_data ->> 'avatar_seed'
  from public.transactions transaction left join auth.users user_account on user_account.id = transaction.created_by
  where transaction.family_id = public.current_family_id() order by transaction.created_at desc;
$$;

grant execute on function public.create_expense(text, uuid, bigint, timestamptz, text, text) to authenticated;
grant execute on function public.update_family_expense(uuid, text, uuid, bigint, timestamptz, text, text) to authenticated;
grant execute on function public.list_family_transactions() to authenticated;
