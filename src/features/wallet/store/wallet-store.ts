import { create } from "zustand";

type WalletState = {
  walletBalanceCents: number;
  piggyBankBalanceCents: number;
  setBalances: (walletBalanceCents: number, piggyBankBalanceCents: number) => void;
  setWalletBalance: (walletBalanceCents: number) => void;
  setPiggyBankBalance: (piggyBankBalanceCents: number) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  walletBalanceCents: 0,
  piggyBankBalanceCents: 0,
  setBalances: (walletBalanceCents, piggyBankBalanceCents) =>
    set({ walletBalanceCents, piggyBankBalanceCents }),
  setWalletBalance: (walletBalanceCents) => set({ walletBalanceCents }),
  setPiggyBankBalance: (piggyBankBalanceCents) => set({ piggyBankBalanceCents }),
}));
