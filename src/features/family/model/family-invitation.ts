type BootstrapFamily = {
  isBootstrap: boolean;
  isOwner: boolean;
  createdByCurrentUser: boolean;
  hasOtherMembers: boolean;
  hasTransactions: boolean;
  hasExpenses: boolean;
  hasGoals: boolean;
  hasIncomeSources: boolean;
  piggyBankBalanceCents: number;
  hasNonZeroAccountBalance: boolean;
  hasInvitations: boolean;
};

export function isInvitationAcceptable({
  expiresAt,
  acceptedAt,
  hasFamily,
  now = new Date(),
  bootstrapFamily,
}: {
  expiresAt: Date;
  acceptedAt: Date | null;
  hasFamily: boolean;
  now?: Date;
  bootstrapFamily?: BootstrapFamily;
}) {
  if (expiresAt.getTime() <= now.getTime() || acceptedAt !== null) {
    return false;
  }

  if (!hasFamily) {
    return true;
  }

  return (
    bootstrapFamily?.isBootstrap === true &&
    bootstrapFamily.isOwner === true &&
    bootstrapFamily.createdByCurrentUser === true &&
    !bootstrapFamily.hasOtherMembers &&
    !bootstrapFamily.hasTransactions &&
    !bootstrapFamily.hasExpenses &&
    !bootstrapFamily.hasGoals &&
    !bootstrapFamily.hasIncomeSources &&
    bootstrapFamily.piggyBankBalanceCents === 0 &&
    !bootstrapFamily.hasNonZeroAccountBalance &&
    !bootstrapFamily.hasInvitations
  );
}
