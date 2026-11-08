import assert from "node:assert/strict";
import test from "node:test";

import {
  getExpenseOccurrencesForMonth,
  getNextExpenseOccurrence,
} from "../src/features/dashboard/model/expense-occurrences.ts";

const monthlyExpense = {
  id: "rent",
  accountId: "main",
  title: "Aluguel",
  category: "Moradia",
  amountCents: -180000,
  occurredAt: "2026-01-31T12:00:00.000Z",
  recurrenceRule: "monthly",
  syncStatus: "synced",
};

test("projects a monthly expense on the last valid day of a shorter month", () => {
  const occurrences = getExpenseOccurrencesForMonth(monthlyExpense, new Date(2026, 1, 1));

  assert.deepEqual(
    occurrences.map((occurrence) => occurrence.dateKey),
    ["2026-02-28"],
  );
});

test("projects every-15-days expenses and chooses the next occurrence", () => {
  const expense = {
    ...monthlyExpense,
    id: "internet",
    occurredAt: "2026-09-01T12:00:00.000Z",
    recurrenceRule: "every-15-days",
  };

  const occurrences = getExpenseOccurrencesForMonth(expense, new Date(2026, 8, 1));
  const next = getNextExpenseOccurrence([expense], new Date(2026, 8, 17));

  assert.deepEqual(
    occurrences.map((occurrence) => occurrence.dateKey),
    ["2026-09-01", "2026-09-16"],
  );
  assert.equal(next?.dateKey, "2026-10-01");
});

test("does not carry a paid monthly occurrence into following months", () => {
  const paidInNovember = {
    ...monthlyExpense,
    paymentStatus: "paid",
    paidAt: "2026-11-10T12:00:00.000Z",
  };

  assert.equal(
    getExpenseOccurrencesForMonth(paidInNovember, new Date(2026, 10, 1))[0]?.paymentStatus,
    "paid",
  );
  assert.equal(
    getExpenseOccurrencesForMonth(paidInNovember, new Date(2026, 11, 1))[0]?.paymentStatus,
    "pending",
  );
});
