import { ScrollView, Text, View } from "react-native";

import { useAccountsViewModel } from "@/src/features/accounts/view-model/use-accounts-view-model";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";
import { spacing } from "@/src/shared/theme/spacing";

export default function AccountsScreen() {
  const viewModel = useAccountsViewModel();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ gap: spacing.lg, padding: spacing.xl }}
    >
      <Text
        style={{ color: colors.text, fontFamily: fonts.extraBold, fontSize: 28, fontWeight: "900" }}
      >
        Contas
      </Text>

      {viewModel.accounts.map((account) => (
        <View
          key={account.id}
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderCurve: "continuous",
            borderRadius: 18,
            borderWidth: 1,
            gap: spacing.sm,
            padding: spacing.lg,
          }}
        >
          <Text style={{ color: colors.muted, fontFamily: fonts.regular, fontSize: 13 }}>
            {account.name}
          </Text>
          <Text
            selectable
            style={{
              color: colors.text,
              fontFamily: fonts.extraBold,
              fontSize: 24,
              fontVariant: ["tabular-nums"],
              fontWeight: "900",
            }}
          >
            {account.formattedBalance}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
