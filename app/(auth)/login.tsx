import { Link, Stack, type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthFooter, AuthScreen, FormError, Field, InlineLink, LoadingLabel, PrimaryButton, SocialButton } from '@/src/features/auth/components/auth-ui';
import type { AuthFormError } from '@/src/features/auth/model/auth';
import { useAuthViewModel, validateLogin } from '@/src/features/auth/view-model/use-auth-view-model';
import { colors } from '@/src/shared/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { errorMessage, isLoading, signInWithEmail } = useAuthViewModel();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormError>({});

  const handleSubmit = async () => {
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const signedIn = await signInWithEmail(email, password);
    if (signedIn) router.replace('/');
  };

  return (
    <AuthScreen>
      <Stack.Screen options={{ title: 'Entrar' }} />
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text><Text style={styles.backLabel}>Voltar</Text></Pressable>
      <AuthHeader />
      <Field error={errors.email} keyboardType="email-address" label="E-mail" onChangeText={setEmail} placeholder="voce@exemplo.com" value={email} />
      <Field error={errors.password} label="Senha" onChangeText={setPassword} placeholder="Sua senha" secureTextEntry value={password} />
      <Link href={"/(auth)/login" as Href} style={styles.forgot}>Esqueci minha senha</Link>
      <FormError message={errorMessage} />
      <PrimaryButton disabled={isLoading} onPress={handleSubmit}><LoadingLabel isLoading={isLoading} label="Entrar" /></PrimaryButton>
      <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>ou continue com</Text><View style={styles.line} /></View>
      <SocialButton icon="G" onPress={() => {}}>Continuar com Google</SocialButton>
      <SocialButton icon="●" onPress={() => {}}>Continuar com Apple</SocialButton>
      <AuthFooter><Text style={styles.footerText}>Ainda não tem uma conta?</Text><InlineLink href={"/(auth)/register" as Href}>Criar minha conta</InlineLink></AuthFooter>
    </AuthScreen>
  );
}

function AuthHeader() {
  return <View style={styles.header}><View style={styles.logo}><Text style={styles.logoText}>$</Text></View><Text style={styles.eyebrow}>My Finance Family</Text><Text style={styles.title}>Bem-vindo de volta</Text><Text style={styles.description}>Organize as finanças da sua família com clareza e tranquilidade.</Text></View>;
}

const styles = StyleSheet.create({
  back: { alignItems: 'center', flexDirection: 'row', gap: 6, paddingVertical: 8 },
  backText: { color: colors.text, fontSize: 30, lineHeight: 30 },
  backLabel: { color: colors.text, fontSize: 14, fontWeight: '800' },
  header: { gap: 10, paddingBottom: 24, paddingTop: 22 },
  logo: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 18, height: 52, justifyContent: 'center', width: 52 },
  logoText: { color: colors.text, fontSize: 26, fontWeight: '900' },
  eyebrow: { color: colors.muted, fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  description: { color: colors.muted, fontSize: 16, lineHeight: 23 },
  forgot: { alignSelf: 'flex-end', color: colors.text, fontSize: 13, fontWeight: '800', marginBottom: 20, textDecorationLine: 'underline' },
  divider: { alignItems: 'center', flexDirection: 'row', gap: 10, paddingVertical: 22 },
  line: { backgroundColor: colors.border, flex: 1, height: 1 },
  or: { color: colors.muted, fontSize: 12 },
  footerText: { color: colors.muted, fontSize: 14 },
});
