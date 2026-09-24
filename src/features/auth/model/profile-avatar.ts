export type ProfileAvatarMetadata = {
  avatar_seed?: string;
  avatar_url?: string;
};

export type ProfileAvatarPresentation = {
  avatarUrl?: string;
  label: string;
  token: string;
};

export function createAvatarSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAvatarToken(
  metadata: ProfileAvatarMetadata | undefined,
  fallback: string,
): string {
  return metadata?.avatar_seed || fallback;
}

export function getProfileAvatarPresentation(
  metadata: ProfileAvatarMetadata | undefined,
  label: string,
): ProfileAvatarPresentation {
  return {
    avatarUrl: metadata?.avatar_url,
    label,
    token: getAvatarToken(metadata, label),
  };
}

export function getAvatarInitial(label: string): string {
  return label.trim().charAt(0).toLocaleUpperCase("pt-BR") || "?";
}
