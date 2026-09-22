import { Search, ShoppingCart, TrendingUp, WalletCards } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  filterTransactions,
  groupTransactionsByDay,
} from "@/src/features/transactions/model/transaction-list";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { SmoothTextInput } from "@/src/shared/components/smooth-text-input";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function AllTransactionsView() {
  const [query, setQuery] = useState("");
  const viewModel = useTransactionsViewModel();
  const groups = useMemo(
    () => groupTransactionsByDay(filterTransactions(viewModel.transactions, query), new Date()),
    [query, viewModel.transactions],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          colors={[colors.darkPink]}
          onRefresh={viewModel.reloadTransactions}
          refreshing={viewModel.transactionsLoading}
          tintColor={colors.darkPink}
        />
      }
      style={styles.screen}
    >
      <Text style={styles.title}>Transações</Text>
      <Text style={styles.subtitle}>Acompanhe tudo que entra e sai</Text>
      <View style={styles.searchBox}>
        <Search color={colors.muted} size={19} />
        <SmoothTextInput
          accessibilityLabel="Buscar transações"
          autoCapitalize="none"
          onChangeText={setQuery}
          placeholder="Buscar por descrição ou categoria"
          placeholderTextColor={colors.mutedLight}
          style={styles.searchInput}
          value={query}
        />
      </View>
      {viewModel.transactionsError ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{viewModel.transactionsError}</Text>
          <Pressable accessibilityRole="button" onPress={viewModel.reloadTransactions}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}
      {viewModel.transactionsLoading && viewModel.transactions.length === 0 ? (
        <LoadingShimmer rows={3} />
      ) : groups.length === 0 ? (
        <View style={styles.empty}>
          <TrendingUp color={colors.mutedLight} size={26} />
          <Text style={styles.emptyTitle}>
            {query ? "Nenhuma transação encontrada" : "Nenhuma transação cadastrada"}
          </Text>
          <Text style={styles.emptyText}>
            {query ? "Tente buscar outro termo." : "Suas entradas e saídas aparecerão aqui."}
          </Text>
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.id} style={styles.group}>
            <Text style={styles.day}>{group.label}</Text>
            {group.transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transaction}>
                <View style={styles.icon}>
                  {transaction.amountCents < 0 ? (
                    <ShoppingCart color={colors.muted} size={20} />
                  ) : (
                    <WalletCards color={colors.muted} size={20} />
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{transaction.title}</Text>
                  <Text style={styles.meta}>
                    {transaction.amountCents < 0 ? "Despesa" : "Receita"} · {transaction.category}
                  </Text>
                </View>
                <AnimatedCurrency
                  style={[
                    styles.amount,
                    transaction.amountCents < 0 ? styles.expense : styles.income,
                  ]}
                  valueInCents={transaction.amountCents}
                />
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { flexGrow: 1, gap: 14, padding: 20, paddingBottom: 140, paddingTop: 58 },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: -10 },
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 14,
  },
  searchInput: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 14, height: 48 },
  notice: { backgroundColor: colors.surfaceMuted, borderRadius: 12, gap: 5, padding: 12 },
  noticeText: { color: colors.muted, fontSize: 12 },
  retry: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  empty: { alignItems: "center", gap: 8, paddingTop: 28 },
  emptyTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center" },
  group: { gap: 8, marginTop: 4 },
  day: { color: colors.mutedLight, fontFamily: fonts.bold, fontSize: 12 },
  transaction: { alignItems: "center", flexDirection: "row", minHeight: 54 },
  icon: { width: 38 },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12 },
  amount: { fontFamily: fonts.bold, fontSize: 14 },
  expense: { color: colors.negative },
  income: { color: colors.positive },
});
