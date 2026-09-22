import { Banknote, ChartNoAxesCombined, PiggyBank, Plus, Shapes } from "lucide-react-native";
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
import type { IncomeSource } from "@/src/features/income-sources/model/income-source";
import { incomeSourceKindLabel } from "@/src/features/income-sources/model/income-source";
import { IncomeSourceNewView } from "@/src/features/income-sources/view/income-source-new-view";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function IncomeSourcesView() {
  const viewModel = useIncomeSourcesViewModel();
  const transactions = useTransactionsViewModel();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<IncomeSource | undefined>();
  const balanceCents =
    viewModel.totalCents -
    transactions.transactions.reduce(
      (total, transaction) =>
        total + (transaction.isExpense ? Math.abs(transaction.amountCents) : 0),
      0,
    );
  const incomeCents = viewModel.totalCents;
  const expenseCents = transactions.transactions.reduce(
    (total, transaction) =>
      total + (transaction.amountCents < 0 ? Math.abs(transaction.amountCents) : 0),
    0,
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          colors={[colors.darkPink]}
          onRefresh={viewModel.reload}
          refreshing={viewModel.loading && viewModel.sources.length > 0}
          tintColor={colors.darkPink}
        />
      }
      style={styles.screen}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cofrinho</Text>
          <Text style={styles.subtitle}>Registre e acompanhe suas finanças</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Image
          accessibilityIgnoresInvertColors
          source={require("../../../../assets/images/piggy-bank.png")}
          style={styles.cardImage}
        />
        <View style={styles.cardOverlay} />
        <View style={styles.balanceContent}>
          <Text style={styles.balanceEyebrow}>SALDO DO COFRINHO</Text>
          <AnimatedCurrency
            accessibilityLabel="Saldo do cofrinho"
            style={styles.balanceInput}
            valueInCents={balanceCents}
          />
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Entradas</Text>
              <AnimatedCurrency style={styles.incomeAmount} valueInCents={incomeCents} />
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Saídas</Text>
              <AnimatedCurrency style={styles.expenseAmount} valueInCents={-expenseCents} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Fontes de renda</Text>
          <Text style={styles.sectionSubtitle}>De onde vem o seu dinheiro</Text>
        </View>
        <Pressable
          accessibilityLabel="Adicionar fonte de renda"
          accessibilityRole="button"
          onPress={() => {
            setSelectedSource(undefined);
            setDrawerVisible(true);
          }}
          style={styles.addButton}
        >
          <Plus color={colors.text} size={18} />
        </Pressable>
      </View>

      {viewModel.loading && viewModel.sources.length === 0 ? <LoadingShimmer rows={2} /> : null}
      {!viewModel.loading && viewModel.sources.length === 0 ? (
        <View style={styles.empty}>
          <PiggyBank color={colors.mutedLight} size={26} />
          <Text style={styles.emptyTitle}>Nenhuma fonte cadastrada</Text>
          <Text style={styles.emptyText}>Adicione sua primeira fonte de renda.</Text>
        </View>
      ) : (
        viewModel.sources.map((source) => (
          <Pressable
            key={source.id}
            onPress={() => {
              setSelectedSource(source);
              setDrawerVisible(true);
            }}
            style={styles.sourceRow}
          >
            <View style={styles.sourceIcon}>
              <IncomeSourceIcon kind={source.kind} />
            </View>
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceMeta}>{incomeSourceKindLabel(source.kind)}</Text>
            </View>
            <AnimatedCurrency style={styles.sourceAmount} valueInCents={source.amountCents} />
          </Pressable>
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
            <IncomeSourceNewView
              initialSource={selectedSource}
              onBack={() => {
                setDrawerVisible(false);
                setSelectedSource(undefined);
              }}
              onSave={(name, amountCents, kind) =>
                selectedSource
                  ? viewModel.updateSource({ ...selectedSource, name, amountCents, kind })
                  : viewModel.createSource(name, amountCents, kind)
              }
              onDelete={viewModel.removeSource}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function IncomeSourceIcon({ kind }: { kind: "salary" | "investment" | "other" }) {
  const Icon = kind === "salary" ? Banknote : kind === "investment" ? ChartNoAxesCombined : Shapes;
  return <Icon color={colors.darkPink} size={20} />;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.background },
  content: { flexGrow: 1, gap: 16, padding: 20, paddingBottom: 140, paddingTop: 58 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  registerButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: "row",
    gap: 5,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  registerText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  balanceCard: { borderRadius: 22, height: 208, overflow: "hidden", position: "relative" },
  cardImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  cardOverlay: {
    backgroundColor: "#FFE1E8B8",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  balanceContent: { alignItems: "center", flex: 1, justifyContent: "center", padding: 20 },
  balanceEyebrow: {
    color: colors.darkPink,
    fontFamily: fonts.bold,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  balanceInput: {
    color: colors.darkPink,
    fontFamily: fonts.extraBold,
    fontSize: 38,
    marginTop: 3,
    padding: 0,
    textAlign: "center",
  },
  balanceStats: { alignItems: "center", flexDirection: "row", gap: 18, marginTop: 12 },
  balanceStat: { alignItems: "center", gap: 2, minWidth: 100 },
  balanceStatLabel: { color: colors.darkPink, fontFamily: fonts.bold, fontSize: 11 },
  incomeAmount: { color: colors.positive, fontFamily: fonts.bold, fontSize: 14 },
  expenseAmount: { color: colors.negative, fontFamily: fonts.bold, fontSize: 14 },
  balanceDivider: { backgroundColor: colors.darkPink, height: 30, opacity: 0.28, width: 1 },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sectionTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18 },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 16,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  sourceRow: { alignItems: "center", flexDirection: "row", minHeight: 58 },
  sourceIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    height: 40,
    justifyContent: "center",
    marginRight: 12,
    width: 40,
  },
  sourceInfo: { flex: 1, gap: 3 },
  sourceName: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  sourceMeta: { color: colors.muted, fontSize: 12 },
  sourceAmount: { color: colors.positive, fontFamily: fonts.bold, fontSize: 14 },
  empty: { alignItems: "center", gap: 8, paddingTop: 28 },
  emptyTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  emptyText: { color: colors.muted, fontSize: 14 },
  drawerBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  drawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    overflow: "hidden",
  },
});
