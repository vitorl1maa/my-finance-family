import {
  Bell,
  ChevronRight,
  CircleDollarSign,
  Plus,
  ReceiptText,
  Repeat2,
  Send,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useDashboardViewModel } from "@/src/features/dashboard/view-model/use-dashboard-view-model";
import { GradientAvatar } from "@/src/shared/components/base/gradient-avatar";
import { colors } from "@/src/shared/theme/colors";

type DashboardViewProps = { onCreateAccount: () => void; onCreateExpense: () => void };

export function DashboardView({ onCreateAccount, onCreateExpense }: DashboardViewProps) {
  const { accounts, greeting, recentTransactions, totalBalance, userName } =
    useDashboardViewModel();

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.profile}>
          <GradientAvatar
            palette={[colors.accent, colors.text, colors.surfaceMuted]}
            sheen={false}
            size={42}
            token={userName}
          />
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Notificações" style={styles.notification}>
          <Bell color={colors.text} size={22} strokeWidth={2} />
        </Pressable>
      </View>
      <View style={styles.balance}>
        <View style={styles.balanceLabel}>
          <Text style={styles.mutedSmall}>Total balance (BRL)</Text>
          <ChevronRight color={colors.muted} size={14} style={styles.down} />
        </View>
        <Text style={styles.total}>{totalBalance}</Text>
        <Text style={styles.monthly}>
          + 8,4% <Text style={styles.mutedSmall}>este mês</Text>
        </Text>
      </View>
      <View style={styles.actions}>
        <Action
          icon={<Plus color={colors.text} size={16} />}
          label="Nova conta"
          onPress={onCreateAccount}
        />
        <Action
          accent
          icon={<ReceiptText color={colors.text} size={16} />}
          label="Nova despesa"
          onPress={onCreateExpense}
        />
        <Action
          icon={<Repeat2 color={colors.text} size={16} />}
          label="Transferir"
          onPress={() => undefined}
        />
      </View>
      <SectionHeader title="Contas da família" action="Ver todas" />
      <View style={styles.accounts}>
        {accounts.slice(0, 2).map((account) => (
          <View key={account.id} style={styles.accountCard}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>{account.formattedBalance}</Text>
            <Text style={styles.updated}>Atualizado agora</Text>
          </View>
        ))}
      </View>
      <SectionHeader title="Movimentações" action="Ver todas" />
      <View style={styles.transactions}>
        {recentTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transaction}>
            <View
              style={[
                styles.transactionIcon,
                transaction.isExpense ? styles.expenseIcon : styles.incomeIcon,
              ]}
            >
              {transaction.isExpense ? (
                <Send color={colors.text} size={14} />
              ) : (
                <CircleDollarSign color={colors.text} size={14} />
              )}
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{transaction.title}</Text>
              <Text style={styles.transactionDate}>{transaction.category} · Hoje, 10:32</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                transaction.isExpense ? styles.expenseText : styles.incomeText,
              ]}
            >
              {transaction.formattedAmount}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Action({
  accent,
  icon,
  label,
  onPress,
}: {
  accent?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.action, accent && styles.actionAccent]}
    >
      {icon}
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}
function SectionHeader({ action, title }: { action: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable>
        <Text style={styles.sectionAction}>{action} ›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 28, paddingTop: 60 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  profile: { alignItems: "center", flexDirection: "row", gap: 10 },
  greeting: { color: colors.muted, fontSize: 20, fontWeight: "600" },
  name: { color: colors.text, fontSize: 20, fontWeight: "900", marginTop: 2 },
  notification: { alignItems: "center", height: 38, justifyContent: "center", width: 30 },
  balance: { marginBottom: 16, marginTop: 40 },
  balanceLabel: { alignItems: "center", flexDirection: "row", gap: 3 },
  mutedSmall: { color: colors.muted, fontSize: 12 },
  down: { transform: [{ rotate: "90deg" }] },
  total: { color: colors.text, fontSize: 40, fontWeight: "900", letterSpacing: -0.8, marginTop: 3 },
  monthly: { color: colors.positive, fontSize: 11, fontWeight: "800", marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginBottom: 24 },
  action: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    justifyContent: "center",
    minHeight: 64,
  },
  actionAccent: { backgroundColor: colors.accent, borderColor: colors.accent },
  actionLabel: { color: colors.text, fontSize: 11, fontWeight: "900" },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  sectionAction: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  accounts: { flexDirection: "row", gap: 8, marginBottom: 22 },
  accountCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 100,
    padding: 12,
  },
  accountName: { color: colors.muted, fontSize: 10, fontWeight: "700" },
  accountBalance: { color: colors.text, fontSize: 15, fontWeight: "900", marginTop: 13 },
  updated: { color: colors.mutedLight, fontSize: 9, marginTop: 10 },
  transactions: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 0,
    paddingHorizontal: 12,
  },
  transaction: { alignItems: "center", minHeight: 62, flexDirection: "row" },
  transactionIcon: {
    alignItems: "center",
    borderRadius: 18,
    height: 34,
    justifyContent: "center",
    marginRight: 10,
    width: 34,
  },
  expenseIcon: { backgroundColor: "#F3F3F3" },
  incomeIcon: { backgroundColor: colors.accent },
  transactionInfo: { flex: 1 },
  transactionTitle: { color: colors.text, fontSize: 12, fontWeight: "900" },
  transactionDate: { color: colors.muted, fontSize: 9, marginTop: 4 },
  transactionAmount: { fontSize: 11, fontWeight: "900" },
  expenseText: { color: colors.negative },
  incomeText: { color: colors.positive },
});
