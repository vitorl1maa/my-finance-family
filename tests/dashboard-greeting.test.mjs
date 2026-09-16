import assert from "node:assert/strict";
import test from "node:test";

import {
  getDashboardGreeting,
  getUserDisplayName,
} from "../src/features/dashboard/model/dashboard-greeting.ts";

test("returns the Portuguese period greeting for the current hour", () => {
  assert.equal(getDashboardGreeting(new Date(2026, 8, 16, 7)), "Bom dia,");
  assert.equal(getDashboardGreeting(new Date(2026, 8, 16, 15)), "Boa tarde,");
  assert.equal(getDashboardGreeting(new Date(2026, 8, 16, 21)), "Boa noite,");
});

test("uses the logged-in user's first name and falls back safely", () => {
  assert.equal(getUserDisplayName({ first_name: "Vitor" }), "Vitor");
  assert.equal(getUserDisplayName({}), "Usuário");
});
