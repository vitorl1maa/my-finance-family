import { useAccountsViewModel } from "@/src/features/accounts/view-model/use-accounts-view-model";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  getDashboardGreeting,
  getUserDisplayName,
} from "@/src/features/dashboard/model/dashboard-greeting";
import { useGoalsViewModel } from "@/src/features/goals/view-model/use-goals-view-model";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";

export function useDashboardViewModel() {
  const session = useAuthStore((state) => state.session);
  const accounts = useAccountsViewModel();
  const transactions = useTransactionsViewModel();
  const goals = useGoalsViewModel();

  return {
    accounts: accounts.accounts,
    goals: goals.goals,
    greeting: getDashboardGreeting(),
    recentTransactions: transactions.transactions.slice(0, 2),
    totalBalance: accounts.totalBalance,
    userName: getUserDisplayName(session?.user.user_metadata),
  };
}
