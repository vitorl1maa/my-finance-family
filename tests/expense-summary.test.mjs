import assert from "node:assert/strict";
import test from "node:test";

import {
  getExpenseMonthLabel,
  getExpensePercentageComparedToNextMonth,
  getExpenseSavingsComparedToPreviousMonth,
  getExpenseTotalForMonth,
} from "../src/features/transactions/model/expense-summary.ts";

test("formats the expense month label in uppercase", () => {
  assert.equal(getExpenseMonthLabel(new Date(2026, 9, 1)), "SUAS DESPESAS DE OUTUBRO");
});

test("calculates savings against the previous month in cents", () => {
  const savings = getExpenseSavingsComparedToPreviousMonth(
    [
      {
        id: "october-expense",
        accountId: "main-account",
        title: "Outubro",
        category: "Casa",
        amountCents: -130000,
        occurredAt: "2026-10-10T12:00:00.000Z",
        paidAt: "2026-10-10T12:00:00.000Z",
        paymentStatus: "paid",
        syncStatus: "synced",
      },
      {
        id: "november-expense",
        accountId: "main-account",
        title: "Novembro",
        category: "Casa",
        amountCents: -90000,
        occurredAt: "2026-11-10T12:00:00.000Z",
        paidAt: "2026-11-10T12:00:00.000Z",
        paymentStatus: "paid",
        syncStatus: "synced",
      },
    ],
    new Date(2026, 10, 1),
  );

  assert.equal(savings, 40000);
});

test("totals expenses scheduled for the reference month", () => {
  const total = getExpenseTotalForMonth(
    [
      {
        id: "rent",
        accountId: "main-account",
        title: "Aluguel",
        category: "Casa",
        amountCents: -180000,
        occurredAt: "2026-10-05T12:00:00.000Z",
        paidAt: "2026-10-05T12:00:00.000Z",
        paymentStatus: "paid",
        syncStatus: "synced",
      },
      {
        id: "market",
        accountId: "main-account",
        title: "Mercado",
        category: "Alimentação",
        amountCents: -45000,
        occurredAt: "2026-10-20T12:00:00.000Z",
        paidAt: "2026-10-20T12:00:00.000Z",
        paymentStatus: "paid",
        syncStatus: "synced",
      },
      {
        id: "previous-market",
        accountId: "main-account",
        title: "Mercado anterior",
        category: "Alimentação",
        amountCents: -99000,
        occurredAt: "2026-09-30T12:00:00.000Z",
        paidAt: "2026-10-01T12:00:00.000Z",
        paymentStatus: "paid",
        syncStatus: "synced",
      },
      {
        id: "income",
        accountId: "main-account",
        title: "Salário",
        category: "Receita",
        amountCents: 500000,
        occurredAt: "2026-10-01T12:00:00.000Z",
        syncStatus: "synced",
      },
    ],
    new Date(2026, 9, 1),
  );

  assert.equal(total, 225000);
});

test("includes a recurring expense planned for the selected month", () => {
  const total = getExpenseTotalForMonth(
    [
      {
        id: "rent",
        accountId: "main-account",
        title: "Aluguel",
        category: "Casa",
        amountCents: -180000,
        occurredAt: "2026-11-05T12:00:00.000Z",
        paidAt: "2026-11-05T12:00:00.000Z",
        paymentStatus: "paid",
        recurrenceRule: "monthly",
        syncStatus: "synced",
      },
    ],
    new Date(2026, 11, 1),
  );

  assert.equal(total, 180000);
});

test("calculates the expense percentage compared to the next month", () => {
  const percentage = getExpensePercentageComparedToNextMonth(
    [
      {
        id: "november-expense",
        accountId: "main-account",
        title: "Novembro",
        category: "Casa",
        amountCents: -8000,
        occurredAt: "2026-11-10T12:00:00.000Z",
        paidAt: "2026-11-10T12:00:00.000Z",
        paymentStatus: "paid",
        syncStatus: "synced",
      },
      {
        id: "december-expense",
        accountId: "main-account",
        title: "Dezembro",
        category: "Casa",
        amountCents: -10000,
        occurredAt: "2026-12-10T12:00:00.000Z",
        paidAt: "2026-12-10T12:00:00.000Z",
        paymentStatus: "paid",
        syncStatus: "synced",
      },
    ],
    new Date(2026, 10, 1),
  );

  assert.equal(percentage, -20);
});
