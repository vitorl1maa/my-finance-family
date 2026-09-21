import assert from "node:assert/strict";
import test from "node:test";

import {
  incomeSourceKindLabel,
  incomeSourceSchema,
  totalIncomeSources,
} from "../src/features/income-sources/model/income-source.ts";

const sources = [
  {
    id: "salary",
    name: "Salários",
    kind: "salary",
    amountCents: 580000,
    updatedAt: "2026-09-21T12:00:00.000Z",
    syncStatus: "pending",
  },
  {
    id: "investments",
    name: "Investimentos",
    kind: "investment",
    amountCents: 668050,
    updatedAt: "2026-09-21T12:00:00.000Z",
    syncStatus: "pending",
  },
];

test("sums income sources and exposes readable labels", () => {
  assert.equal(totalIncomeSources(sources), 1248050);
  assert.equal(incomeSourceKindLabel("salary"), "Salário");
  assert.equal(incomeSourceKindLabel("investment"), "Investimento");
});

test("rejects empty names and non-positive income values", () => {
  assert.equal(incomeSourceSchema.safeParse(sources[0]).success, true);
  assert.equal(incomeSourceSchema.safeParse({ ...sources[0], name: "   " }).success, false);
  assert.equal(incomeSourceSchema.safeParse({ ...sources[0], amountCents: 0 }).success, false);
});
