import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Banknote,
  BanknoteArrowDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Funnel,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp as TrendingUpIcon,
} from "lucide-react-native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import type { FamilyMember } from "@/src/features/family/model/family-invitation";
import { listFamilyMembers } from "@/src/features/family/repository/family-invitations-remote-repository";
import { TransactionCreatorAvatar } from "@/src/features/transactions/components/transaction-creator-avatar";
import { TransactionDetailModal } from "@/src/features/transactions/components/transaction-detail-modal";
import { getCreditCardInstallmentLabel } from "@/src/features/transactions/model/credit-card-billing";
import { filterExpenses } from "@/src/features/transactions/model/expense-list";
import {
  getExpenseMonthLabel,
  getExpenseSavingsComparedToPreviousMonth,
  getExpenseTotalForMonth,
} from "@/src/features/transactions/model/expense-summary";
import { createExpenseSwipeActions } from "@/src/features/transactions/model/expense-swipe-actions";
import {
  getPaymentMethodLabel,
  type Transaction,
} from "@/src/features/transactions/model/transaction";
import { ExpenseNewView } from "@/src/features/transactions/view/expense-new-view";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { GooeySearchTabs } from "@/src/shared/components/base/molecules/gooey-search-tabs";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { formatCurrencyFromCents } from "@/src/shared/utils/money";

