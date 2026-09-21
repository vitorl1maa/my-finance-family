import { PiggyBank, Plus, RefreshCw, WalletCards } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { incomeSourceKindLabel } from "@/src/features/income-sources/model/income-source";
import { IncomeSourceNewView } from "@/src/features/income-sources/view/income-source-new-view";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import {
  formatBrlInput,
  formatCurrencyFromCents,
  parseBrlInputToCents,
} from "@/src/shared/utils/money";

export function IncomeSourcesView() {
  const viewModel = useIncomeSourcesViewModel();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [balance, setBalance] = useState(formatCurrencyFromCents(0));
  const [balanceReady, setBalanceReady] = useState(false);

  useEffect(() => {
    if (!viewModel.balanceLoading) {
      setBalance(formatCurrencyFromCents(viewModel.balanceCents));
      setBalanceReady(true);
    }
  }, [viewModel.balanceCents, viewModel.balanceLoading]);

  useEffect(() => {
    if (viewModel.balanceLoading || !balanceReady) return;

    const timeout = setTimeout(() => {
      void viewModel.saveBalance(parseBrlInputToCents(balance));
    }, 10_000);

    return () => clearTimeout(timeout);
  }, [balance, balanceReady, viewModel.balanceLoading, viewModel.saveBalance]);

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cofrinho</Text>
          <Text style={styles.subtitle}>Registre e acompanhe suas finanças</Text>
        </View>
        <Pressable
          accessibilityLabel="Registrar fonte de renda"
          accessibilityRole="button"
          onPress={() => setDrawerVisible(true)}
          style={styles.registerButton}
        >
          <Plus color={colors.text} size={24} strokeWidth={2.4} />
        </Pressable>
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
          <TextInput
            accessibilityLabel="Saldo do cofrinho"
            keyboardType="decimal-pad"
            onChangeText={(value) => setBalance(formatBrlInput(value))}
            style={styles.balanceInput}
            value={balance}
          />
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
          onPress={() => setDrawerVisible(true)}
          style={styles.addButton}
        >
          <Plus color={colors.text} size={18} />
        </Pressable>
      </View>

      {viewModel.error ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{viewModel.error}</Text>
          <Pressable accessibilityRole="button" onPress={viewModel.reload} style={styles.retry}>
            <RefreshCw color={colors.text} size={15} />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}
      {viewModel.loading && viewModel.sources.length === 0 ? <LoadingShimmer rows={2} /> : null}
      {!viewModel.loading && viewModel.sources.length === 0 ? (
        <View style={styles.empty}>
          <PiggyBank color={colors.mutedLight} size={26} />
          <Text style={styles.emptyTitle}>Nenhuma fonte cadastrada</Text>
          <Text style={styles.emptyText}>Adicione sua primeira fonte de renda.</Text>
        </View>
      ) : (
        viewModel.sources.map((source) => (
          <View key={source.id} style={styles.sourceRow}>
            <View style={styles.sourceIcon}>
              <WalletCards color={colors.darkPink} size={20} />
            </View>
            <View style={styles.sourceInfo}>
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceMeta}>{incomeSourceKindLabel(source.kind)}</Text>
            </View>
            <AnimatedCurrency style={styles.sourceAmount} valueInCents={source.amountCents} />
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
            <IncomeSourceNewView
              onBack={() => setDrawerVisible(false)}
              onSave={viewModel.createSource}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
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
    fontSize: 12,
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
  notice: { backgroundColor: colors.surfaceMuted, borderRadius: 14, gap: 8, padding: 12 },
  noticeText: { color: colors.muted, fontSize: 12 },
  retry: { alignItems: "center", flexDirection: "row", gap: 6 },
  retryText: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  empty: { alignItems: "center", gap: 7, padding: 24 },
  emptyTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  emptyText: { color: colors.muted, fontSize: 12 },
  drawerBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  drawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "88%",
    overflow: "hidden",
  },
});
