import assert from "node:assert/strict";
import test from "node:test";

import {
  filterExpenses,
  filterExpensesForMonth,
} from "../src/features/transactions/model/expense-list.ts";

const expenses = [
  {
    id: "current",
    amountCents: -1000,
    occurredAt: "2026-11-02T12:00:00.000Z",
    registeredAt: "2026-11-03T12:00:00.000Z",
  },
  {
    id: "previous",
    amountCents: -2000,
    occurredAt: "2026-10-31T12:00:00.000Z",
    registeredAt: "2026-10-31T12:00:00.000Z",
  },
  {
    id: "income",
    amountCents: 5000,
    occurredAt: "2026-11-03T12:00:00.000Z",
    registeredAt: "2026-11-03T12:00:00.000Z",
  },
];

test("filters only expenses registered in the selected month", () => {
  assert.deepEqual(
    filterExpensesForMonth(expenses, new Date(2026, 10, 1)).map((expense) => expense.id),
    ["current"],
  );
});

test("uses the selected previous month when filtering", () => {
  assert.deepEqual(
    filterExpensesForMonth(expenses, new Date(2026, 9, 1)).map((expense) => expense.id),
    ["previous"],
  );
});

test("filters the selected month by payment status and author", () => {
  const items = [
    { ...expenses[0], creatorId: "ana", paymentStatus: "paid" },
    { ...expenses[1], creatorId: "bia", paymentStatus: "pending" },
    {
      id: "pending-current",
      amountCents: -3000,
      occurredAt: "2026-11-05T12:00:00.000Z",
      registeredAt: "2026-11-05T12:00:00.000Z",
      creatorId: "bia",
      paymentStatus: "pending",
    },
  ];

  assert.deepEqual(
    filterExpenses(items, {
      authorId: "bia",
      month: new Date(2026, 10, 1),
      paymentStatus: "pending",
      query: "",
    }).map((expense) => expense.id),
    ["pending-current"],
  );
});
