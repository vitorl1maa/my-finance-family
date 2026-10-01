import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultExpenseCategories,
  orderExpenseCategories,
  resolveExpenseCategories,
} from "../src/features/categories/model/expense-category.ts";

test("uses the family's remote categories for authenticated expense editing", () => {
  const remoteCategories = [
    {
      id: "9f4c5b19-c86a-4dfb-a6fc-1532eae398d0",
      familyId: "family-id",
      name: "Alimentação",
      slug: "alimentacao",
      isActive: true,
    },
  ];

  assert.deepEqual(resolveExpenseCategories(true, remoteCategories), remoteCategories);
});

test("keeps local category options available without an authenticated family", () => {
  assert.deepEqual(resolveExpenseCategories(false, []), defaultExpenseCategories);
});

test("includes Outros after the standard expense categories", () => {
  assert.deepEqual(
    defaultExpenseCategories.map((category) => category.name),
    ["Moradia", "Alimentação", "Saúde", "Lazer", "Outros"],
  );

  assert.deepEqual(
    orderExpenseCategories([
      { id: "other", familyId: "family-id", name: "Outros", slug: "outros", isActive: true },
      { id: "home", familyId: "family-id", name: "Moradia", slug: "moradia", isActive: true },
    ]).map((category) => category.name),
    ["Moradia", "Outros"],
  );
});
