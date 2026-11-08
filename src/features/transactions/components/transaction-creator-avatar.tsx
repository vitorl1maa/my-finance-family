import { View } from "react-native";
import { ProfileAvatar } from "@/src/features/auth/components/profile-avatar";
import { getAvatarToken } from "@/src/features/auth/model/profile-avatar";
import type { Transaction } from "@/src/features/transactions/model/transaction";

export function TransactionCreatorAvatar({
  transaction,
  size = 28,
}: {
  transaction: Transaction;
  size?: number;
}) {
  if (!transaction.creatorId && !transaction.creatorName && !transaction.creatorAvatarUrl) {
    return null;
  }

  const label = transaction.creatorName ?? "Membro";

  return (
    <View style={{ marginLeft: 8 }}>
      <ProfileAvatar
        avatarUrl={transaction.creatorAvatarUrl}
        label={label}
        size={size}
        token={transaction.creatorAvatarSeed ?? getAvatarToken(undefined, label)}
      />
    </View>
  );
}
