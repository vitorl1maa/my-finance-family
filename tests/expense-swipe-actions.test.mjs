import assert from "node:assert/strict";
import test from "node:test";
import { createExpenseSwipeActions } from "../src/features/transactions/model/expense-swipe-actions.ts";

test("closes the revealed card before editing or deleting an expense", () => {
  const calls = [];
  const actions = createExpenseSwipeActions(
    () => calls.push("close"),
    () => calls.push("edit"),
    () => calls.push("delete"),
  );

  actions.edit();
  assert.deepEqual(calls, ["close", "edit"]);

  calls.length = 0;
  actions.remove();
  assert.deepEqual(calls, ["close", "delete"]);
});
