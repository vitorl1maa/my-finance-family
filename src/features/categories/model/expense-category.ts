export type ExpenseCategory = {
  id: string;
  familyId: string;
  name: string;
  slug: string;
  isActive: boolean;
};

export const defaultExpenseCategories: ExpenseCategory[] = [
  { id: "moradia", familyId: "local", name: "Moradia", slug: "moradia", isActive: true },
  {
    id: "alimentacao",
    familyId: "local",
    name: "Alimentação",
    slug: "alimentacao",
    isActive: true,
  },
  { id: "saude", familyId: "local", name: "Saúde", slug: "saude", isActive: true },
  { id: "lazer", familyId: "local", name: "Lazer", slug: "lazer", isActive: true },
];

export function resolveExpenseCategories(
  hasAuthenticatedFamily: boolean,
  remoteCategories: ExpenseCategory[],
): ExpenseCategory[] {
  return hasAuthenticatedFamily ? remoteCategories : defaultExpenseCategories;
}

const categoryOrder = ["moradia", "alimentacao", "saude", "lazer"];

export function orderExpenseCategories(categories: ExpenseCategory[]): ExpenseCategory[] {
  return categories
    .filter((category) => category.isActive)
    .sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.slug);
      const bIndex = categoryOrder.indexOf(b.slug);

      return (
        (aIndex === -1 ? categoryOrder.length : aIndex) -
        (bIndex === -1 ? categoryOrder.length : bIndex)
      );
    });
}
