import { Check, Mail, MoreHorizontal, UserPlus, Users, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import { colors } from "@/src/shared/theme/colors";
import { fonts } from "@/src/shared/theme/fonts";

export function FamilyMembersView({ onBack }: { onBack: () => void }) {
  const session = useAuthStore((state) => state.session);
  const [email, setEmail] = useState("");
  const [invited, setInvited] = useState<string[]>([]);
  const name = String(session?.user.user_metadata?.first_name ?? "Você");
  const currentEmail = session?.user.email ?? "Conta principal";

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Membros da família</Text>
          <Text style={styles.subtitle}>Gerencie quem participa das suas finanças</Text>
        </View>
        <Pressable
          accessibilityLabel="Fechar membros da família"
          onPress={onBack}
          style={styles.close}
        >
          <X color={colors.text} size={20} />
        </Pressable>
      </View>
      <View style={styles.summary}>
        <View style={styles.summaryIcon}>
          <Users color={colors.text} size={22} />
        </View>
        <View style={styles.summaryCopy}>
          <Text style={styles.summaryTitle}>Sua família financeira</Text>
          <Text style={styles.summaryText}>
            {invited.length + 1} {invited.length + 1 === 1 ? "pessoa" : "pessoas"} participando
          </Text>
        </View>
        <Check color={colors.positive} size={20} />
      </View>
      <View style={styles.inviteCard}>
        <View style={styles.cardIcon}>
          <UserPlus color={colors.text} size={20} />
        </View>
        <Text style={styles.cardTitle}>Convide alguém</Text>
        <Text style={styles.cardText}>
          Envie um convite para compartilhar o controle financeiro da família.
        </Text>
        <View style={styles.inputRow}>
          <Mail color={colors.muted} size={18} />
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="email@exemplo.com"
            placeholderTextColor={colors.mutedLight}
            style={styles.input}
            value={email}
          />
        </View>
        <Pressable
          disabled={!email.trim()}
          onPress={() => {
            setInvited((items) => [...items, email.trim()]);
            setEmail("");
          }}
          style={[styles.primary, !email.trim() && styles.disabled]}
        >
          <Text style={styles.primaryText}>Enviar convite</Text>
        </Pressable>
      </View>
      <Text style={styles.sectionTitle}>Membros</Text>
      <MemberRow name={name} email={currentEmail} memberRole="Administrador" />
      {invited.map((item) => (
        <MemberRow
          key={item}
          name="Convite pendente"
          email={item}
          memberRole="Aguardando resposta"
          action={() => setInvited((items) => items.filter((value) => value !== item))}
        />
      ))}
    </ScrollView>
  );
}

function MemberRow({
  name,
  email,
  memberRole,
  action,
}: {
  name: string;
  email: string;
  memberRole: string;
  action?: () => void;
}) {
  return (
    <View style={styles.member}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{name}</Text>
        <Text style={styles.memberEmail}>{email}</Text>
      </View>
      <Text style={styles.role}>{memberRole}</Text>
      {action ? (
        <Pressable accessibilityLabel="Remover convite" onPress={action} style={styles.more}>
          <MoreHorizontal color={colors.muted} size={18} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: 16,
    padding: 20,
    paddingBottom: 40,
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
  inviteCard: { backgroundColor: colors.surfaceMuted, borderRadius: 20, gap: 10, padding: 16 },
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
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  input: { color: colors.text, flex: 1, fontSize: 14 },
  primary: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 50,
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
  avatar: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 21,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  avatarText: { color: colors.text, fontFamily: fonts.extraBold, fontSize: 17 },
  memberInfo: { flex: 1, gap: 3 },
  memberName: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  memberEmail: { color: colors.muted, fontSize: 12 },
  role: { color: colors.muted, fontSize: 11, textAlign: "right" },
  more: { alignItems: "center", height: 32, justifyContent: "center", width: 28 },
});
