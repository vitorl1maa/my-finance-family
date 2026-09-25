import assert from "node:assert/strict";
import test from "node:test";

import {
  listTransactions,
  replaceTransaction,
  upsertTransactions,
} from "../src/features/transactions/repository/transactions-repository.ts";

function createDatabase() {
  const operations = [];
  return {
    operations,
    async getAllAsync() {
      return [
        {
          id: "remote-id",
          account_id: "account-id",
          family_id: "family-id",
          title: "Mercado",
          category: "Alimentação",
          category_id: "food-id",
          amount_cents: -4500,
          occurred_at: "2026-09-18T12:00:00.000Z",
          registered_at: "2026-09-17T16:45:00.000Z",
          recurrence_rule: "none",
          payment_method: "pix",
          sync_status: "synced",
        },
      ];
    },
    async runAsync(sql, ...params) {
      operations.push({ sql, params });
    },
    async withTransactionAsync(work) {
      await work();
    },
  };
}

const pendingTransaction = {
  id: "pending-id",
  accountId: "account-id",
  familyId: "family-id",
  title: "Mercado",
  category: "Alimentação",
  categoryId: "food-id",
  amountCents: -4500,
  occurredAt: "2026-09-18T12:00:00.000Z",
  registeredAt: "2026-09-17T16:45:00.000Z",
  recurrenceRule: "none",
  paymentMethod: "pix",
  syncStatus: "pending",
};

test("persists transactions with bound SQL parameters", async () => {
  const db = createDatabase();

  await upsertTransactions(db, [pendingTransaction]);

  assert.equal(db.operations.length, 1);
  assert.match(db.operations[0].sql, /ON CONFLICT\(id\) DO UPDATE/);
  assert.deepEqual(db.operations[0].params, [
    "pending-id",
    "account-id",
    "family-id",
    "Mercado",
    "Alimentação",
    "food-id",
    -4500,
    "2026-09-18T12:00:00.000Z",
    "2026-09-17T16:45:00.000Z",
    "none",
    "pix",
    "pending",
    null,
    null,
    null,
    null,
  ]);
});

test("replaces a pending transaction only after persisting its synced replacement", async () => {
  const db = createDatabase();

  await replaceTransaction(db, "pending-id", {
    ...pendingTransaction,
    id: "remote-id",
    syncStatus: "synced",
  });

  assert.equal(db.operations.length, 2);
  assert.match(db.operations[0].sql, /INSERT INTO transactions/);
  assert.match(db.operations[1].sql, /DELETE FROM transactions WHERE id = \?/);
  assert.deepEqual(db.operations[1].params, ["pending-id"]);
});

test("maps persisted transaction rows into the domain model", async () => {
  const transactions = await listTransactions(createDatabase());

  assert.deepEqual(transactions, [
    { ...pendingTransaction, id: "remote-id", syncStatus: "synced" },
  ]);
});
