import { useAccountsViewModel } from "@/src/features/accounts/view-model/use-accounts-view-model";
import { useGoalsViewModel } from "@/src/features/goals/view-model/use-goals-view-model";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";

export function useDashboardViewModel() {
  const accounts = useAccountsViewModel();
  const transactions = useTransactionsViewModel();
  const goals = useGoalsViewModel();

  return {
    accounts: accounts.accounts,
    goals: goals.goals,
    recentTransactions: transactions.transactions.slice(0, 2),
    totalBalance: accounts.totalBalance,
  };
}
