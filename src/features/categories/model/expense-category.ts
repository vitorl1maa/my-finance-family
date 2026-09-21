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
