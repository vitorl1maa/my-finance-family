import assert from "node:assert/strict";
import test from "node:test";

import {
  filterTransactions,
  groupTransactionsByDay,
} from "../src/features/transactions/model/transaction-list.ts";

const transactions = [
  {
    id: "market",
    accountId: "main-account",
    title: "Supermercado",
    category: "Alimentação",
    amountCents: -23890,
    occurredAt: "2026-09-18T10:32:00.000Z",
    syncStatus: "synced",
  },
  {
    id: "salary",
    accountId: "main-account",
    title: "Salário",
    category: "Trabalho",
    amountCents: 580000,
    occurredAt: "2026-09-17T08:00:00.000Z",
    syncStatus: "synced",
  },
  {
    id: "rent",
    accountId: "main-account",
    title: "Aluguel",
    category: "Moradia",
    amountCents: -180000,
    occurredAt: "2026-09-14T12:00:00.000Z",
    syncStatus: "synced",
  },
];

test("filters transactions by title or category without case sensitivity", () => {
  assert.deepEqual(
    filterTransactions(transactions, "alimen").map((transaction) => transaction.id),
    ["market"],
  );
  assert.deepEqual(
    filterTransactions(transactions, "SALÁRIO").map((transaction) => transaction.id),
    ["salary"],
  );
});

test("groups transactions into today, yesterday and a localized date", () => {
  const groups = groupTransactionsByDay(transactions, new Date("2026-09-18T14:00:00.000Z"));

  assert.deepEqual(
    groups.map((group) => ({ id: group.id, label: group.label })),
    [
      { id: "2026-09-18", label: "HOJE" },
      { id: "2026-09-17", label: "ONTEM" },
      { id: "2026-09-14", label: "14 de setembro" },
    ],
  );
});
