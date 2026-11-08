import { addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Funnel,
  Gamepad2,
  House,
  Pencil,
  Search,
  ShoppingCart,
  Stethoscope,
  Trash2,
  TrendingUp,
  Utensils,
  WalletCards,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
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
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";

import type { FamilyMember } from "@/src/features/family/model/family-invitation";
import { listFamilyMembers } from "@/src/features/family/repository/family-invitations-remote-repository";
import type { IncomeSource } from "@/src/features/income-sources/model/income-source";
import { IncomeSourceNewView } from "@/src/features/income-sources/view/income-source-new-view";
import { useIncomeSourcesViewModel } from "@/src/features/income-sources/view-model/use-income-sources-view-model";
import { TransactionCreatorAvatar } from "@/src/features/transactions/components/transaction-creator-avatar";
import { TransactionDetailModal } from "@/src/features/transactions/components/transaction-detail-modal";
import {
  getPaymentMethodLabel,
  type Transaction,
} from "@/src/features/transactions/model/transaction";
import { getExpenseCategoryIcon } from "@/src/features/transactions/model/transaction-icon";
import {
  filterTransactionsForPeriod,
  groupTransactionsByDay,
  mergeIncomeSourcesIntoTransactions,
} from "@/src/features/transactions/model/transaction-list";
import { ExpenseNewView } from "@/src/features/transactions/view/expense-new-view";
import { useTransactionsViewModel } from "@/src/features/transactions/view-model/use-transactions-view-model";
import { AnimatedCurrency } from "@/src/shared/components/animated-currency";
import { GooeySearchTabs } from "@/src/shared/components/base/molecules/gooey-search-tabs";
import { LoadingShimmer } from "@/src/shared/components/loading-shimmer";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function AllTransactionsView() {
  const [query, setQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [month, setMonth] = useState(() => new Date());
  const [authorId, setAuthorId] = useState<string>();
  const [draftMonth, setDraftMonth] = useState(month);
  const [draftAuthorId, setDraftAuthorId] = useState<string>();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>();
  const [editorVisible, setEditorVisible] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Transaction>();
  const [sourceToEdit, setSourceToEdit] = useState<IncomeSource>();
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);
  const viewModel = useTransactionsViewModel();
  const incomeSources = useIncomeSourcesViewModel();
  const transactions = useMemo(
    () => mergeIncomeSourcesIntoTransactions(viewModel.transactions, incomeSources.sources),
    [incomeSources.sources, viewModel.transactions],
  );
  useEffect(() => {
    void listFamilyMembers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, []);
  const groups = useMemo(
    () =>
      groupTransactionsByDay(
        filterTransactionsForPeriod(transactions, { authorId, month, query }),
        new Date(),
      ),
    [authorId, month, query, transactions],
  );
  const openFilters = () => {
    setDraftMonth(month);
    setDraftAuthorId(authorId);
    setFilterVisible(true);
  };
  const closeEditor = () => {
    setEditorVisible(false);
    setExpenseToEdit(undefined);
    setSourceToEdit(undefined);
  };
  const openEditor = (transaction: Transaction) => {
    const source = getIncomeSourceForTransaction(transaction, incomeSources.sources);
    if (source) {
      setSourceToEdit(source);
      setExpenseToEdit(undefined);
    } else {
      setExpenseToEdit(transaction);
      setSourceToEdit(undefined);
    }
    setEditorVisible(true);
  };
  const removeTransaction = async (transaction: Transaction) => {
    const source = getIncomeSourceForTransaction(transaction, incomeSources.sources);
    if (source) {
      await incomeSources.removeSource(source.id);
      return;
    }
    await viewModel.removeExpense(transaction.id);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          colors={[colors.darkPink]}
          onRefresh={() =>
            void Promise.all([viewModel.reloadTransactions(), incomeSources.reload()])
          }
          refreshing={viewModel.transactionsLoading || incomeSources.loading}
          tintColor={colors.darkPink}
        />
      }
      style={styles.screen}
    >
      <Text style={styles.title}>Transações</Text>
      <Text style={styles.subtitle}>Acompanhe tudo que entra e sai</Text>
      <TransactionActions onFilter={openFilters} onQueryChange={setQuery} query={query} />
      {viewModel.transactionsError ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>{viewModel.transactionsError}</Text>
          <Pressable accessibilityRole="button" onPress={viewModel.reloadTransactions}>
            <Text style={styles.retry}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : null}
      {(viewModel.transactionsLoading || incomeSources.loading) && transactions.length === 0 ? (
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
              <TransactionRow
                key={transaction.id}
                onClose={(swipeable) => {
                  if (openSwipeableRef.current === swipeable) openSwipeableRef.current = null;
                }}
                onDelete={() => void removeTransaction(transaction)}
                onEdit={() => openEditor(transaction)}
                onOpen={(swipeable) => {
                  if (openSwipeableRef.current && openSwipeableRef.current !== swipeable) {
                    openSwipeableRef.current.close();
                  }
                  openSwipeableRef.current = swipeable;
                }}
                onPress={() => setSelectedTransaction(transaction)}
                transaction={transaction}
              />
            ))}
          </View>
        ))
      )}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(undefined)}
      />
      <Modal animationType="slide" onRequestClose={closeEditor} transparent visible={editorVisible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
          style={styles.editorBackdrop}
        >
          <Pressable
            accessibilityLabel="Fechar edição"
            onPress={closeEditor}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.editorDrawer}>
            {expenseToEdit ? (
              <ExpenseNewView initialTransaction={expenseToEdit} onBack={closeEditor} />
            ) : sourceToEdit ? (
              <IncomeSourceNewView
                initialSource={sourceToEdit}
                onBack={closeEditor}
                onDelete={incomeSources.removeSource}
                onSave={(name, amountCents, kind) =>
                  incomeSources.updateSource({ ...sourceToEdit, name, amountCents, kind })
                }
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
        transparent
        visible={filterVisible}
      >
        <Pressable onPress={() => setFilterVisible(false)} style={styles.filterBackdrop}>
          <Pressable onPress={(event) => event.stopPropagation()} style={styles.filterSheet}>
            <Text style={styles.filterTitle}>Filtrar transações</Text>
            <Text style={styles.filterLabel}>Mês de registro</Text>
            <View style={styles.monthSelector}>
              <Pressable
                onPress={() => setDraftMonth(addMonths(draftMonth, -1))}
                style={styles.monthButton}
              >
                <ChevronLeft color={colors.text} size={20} />
              </Pressable>
              <Text style={styles.monthLabel}>
                {format(draftMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </Text>
              <Pressable
                onPress={() => setDraftMonth(addMonths(draftMonth, 1))}
                style={styles.monthButton}
              >
                <ChevronRight color={colors.text} size={20} />
              </Pressable>
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
                  setMonth(new Date());
                  setAuthorId(undefined);
                  setFilterVisible(false);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>Limpar</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMonth(draftMonth);
                  setAuthorId(draftAuthorId);
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

function TransactionActions({
  onFilter,
  onQueryChange,
  query,
}: {
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
        placeholder="Buscar transação"
        style={styles.gooeySearch}
        value={query}
      >
        <GooeySearchTabs.Trigger>
          <Search color={colors.text} size={20} strokeWidth={2.2} />
        </GooeySearchTabs.Trigger>
      </GooeySearchTabs>
      {!searchExpanded ? (
        <Pressable
          accessibilityLabel="Filtrar transações"
          onPress={onFilter}
          style={styles.roundActionButton}
        >
          <Funnel color={colors.text} size={20} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </View>
  );
}

function TransactionRow({
  onClose,
  onDelete,
  onEdit,
  onOpen,
  onPress,
  transaction,
}: {
  onClose: (swipeable: SwipeableMethods) => void;
  onDelete: () => void;
  onEdit: () => void;
  onOpen: (swipeable: SwipeableMethods) => void;
  onPress: () => void;
  transaction: Transaction;
}) {
  const swipeableRef = useRef<SwipeableMethods | null>(null);

  return (
    <ReanimatedSwipeable
      containerStyle={styles.swipeable}
      friction={2}
      leftThreshold={44}
      onSwipeableClose={() => {
        if (swipeableRef.current) onClose(swipeableRef.current);
      }}
      onSwipeableWillOpen={() => {
        if (swipeableRef.current) onOpen(swipeableRef.current);
      }}
      overshootLeft={false}
      overshootRight={false}
      ref={swipeableRef}
      renderLeftActions={() => (
        <TransactionSwipeAction icon={Trash2} label="Excluir" onPress={onDelete} tone="delete" />
      )}
      renderRightActions={() => (
        <TransactionSwipeAction icon={Pencil} label="Editar" onPress={onEdit} tone="edit" />
      )}
      rightThreshold={44}
    >
      <Pressable onPress={onPress} style={styles.transaction}>
        <View style={styles.icon}>
          {transaction.amountCents < 0 ? (
            <ExpenseTransactionIcon category={transaction.category} />
          ) : (
            <WalletCards color={colors.muted} size={20} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{transaction.title}</Text>
          <Text style={styles.meta}>
            {transaction.amountCents < 0 ? "Despesa" : "Receita"} · {transaction.category}
            {transaction.amountCents < 0 && getPaymentMethodLabel(transaction.paymentMethod)
              ? ` · ${getPaymentMethodLabel(transaction.paymentMethod)}`
              : ""}
          </Text>
        </View>
        <AnimatedCurrency
          style={[styles.amount, transaction.amountCents < 0 ? styles.expense : styles.income]}
          valueInCents={transaction.amountCents}
        />
        <TransactionCreatorAvatar transaction={transaction} />
      </Pressable>
    </ReanimatedSwipeable>
  );
}

function TransactionSwipeAction({
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
      accessibilityLabel={`${label} transação`}
      onPress={onPress}
      style={[styles.swipeAction, isDelete ? styles.deleteAction : styles.editAction]}
    >
      <Icon color={isDelete ? colors.background : colors.text} size={18} strokeWidth={2.25} />
    </Pressable>
  );
}

function getIncomeSourceForTransaction(
  transaction: Transaction,
  sources: IncomeSource[],
): IncomeSource | undefined {
  const sourceId = transaction.id.startsWith("income-source:")
    ? transaction.id.slice("income-source:".length)
    : undefined;

  return sourceId ? sources.find((source) => source.id === sourceId) : undefined;
}

function ExpenseTransactionIcon({ category }: { category: string }) {
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
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 28 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: -10 },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: -4,
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
  notice: { backgroundColor: colors.surfaceMuted, borderRadius: 12, gap: 5, padding: 12 },
  noticeText: { color: colors.muted, fontSize: 12 },
  retry: { color: colors.text, fontFamily: fonts.bold, fontSize: 12 },
  empty: { alignItems: "center", gap: 8, paddingTop: 28 },
  emptyTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  emptyText: { color: colors.muted, fontSize: 14, textAlign: "center" },
  group: { gap: 8, marginTop: 4 },
  day: { color: colors.mutedLight, fontFamily: fonts.bold, fontSize: 12 },
  transaction: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 12,
  },
  swipeable: { borderRadius: 18, overflow: "hidden" },
  swipeAction: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    marginHorizontal: 12,
    width: 44,
  },
  deleteAction: { backgroundColor: colors.negative },
  editAction: { backgroundColor: colors.surfaceMuted },
  icon: { width: 38 },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  meta: { color: colors.muted, fontSize: 12 },
  amount: { fontFamily: fonts.bold, fontSize: 14 },
  expense: { color: colors.negative },
  income: { color: colors.positive },
  editorBackdrop: { backgroundColor: "#00000055", flex: 1, justifyContent: "flex-end" },
  editorDrawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
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
  monthButton: { alignItems: "center", height: 38, justifyContent: "center", width: 38 },
  monthLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    textTransform: "capitalize",
  },
  memberList: { gap: 8 },
  memberOption: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, padding: 12 },
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
});
