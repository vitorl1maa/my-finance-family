import { create } from "zustand";

import type { Account } from "@/src/features/accounts/model/account";

type AccountsState = {
  accounts: Account[];
  setAccounts: (accounts: Account[]) => void;
};

export const useAccountsStore = create<AccountsState>((set) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
}));
