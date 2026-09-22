import { ShoppingCart, WalletCards } from "lucide-react-native";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ExpenseNewView } from "@/src/features/transactions/view/expense-new-view";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function TransactionsView() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const viewModel = useTransactionsViewModel();

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
      </View>
      <View style={styles.summary}>
        <Image
          accessibilityIgnoresInvertColors
          source={require("../../../../assets/images/expenses.png")}
          style={styles.summaryImage}
        />
        <View style={styles.summaryOverlay} />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>SALDO DE DESPESAS</Text>
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
        </View>
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
      ) : viewModel.transactions.length === 0 ? (
        <Text style={styles.empty}>Ainda não há despesas registradas.</Text>
      ) : (
        <View style={styles.group}>
          <View style={styles.expenseHeader}>
            <Text style={styles.expenseTitle}>Suas despesas</Text>
            <Pressable onPress={() => setDrawerVisible(true)}>
              <Text style={styles.registerLink}>+ Registrar</Text>
            </Pressable>
          </View>
          {viewModel.transactions
            .filter((transaction) => transaction.amountCents < 0)
            .map((transaction) => (
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
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5 },
  summary: { borderRadius: 22, height: 188, overflow: "hidden", position: "relative" },
  summaryImage: { height: "100%", position: "absolute", width: "100%" },
  summaryOverlay: {
    backgroundColor: "#FFF0B8B8",
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  summaryContent: { alignItems: "center", flex: 1, justifyContent: "center", padding: 18 },
  summaryLabel: {
    color: "#8A5A00",
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  summaryValue: { color: "#7A4F00", fontFamily: fonts.extraBold, fontSize: 34 },
  notice: { backgroundColor: colors.surfaceMuted, borderRadius: 12, gap: 5, padding: 12 },
  noticeText: { color: colors.muted, fontSize: 12 },
  retry: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  empty: { color: colors.muted, fontSize: 14, paddingTop: 28, textAlign: "center" },
  group: { gap: 8, marginTop: 0 },
  expenseHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  expenseTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18 },
  registerLink: { color: colors.muted, fontFamily: fonts.bold, fontSize: 12 },
  transaction: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 64,
    paddingHorizontal: 12,
  },
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
