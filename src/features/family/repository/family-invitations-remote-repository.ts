import type {
  FamilyInvitation,
  FamilyInvitationPreview,
  FamilyMember,
  FamilyMembership,
  FamilyMembershipRow,
} from "@/src/features/family/model/family-invitation";
import { mapFamilyMembership } from "@/src/features/family/model/family-invitation";
import { supabase } from "@/src/shared/supabase/supabase-client";

type InvitationRpcRow = {
  expires_at: string;
  token: string;
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

export async function leaveCurrentFamily(): Promise<void> {
  const { error } = await supabase.rpc("leave_current_family");
  if (error) throw error;
}

export async function listFamilyMembers(): Promise<FamilyMember[]> {
  const { data, error } = await supabase.rpc("list_family_members");
  if (error) throw error;
  return (
    (data ?? []) as Array<{
      avatar_url: string | null;
      email: string;
      first_name: string | null;
      last_name: string | null;
      role: FamilyMember["role"];
      user_id: string;
    }>
  ).map((member) => ({
    avatarUrl: member.avatar_url ?? undefined,
    email: member.email,
    id: member.user_id,
    name: [member.first_name, member.last_name].filter(Boolean).join(" ") || member.email,
    role: member.role,
  }));
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

  return mapFamilyMembership(data as FamilyMembershipRow, userId);
}
