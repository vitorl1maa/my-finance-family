import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, QrCode, RefreshCw, ScanLine, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ProfileAvatar } from "@/src/features/auth/components/profile-avatar";
import {
  getProfileAvatarPresentation,
  type ProfileAvatarMetadata,
} from "@/src/features/auth/model/profile-avatar";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import {
  type FamilyInvitation,
  getInvitationProgress,
  getRemainingInvitationSeconds,
  parseFamilyInvitationToken,
} from "@/src/features/family/model/family-invitation";
import { useFamilyInvitationsViewModel } from "@/src/features/family/view-model/use-family-invitations-view-model";
import { ReacticxQrCode } from "@/src/shared/components/base/reacticx-qr-code";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function FamilyMembersView({ onBack: _onBack }: { onBack: () => void }) {
  const session = useAuthStore((state) => state.session);
  const vm = useFamilyInvitationsViewModel();
  const mounted = useRef(true);
  const [invitationVisible, setInvitationVisible] = useState(false);
  const [joinVisible, setJoinVisible] = useState(false);
  const [invitation, setInvitation] = useState<FamilyInvitation | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [manualToken, setManualToken] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const isOwner = vm.membership?.role === "owner";
  const canJoin = vm.membership?.isBootstrap === true;
  const name = String(session?.user.user_metadata?.first_name ?? "Você");
  const avatar = getProfileAvatarPresentation(
    session?.user.user_metadata as ProfileAvatarMetadata | undefined,
    name,
  );

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  useEffect(() => {
    if (!invitationVisible || !invitation) return;
    const update = () =>
      mounted.current && setSeconds(getRemainingInvitationSeconds(invitation.expiresAt));
    update();
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [invitation, invitationVisible]);

  const generate = useCallback(async () => {
    const next = await vm.createInvitation();
    if (!mounted.current || !next) return;
    setInvitation(next);
    setSeconds(getRemainingInvitationSeconds(next.expiresAt));
  }, [vm]);
  const closeInvite = useCallback(() => {
    setInvitationVisible(false);
    setInvitation(null);
    setSeconds(0);
    vm.clearFeedback();
  }, [vm]);
  const closeJoin = useCallback(() => {
    setJoinVisible(false);
    setScanning(false);
    setManualToken("");
    vm.clearFeedback();
  }, [vm]);
  const openInvite = () => {
    setNotice(null);
    setInvitation(null);
    setSeconds(0);
    vm.clearFeedback();
    setInvitationVisible(true);
    void generate();
  };
  const accept = useCallback(
    async (value: string) => {
      const token = parseFamilyInvitationToken(value);
      if (!token || vm.accepting) return;
      const joined = await vm.acceptInvitation(token);
      if (!mounted.current || !joined) return;
      closeJoin();
      setNotice("Você entrou na família com sucesso.");
    },
    [closeJoin, vm],
  );
  const openCamera = useCallback(async () => {
    const result = permission?.granted ? permission : await requestPermission();
    if (mounted.current) setScanning(result.granted);
  }, [permission, requestPermission]);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Membros da família</Text>
          <Text style={styles.subtitle}>Gerencie quem participa das suas finanças</Text>
        </View>
      </View>
      {notice ? <Text style={styles.success}>{notice}</Text> : null}
      {vm.error && !invitationVisible && !joinVisible ? (
        <Text style={styles.error}>{vm.error}</Text>
      ) : null}

      {isOwner ? (
        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <QrCode color={colors.text} size={20} />
          </View>
          <Text style={styles.cardTitle}>Convide alguém por QR Code</Text>
          <Text style={styles.cardText}>
            Gere um código temporário para a pessoa entrar na sua família.
          </Text>
          <Pressable
            disabled={vm.creating}
            onPress={openInvite}
            style={[styles.primary, vm.creating && styles.disabled]}
          >
            <QrCode color={colors.text} size={18} />
            <Text style={styles.primaryText}>{vm.creating ? "Gerando..." : "Gerar QR Code"}</Text>
          </Pressable>
        </View>
      ) : null}
      {canJoin ? (
        <View style={styles.joinCard}>
          <Text style={styles.cardTitle}>Entrar em uma família</Text>
          <Text style={styles.cardText}>Leia o QR Code gerado pelo administrador.</Text>
          <Pressable onPress={() => setJoinVisible(true)} style={styles.secondary}>
            <ScanLine color={colors.text} size={18} />
            <Text style={styles.primaryText}>Ler QR Code</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.sectionTitle}>Membros</Text>
      <MemberRow
        avatarUrl={avatar.avatarUrl}
        avatarToken={avatar.token}
        name={name}
        email={session?.user.email ?? "Conta principal"}
        memberRole={isOwner ? "Administrador" : "Membro"}
      />
      <Modal
        animationType="fade"
        onRequestClose={closeInvite}
        transparent
        visible={invitationVisible}
      >
        <View style={styles.backdrop}>
          <ScrollView contentContainerStyle={styles.drawer} style={styles.modalCard}>
            <DrawerHeader
              subtitle="Compartilhe com quem fará parte da família."
              title="Convite por QR Code"
              onClose={closeInvite}
            />
            {invitation && seconds > 0 ? (
              <View style={styles.qrArea}>
                <View style={styles.qrFrame}>
                  <ReacticxQrCode value={invitation.token} />
                </View>
                <Text style={styles.countdown}>{seconds}s</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${getInvitationProgress(seconds) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.helper}>
                  Este QR Code expira em 60 segundos e pode ser usado uma única vez.
                </Text>
              </View>
            ) : (
              <View style={styles.expired}>
                <RefreshCw color={colors.muted} size={26} />
                <Text style={styles.expiredTitle}>
                  {vm.creating ? "Gerando QR Code..." : "QR Code expirado"}
                </Text>
                <Text style={styles.helper}>Gere um novo código para continuar.</Text>
              </View>
            )}
            {vm.error ? <Text style={styles.error}>{vm.error}</Text> : null}
            <Pressable
              disabled={vm.creating}
              onPress={() => void generate()}
              style={[styles.primary, vm.creating && styles.disabled]}
            >
              <RefreshCw color={colors.text} size={18} />
              <Text style={styles.primaryText}>
                {vm.creating ? "Gerando..." : "Gerar novo QR Code"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
      <Modal animationType="fade" onRequestClose={closeJoin} transparent visible={joinVisible}>
        <View style={styles.backdrop}>
          <ScrollView
            contentContainerStyle={styles.drawer}
            keyboardShouldPersistTaps="handled"
            style={styles.modalCard}
          >
            <DrawerHeader
              subtitle="Leia o QR Code do administrador."
              title="Entrar na família"
              onClose={closeJoin}
            />
            {scanning ? (
              <View style={styles.cameraFrame}>
                <CameraView
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={({ data }) => {
                    setScanning(false);
                    void accept(data);
                  }}
                  style={styles.camera}
                />
              </View>
            ) : (
              <Pressable onPress={() => void openCamera()} style={styles.cameraButton}>
                <Camera color={colors.text} size={24} />
                <Text style={styles.primaryText}>Abrir câmera para ler QR Code</Text>
              </Pressable>
            )}
            {permission && !permission.granted && !permission.canAskAgain ? (
              <Text style={styles.helper}>
                A câmera não está disponível. Use o código manual abaixo.
              </Text>
            ) : null}
            <Text style={styles.manualLabel}>Ou digite o código do convite</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setManualToken}
              placeholder="Cole o código de 64 caracteres"
              placeholderTextColor={colors.mutedLight}
              style={styles.input}
              value={manualToken}
            />
            {vm.error ? <Text style={styles.error}>{vm.error}</Text> : null}
            <Pressable
              disabled={vm.accepting || !parseFamilyInvitationToken(manualToken)}
              onPress={() => void accept(manualToken)}
              style={[
                styles.primary,
                (vm.accepting || !parseFamilyInvitationToken(manualToken)) && styles.disabled,
              ]}
            >
              <Text style={styles.primaryText}>
                {vm.accepting ? "Entrando..." : "Entrar na família"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

function DrawerHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.drawerHeader}>
      <View>
        <Text style={styles.drawerTitle}>{title}</Text>
        <Text style={styles.drawerSubtitle}>{subtitle}</Text>
      </View>
      <Pressable accessibilityLabel="Fechar" onPress={onClose} style={styles.close}>
        <X color={colors.text} size={20} />
      </Pressable>
    </View>
  );
}
function MemberRow({
  avatarUrl,
  avatarToken,
  name,
  email,
  memberRole,
}: {
  avatarUrl?: string;
  avatarToken: string;
  name: string;
  email: string;
  memberRole: string;
}) {
  return (
    <View style={styles.member}>
      <ProfileAvatar avatarUrl={avatarUrl} label={name} size={42} token={avatarToken} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{name}</Text>
        <Text style={styles.memberEmail}>{email}</Text>
      </View>
      <Text style={styles.role}>{memberRole}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: 16,
    padding: 20,
    paddingBottom: 140,
    paddingTop: 58,
  },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  title: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 25 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 5 },
  close: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  success: {
    backgroundColor: "#E5F9EA",
    borderRadius: 12,
    color: colors.positive,
    fontFamily: fonts.bold,
    padding: 12,
  },
  error: { color: colors.negative, fontSize: 13, lineHeight: 19 },
  summary: {
    alignItems: "center",
    backgroundColor: colors.text,
    borderRadius: 20,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  summaryCopy: { flex: 1, gap: 3 },
  summaryTitle: { color: colors.background, fontFamily: fonts.extraBold, fontSize: 15 },
  summaryText: { color: colors.mutedLight, fontSize: 12 },
  card: { backgroundColor: colors.surfaceMuted, borderRadius: 20, gap: 10, padding: 16 },
  joinCard: { borderColor: colors.border, borderRadius: 20, borderWidth: 1, gap: 10, padding: 16 },
  cardIcon: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  cardTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 19 },
  cardText: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  primary: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 16,
  },
  secondary: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
  },
  primaryText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 14 },
  disabled: { opacity: 0.5 },
  sectionTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 19, marginTop: 8 },
  member: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 70,
    padding: 12,
  },
  memberInfo: { flex: 1, gap: 3 },
  memberName: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  memberEmail: { color: colors.muted, fontSize: 12 },
  role: { color: colors.muted, fontSize: 11, textAlign: "right" },
  backdrop: {
    alignItems: "center",
    backgroundColor: "#00000055",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    alignSelf: "center",
    backgroundColor: colors.background,
    borderRadius: 28,
    flexGrow: 0,
    maxHeight: "85%",
    overflow: "hidden",
    width: "100%",
  },
  drawer: { gap: 18, padding: 20, paddingBottom: 28 },
  drawerHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  drawerTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 23 },
  drawerSubtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  qrArea: { alignItems: "center", gap: 12, paddingVertical: 6 },
  qrFrame: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  countdown: {
    color: colors.text,
    fontFamily: fonts.extraBold,
    fontSize: 28,
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 8,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: { backgroundColor: colors.accent, borderRadius: 8, height: "100%" },
  helper: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  expired: { alignItems: "center", gap: 10, paddingVertical: 36 },
  expiredTitle: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 18 },
  cameraButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    gap: 10,
    justifyContent: "center",
    minHeight: 120,
    padding: 20,
  },
  cameraFrame: { borderRadius: 18, height: 260, overflow: "hidden" },
  camera: { flex: 1 },
  manualLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 13 },
  input: {
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.text,
    fontSize: 13,
    minHeight: 52,
    paddingHorizontal: 14,
  },
});
