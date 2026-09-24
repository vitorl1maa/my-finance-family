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
  syncStatus: z.enum(["pending", "synced", "failed"]),
});

export type Transaction = z.infer<typeof transactionSchema>;
