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

export type FamilyInvitation = {
  token: string;
  expiresAt: string;
};

export type FamilyMembership = {
  role: "owner" | "member";
  isBootstrap: boolean;
  createdByCurrentUser: boolean;
};

export function getRemainingInvitationSeconds(expiresAt: string, now: Date = new Date()) {
  const remainingMilliseconds = new Date(expiresAt).getTime() - now.getTime();

  if (!Number.isFinite(remainingMilliseconds)) return 0;

  return Math.max(0, Math.floor(remainingMilliseconds / 1000));
}

export function getInvitationProgress(remainingSeconds: number) {
  return Math.max(0, Math.min(1, remainingSeconds / 60));
}

export function parseFamilyInvitationToken(value: string) {
  const normalized = value.trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(normalized) ? normalized : null;
}

export function getFamilyInvitationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("is_bootstrap") || message.includes("does not exist")) {
    return "A atualização de famílias ainda não foi aplicada no servidor. Tente novamente após sincronizar o banco.";
  }

  if (message.includes("invalid_or_expired_invitation")) {
    return "Este QR Code expirou ou já foi utilizado. Peça para gerar um novo código.";
  }
  if (message.includes("user_already_associated")) {
    return "Você já participa de uma família e não pode aceitar outro convite.";
  }
  if (message.includes("family_owner_required")) {
    return "Somente administradores podem gerar um QR Code de convite.";
  }
  if (message.includes("authentication_required")) {
    return "Entre novamente na sua conta para usar convites familiares.";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "Sem conexão. Verifique sua internet e tente novamente.";
  }

  return "Não foi possível concluir o convite agora. Tente novamente.";
}

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
