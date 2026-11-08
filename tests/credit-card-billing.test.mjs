import assert from "node:assert/strict";
import test from "node:test";

import { getCreditCardInstallments } from "../src/features/transactions/model/credit-card-billing.ts";

test("schedules a purchase before closing for the next invoice due date", () => {
  const installments = getCreditCardInstallments(new Date(2026, 10, 27), 120000, 3);

  assert.deepEqual(
    installments.map((installment) => [installment.amountCents, installment.dueDate.toISOString().slice(0, 10)]),
    [[40000, "2026-12-08"], [40000, "2027-01-08"], [40000, "2027-02-08"]],
  );
});

test("schedules a purchase after the last business day for the following invoice", () => {
  const [installment] = getCreditCardInstallments(new Date(2026, 9, 31), 9999, 1);

  assert.deepEqual(
    [installment?.amountCents, installment?.dueDate.toISOString().slice(0, 10)],
    [9999, "2026-12-08"],
  );
});
