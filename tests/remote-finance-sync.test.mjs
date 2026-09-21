import assert from "node:assert/strict";
import test from "node:test";

import { mapRemoteGoal } from "../src/features/goals/model/remote-goal.ts";
import { saveGoal } from "../src/features/goals/repository/goals-repository.ts";
import { mapRemoteIncomeSource } from "../src/features/income-sources/model/remote-income-source.ts";
import { mapRemotePiggyBankSettings } from "../src/features/income-sources/model/remote-piggy-bank-settings.ts";

test("maps Supabase goals and income sources as synchronized local records", () => {
  assert.deepEqual(
    mapRemoteGoal({
      id: "goal-1",
      title: "Reserva",
      product_url: "https://example.com/reserva",
      category: "Segurança",
      priority: "Alta",
      target_cents: 100000,
      saved_cents: 20000,
      due_date: "2027-03-18",
    }),
    {
      id: "goal-1",
      title: "Reserva",
      productUrl: "https://example.com/reserva",
      category: "Segurança",
      priority: "Alta",
      targetCents: 100000,
      savedCents: 20000,
      dueDate: "2027-03-18",
      syncStatus: "synced",
    },
  );

  assert.deepEqual(
    mapRemoteIncomeSource({
      id: "income-1",
      name: "Salário",
      kind: "salary",
      amount_cents: 580000,
      updated_at: "2026-09-21T20:00:00.000Z",
    }),
    {
      id: "income-1",
      name: "Salário",
      kind: "salary",
      amountCents: 580000,
      updatedAt: "2026-09-21T20:00:00.000Z",
      syncStatus: "synced",
    },
  );

  assert.deepEqual(
    mapRemotePiggyBankSettings({
      balance_cents: 1248050,
      updated_at: "2026-09-21T20:00:00.000Z",
    }),
    {
      balanceCents: 1248050,
      updatedAt: "2026-09-21T20:00:00.000Z",
      syncStatus: "synced",
    },
  );
});

test("persists every goal field locally before remote synchronization", async () => {
  const operations = [];
  const db = {
    async runAsync(sql, ...params) {
      operations.push({ sql, params });
    },
  };

  await saveGoal(db, {
    id: "goal-1",
    title: "Reserva",
    productUrl: "https://example.com/reserva",
    category: "Segurança",
    priority: "Alta",
    targetCents: 100000,
    savedCents: 20000,
    dueDate: "2027-03-18",
    syncStatus: "pending",
  });

  assert.deepEqual(operations[0].params, [
    "goal-1",
    "Reserva",
    "https://example.com/reserva",
    "Segurança",
    "Alta",
    100000,
    20000,
    "2027-03-18",
    "pending",
  ]);
});
