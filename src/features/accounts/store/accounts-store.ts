import { create } from "zustand";

import type { Account } from "@/src/features/accounts/model/account";

type AccountsState = {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
};

const initialAccounts: Account[] = [
  {
    id: "main-account",
    name: "Conta principal",
    kind: "checking",
    balanceCents: 824050,
  },
  {
    id: "savings",
    name: "Poupanca",
    kind: "savings",
    balanceCents: 424000,
  },
];

export const useAccountsStore = create<AccountsState>((set) => ({
  accounts: initialAccounts,
  setAccounts: (accounts) => set({ accounts }),
}));
