import { useAccountsViewModel } from "@/src/features/accounts/view-model/use-accounts-view-model";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  getDashboardGreeting,
  getUserDisplayName,
} from "@/src/features/dashboard/model/dashboard-greeting";
import { buildDashboardInsights } from "@/src/features/dashboard/model/dashboard-insights";
import { useGoalsViewModel } from "@/src/features/goals/view-model/use-goals-view-model";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import {
  filterTransactions,
  mergeIncomeSourcesIntoTransactions,
} from "@/src/features/transactions/model/transaction-list";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function useDashboardViewModel(selectedDate: Date = new Date()) {
  const session = useAuthStore((state) => state.session);
  const accounts = useAccountsViewModel();
  const transactions = useTransactionsViewModel();
  const goals = useGoalsViewModel();
  const incomeSources = useIncomeSourcesViewModel();
  const insights = buildDashboardInsights(transactions.transactions, selectedDate);
  const recentTransactions = filterTransactions(
    mergeIncomeSourcesIntoTransactions(transactions.transactions, incomeSources.sources),
    "",
  )
    .slice(0, 3)
    .map((transaction) => ({
      ...transaction,
      formattedAmount: formatCurrencyFromCents(transaction.amountCents),
      isExpense: transaction.amountCents < 0,
    }));

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
    recentTransactions,
    totalBalance: incomeSources.formattedWalletBalance,
    totalBalanceCents: incomeSources.walletBalanceCents,
    piggyBankBalanceCents: incomeSources.piggyBankBalanceCents,
    incomeSourcesLoading: incomeSources.loading,
    incomeSources: incomeSources.sources,
    loading: incomeSources.loading || goals.loading || transactions.transactionsLoading,
    reload,
    userName: getUserDisplayName(session?.user.user_metadata),
  };
}
