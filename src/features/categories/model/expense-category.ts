export type ExpenseCategory = {
  id: string;
  familyId: string;
  name: string;
  slug: string;
  isActive: boolean;
};

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

export const fallbackExpenseCategories: ExpenseCategory[] = [
  { id: "moradia", familyId: "local-family", name: "Moradia", slug: "moradia", isActive: true },
  {
    id: "alimentacao",
    familyId: "local-family",
    name: "Alimentação",
    slug: "alimentacao",
    isActive: true,
  },
  { id: "saude", familyId: "local-family", name: "Saúde", slug: "saude", isActive: true },
  { id: "lazer", familyId: "local-family", name: "Lazer", slug: "lazer", isActive: true },
];
