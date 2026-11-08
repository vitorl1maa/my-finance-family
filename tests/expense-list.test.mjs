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

test("projects a recurring expense into the selected future month as pending", () => {
  const projected = filterExpensesForMonth(
    [
      {
        id: "rent",
        amountCents: -180000,
        occurredAt: "2026-11-05T12:00:00.000Z",
        registeredAt: "2026-11-01T12:00:00.000Z",
        recurrenceRule: "monthly",
        paymentStatus: "paid",
        paidAt: "2026-11-05T12:00:00.000Z",
      },
    ],
    new Date(2026, 11, 1),
  );

  assert.equal(projected.length, 1);
  assert.equal(projected[0]?.id, "rent");
  assert.equal(projected[0]?.paymentStatus, "pending");
  assert.match(projected[0]?.occurredAt ?? "", /^2026-12-05/);
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
