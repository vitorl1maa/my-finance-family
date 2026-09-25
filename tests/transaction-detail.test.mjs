import assert from "node:assert/strict";
import test from "node:test";

import { getTransactionDetail } from "../src/features/transactions/model/transaction-detail.ts";

test("builds expense detail fields", () => {
  assert.deepEqual(
    getTransactionDetail({
      id: "expense",
      accountId: "a",
      title: "Mercado",
      category: "Alimentação",
      amountCents: -23890,
      occurredAt: "2026-09-18T12:00:00.000Z",
      recurrenceRule: "monthly",
      syncStatus: "synced",
    }),
    {
      kind: "expense",
      title: "Mercado",
      amountCents: -23890,
      fields: ["Categoria", "Vencimento", "Recorrência"],
    },
  );
});

test("builds income detail fields", () => {
  assert.deepEqual(
    getTransactionDetail({
      id: "income-source:salary",
      accountId: "",
      title: "Salário",
      category: "Salário",
      amountCents: 580000,
      occurredAt: "2026-09-18T12:00:00.000Z",
      syncStatus: "synced",
    }),
    {
      kind: "income",
      title: "Salário",
      amountCents: 580000,
      fields: ["Valor mensal", "Tipo de fonte"],
    },
  );
});
