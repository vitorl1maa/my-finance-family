// @ts-expect-error The Node test runner imports TypeScript modules by extension.
import { parseBrlInputToCents } from "../../../shared/utils/money.ts";

export type ExpensePayloadInput = {
  title: string;
  categoryId: string;
  amount: string;
  occurredAt: string;
  recurrenceRule: string;
  paymentMethod: "credit_card" | "debit_card" | "pix" | "cash";
};

export type CreateExpensePayload = {
  title: string;
  categoryId: string;
  amountCents: number;
  occurredAt: string;
  recurrenceRule: string;
  paymentMethod: "credit_card" | "debit_card" | "pix" | "cash";
};

export function buildCreateExpensePayload(input: ExpensePayloadInput): CreateExpensePayload {
  return {
    title: input.title.trim(),
    categoryId: input.categoryId,
    amountCents: parseBrlInputToCents(input.amount),
    occurredAt: input.occurredAt,
    recurrenceRule: input.recurrenceRule,
    paymentMethod: input.paymentMethod,
  };
}
