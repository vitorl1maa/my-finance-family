-- The wallet was originally seeded from income minus expenses, without
-- excluding money that had already been moved to the piggy bank.
update public.wallet_settings wallet
set balance_cents = greatest(0, wallet.balance_cents - coalesce(piggy.balance_cents, 0)),
    updated_at = now()
from public.piggy_bank_settings piggy
where piggy.family_id = wallet.family_id
  and piggy.balance_cents > 0
  and wallet.balance_cents = greatest(
    0,
    coalesce((
      select sum(source.amount_cents)
      from public.income_sources source
      where source.family_id = wallet.family_id
    ), 0) - coalesce((
      select sum(abs(expense.amount_cents))
      from public.transactions expense
      where expense.family_id = wallet.family_id
        and expense.amount_cents < 0
    ), 0)
  );
