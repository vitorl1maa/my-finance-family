import { z } from "zod";

export const goalSchema = z.object({
  id: z.string(),
  title: z.string(),
  productUrl: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["Alta", "Média", "Baixa"]).optional(),
  targetCents: z.number().int().positive(),
  savedCents: z.number().int().nonnegative(),
  dueDate: z.string().nullable(),
  syncStatus: z.enum(["pending", "synced", "failed"]),
});

export type Goal = z.infer<typeof goalSchema>;
