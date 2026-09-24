import assert from "node:assert/strict";
import test from "node:test";

import {
  applyWalletDelta,
  createEmptyWallet,
  transferBetweenBalances,
} from "../src/features/wallet/model/wallet.ts";

test("creates an empty wallet with independent balances", () => {
  assert.deepEqual(createEmptyWallet(), {
    walletBalanceCents: 0,
    piggyBankBalanceCents: 0,
  });
});

test("applies income and expense deltas without allowing a negative wallet", () => {
  assert.deepEqual(applyWalletDelta(5000, 2500), 7500);
  assert.throws(() => applyWalletDelta(2500, -3000), /Saldo insuficiente/);
});

test("transfers money between wallet and piggy bank atomically", () => {
  assert.deepEqual(transferBetweenBalances({ walletBalanceCents: 10000, piggyBankBalanceCents: 0 }, 4000), {
    walletBalanceCents: 6000,
    piggyBankBalanceCents: 4000,
  });
  assert.throws(
    () => transferBetweenBalances({ walletBalanceCents: 1000, piggyBankBalanceCents: 4000 }, 2000),
    /Saldo insuficiente/,
  );
});
