create table if not exists public.wallet_settings (
  family_id uuid primary key references public.families(id) on delete cascade,
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  updated_at timestamptz not null default now()
);

alter table public.wallet_settings enable row level security;

drop policy if exists "family members can read wallet settings" on public.wallet_settings;
drop policy if exists "family members can insert wallet settings" on public.wallet_settings;
drop policy if exists "family members can update wallet settings" on public.wallet_settings;

create policy "family members can read wallet settings"
  on public.wallet_settings for select
  using (public.is_family_member(family_id));

create policy "family members can insert wallet settings"
  on public.wallet_settings for insert
  with check (public.is_family_member(family_id));

create policy "family members can update wallet settings"
  on public.wallet_settings for update
  using (public.is_family_member(family_id))
  with check (public.is_family_member(family_id));

insert into public.wallet_settings (family_id, balance_cents)
select family.id,
  greatest(
    0,
    coalesce((
      select sum(source.amount_cents)
      from public.income_sources source
      where source.family_id = family.id
    ), 0) - coalesce((
      select sum(abs(expense.amount_cents))
      from public.transactions expense
      where expense.family_id = family.id
        and expense.amount_cents < 0
    ), 0)
  )
from public.families family
on conflict (family_id) do nothing;

create or replace function public.get_family_wallet_settings()
returns table (balance_cents bigint, updated_at timestamptz)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_family uuid := public.current_family_id();
begin
  if current_family is null then raise exception 'family_not_found'; end if;

  insert into public.wallet_settings (family_id)
  values (current_family)
  on conflict (family_id) do nothing;

  return query
  select wallet.balance_cents, wallet.updated_at
  from public.wallet_settings wallet
  where wallet.family_id = current_family;
end;
$$;

create or replace function public.transfer_family_wallet(
  transfer_direction text,
  transfer_amount_cents bigint
)
returns table (wallet_balance_cents bigint, piggy_bank_balance_cents bigint)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_family uuid := public.current_family_id();
  next_wallet bigint;
  next_piggy bigint;
begin
  if current_family is null then raise exception 'family_not_found'; end if;
  if transfer_amount_cents <= 0 then raise exception 'invalid_transfer_amount'; end if;
  if transfer_direction not in ('to_piggy_bank', 'from_piggy_bank') then
    raise exception 'invalid_transfer_direction';
  end if;

  insert into public.wallet_settings (family_id)
  values (current_family)
  on conflict (family_id) do nothing;
  insert into public.piggy_bank_settings (family_id)
  values (current_family)
  on conflict (family_id) do nothing;

  select wallet.balance_cents
  into next_wallet
  from public.wallet_settings wallet
  where wallet.family_id = current_family
  for update;

  select piggy.balance_cents
  into next_piggy
  from public.piggy_bank_settings piggy
  where piggy.family_id = current_family
  for update;

  if transfer_direction = 'to_piggy_bank' then
    next_wallet := next_wallet - transfer_amount_cents;
    next_piggy := next_piggy + transfer_amount_cents;
  else
    next_wallet := next_wallet + transfer_amount_cents;
    next_piggy := next_piggy - transfer_amount_cents;
  end if;

  if next_wallet < 0 or next_piggy < 0 then
    raise exception 'insufficient_balance';
  end if;

  update public.wallet_settings
  set balance_cents = next_wallet, updated_at = now()
  where family_id = current_family;
  update public.piggy_bank_settings
  set balance_cents = next_piggy, updated_at = now()
  where family_id = current_family;

  return query select next_wallet, next_piggy;
end;
$$;

revoke all on function public.get_family_wallet_settings() from public;
revoke all on function public.transfer_family_wallet(text, bigint) from public;
grant execute on function public.get_family_wallet_settings() to authenticated;
grant execute on function public.transfer_family_wallet(text, bigint) to authenticated;
