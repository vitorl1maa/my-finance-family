create or replace function public.reset_family_wallet_balance(balance_target text)
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
  if balance_target not in ('wallet', 'piggy_bank') then raise exception 'invalid_balance_target'; end if;

  insert into public.wallet_settings (family_id) values (current_family)
  on conflict (family_id) do nothing;
  insert into public.piggy_bank_settings (family_id) values (current_family)
  on conflict (family_id) do nothing;

  if balance_target = 'wallet' then
    update public.wallet_settings
    set balance_cents = 0, updated_at = now()
    where family_id = current_family;
  else
    update public.piggy_bank_settings
    set balance_cents = 0, updated_at = now()
    where family_id = current_family;
  end if;

  select balance_cents into next_wallet from public.wallet_settings where family_id = current_family;
  select balance_cents into next_piggy from public.piggy_bank_settings where family_id = current_family;
  return query select next_wallet, next_piggy;
end;
$$;

revoke all on function public.reset_family_wallet_balance(text) from public;
grant execute on function public.reset_family_wallet_balance(text) to authenticated;
