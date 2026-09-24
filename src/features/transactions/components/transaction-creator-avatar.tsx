import { View } from "react-native";
import { ProfileAvatar } from "@/src/features/auth/components/profile-avatar";
import { getAvatarToken } from "@/src/features/auth/model/profile-avatar";
import type { Transaction } from "@/src/features/transactions/model/transaction";

export function TransactionCreatorAvatar({ transaction }: { transaction: Transaction }) {
  if (!transaction.creatorId && !transaction.creatorName && !transaction.creatorAvatarUrl) {
    return null;
  }

  const label = transaction.creatorName ?? "Membro";

  return (
    <View style={{ marginLeft: 8 }}>
      <ProfileAvatar
        avatarUrl={transaction.creatorAvatarUrl}
        label={label}
        size={28}
        token={transaction.creatorAvatarSeed ?? getAvatarToken(undefined, label)}
      />
    </View>
  );
}
