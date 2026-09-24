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
      created_at: "2026-09-17T16:45:00.000Z",
      recurrence_rule: "monthly",
      created_by: "user-id",
      creator_name: "Vitor",
      creator_avatar_url: "https://example.com/avatar.jpg",
      creator_avatar_seed: "vitor-seed",
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
      registeredAt: "2026-09-17T16:45:00.000Z",
      recurrenceRule: "monthly",
      creatorId: "user-id",
      creatorName: "Vitor",
      creatorAvatarUrl: "https://example.com/avatar.jpg",
      creatorAvatarSeed: "vitor-seed",
      syncStatus: "synced",
    },
  );
});
