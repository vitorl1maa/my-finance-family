import {
  Banknote,
  ChartNoAxesCombined,
  PiggyBank,
  Plus,
  Shapes,
  Trash2,
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
import type { IncomeSource } from "@/src/features/income-sources/model/income-source";
import { incomeSourceKindLabel } from "@/src/features/income-sources/model/income-source";
import { IncomeSourceNewView } from "@/src/features/income-sources/view/income-source-new-view";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import { TransactionCreatorAvatar } from "@/src/features/transactions/components/transaction-creator-avatar";
import { BalanceResetConfirmationModal } from "@/src/features/wallet/components/balance-reset-confirmation-modal";
import { WalletBanner } from "@/src/features/wallet/view/wallet-banner";
import { WalletTransferView } from "@/src/features/wallet/view/wallet-transfer-view";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function IncomeSourcesView() {
  const viewModel = useIncomeSourcesViewModel();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<IncomeSource | undefined>();
  const [transferDirection, setTransferDirection] = useState<
    "to_piggy_bank" | "from_piggy_bank" | null
  >(null);
  const [resetTarget, setResetTarget] = useState<"wallet" | "piggy_bank" | null>(null);

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
          <Text style={styles.title}>Carteira e Cofrinho</Text>
          <Text style={styles.subtitle}>Registre e acompanhe suas finanças</Text>
        </View>
      </View>

      <WalletBanner
        balanceCents={viewModel.walletBalanceCents}
        onReset={() => setResetTarget("wallet")}
        onSave={() => {
          setTransferDirection("to_piggy_bank");
          setDrawerVisible(true);
        }}
        onWithdraw={() => {
          setTransferDirection("from_piggy_bank");
          setDrawerVisible(true);
        }}
      />

      <View style={styles.balanceCard}>
        <Image
          accessibilityIgnoresInvertColors
          source={require("../../../../assets/images/piggy-bank.png")}
          style={styles.cardImage}
        />
        <View style={styles.cardOverlay} />
        <View style={styles.balanceContent}>
          <View style={styles.piggyHeading}>
            <Text style={styles.balanceEyebrow}>SALDO DO COFRINHO</Text>
          </View>
          <View style={styles.piggyBalanceRow}>
            <AnimatedCurrency
              accessibilityLabel="Saldo do cofrinho"
              style={styles.balanceInput}
              valueInCents={viewModel.balanceCents}
            />
            <Pressable
              accessibilityLabel="Zerar saldo do cofrinho"
              onPress={() => setResetTarget("piggy_bank")}
              style={styles.resetButton}
            >
              <Trash2 color={colors.darkPink} size={16} />
            </Pressable>
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
            setTransferDirection(null);
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
              setTransferDirection(null);
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
            <TransactionCreatorAvatar
              transaction={{
                id: `income-source:${source.id}`,
                accountId: "",
                title: source.name,
                category: incomeSourceKindLabel(source.kind),
                amountCents: source.amountCents,
                occurredAt: source.updatedAt,
                registeredAt: source.updatedAt,
                recurrenceRule: "monthly",
                creatorId: source.creatorId,
                creatorName: source.creatorName,
                creatorAvatarUrl: source.creatorAvatarUrl,
                creatorAvatarSeed: source.creatorAvatarSeed,
                syncStatus: source.syncStatus,
              }}
            />
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
          <Pressable
            accessibilityLabel="Fechar fonte de renda"
            onPress={() => {
              setDrawerVisible(false);
              setSelectedSource(undefined);
              setTransferDirection(null);
            }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.drawer}>
            {transferDirection ? (
              <WalletTransferView
                direction={transferDirection}
                onBack={() => {
                  setDrawerVisible(false);
                  setTransferDirection(null);
                }}
                onTransfer={(amountCents) => viewModel.transfer(transferDirection, amountCents)}
              />
            ) : (
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
            )}
          </View>
        </View>
      </Modal>
      <BalanceResetConfirmationModal
        target={resetTarget}
        onCancel={() => setResetTarget(null)}
        onConfirm={() => {
          if (!resetTarget) return;
          void viewModel.resetBalance(resetTarget);
          setResetTarget(null);
        }}
      />
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
  piggyHeading: { alignItems: "center", flexDirection: "row", gap: 7 },
  piggyBalanceRow: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 3 },
  resetButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFFB8",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  balanceInput: {
    color: colors.darkPink,
    fontFamily: fonts.extraBold,
    fontSize: 38,
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
