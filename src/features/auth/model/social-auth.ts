export const socialProviders = ["google", "apple"] as const;

export type SocialProvider = (typeof socialProviders)[number];

export const socialAuthRedirectUrl = "myfinancefamily://auth/callback";

export function isSocialProvider(value: string): value is SocialProvider {
  return socialProviders.includes(value as SocialProvider);
}

export function getOAuthCode(url: string) {
  try {
    const callback = new URL(url);
    if (
      callback.protocol !== "myfinancefamily:" ||
      callback.hostname !== "auth" ||
      callback.pathname !== "/callback"
    ) {
      return null;
    }

    return callback.searchParams.get("code");
  } catch {
    return null;
  }
}
