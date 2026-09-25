export type WalletBalances = {
  walletBalanceCents: number;
  piggyBankBalanceCents: number;
};

export type WalletSettings = {
  balanceCents: number;
  updatedAt: string;
  syncStatus: "pending" | "synced" | "failed";
};

export function createEmptyWallet(): WalletBalances {
  return { walletBalanceCents: 0, piggyBankBalanceCents: 0 };
}

export function applyWalletDelta(balanceCents: number, deltaCents: number): number {
  const nextBalance = balanceCents + deltaCents;
  if (nextBalance < 0) throw new Error("Saldo insuficiente");
  return nextBalance;
}

export function getIncomeSourceWalletDelta(
  previousAmountCents: number | undefined,
  nextAmountCents: number | undefined,
): number {
  return (nextAmountCents ?? 0) - (previousAmountCents ?? 0);
}

export function getExpenseWalletDelta(
  previousAmountCents: number | undefined,
  nextAmountCents: number | undefined,
): number {
  return (nextAmountCents ?? 0) - (previousAmountCents ?? 0);
}

export function transferBetweenBalances(
  balances: WalletBalances,
  amountCents: number,
  direction: "to_piggy_bank" | "from_piggy_bank" = "to_piggy_bank",
): WalletBalances {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Informe um valor válido");
  }

  if (direction === "to_piggy_bank") {
    return {
      walletBalanceCents: applyWalletDelta(balances.walletBalanceCents, -amountCents),
      piggyBankBalanceCents: balances.piggyBankBalanceCents + amountCents,
    };
  }

  return {
    walletBalanceCents: balances.walletBalanceCents + amountCents,
    piggyBankBalanceCents: applyWalletDelta(balances.piggyBankBalanceCents, -amountCents),
  };
}

export function resetWalletBalance(
  balances: WalletBalances,
  target: "wallet" | "piggy_bank",
): WalletBalances {
  return target === "wallet"
    ? { ...balances, walletBalanceCents: 0 }
    : { ...balances, piggyBankBalanceCents: 0 };
}
