export function createExpenseSwipeActions(close: () => void, edit: () => void, remove: () => void) {
  return {
    edit: () => {
      close();
      edit();
    },
    remove: () => {
      close();
      remove();
    },
  };
}