export function TransactionsView() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Transaction | undefined>();
  const [detailExpense, setDetailExpense] = useState<Transaction | undefined>();
  const [query, setQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<"all" | "paid" | "pending">(
    "all",
  );
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>();
  const [draftMonth, setDraftMonth] = useState(selectedMonth);
  const [draftPaymentStatus, setDraftPaymentStatus] = useState<"all" | "paid" | "pending">("all");
  const [draftAuthorId, setDraftAuthorId] = useState<string>();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);
  const viewModel = useTransactionsViewModel();
  const expenseMonthLabel = getExpenseMonthLabel(selectedMonth);
  const monthlyExpenseCents = getExpenseTotalForMonth(viewModel.transactions, selectedMonth);
  const expenseSavingsCents = getExpenseSavingsComparedToPreviousMonth(
    viewModel.transactions,
    selectedMonth,
  );
  const previousMonthLabel = format(addMonths(selectedMonth, -1), "MMMM", { locale: ptBR });
  useEffect(() => {
    void listFamilyMembers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, []);
  const expenses = useMemo(
    () =>
      filterExpenses(viewModel.transactions, {
        authorId: selectedAuthorId,
        month: selectedMonth,
        paymentStatus: selectedPaymentStatus,
        query,
      }),
    [query, selectedAuthorId, selectedMonth, selectedPaymentStatus, viewModel.transactions],
  );

  const openFilters = () => {
    setDraftMonth(selectedMonth);
    setDraftPaymentStatus(selectedPaymentStatus);
    setDraftAuthorId(selectedAuthorId);
    setFilterVisible(true);
  };

  const renderExpense = useCallback(
    ({ item }: { item: Transaction }) => (
      <ExpenseCard
        expense={item}
        onDelete={() => void viewModel.removeExpense(item.id)}
        onEdit={() => {
          setSelectedExpense(item);
          setDrawerVisible(true);
        }}
        onOpen={(swipeable) => {
          if (openSwipeableRef.current && openSwipeableRef.current !== swipeable) {
            openSwipeableRef.current.close();
          }
          openSwipeableRef.current = swipeable;
        }}
        onClose={(swipeable) => {
          if (openSwipeableRef.current === swipeable) openSwipeableRef.current = null;
        }}
        onPress={() => setDetailExpense(item)}
      />
    ),
    [viewModel.removeExpense],
  );

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.content}
        data={expenses}
        decelerationRate="normal"
        initialNumToRender={10}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          viewModel.transactionsLoading ? (
            <LoadingShimmer rows={3} />
          ) : (
            <View style={styles.empty}>
              <BanknoteArrowDown color={colors.mutedLight} size={26} />
              <Text style={styles.emptyTitle}>Nenhuma despesa neste mês</Text>
              <Text style={styles.emptyText}>Use o filtro para consultar outro período.</Text>
            </View>
          )
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
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
                <Text numberOfLines={1} style={styles.summaryLabel}>
                  {expenseMonthLabel}
                </Text>
                <AnimatedCurrency style={styles.summaryValue} valueInCents={-monthlyExpenseCents} />
                <View style={styles.summaryTrend}>
                  <TrendingUpIcon />
                  <Text style={styles.summaryTrendText}>
                    {expenseSavingsCents === null
                      ? `Sem dados de ${previousMonthLabel}`
                      : expenseSavingsCents >= 0
                        ? `Economia de ${formatCurrencyFromCents(expenseSavingsCents)} em relação a ${previousMonthLabel}`
                        : `${formatCurrencyFromCents(Math.abs(expenseSavingsCents))} a mais que ${previousMonthLabel}`}
                  </Text>
                </View>
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
            <View style={styles.expenseHeader}>
              <View>
                <Text style={styles.expenseTitle}>Suas despesas</Text>
                <Text style={styles.expenseSubtitle}>
                  Acompanhe cada lançamento com seus detalhes
                </Text>
              </View>
              <ExpenseActions
                onAdd={() => setDrawerVisible(true)}
                onFilter={openFilters}
                onQueryChange={(value) => {
                  setQuery(value);
                }}
                query={query}
              />
            </View>
          </View>
        }
        maxToRenderPerBatch={10}
        refreshControl={
          <RefreshControl
            colors={[colors.darkPink]}
            onRefresh={viewModel.reloadTransactions}
            refreshing={viewModel.transactionsLoading}
            tintColor={colors.darkPink}
          />
        }
        renderItem={renderExpense}
        removeClippedSubviews
        updateCellsBatchingPeriod={16}
        windowSize={9}
      />
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
      <Modal
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
        transparent
        visible={filterVisible}
      >
        <Pressable onPress={() => setFilterVisible(false)} style={styles.filterBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.filterSheet}>
            <Text style={styles.filterTitle}>Filtrar despesas</Text>
            <Text style={styles.filterLabel}>Mês de registro</Text>
            <View style={styles.monthSelector}>
              <Pressable
                onPress={() => setDraftMonth(addMonths(draftMonth, -1))}
                style={styles.monthButton}
              >
                <ChevronLeft color={colors.text} size={20} />
              </Pressable>
              <Text style={styles.monthFilterLabel}>
                {format(draftMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </Text>
              <Pressable
                onPress={() => setDraftMonth(addMonths(draftMonth, 1))}
                style={styles.monthButton}
              >
                <ChevronRight color={colors.text} size={20} />
              </Pressable>
            </View>
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {(["all", "paid", "pending"] as const).map((status) => (
                <Pressable
                  key={status}
                  onPress={() => setDraftPaymentStatus(status)}
                  style={[
                    styles.statusOption,
                    draftPaymentStatus === status && styles.statusOptionSelected,
                  ]}
                >
                  <Text style={styles.statusOptionText}>
                    {status === "all" ? "Todos" : status === "paid" ? "Pago" : "Pendente"}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.filterLabel}>Autor</Text>
            <View style={styles.memberList}>
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
                </Pressable>
              ))}
            </View>
            <View style={styles.filterFooter}>
              <Pressable
                onPress={() => {
                  setSelectedMonth(new Date());
                  setSelectedPaymentStatus("all");
                  setSelectedAuthorId(undefined);
                  setFilterVisible(false);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSelectedMonth(draftMonth);
                  setSelectedPaymentStatus(draftPaymentStatus);
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
    </View>
  );
}

function formatRegisteredDate(value: string): string {
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

const ExpenseCard = memo(function ExpenseCard({
  expense,
  onDelete,
  onEdit,
  onClose,
  onOpen,
  onPress,
}: {
  expense: Transaction;
  onDelete: () => void;
  onEdit: () => void;
  onClose: (swipeable: SwipeableMethods) => void;
  onOpen: (swipeable: SwipeableMethods) => void;
  onPress: () => void;
}) {
  const paymentLabel = getPaymentMethodLabel(expense.paymentMethod);
  const installmentLabel = getCreditCardInstallmentLabel(
    expense.purchaseDate,
    expense.installmentCount,
    expense.amountCents,
    expense.occurredAt,
  );
  const paid = expense.paymentStatus === "paid";
  const swipeableRef = useRef<SwipeableMethods | null>(null);
  const actions = createExpenseSwipeActions(() => swipeableRef.current?.close(), onEdit, onDelete);

  return (
    <View style={styles.transactionRow}>
      <ReanimatedSwipeable
        containerStyle={styles.swipeable}
        friction={2}
        leftThreshold={44}
        onSwipeableWillOpen={() => {
          if (swipeableRef.current) onOpen(swipeableRef.current);
        }}
        onSwipeableClose={() => {
          if (swipeableRef.current) onClose(swipeableRef.current);
        }}
        overshootLeft={false}
        overshootRight={false}
        ref={swipeableRef}
        renderLeftActions={() => (
          <SwipeAction icon={Trash2} label="Excluir" onPress={actions.remove} tone="delete" />
        )}
        renderRightActions={() => (
          <SwipeAction icon={Pencil} label="Editar" onPress={actions.edit} tone="edit" />
        )}
        rightThreshold={44}
      >
        <Pressable onPress={onPress} style={styles.transaction}>
          <View style={styles.identity}>
            <TransactionCreatorAvatar size={38} transaction={expense} />
          </View>
          <View style={styles.info}>
            <Text numberOfLines={1} style={styles.name}>
              {expense.title}
            </Text>
            <View style={styles.detailLine}>
              <Banknote color={colors.text} size={15} />
              <Text style={styles.detailText}>
                {installmentLabel ??
                  (paymentLabel ? `Pagamento: ${paymentLabel}` : `Despesa · ${expense.category}`)}
              </Text>
            </View>
            <View style={styles.detailLine}>
              <CalendarDays color={colors.text} size={15} />
              <Text style={styles.detailText}>
                {`Registrada em ${formatRegisteredDate(expense.registeredAt ?? expense.occurredAt)}`}
              </Text>
            </View>
          </View>
          <View style={styles.transactionValue}>
            <View style={[styles.statusChip, paid ? styles.paidChip : styles.pendingChip]}>
              <Text style={paid ? styles.paidTag : styles.pendingTag}>
                {paid ? "Pago" : "Pendente"}
              </Text>
            </View>
            <AnimatedCurrency
              style={[styles.amount, styles.expense]}
              valueInCents={expense.amountCents}
            />
          </View>
        </Pressable>
      </ReanimatedSwipeable>
    </View>
  );
});

function SwipeAction({
  icon: Icon,
  label,
  onPress,
  tone,
}: {
  icon: typeof Pencil;
  label: string;
  onPress: () => void;
  tone: "delete" | "edit";
}) {
  const isDelete = tone === "delete";

  return (
    <Pressable
      accessibilityLabel={`${label} despesa`}
      onPress={onPress}
      style={[styles.swipeAction, isDelete ? styles.deleteAction : styles.editAction]}
    >
      <Icon color={isDelete ? colors.background : colors.text} size={18} strokeWidth={2.25} />
    </Pressable>
  );
}

function ExpenseActions({
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
        placeholder="Buscar despesa"
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
            accessibilityLabel="Filtrar despesas"
            onPress={onFilter}
            style={styles.roundActionButton}
          >
            <Funnel color={colors.text} size={20} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            accessibilityLabel="Adicionar despesa"
            onPress={onAdd}
            style={[styles.roundActionButton, styles.addExpenseTab]}
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
  content: { flexGrow: 1, gap: 14, padding: 20, paddingBottom: 140, paddingTop: 58 },
  listHeader: { gap: 14, marginBottom: 8 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5 },
  summary: { borderRadius: 22, height: 188, overflow: "hidden", position: "relative" },
  summaryImage: {
    height: "100%",
    position: "absolute",
    right: -18,
    resizeMode: "contain",
    width: "58%",
  },
  summaryOverlay: {
    backgroundColor: "#FFF0B8B8",
    height: "100%",
    position: "absolute",
    width: "100%",
  },
  summaryContent: { alignItems: "flex-start", flex: 1, justifyContent: "center", padding: 22 },
  summaryLabel: {
    color: "#8A5A00",
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  summaryValue: { color: "#7A4F00", fontFamily: fonts.extraBold, fontSize: 38 },
  summaryTrend: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 18,
    flexDirection: "row",
    gap: 7,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  summaryTrendText: { color: colors.walletDark, fontFamily: fonts.bold, fontSize: 12 },
  notice: { backgroundColor: colors.surfaceMuted, borderRadius: 12, gap: 5, padding: 12 },
  noticeText: { color: colors.muted, fontSize: 12 },
  retry: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  empty: { alignItems: "center", gap: 8, paddingTop: 28 },
  emptyTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  emptyText: { color: colors.muted, fontSize: 14 },
  group: { gap: 8, marginTop: 0 },
  expenseHeader: {
    alignItems: "stretch",
    marginBottom: 4,
  },
  transactionRow: { alignItems: "center", flexDirection: "row", gap: 8, marginBottom: 8 },
  swipeable: { borderRadius: 22, flex: 1, overflow: "hidden" },
  swipeAction: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginHorizontal: 12,
    minWidth: 44,
    paddingHorizontal: 0,
    width: 44,
  },
  deleteAction: { backgroundColor: colors.negative },
  editAction: { backgroundColor: colors.surfaceMuted },
  actions: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 10,
    width: "100%",
  },
  gooeySearch: { alignSelf: "flex-end", backgroundColor: colors.surfaceMuted, borderRadius: 23 },
  roundActionButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 23,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  addExpenseTab: { backgroundColor: colors.accent, borderRadius: 23 },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#F7F9E9",
    borderColor: "#E8ECCF",
    borderRadius: 15,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  pendingTag: {
    color: "#8A5A00",
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  paidTag: {
    color: colors.positive,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  statusChip: { borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  pendingChip: { backgroundColor: "#FFF0B8" },
  paidChip: { backgroundColor: "#E0F6D5" },
  expenseTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 22 },
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
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    flex: 1,
    minHeight: 104,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  identity: { alignItems: "center", justifyContent: "center", width: 38 },
  info: { flex: 1, gap: 5, marginLeft: 12, minWidth: 0 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  meta: { color: colors.muted, fontSize: 12 },
  detailLine: { alignItems: "center", flexDirection: "row", gap: 5 },
  detailText: { color: colors.text, flex: 1, fontSize: 12 },
  transactionValue: {
    alignItems: "flex-end",
    gap: 8,
    justifyContent: "center",
    marginLeft: 6,
    minWidth: 104,
  },
  amount: { fontFamily: fonts.extraBold, fontSize: 16, lineHeight: 20 },
  expense: { color: colors.negative },
  income: { color: colors.positive },
  searchField: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  searchInput: { color: colors.text, flex: 1, fontSize: 14, padding: 0 },
  monthSelector: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
  },
  monthButton: { alignItems: "center", height: 32, justifyContent: "center", width: 32 },
  monthFilterLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
    textTransform: "capitalize",
  },
  filterBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  filterSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 12,
    padding: 20,
    paddingBottom: 34,
  },
  filterTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 22 },
  filterLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, marginTop: 4 },
  statusOptions: { flexDirection: "row", gap: 8 },
  statusOption: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  statusOptionSelected: { backgroundColor: "#EDFFD3", borderColor: colors.accent },
  statusOptionText: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  memberList: { gap: 8 },
  memberOption: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, padding: 10 },
  memberOptionSelected: { backgroundColor: "#EDFFD3", borderColor: colors.accent },
  memberName: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
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
  listLoading: { marginVertical: 16 },
  drawerBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  drawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    overflow: "hidden",
  },
});
