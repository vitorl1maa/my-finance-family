import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  title: z.string(),
  category: z.string(),
  amountCents: z.number().int(),
  occurredAt: z.string(),
  syncStatus: z.enum(["pending", "synced", "failed"]),
});

export type Transaction = z.infer<typeof transactionSchema>;
