import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Banknote,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Funnel,
  PiggyBank,
  Plus,
  Search,
  Shapes,
  Trash2,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { FamilyMember } from "@/src/features/family/model/family-invitation";
import { listFamilyMembers } from "@/src/features/family/repository/family-invitations-remote-repository";
import type { IncomeSource } from "@/src/features/income-sources/model/income-source";
import { incomeSourceKindLabel } from "@/src/features/income-sources/model/income-source";
import { filterIncomeSources } from "@/src/features/income-sources/model/income-source-list";
import { IncomeSourceNewView } from "@/src/features/income-sources/view/income-source-new-view";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import { TransactionCreatorAvatar } from "@/src/features/transactions/components/transaction-creator-avatar";
import { BalanceResetConfirmationModal } from "@/src/features/wallet/components/balance-reset-confirmation-modal";
import { getBalanceMonthLabel } from "@/src/features/wallet/model/balance-label";
import { WalletBanner } from "@/src/features/wallet/view/wallet-banner";
import { WalletTransferView } from "@/src/features/wallet/view/wallet-transfer-view";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { GooeySearchTabs } from "@/src/shared/components/base/molecules/gooey-search-tabs";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function IncomeSourcesView() {
  const viewModel = useIncomeSourcesViewModel();
  const piggyBankLabel = getBalanceMonthLabel("piggy_bank");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedSource, setSelectedSource] = useState<IncomeSource | undefined>();
  const [transferDirection, setTransferDirection] = useState<
    "to_piggy_bank" | "from_piggy_bank" | null
  >(null);
  const [resetTarget, setResetTarget] = useState<"wallet" | "piggy_bank" | null>(null);
  const [query, setQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>();
  const [draftMonth, setDraftMonth] = useState(selectedMonth);
  const [draftAuthorId, setDraftAuthorId] = useState<string>();
  const [members, setMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    void listFamilyMembers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, []);

  const sources = useMemo(
    () =>
      filterIncomeSources(viewModel.sources, {
        authorId: selectedAuthorId,
        month: selectedMonth,
        query,
      }),
    [query, selectedAuthorId, selectedMonth, viewModel.sources],
  );
  const openFilters = () => {
    setDraftMonth(selectedMonth);
    setDraftAuthorId(selectedAuthorId);
    setFilterVisible(true);
  };

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
            <Text style={styles.balanceEyebrow}>{piggyBankLabel}</Text>
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
          <Text style={styles.sectionSubtitle}>De onde veio seu dinheiro esse mês</Text>
        </View>
      </View>
      <IncomeSourceActions
        onAdd={() => {
          setSelectedSource(undefined);
          setTransferDirection(null);
          setDrawerVisible(true);
        }}
        onFilter={openFilters}
        onQueryChange={setQuery}
        query={query}
      />

      {viewModel.loading && viewModel.sources.length === 0 ? <LoadingShimmer rows={2} /> : null}
      {!viewModel.loading && sources.length === 0 ? (
        <View style={styles.empty}>
          <PiggyBank color={colors.mutedLight} size={26} />
          <Text style={styles.emptyTitle}>Nenhuma fonte encontrada</Text>
          <Text style={styles.emptyText}>
            Ajuste a busca ou os filtros para encontrar uma fonte.
          </Text>
        </View>
      ) : (
        sources.map((source) => (
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
              <Text
                style={styles.sourceDate}
              >{`Registrada em ${formatRegisteredDate(source.registeredAt)}`}</Text>
            </View>
            <AnimatedCurrency style={styles.sourceAmount} valueInCents={source.amountCents} />
            <TransactionCreatorAvatar
              transaction={{
                id: `income-source:${source.id}`,
                accountId: "",
                title: source.name,
                category: incomeSourceKindLabel(source.kind),
                amountCents: source.amountCents,
                occurredAt: source.registeredAt,
                registeredAt: source.registeredAt,
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
          style={styles.drawerBackdrop}
        >
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
                onSave={async (name, amountCents, kind) => {
                  if (!selectedSource) {
                    setDrawerVisible(false);
                    setSelectedSource(undefined);
                  }
                  await (selectedSource
                    ? viewModel.updateSource({ ...selectedSource, name, amountCents, kind })
                    : viewModel.createSource(name, amountCents, kind));
                }}
                onDelete={viewModel.removeSource}
              />
            )}
          </View>
        </KeyboardAvoidingView>
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
      <Modal
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
        transparent
        visible={filterVisible}
      >
        <Pressable onPress={() => setFilterVisible(false)} style={styles.filterBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.filterSheet}>
            <Text style={styles.filterTitle}>Filtrar fontes de renda</Text>
            <Text style={styles.filterLabel}>Mês de registro</Text>
            <View style={styles.monthSelector}>
              <Pressable
                onPress={() => setDraftMonth(addMonths(draftMonth, -1))}
                style={styles.monthControl}
              >
                <ChevronLeft color={colors.text} size={20} />
              </Pressable>
              <Text style={styles.monthLabel}>
                {format(draftMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </Text>
              <Pressable
                onPress={() => setDraftMonth(addMonths(draftMonth, 1))}
                style={styles.monthControl}
              >
                <ChevronRight color={colors.text} size={20} />
              </Pressable>
            </View>
            <Text style={styles.filterLabel}>Autor</Text>
            <ScrollView contentContainerStyle={styles.memberList} style={styles.memberScroll}>
              <Pressable
                onPress={() => setDraftAuthorId(undefined)}
                style={[styles.memberOption, !draftAuthorId && styles.memberOptionSelected]}
              >
                <Text style={styles.memberName}>Todos os membros</Text>
              </Pressable>
              {members.map((member) => (
                <Pressable
                  key={member.id}
                  onPress={() => setDraftAuthorId(member.id)}
                  style={[
                    styles.memberOption,
                    draftAuthorId === member.id && styles.memberOptionSelected,
                  ]}
                >
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.filterFooter}>
              <Pressable
                onPress={() => {
                  setSelectedAuthorId(undefined);
                  setSelectedMonth(new Date());
                  setFilterVisible(false);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelectedMonth(draftMonth);
                  setSelectedAuthorId(draftAuthorId);
                  setFilterVisible(false);
                }}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Aplicar filtros</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function IncomeSourceIcon({ kind }: { kind: "salary" | "investment" | "other" }) {
  const Icon = kind === "salary" ? Banknote : kind === "investment" ? ChartNoAxesCombined : Shapes;
  return <Icon color={colors.darkPink} size={20} />;
}

function formatRegisteredDate(value: string) {
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

function IncomeSourceActions({
  onAdd,
  onFilter,
  onQueryChange,
  query,
}: {
  onAdd: () => void;
  onFilter: () => void;
  onQueryChange: (value: string) => void;
  query: string;
}) {
  const [availableWidth, setAvailableWidth] = useState(0);
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <View
      onLayout={(event) => setAvailableWidth(event.nativeEvent.layout.width)}
      style={styles.actions}
    >
      <GooeySearchTabs
        colorScheme={{
          bg: colors.surfaceMuted,
          fg: colors.text,
          indicator: colors.border,
          muted: colors.mutedLight,
        }}
        expandedWidth={availableWidth}
        intensity={0.2}
        onChange={onQueryChange}
        onExpandedChange={(expanded) => {
          setSearchExpanded(expanded);
          if (!expanded) onQueryChange("");
        }}
        placeholder="Buscar fonte"
        springConfig={{ damping: 12, mass: 0.5, stiffness: 150 }}
        style={styles.gooeySearch}
        value={query}
      >
        <GooeySearchTabs.Trigger>
          <Search color={colors.text} size={20} strokeWidth={2.2} />
        </GooeySearchTabs.Trigger>
      </GooeySearchTabs>
      {!searchExpanded ? (
        <>
          <Pressable
            accessibilityLabel="Filtrar fontes de renda"
            onPress={onFilter}
            style={styles.roundActionButton}
          >
            <Funnel color={colors.text} size={20} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            accessibilityLabel="Adicionar fonte de renda"
            onPress={onAdd}
            style={[styles.roundActionButton, styles.addSourceTab]}
          >
            <Plus color={colors.text} size={22} strokeWidth={2.5} />
          </Pressable>
        </>
      ) : null}
    </View>
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
    marginTop: 2,
  },
  sectionTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18 },
  sectionSubtitle: { color: colors.muted, fontSize: 12, marginTop: 3 },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: -8,
    width: "100%",
  },
  gooeySearch: { backgroundColor: colors.surfaceMuted, borderRadius: 23 },
  roundActionButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  addSourceTab: { backgroundColor: colors.accent, borderRadius: 23 },
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
  sourceDate: { color: colors.muted, fontSize: 11 },
  sourceAmount: { color: colors.positive, fontFamily: fonts.bold, fontSize: 14 },
  empty: { alignItems: "center", gap: 8, paddingTop: 28 },
  emptyTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  emptyText: { color: colors.muted, fontSize: 14 },
  drawerBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  drawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    overflow: "hidden",
  },
  filterBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  filterSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 14,
    padding: 20,
    paddingBottom: 34,
  },
  filterTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 22 },
  filterLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, marginTop: 4 },
  monthSelector: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
  },
  monthControl: { alignItems: "center", height: 38, justifyContent: "center", width: 38 },
  monthLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    textTransform: "capitalize",
  },
  memberScroll: { maxHeight: 150 },
  memberList: { gap: 8 },
  memberOption: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, padding: 12 },
  memberOptionSelected: { backgroundColor: "#EDFFD3", borderColor: colors.accent },
  memberName: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  memberEmail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  filterFooter: { flexDirection: "row", gap: 12, marginTop: 4 },
  clearButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    height: 46,
    justifyContent: "center",
  },
  clearButtonText: { color: colors.text, fontFamily: fonts.bold },
  applyButton: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    flex: 1.5,
    height: 46,
    justifyContent: "center",
  },
  applyButtonText: { color: colors.text, fontFamily: fonts.bold },
});
