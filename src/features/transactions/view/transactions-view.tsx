import { Plus, Search, ShoppingCart, WalletCards } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  filterTransactions,
  groupTransactionsByDay,
} from "@/src/features/transactions/model/transaction-list";
import { ExpenseNewView } from "@/src/features/transactions/view/expense-new-view";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { SmoothTextInput } from "@/src/shared/components/smooth-text-input";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function TransactionsView() {
  const [query, setQuery] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Despesas</Text>
          <Text style={styles.subtitle}>Acompanhe tudo que saiu</Text>
        </View>
        <Pressable
          accessibilityLabel="Registrar despesa"
          accessibilityRole="button"
          onPress={() => setDrawerVisible(true)}
          style={styles.addButton}
        >
          <Plus color={colors.text} size={22} strokeWidth={2.4} />
          <Text style={styles.addLabel}>Registrar</Text>
        </Pressable>
      </View>
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
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>DESPESAS DO MÊS</Text>
        <AnimatedCurrency
          style={styles.summaryValue}
          valueInCents={
            -viewModel.transactions.reduce(
              (total, transaction) =>
                total + (transaction.amountCents < 0 ? Math.abs(transaction.amountCents) : 0),
              0,
            )
          }
        />
        <Text style={styles.summaryHint}>Total registrado neste período</Text>
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
        <Text style={styles.empty}>
          {query ? "Nenhuma transação encontrada." : "Ainda não há transações registradas."}
        </Text>
      ) : (
        groups.map((group) => (
          <View key={group.id} style={styles.group}>
            <Text style={styles.day}>{group.label}</Text>
            {group.transactions.map((transaction) => (
              <View key={transaction.id} style={styles.transaction}>
                <View style={styles.icon}>
                  <TransactionIcon isExpense={transaction.amountCents < 0} />
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
      <Modal
        animationType="slide"
        onRequestClose={() => setDrawerVisible(false)}
        transparent
        visible={drawerVisible}
      >
        <View style={styles.drawerBackdrop}>
          <View style={styles.drawer}>
            <ExpenseNewView onBack={() => setDrawerVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function TransactionIcon({ isExpense }: { isExpense: boolean }) {
  return isExpense ? (
    <ShoppingCart color={colors.muted} size={20} />
  ) : (
    <WalletCards color={colors.muted} size={20} />
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { flexGrow: 1, gap: 14, padding: 20, paddingBottom: 140, paddingTop: 58 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: -10 },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  addLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  searchBox: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 14,
  },
  searchInput: { color: colors.text, flex: 1, fontFamily: fonts.regular, fontSize: 14, height: 48 },
  summary: { backgroundColor: "#FFF0F2", borderRadius: 20, gap: 6, padding: 16 },
  summaryLabel: {
    color: colors.darkPink,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  summaryValue: { color: colors.darkPink, fontFamily: fonts.extraBold, fontSize: 30 },
  summaryHint: { color: colors.darkPink, fontSize: 11 },
  notice: { backgroundColor: colors.surfaceMuted, borderRadius: 12, gap: 5, padding: 12 },
  noticeText: { color: colors.muted, fontSize: 12 },
  retry: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  empty: { color: colors.muted, fontSize: 14, paddingTop: 28, textAlign: "center" },
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
  drawerBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  drawer: { backgroundColor: colors.background, maxHeight: "92%", minHeight: "82%" },
});
