import { z } from "zod";

export const accountSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["checking", "savings", "wallet"]),
  balanceCents: z.number().int(),
});

export type Account = z.infer<typeof accountSchema>;
