import assert from "node:assert/strict";
import test from "node:test";

import {
  getExpenseMonthLabel,
  getExpenseTotalForMonth,
} from "../src/features/transactions/model/expense-summary.ts";

test("formats the expense month label in uppercase", () => {
  assert.equal(getExpenseMonthLabel(new Date(2026, 9, 1)), "SUAS DESPESAS DE OUTUBRO");
});

test("totals only expenses debited in the reference month", () => {
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

  assert.equal(total, 324000);
});
