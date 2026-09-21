import { z } from "zod";

export const incomeSourceSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1),
  kind: z.enum(["salary", "investment", "other"]),
  amountCents: z.number().int().positive(),
  updatedAt: z.string(),
  syncStatus: z.enum(["pending", "synced", "failed"]),
});

export type IncomeSource = z.infer<typeof incomeSourceSchema>;

export function incomeSourceKindLabel(kind: IncomeSource["kind"]): string {
  if (kind === "salary") return "Salário";
  if (kind === "investment") return "Investimento";
  return "Outra fonte";
}

export function totalIncomeSources(sources: IncomeSource[]): number {
  return sources.reduce((total, source) => total + source.amountCents, 0);
}
