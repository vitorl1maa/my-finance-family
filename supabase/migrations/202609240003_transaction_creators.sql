alter table public.transactions
  add column if not exists created_by uuid references auth.users(id);

update public.transactions transaction
set created_by = family.created_by
from public.families family
where transaction.family_id = family.id
  and transaction.created_by is null;

alter table public.transactions
  alter column created_by set default auth.uid();

create or replace function public.list_family_transactions()
returns table (
  id uuid,
  account_id uuid,
  family_id uuid,
  title text,
  category text,
  category_id uuid,
  amount_cents bigint,
  occurred_at timestamptz,
  created_at timestamptz,
  recurrence_rule text,
  created_by uuid,
  creator_name text,
  creator_avatar_url text,
  creator_avatar_seed text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    transaction.id,
    transaction.account_id,
    transaction.family_id,
    transaction.title,
    transaction.category,
    transaction.category_id,
    transaction.amount_cents,
    transaction.occurred_at,
    transaction.created_at,
    transaction.recurrence_rule,
    transaction.created_by,
    coalesce(
      nullif(user_account.raw_user_meta_data ->> 'full_name', ''),
      nullif(user_account.raw_user_meta_data ->> 'name', ''),
      nullif(split_part(coalesce(user_account.email, ''), '@', 1), ''),
      'Membro'
    ),
    user_account.raw_user_meta_data ->> 'avatar_url',
    user_account.raw_user_meta_data ->> 'avatar_seed'
  from public.transactions transaction
  left join auth.users user_account on user_account.id = transaction.created_by
  where transaction.family_id = public.current_family_id()
  order by transaction.created_at desc;
$$;

revoke all on function public.list_family_transactions() from public;
grant execute on function public.list_family_transactions() to authenticated;
