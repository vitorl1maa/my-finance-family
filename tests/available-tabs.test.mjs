import assert from "node:assert/strict";
import test from "node:test";

import { isVisibleTab, unavailableTabRedirect } from "../src/shared/navigation/available-tabs.ts";

test("keeps goals unavailable while the feature is postponed", () => {
  assert.equal(isVisibleTab("goals"), false);
  assert.equal(unavailableTabRedirect("goals"), "/");
});
