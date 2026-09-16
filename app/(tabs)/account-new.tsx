import { Stack, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAccountsStore } from '@/src/features/accounts/store/accounts-store';
import { colors } from '@/src/shared/theme/colors';

type AccountForm = { name: string; kind: 'checking' | 'savings' | 'wallet'; balance: string };

export default function AccountNewScreen() {
  const router = useRouter();
  const setAccounts = useAccountsStore((state) => state.setAccounts);
  const accounts = useAccountsStore((state) => state.accounts);
  const { control, formState: { errors }, handleSubmit, setValue, watch } = useForm<AccountForm>({ defaultValues: { name: '', kind: 'checking', balance: '0' } });
  const selectedKind = watch('kind');

  const onSubmit = ({ name, kind, balance }: AccountForm) => {
    const balanceCents = Math.round(Number(balance.replace(',', '.')) * 100);
    setAccounts([...accounts, { id: `account-${Date.now()}`, name: name.trim(), kind, balanceCents }]);
    router.back();
  };

  return <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.screen}>
    <Stack.Screen options={{ title: 'Nova conta', presentation: 'modal' }} />
    <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
    <Text style={styles.eyebrow}>NOVA CONTA</Text><Text style={styles.title}>Cadastre sua conta</Text>
    <Text style={styles.description}>Organize seu dinheiro e acompanhe o saldo da família.</Text>
    <Controller control={control} name="name" rules={{ required: 'Informe o nome da conta.' }} render={({ field: { onChange, value } }) => <Input label="Nome da conta" placeholder="Ex.: Conta principal" value={value} onChangeText={onChange} error={errors.name?.message} />} />
    <Text style={styles.sectionLabel}>Tipo de conta</Text>
    <View style={styles.typeRow}>{(['checking', 'savings', 'wallet'] as const).map((kind) => <Pressable key={kind} onPress={() => setValue('kind', kind)} style={[styles.typeCard, selectedKind === kind && styles.typeSelected]}><Text style={styles.typeText}>{kind === 'checking' ? 'Principal' : kind === 'savings' ? 'Poupança' : 'Carteira'}</Text></Pressable>)}</View>
    <Controller control={control} name="balance" rules={{ pattern: { value: /^\d+(?:[,.]\d{1,2})?$/, message: 'Informe um valor válido.' } }} render={({ field: { onChange, value } }) => <Input keyboardType="decimal-pad" label="Saldo inicial" placeholder="0,00" value={value} onChangeText={onChange} error={errors.balance?.message} />} />
    <Pressable onPress={handleSubmit(onSubmit)} style={styles.primary}><Text style={styles.primaryText}>Salvar conta</Text><Text style={styles.arrow}>→</Text></Pressable>
  </ScrollView>;
}

function Input({ label, placeholder, value, onChangeText, error, keyboardType = 'default' }: { label: string; placeholder: string; value: string; onChangeText: (value: string) => void; error?: string; keyboardType?: 'default' | 'decimal-pad' }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={colors.mutedLight} style={[styles.input, error && styles.inputError]} value={value} onChangeText={onChangeText} /><Text style={styles.error}>{error}</Text></View>;
}

const styles = StyleSheet.create({ screen: { backgroundColor: colors.background, flexGrow: 1, gap: 14, padding: 20, paddingBottom: 32 }, back: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: 22, height: 42, justifyContent: 'center', width: 42 }, backText: { color: colors.text, fontSize: 30, lineHeight: 30 }, eyebrow: { color: colors.muted, fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginTop: 18 }, title: { color: colors.text, fontSize: 32, fontWeight: '900' }, description: { color: colors.muted, fontSize: 15, lineHeight: 21, marginBottom: 12 }, field: { gap: 6 }, label: { color: colors.text, fontSize: 13, fontWeight: '800' }, input: { borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 56, paddingHorizontal: 16 }, inputError: { borderColor: colors.negative }, error: { color: colors.negative, fontSize: 12, minHeight: 14 }, sectionLabel: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 4 }, typeRow: { flexDirection: 'row', gap: 8 }, typeCard: { alignItems: 'center', borderColor: colors.border, borderRadius: 14, borderWidth: 1, flex: 1, minHeight: 52, justifyContent: 'center' }, typeSelected: { backgroundColor: colors.accent, borderColor: colors.accent }, typeText: { color: colors.text, fontSize: 13, fontWeight: '800' }, primary: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 16, flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 12, minHeight: 58 }, primaryText: { color: colors.text, fontSize: 16, fontWeight: '900' }, arrow: { color: colors.text, fontSize: 20, fontWeight: '900' } });
