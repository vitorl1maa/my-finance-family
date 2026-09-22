export function isInvitationAcceptable({
  expiresAt,
  acceptedAt,
  hasFamily,
}: {
  expiresAt: Date;
  acceptedAt: Date | null;
  hasFamily: boolean;
}) {
  return expiresAt.getTime() > Date.now() && acceptedAt === null && !hasFamily;
}
