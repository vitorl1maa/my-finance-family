import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  familyId: z.string().optional(),
  title: z.string(),
  category: z.string(),
  categoryId: z.string().optional(),
  amountCents: z.number().int(),
  occurredAt: z.string(),
  registeredAt: z.string().optional(),
  recurrenceRule: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "debit_card", "pix", "cash"]).optional(),
  creatorId: z.string().optional(),
  creatorName: z.string().optional(),
  creatorAvatarUrl: z.string().optional(),
  creatorAvatarSeed: z.string().optional(),
  syncStatus: z.enum(["pending", "synced", "failed"]),
});

export type Transaction = z.infer<typeof transactionSchema>;

export function getPaymentMethodLabel(paymentMethod: Transaction["paymentMethod"]) {
  switch (paymentMethod) {
    case "credit_card":
      return "Cartão de crédito";
    case "debit_card":
      return "Cartão de débito";
    case "pix":
      return "PIX";
    case "cash":
      return "Dinheiro";
    default:
      return null;
  }
}
