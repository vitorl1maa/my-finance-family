import assert from "node:assert/strict";
import test from "node:test";

import { buildCreateExpensePayload } from "../src/features/transactions/model/expense-payload.ts";

test("builds an expense payload in cents without account or family input", () => {
  const payload = buildCreateExpensePayload({
    title: "  Mercado  ",
    categoryId: "category-food",
    amount: "R$ 40,00",
    occurredAt: "2026-09-18T12:00:00.000Z",
    recurrenceRule: "monthly",
  });

  assert.deepEqual(payload, {
    title: "Mercado",
    categoryId: "category-food",
    amountCents: 4000,
    occurredAt: "2026-09-18T12:00:00.000Z",
    recurrenceRule: "monthly",
  });
  assert.equal("accountId" in payload, false);
  assert.equal("familyId" in payload, false);
});
