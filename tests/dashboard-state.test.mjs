import assert from "node:assert/strict";
import test from "node:test";

import { shouldShowEmptyPiggyBankBanner } from "../src/features/dashboard/model/dashboard-state.ts";

test("shows the empty piggy bank banner only after loading with no income sources", () => {
  assert.equal(shouldShowEmptyPiggyBankBanner(true, 0), false);
  assert.equal(shouldShowEmptyPiggyBankBanner(false, 0), true);
  assert.equal(shouldShowEmptyPiggyBankBanner(false, 2), false);
});
