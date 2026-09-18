import assert from "node:assert/strict";
import test from "node:test";

import {
  fallbackExpenseCategories,
  orderExpenseCategories,
} from "../src/features/categories/model/expense-category.ts";

test("orders active family categories in product order", () => {
  const categories = orderExpenseCategories([
    { ...fallbackExpenseCategories[3], isActive: true },
    { ...fallbackExpenseCategories[1], isActive: true },
    { ...fallbackExpenseCategories[0], isActive: true },
    { ...fallbackExpenseCategories[2], isActive: true },
    { ...fallbackExpenseCategories[0], isActive: false, id: "inactive" },
  ]);

  assert.deepEqual(
    categories.map((category) => category.name),
    ["Moradia", "Alimentação", "Saúde", "Lazer"],
  );
});
