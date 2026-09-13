import { useMemo } from "react";

import { useAccountsStore } from "@/src/features/accounts/store/accounts-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useAccountsViewModel() {
  const accounts = useAccountsStore((state) => state.accounts);

  return useMemo(
    () => ({
      accounts: accounts.map((account) => ({
        ...account,
        formattedBalance: formatCurrencyFromCents(account.balanceCents),
      })),
      totalBalance: formatCurrencyFromCents(
        accounts.reduce((total, account) => total + account.balanceCents, 0),
      ),
    }),
    [accounts],
  );
}
