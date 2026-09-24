import assert from "node:assert/strict";
import test from "node:test";

import {
  applyWalletDelta,
  createEmptyWallet,
  getExpenseWalletDelta,
  getIncomeSourceWalletDelta,
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
  assert.deepEqual(
    transferBetweenBalances(
      { walletBalanceCents: 6000, piggyBankBalanceCents: 4000 },
      1500,
      "from_piggy_bank",
    ),
    { walletBalanceCents: 7500, piggyBankBalanceCents: 2500 },
  );
});

test("calculates only the delta when an income source changes", () => {
  assert.equal(getIncomeSourceWalletDelta(undefined, 5000), 5000);
  assert.equal(getIncomeSourceWalletDelta(5000, 6500), 1500);
  assert.equal(getIncomeSourceWalletDelta(6500, undefined), -6500);
});

test("calculates expense deltas from the signed transaction values", () => {
  assert.equal(getExpenseWalletDelta(undefined, -1000), -1000);
  assert.equal(getExpenseWalletDelta(-1000, -1500), -500);
  assert.equal(getExpenseWalletDelta(-1500, undefined), 1500);
});
