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

export function transferBetweenBalances(
  balances: WalletBalances,
  amountCents: number,
): WalletBalances {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Informe um valor válido");
  }

  return {
    walletBalanceCents: applyWalletDelta(balances.walletBalanceCents, -amountCents),
    piggyBankBalanceCents: balances.piggyBankBalanceCents + amountCents,
  };
}
