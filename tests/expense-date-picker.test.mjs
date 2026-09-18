import assert from "node:assert/strict";
import test from "node:test";

import {
  formatExpenseDate,
  getExpenseCalendarDays,
  toExpenseIso,
} from "../src/features/transactions/model/expense-date.ts";

test("builds a Sunday-first calendar containing the full month", () => {
  const days = getExpenseCalendarDays(new Date(2026, 8, 16));

  assert.equal(days.length, 35);
  assert.equal(days[0].getDay(), 0);
  assert.equal(
    days.some((day) => formatExpenseDate(day) === "16/09/2026"),
    true,
  );
});

test("formats a selected date and normalizes it at noon", () => {
  const date = new Date(2026, 8, 16);

  assert.equal(formatExpenseDate(date), "16/09/2026");
  assert.equal(new Date(toExpenseIso(date)).getHours(), 12);
});
