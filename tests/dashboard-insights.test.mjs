import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDashboardInsights,
  getCalendarWeeks,
  getWeekDays,
} from "../src/features/dashboard/model/dashboard-insights.ts";

test("builds a Monday-first week for the selected date", () => {
  const days = getWeekDays(new Date(2026, 8, 16));

  assert.deepEqual(
    days.map((day) => day.date),
    [14, 15, 16, 17, 18, 19, 20],
  );
  assert.equal(days[2].isSelected, true);
  assert.equal(days[0].shortWeekday, "S");
});

test("builds complete month weeks while keeping the selected day", () => {
  const weeks = getCalendarWeeks(new Date(2026, 8, 16));

  assert.equal(weeks.length, 5);
  assert.equal(weeks[0][0].isoDate, "2026-08-31");
  assert.equal(weeks[4][6].isoDate, "2026-10-04");
  assert.equal(weeks[2][2].isSelected, true);
  assert.equal(weeks[2][2].isCurrentMonth, true);
  assert.equal(weeks[0][0].isCurrentMonth, false);
});

test("summarizes monthly cash flow, categories and financial health", () => {
  const insights = buildDashboardInsights(
    [
      {
        id: "salary",
        accountId: "main-account",
        title: "Salário",
        category: "Receita",
        amountCents: 580000,
        occurredAt: "2026-09-12T08:00:00.000Z",
        syncStatus: "synced",
      },
      {
        id: "market",
        accountId: "main-account",
        title: "Supermercado",
        category: "Casa",
        amountCents: -23890,
        occurredAt: "2026-09-18T10:32:00.000Z",
        syncStatus: "pending",
      },
    ],
    new Date(2026, 8, 16),
  );

  assert.equal(insights.monthlyIncomeCents, 580000);
  assert.equal(insights.monthlyExpenseCents, 23890);
  assert.deepEqual(insights.expenseByCategory[0], { category: "Casa", amountCents: 23890 });
  assert.equal(insights.healthStatus, "Boa");
  assert.equal(insights.healthMessage, "Você gastou menos do que entrou este mês.");
  assert.deepEqual(insights.nextExpense, {
    dateKey: "2026-09-18",
    transactionId: "market",
    title: "Supermercado",
    amountCents: -23890,
  });
  assert.deepEqual(insights.scheduledExpenses.map((expense) => expense.dateKey), ["2026-09-18"]);
});
