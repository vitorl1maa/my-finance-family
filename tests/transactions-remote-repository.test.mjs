import assert from "node:assert/strict";
import test from "node:test";

import { mapRemoteTransaction } from "../src/features/transactions/model/remote-transaction.ts";

test("maps a Supabase transaction row into the domain transaction", () => {
  assert.deepEqual(
    mapRemoteTransaction({
      id: "transaction-id",
      account_id: "account-id",
      family_id: "family-id",
      title: "Mercado",
      category: "Alimentação",
      category_id: "category-id",
      amount_cents: -7600,
      occurred_at: "2026-09-18T12:00:00.000Z",
      recurrence_rule: "monthly",
    }),
    {
      id: "transaction-id",
      accountId: "account-id",
      familyId: "family-id",
      title: "Mercado",
      category: "Alimentação",
      categoryId: "category-id",
      amountCents: -7600,
      occurredAt: "2026-09-18T12:00:00.000Z",
      recurrenceRule: "monthly",
      syncStatus: "synced",
    },
  );
});
