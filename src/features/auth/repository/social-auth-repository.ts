import * as WebBrowser from "expo-web-browser";
import {
  getOAuthCode,
  socialAuthRedirectUrl,
  type SocialProvider,
} from "@/src/features/auth/model/social-auth";
import { supabase } from "@/src/shared/supabase/supabase-client";

export async function startSocialAuth(provider: SocialProvider): Promise<"success" | "cancel" | "error"> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: socialAuthRedirectUrl, skipBrowserRedirect: true },
  });

  if (error || !data.url) throw error ?? new Error("Não foi possível iniciar o login social.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, socialAuthRedirectUrl);
  if (result.type === "cancel" || result.type === "dismiss") return "cancel";
  if (result.type !== "success") return "error";

  return (await exchangeSocialAuthCode(result.url)) ? "success" : "error";
}

export async function exchangeSocialAuthCode(url: string) {
  if (!getOAuthCode(url)) return false;

  const { error } = await supabase.auth.exchangeCodeForSession(url);
  if (error) throw error;
  return true;
}
