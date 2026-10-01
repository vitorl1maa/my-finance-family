import {
  BanknoteArrowDown,
  Gamepad2,
  House,
  Pencil,
  Plus,
  ShoppingCart,
  Stethoscope,
  Utensils,
} from "lucide-react-native";
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
import { TransactionCreatorAvatar } from "@/src/features/transactions/components/transaction-creator-avatar";
import { TransactionDetailModal } from "@/src/features/transactions/components/transaction-detail-modal";
import {
  getExpenseMonthLabel,
  getExpenseTotalForMonth,
} from "@/src/features/transactions/model/expense-summary";
import {
  getPaymentMethodLabel,
  type Transaction,
} from "@/src/features/transactions/model/transaction";
import { getExpenseCategoryIcon } from "@/src/features/transactions/model/transaction-icon";
import { ExpenseNewView } from "@/src/features/transactions/view/expense-new-view";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function TransactionsView() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Transaction | undefined>();
  const [detailExpense, setDetailExpense] = useState<Transaction | undefined>();
  const viewModel = useTransactionsViewModel();
  const referenceDate = new Date();
  const expenseMonthLabel = getExpenseMonthLabel(referenceDate);
  const monthlyExpenseCents = getExpenseTotalForMonth(viewModel.transactions, referenceDate);

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
          <Text style={styles.summaryLabel}>{expenseMonthLabel}</Text>
          <AnimatedCurrency style={styles.summaryValue} valueInCents={-monthlyExpenseCents} />
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
        <View style={styles.group}>
          <View style={styles.expenseHeader}>
            <View>
              <Text style={styles.expenseTitle}>Suas despesas</Text>
              <Text style={styles.expenseSubtitle}>Acompanhe tudo que saiu esse mês</Text>
            </View>
            <Pressable
              accessibilityLabel="Adicionar nova despesa"
              accessibilityRole="button"
              onPress={() => setDrawerVisible(true)}
              style={styles.addExpenseButton}
            >
              <Plus color={colors.text} size={20} strokeWidth={2.5} />
            </Pressable>
          </View>
          <View style={styles.empty}>
            <BanknoteArrowDown color={colors.mutedLight} size={26} />
            <Text style={styles.emptyTitle}>Nenhuma despesa cadastrada</Text>
            <Text style={styles.emptyText}>Adicione sua primeira despesa.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.group}>
          <View style={styles.expenseHeader}>
            <View>
              <Text style={styles.expenseTitle}>Suas despesas</Text>
              <Text style={styles.expenseSubtitle}>Acompanhe tudo que saiu esse mês</Text>
            </View>
            <Pressable
              accessibilityLabel="Adicionar nova despesa"
              accessibilityRole="button"
              onPress={() => setDrawerVisible(true)}
              style={styles.addExpenseButton}
            >
              <Plus color={colors.text} size={20} strokeWidth={2.5} />
            </Pressable>
          </View>
          {viewModel.transactions
            .filter((transaction) => transaction.amountCents < 0)
            .map((transaction) => (
              <View key={transaction.id} style={styles.transactionRow}>
                <Pressable onPress={() => setDetailExpense(transaction)} style={styles.transaction}>
                  <View style={styles.icon}>
                    <TransactionIcon category={transaction.category} />
                  </View>
                  <View style={styles.info}>
                    <Text numberOfLines={1} style={styles.name}>
                      {transaction.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.meta}>
                      Despesa · {transaction.category}
                      {getPaymentMethodLabel(transaction.paymentMethod)
                        ? ` · ${getPaymentMethodLabel(transaction.paymentMethod)}`
                        : ""}
                    </Text>
                    <Text
                      style={
                        transaction.paymentStatus === "paid" ? styles.paidTag : styles.pendingTag
                      }
                    >
                      {transaction.paymentStatus === "paid" ? "Pago" : "Pendete"}
                    </Text>
                  </View>
                  <View style={styles.transactionValue}>
                    <AnimatedCurrency
                      style={[styles.amount, styles.expense]}
                      valueInCents={transaction.amountCents}
                    />
                    <TransactionCreatorAvatar transaction={transaction} />
                  </View>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Editar ${transaction.title}`}
                  onPress={() => {
                    setSelectedExpense(transaction);
                    setDrawerVisible(true);
                  }}
                  style={styles.editButton}
                >
                  <Pencil color={colors.muted} size={16} />
                </Pressable>
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
          <Pressable
            accessibilityLabel="Fechar despesa"
            onPress={() => {
              setDrawerVisible(false);
              setSelectedExpense(undefined);
            }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.drawer}>
            <ExpenseNewView
              initialTransaction={selectedExpense}
              onBack={() => {
                setDrawerVisible(false);
                setSelectedExpense(undefined);
              }}
            />
          </View>
        </View>
      </Modal>
      <TransactionDetailModal
        transaction={detailExpense}
        onClose={() => setDetailExpense(undefined)}
        onMarkPaid={viewModel.markExpenseAsPaid}
      />
    </ScrollView>
  );
}

function TransactionIcon({ category }: { category: string }) {
  const Icon = {
    house: House,
    utensils: Utensils,
    stethoscope: Stethoscope,
    "gamepad-2": Gamepad2,
    "shopping-cart": ShoppingCart,
  }[getExpenseCategoryIcon(category)];
  return <Icon color={colors.muted} size={20} />;
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
    fontSize: 14,
    letterSpacing: 0.3,
  },
  summaryValue: { color: "#7A4F00", fontFamily: fonts.extraBold, fontSize: 38 },
  notice: { backgroundColor: colors.surfaceMuted, borderRadius: 12, gap: 5, padding: 12 },
  noticeText: { color: colors.muted, fontSize: 12 },
  retry: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  empty: { alignItems: "center", gap: 8, paddingTop: 28 },
  emptyTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  emptyText: { color: colors.muted, fontSize: 14 },
  group: { gap: 8, marginTop: 0 },
  expenseHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  transactionRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  pendingTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF0B8",
    borderRadius: 6,
    color: "#8A5A00",
    fontFamily: fonts.bold,
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  paidTag: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F6D5",
    borderRadius: 6,
    color: colors.positive,
    fontFamily: fonts.bold,
    fontSize: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  editButton: { alignItems: "center", height: 40, justifyContent: "center", width: 40 },
  expenseTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18 },
  expenseSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  addExpenseButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  transaction: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    flex: 1,
    minHeight: 84,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  icon: { width: 36 },
  info: { flex: 1, gap: 4, minWidth: 0 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12 },
  transactionValue: { alignItems: "flex-end", gap: 8, marginLeft: 8, width: 90 },
  amount: { fontFamily: fonts.bold, fontSize: 13 },
  expense: { color: colors.negative },
  income: { color: colors.positive },
  drawerBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  drawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    overflow: "hidden",
  },
});
