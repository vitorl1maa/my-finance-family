import { useAccountsViewModel } from "@/src/features/accounts/view-model/use-accounts-view-model";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  getDashboardGreeting,
  getUserDisplayName,
} from "@/src/features/dashboard/model/dashboard-greeting";
import { buildDashboardInsights } from "@/src/features/dashboard/model/dashboard-insights";
import { useGoalsViewModel } from "@/src/features/goals/view-model/use-goals-view-model";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";

export function useDashboardViewModel(selectedDate: Date = new Date()) {
  const session = useAuthStore((state) => state.session);
  const accounts = useAccountsViewModel();
  const transactions = useTransactionsViewModel();
  const goals = useGoalsViewModel();
  const incomeSources = useIncomeSourcesViewModel();
  const insights = buildDashboardInsights(transactions.transactions, selectedDate);
  const monthlyWalletBalanceCents = Math.max(
    0,
    incomeSources.totalCents - insights.monthlyExpenseCents,
  );

  const reload = async () => {
    await Promise.all([
      goals.reload(),
      incomeSources.reload(),
      transactions.reloadTransactions(),
      transactions.reloadCategories(),
    ]);
  };

  return {
    accounts: accounts.accounts,
    goals: goals.goals,
    greeting: getDashboardGreeting(),
    insights,
    recentTransactions: transactions.transactions.slice(0, 3),
    totalBalance: incomeSources.formattedWalletBalance,
    totalBalanceCents: incomeSources.walletBalanceCents,
    monthlyWalletBalanceCents,
    piggyBankBalanceCents: incomeSources.piggyBankBalanceCents,
    incomeSourcesLoading: incomeSources.loading,
    incomeSources: incomeSources.sources,
    loading: incomeSources.loading || goals.loading || transactions.transactionsLoading,
    reload,
    userName: getUserDisplayName(session?.user.user_metadata),
  };
}
