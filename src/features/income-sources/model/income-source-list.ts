import type { IncomeSource } from "./income-source";

export type IncomeSourceFilters = {
  authorId?: string;
  month: Date;
  query: string;
};

export function filterIncomeSources(
  sources: IncomeSource[],
  { authorId, month, query }: IncomeSourceFilters,
): IncomeSource[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");

  return sources.filter((source) => {
    const registeredAt = new Date(source.registeredAt);
    const matchesMonth =
      registeredAt.getFullYear() === month.getFullYear() &&
      registeredAt.getMonth() === month.getMonth();
    const matchesAuthor = !authorId || source.creatorId === authorId;
    const matchesQuery =
      !normalizedQuery ||
      source.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ||
      source.creatorName?.toLocaleLowerCase("pt-BR").includes(normalizedQuery);

    return matchesMonth && matchesAuthor && matchesQuery;
  });
}
