import { ScrollView, Text, View } from 'react-native';

import { useTransactionsViewModel } from '@/src/features/transactions/view-model/use-transactions-view-model';
import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';

export default function TransactionsScreen() {
  const viewModel = useTransactionsViewModel();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.xl }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>
        Movimentacoes
      </Text>

      {viewModel.transactions.map((transaction) => (
        <View
          key={transaction.id}
          style={{
            alignItems: 'center',
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: spacing.lg,
          }}>
          <View style={{ gap: spacing.xs }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '800' }}>
              {transaction.title}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{transaction.category}</Text>
          </View>
          <Text
            selectable
            style={{
              color: transaction.isExpense ? colors.negative : colors.positive,
              fontSize: 15,
              fontVariant: ['tabular-nums'],
              fontWeight: '900',
            }}>
            {transaction.formattedAmount}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
