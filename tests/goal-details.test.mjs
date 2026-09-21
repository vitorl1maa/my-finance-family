import assert from "node:assert/strict";
import test from "node:test";

import {
  getGoalStatus,
  getMonthlyGoalAmount,
  getMonthsUntilGoal,
} from "../src/features/goals/model/goal-details.ts";

test("calculates the remaining monthly amount until a goal deadline", () => {
  const goal = {
    targetCents: 1000000,
    savedCents: 640000,
    dueDate: "2027-03-18",
  };

  assert.equal(getMonthsUntilGoal(goal.dueDate, new Date("2026-09-18")), 6);
  assert.equal(getMonthlyGoalAmount(goal, new Date("2026-09-18")), 60000);
});

test("classifies goals as completed, on track or attention", () => {
  assert.equal(
    getGoalStatus({ targetCents: 100, savedCents: 100, dueDate: null }, new Date("2026-09-18")),
    "Concluída",
  );
  assert.equal(
    getGoalStatus(
      { targetCents: 100, savedCents: 40, dueDate: "2027-03-18" },
      new Date("2026-09-18"),
    ),
    "No ritmo",
  );
  assert.equal(
    getGoalStatus(
      { targetCents: 100, savedCents: 40, dueDate: "2026-08-18" },
      new Date("2026-09-18"),
    ),
    "Atenção",
  );
});
