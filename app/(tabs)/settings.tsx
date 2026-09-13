import { ScrollView, Text, View } from 'react-native';

import { colors } from '@/src/shared/theme/colors';
import { spacing } from '@/src/shared/theme/spacing';

export default function SettingsScreen() {
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.xl }}>
      <Text style={{ color: colors.text, fontSize: 28, fontWeight: '900' }}>Mais</Text>

      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: 'continuous',
          borderRadius: 18,
          borderWidth: 1,
          gap: spacing.sm,
          padding: spacing.lg,
        }}>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: '900' }}>
          Arquitetura
        </Text>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
          Base preparada para MVVM com Zustand, repositórios SQLite e futura sincronizacao
          com Supabase.
        </Text>
      </View>
    </ScrollView>
  );
}
