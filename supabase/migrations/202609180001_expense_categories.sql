create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  slug text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint categories_family_slug_unique unique (family_id, slug),
  constraint categories_name_not_blank check (length(trim(name)) > 0)
);

alter table public.accounts add column if not exists is_default boolean not null default false;
alter table public.transactions add column if not exists family_id uuid references public.families(id);
alter table public.transactions add column if not exists category_id uuid references public.categories(id);
alter table public.transactions add column if not exists recurrence_rule text not null default 'none';

create unique index if not exists accounts_one_default_per_family
  on public.accounts (family_id)
  where is_default = true;

create or replace function public.seed_family_categories(target_family_id uuid)
returns void
language sql security definer
set search_path = public
as $$
  insert into public.categories (family_id, name, slug)
  values
    (target_family_id, 'Moradia', 'moradia'),
    (target_family_id, 'Alimentação', 'alimentacao'),
    (target_family_id, 'Saúde', 'saude'),
    (target_family_id, 'Lazer', 'lazer')
  on conflict (family_id, slug) do nothing;
$$;

do $$
declare
  family_record record;
begin
  for family_record in select id from public.families loop
    perform public.seed_family_categories(family_record.id);
  end loop;
end;
$$;

create or replace function public.seed_new_family_categories()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  perform public.seed_family_categories(new.id);
  return new;
end;
$$;

drop trigger if exists seed_categories_after_family_insert on public.families;
create trigger seed_categories_after_family_insert
after insert on public.families
for each row execute function public.seed_new_family_categories();

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "family members can read categories" on public.categories;
create policy "family members can read categories"
  on public.categories for select
  using (exists (
    select 1 from public.family_members member
    where member.family_id = categories.family_id
      and member.user_id = auth.uid()
  ));

drop policy if exists "family members can read transactions" on public.transactions;
create policy "family members can read transactions"
  on public.transactions for select
  using (exists (
    select 1 from public.family_members member
    where member.family_id = transactions.family_id
      and member.user_id = auth.uid()
  ));

drop policy if exists "family members can insert transactions" on public.transactions;
create policy "family members can insert transactions"
  on public.transactions for insert
  with check (exists (
    select 1 from public.family_members member
    where member.family_id = transactions.family_id
      and member.user_id = auth.uid()
  ));

create or replace function public.list_family_categories()
returns table (id uuid, family_id uuid, name text, slug text, is_active boolean)
language sql stable security invoker
as $$
  select category.id, category.family_id, category.name, category.slug, category.is_active
  from public.categories category
  join public.family_members member on member.family_id = category.family_id
  where member.user_id = auth.uid()
    and category.is_active = true
  order by case category.slug
    when 'moradia' then 1
    when 'alimentacao' then 2
    when 'saude' then 3
    when 'lazer' then 4
    else 5
  end, category.name;
$$;

drop function if exists public.create_expense(text, uuid, bigint, timestamptz);

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

  if current_family_id is null then
    raise exception 'family_not_found';
  end if;

  select account.id into default_account_id
  from public.accounts account
  where account.family_id = current_family_id
    and account.is_default = true
  limit 1;

  if default_account_id is null then
    raise exception 'default_account_not_found';
  end if;

  if not exists (
    select 1 from public.categories category
    where category.id = expense_category_id
      and category.family_id = current_family_id
      and category.is_active = true
  ) then
    raise exception 'category_not_found';
  end if;

  insert into public.transactions (family_id, account_id, title, category, category_id, amount_cents, occurred_at, recurrence_rule)
  select current_family_id, default_account_id, trim(expense_title), category.name, expense_category_id, -abs(expense_amount_cents), expense_occurred_at, expense_recurrence_rule
  from public.categories category
  where category.id = expense_category_id
  returning id into new_transaction_id;

  return query select new_transaction_id, current_family_id, default_account_id, expense_category_id;
end;
$$;
