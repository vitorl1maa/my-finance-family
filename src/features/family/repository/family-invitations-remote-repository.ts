import type {
  FamilyInvitation,
  FamilyInvitationPreview,
  FamilyMembership,
} from "@/src/features/family/model/family-invitation";
import { supabase } from "@/src/shared/supabase/supabase-client";

type InvitationRpcRow = {
  expires_at: string;
  token: string;
};

type MembershipRow = {
  family: Array<{ created_by: string; is_bootstrap: boolean }> | null;
  role: "owner" | "member";
};

type InvitationPreviewRow = {
  administrator_name: string;
};

export async function createFamilyQrInvitation(): Promise<FamilyInvitation> {
  const { data, error } = await supabase.rpc("create_family_qr_invitation");

  if (error) throw error;

  const invitation = (Array.isArray(data) ? data[0] : data) as InvitationRpcRow | null;
  if (!invitation?.token || !invitation.expires_at) {
    throw new Error("Não foi possível gerar o QR Code de convite.");
  }

  return { token: invitation.token, expiresAt: invitation.expires_at };
}

export async function acceptFamilyQrInvitation(token: string): Promise<void> {
  const { error } = await supabase.rpc("accept_family_qr_invitation", { raw_token: token });

  if (error) throw error;
}

export async function previewFamilyQrInvitation(token: string): Promise<FamilyInvitationPreview> {
  const { data, error } = await supabase.rpc("preview_family_qr_invitation", { raw_token: token });

  if (error) throw error;

  const preview = (Array.isArray(data) ? data[0] : data) as InvitationPreviewRow | null;
  if (!preview?.administrator_name) {
    throw new Error("Não foi possível carregar os dados do convite.");
  }

  return { administratorName: preview.administrator_name };
}

export async function getCurrentFamilyMembership(userId: string): Promise<FamilyMembership | null> {
  const { data, error } = await supabase
    .from("family_members")
    .select("role, family:families(created_by, is_bootstrap)")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const membership = data as MembershipRow;
  const family = membership.family?.[0];
  return {
    role: membership.role,
    isBootstrap: family?.is_bootstrap === true,
    createdByCurrentUser: family?.created_by === userId,
  };
}
