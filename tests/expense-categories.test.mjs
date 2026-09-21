import assert from "node:assert/strict";
import test from "node:test";

import { orderExpenseCategories } from "../src/features/categories/model/expense-category.ts";

test("orders active family categories in product order", () => {
  const categories = orderExpenseCategories([
    { id: "lazer", familyId: "family", name: "Lazer", slug: "lazer", isActive: true },
    {
      id: "alimentacao",
      familyId: "family",
      name: "Alimentação",
      slug: "alimentacao",
      isActive: true,
    },
    { id: "moradia", familyId: "family", name: "Moradia", slug: "moradia", isActive: true },
    { id: "saude", familyId: "family", name: "Saúde", slug: "saude", isActive: true },
    {
      id: "inactive",
      familyId: "family",
      name: "Inativa",
      slug: "moradia",
      isActive: false,
    },
  ]);

  assert.deepEqual(
    categories.map((category) => category.name),
    ["Moradia", "Alimentação", "Saúde", "Lazer"],
  );
});
