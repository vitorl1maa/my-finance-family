import assert from "node:assert/strict";
import test from "node:test";

import { getBalanceMonthLabel } from "../src/features/wallet/model/balance-label.ts";

test("formats wallet and piggy bank titles with the current month in uppercase", () => {
  const referenceDate = new Date(2026, 9, 1);

  assert.equal(getBalanceMonthLabel("wallet", referenceDate), "SALDO DA CARTEIRA EM OUTUBRO");
  assert.equal(getBalanceMonthLabel("piggy_bank", referenceDate), "SALDO DO COFRINHO EM OUTUBRO");
});
