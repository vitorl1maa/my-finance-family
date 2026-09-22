import { useAccountsViewModel } from "@/src/features/accounts/view-model/use-accounts-view-model";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  getDashboardGreeting,
  getUserDisplayName,
} from "@/src/features/dashboard/model/dashboard-greeting";
import { buildDashboardInsights } from "@/src/features/dashboard/model/dashboard-insights";
import { useGoalsViewModel } from "@/src/features/goals/view-model/use-goals-view-model";
import { useIncomeSourcesStore } from "@/src/features/income-sources/store/income-sources-store";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import { useTransactionsStore } from "@/src/features/transactions/store/transactions-store";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";

export function useDashboardViewModel(selectedDate: Date = new Date()) {
  const session = useAuthStore((state) => state.session);
  const accounts = useAccountsViewModel();
  const transactions = useTransactionsViewModel();
  const goals = useGoalsViewModel();
  const incomeSources = useIncomeSourcesViewModel();
  const incomeSourceStore = useIncomeSourcesStore((state) => state.sources);
  const transactionStore = useTransactionsStore((state) => state.transactions);
  const insights = buildDashboardInsights(transactionStore, selectedDate);
  const piggyBankBalanceCents =
    incomeSourceStore.reduce((total, source) => total + source.amountCents, 0) -
    transactionStore.reduce(
      (total, transaction) =>
        total + (transaction.amountCents < 0 ? Math.abs(transaction.amountCents) : 0),
      0,
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
    totalBalance: incomeSources.formattedTotal,
    totalBalanceCents: piggyBankBalanceCents,
    incomeSourcesLoading: incomeSources.loading,
    incomeSources: incomeSources.sources,
    loading: incomeSources.loading || goals.loading || transactions.transactionsLoading,
    reload,
    userName: getUserDisplayName(session?.user.user_metadata),
  };
}
