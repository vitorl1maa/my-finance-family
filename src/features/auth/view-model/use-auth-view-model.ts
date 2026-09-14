import { useAuthStore } from '@/src/features/auth/store/auth-store';
import type { AuthFormError, RegisterProfile } from '@/src/features/auth/model/auth';
import { supabase } from '@/src/shared/supabase/supabase-client';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(email: string, password: string): AuthFormError {
  const errors: AuthFormError = {};

  if (!emailPattern.test(email.trim())) errors.email = 'Informe um e-mail valido.';
  if (password.length < 6) errors.password = 'A senha deve ter pelo menos 6 caracteres.';

  return errors;
}

export function validateProfile(profile: RegisterProfile): AuthFormError {
  const errors: AuthFormError = {};

  if (!profile.firstName.trim()) errors.firstName = 'Informe seu nome.';
  if (!profile.lastName.trim()) errors.lastName = 'Informe seu sobrenome.';
  if (profile.phone.replace(/\D/g, '').length < 10) errors.phone = 'Informe um telefone valido.';

  return errors;
}

export function useAuthViewModel() {
  const { errorMessage, isLoading, setError, setLoading } = useAuthStore();

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);
    if (error) {
      setError(getAuthErrorMessage(error.message));
      return false;
    }

    return true;
  };

  return { errorMessage, isLoading, setError, signInWithEmail };
}

function getAuthErrorMessage(message: string) {
  if (message.toLowerCase().includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.toLowerCase().includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (message.toLowerCase().includes('missing-anon-key')) return 'Configure a anon key do Supabase no arquivo .env.';
  return 'Não foi possível entrar agora. Verifique sua conexão e tente novamente.';
}
