import assert from "node:assert/strict";
import test from "node:test";

import { getExpenseCategoryIcon } from "../src/features/transactions/model/transaction-icon.ts";

test("maps each seeded expense category to its representative icon", () => {
  assert.equal(getExpenseCategoryIcon("Moradia"), "house");
  assert.equal(getExpenseCategoryIcon("Alimentação"), "utensils");
  assert.equal(getExpenseCategoryIcon("Saúde"), "stethoscope");
  assert.equal(getExpenseCategoryIcon("Lazer"), "gamepad-2");
});

test("uses a shopping icon for an unknown expense category", () => {
  assert.equal(getExpenseCategoryIcon("Outra"), "shopping-cart");
});
