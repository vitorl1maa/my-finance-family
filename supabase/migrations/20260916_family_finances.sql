create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  institution text,
  kind text not null check (kind in ('checking', 'savings', 'cash', 'credit')),
  opening_balance_cents bigint not null default 0,
  balance_cents bigint not null default 0,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  unique (family_id, name)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  account_id uuid not null references public.accounts(id),
  category_id uuid references public.categories(id),
  description text not null,
  amount_cents bigint not null check (amount_cents > 0),
  expense_date date not null default current_date,
  recurrence text not null default 'none' check (recurrence in ('none', 'weekly', 'monthly', 'yearly')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists accounts_family_id_idx on public.accounts (family_id);
create index if not exists expenses_family_date_idx on public.expenses (family_id, expense_date desc);
create index if not exists expenses_account_id_idx on public.expenses (account_id);

create or replace function public.is_family_member(target_family_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.family_members
    where family_id = target_family_id and user_id = auth.uid()
  );
$$;

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;

create policy "family members can read families" on public.families for select using (public.is_family_member(id));
create policy "members can read family members" on public.family_members for select using (public.is_family_member(family_id));
create policy "members can read accounts" on public.accounts for select using (public.is_family_member(family_id));
create policy "members can create accounts" on public.accounts for insert with check (public.is_family_member(family_id) and created_by = auth.uid());
create policy "members can update accounts" on public.accounts for update using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "members can read categories" on public.categories for select using (public.is_family_member(family_id));
create policy "members can create categories" on public.categories for insert with check (public.is_family_member(family_id) and created_by = auth.uid());
create policy "members can read expenses" on public.expenses for select using (public.is_family_member(family_id));
create policy "members can create expenses" on public.expenses for insert with check (public.is_family_member(family_id) and created_by = auth.uid());
create policy "members can update expenses" on public.expenses for update using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

create or replace function public.create_initial_family()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_family_id uuid;
begin
  insert into public.families (name, created_by)
  values ('Minha família', new.id)
  returning id into new_family_id;

  insert into public.family_members (family_id, user_id, role)
  values (new_family_id, new.id, 'owner');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_family on auth.users;
create trigger on_auth_user_created_family
  after insert on auth.users
  for each row execute procedure public.create_initial_family();
