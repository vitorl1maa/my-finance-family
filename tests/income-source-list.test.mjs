import assert from "node:assert/strict";
import test from "node:test";

import { filterIncomeSources } from "../src/features/income-sources/model/income-source-list.ts";

const sources = [
  {
    id: "ana",
    name: "Salário",
    kind: "salary",
    amountCents: 500000,
    registeredAt: "2026-11-02T12:00:00.000Z",
    updatedAt: "2026-11-02T12:00:00.000Z",
    creatorId: "ana",
    creatorName: "Ana",
    syncStatus: "synced",
  },
  {
    id: "bia",
    name: "Freela",
    kind: "other",
    amountCents: 120000,
    registeredAt: "2026-11-04T12:00:00.000Z",
    updatedAt: "2026-11-04T12:00:00.000Z",
    creatorId: "bia",
    creatorName: "Bia",
    syncStatus: "synced",
  },
  {
    id: "old",
    name: "Investimento",
    kind: "investment",
    amountCents: 90000,
    registeredAt: "2026-10-30T12:00:00.000Z",
    updatedAt: "2026-11-01T12:00:00.000Z",
    creatorId: "ana",
    creatorName: "Ana",
    syncStatus: "synced",
  },
];

test("filters income sources by registration month, author and search", () => {
  assert.deepEqual(
    filterIncomeSources(sources, {
      month: new Date(2026, 10, 1),
      authorId: "ana",
      query: "sal",
    }).map((source) => source.id),
    ["ana"],
  );
  assert.deepEqual(
    filterIncomeSources(sources, { month: new Date(2026, 10, 1), query: "" }).map(
      (source) => source.id,
    ),
    ["ana", "bia"],
  );
});
