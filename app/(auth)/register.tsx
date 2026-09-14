import { Stack, type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { AuthFooter, AuthScreen, AuthHeader, Field, FormError, InlineLink, LoadingLabel, PrimaryButton } from '@/src/features/auth/components/auth-ui';
import type { RegisterProfile } from '@/src/features/auth/model/auth';
import { useAuthViewModel, validateProfile } from '@/src/features/auth/view-model/use-auth-view-model';
import { colors } from '@/src/shared/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const { errorMessage, setError } = useAuthViewModel();
  const [profile, setProfile] = useState<RegisterProfile>({ firstName: '', lastName: '', phone: '' });
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(validateProfile(profile));

  const updateProfile = (key: keyof RegisterProfile, value: string) => setProfile((current) => ({ ...current, [key]: value }));
  const handleContinue = () => {
    const nextErrors = validateProfile(profile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setStep(2);
  };
  const handleSubmit = async () => {
    if (!email.includes('@') || password.length < 6) {
      setError('Informe um e-mail valido e uma senha com pelo menos 6 caracteres.');
      return;
    }
    setError('O cadastro será conectado ao Supabase na próxima etapa.');
  };

  return (
    <AuthScreen>
      <Stack.Screen options={{ title: 'Criar conta' }} />
      <Pressable accessibilityRole="button" onPress={() => (step === 2 ? setStep(1) : router.back())} style={styles.back}><Text style={styles.backText}>‹</Text><Text style={styles.backLabel}>Voltar</Text></Pressable>
      <Text style={styles.step}>Etapa {step} de 2</Text>
      {step === 1 ? <><AuthHeader eyebrow="Comece sua jornada" title="Crie sua conta" description="Vamos criar seu perfil principal da família." /><Field error={errors.firstName} label="Nome" onChangeText={(value) => updateProfile('firstName', value)} placeholder="Vitor" value={profile.firstName} /><Field error={errors.lastName} label="Sobrenome" onChangeText={(value) => updateProfile('lastName', value)} placeholder="Lima" value={profile.lastName} /><Field error={errors.phone} keyboardType="phone-pad" label="Telefone" onChangeText={(value) => updateProfile('phone', value)} placeholder="(11) 99999-9999" value={profile.phone} /><PrimaryButton onPress={handleContinue}>Continuar →</PrimaryButton></> : <><AuthHeader eyebrow="Quase lá" title="Proteja sua conta" description="Use seus dados de acesso para entrar no My Finance Family." /><Field keyboardType="email-address" label="E-mail" onChangeText={setEmail} placeholder="voce@exemplo.com" value={email} /><Field label="Senha" onChangeText={setPassword} placeholder="Pelo menos 6 caracteres" secureTextEntry value={password} /><FormError message={errorMessage} /><PrimaryButton onPress={handleSubmit}><LoadingLabel isLoading={false} label="Criar conta" /></PrimaryButton></>}
      <AuthFooter><Text style={styles.footerText}>Já tem uma conta?</Text><InlineLink href={"/(auth)/login" as Href}>Entrar</InlineLink></AuthFooter>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  back: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingVertical: 8 },
  backText: { color: colors.text, fontSize: 30, lineHeight: 30 },
  backLabel: { color: colors.text, fontSize: 14, fontWeight: '800' },
  step: { color: colors.muted, fontSize: 13, fontWeight: '800', marginTop: 18 },
  footerText: { color: colors.muted, fontSize: 14 },
});
