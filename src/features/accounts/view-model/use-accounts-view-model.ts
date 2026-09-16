import { useCallback, useMemo } from "react";

import { useAccountsStore } from "@/src/features/accounts/store/accounts-store";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useAccountsViewModel() {
  const accounts = useAccountsStore((state) => state.accounts);
  const setAccounts = useAccountsStore((state) => state.setAccounts);

  const createAccount = useCallback(
    (input: { name: string; kind: "checking" | "savings" | "wallet"; balance: string }) => {
      const balanceCents = Math.round(Number(input.balance.replace(",", ".")) * 100);

      setAccounts([
        ...accounts,
        {
          id: `account-${Date.now()}`,
          name: input.name.trim(),
          kind: input.kind,
          balanceCents,
        },
      ]);
    },
    [accounts, setAccounts],
  );

  return useMemo(
    () => ({
      accounts: accounts.map((account) => ({
        ...account,
        formattedBalance: formatCurrencyFromCents(account.balanceCents),
      })),
      totalBalance: formatCurrencyFromCents(
        accounts.reduce((total, account) => total + account.balanceCents, 0),
      ),
      createAccount,
    }),
    [accounts, createAccount],
  );
}
