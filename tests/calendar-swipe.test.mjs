import assert from "node:assert/strict";
import test from "node:test";

import { getMonthDeltaForSwipe } from "../src/features/dashboard/model/calendar-swipe.ts";

test("changes month only for deliberate horizontal calendar swipes", () => {
  assert.equal(getMonthDeltaForSwipe(-72, 8), 1);
  assert.equal(getMonthDeltaForSwipe(72, 8), -1);
  assert.equal(getMonthDeltaForSwipe(-18, 4), 0);
  assert.equal(getMonthDeltaForSwipe(-72, 90), 0);
});
