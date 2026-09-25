export type ExpenseCategoryIcon =
  | "house"
  | "utensils"
  | "stethoscope"
  | "gamepad-2"
  | "shopping-cart";

export function getExpenseCategoryIcon(category: string): ExpenseCategoryIcon {
  switch (category.trim().toLocaleLowerCase("pt-BR")) {
    case "moradia":
      return "house";
    case "alimentação":
    case "alimentacao":
      return "utensils";
    case "saúde":
    case "saude":
      return "stethoscope";
    case "lazer":
      return "gamepad-2";
    default:
      return "shopping-cart";
  }
}
