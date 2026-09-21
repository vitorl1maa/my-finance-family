import type { AuthError } from "@supabase/supabase-js";
import type { AuthFormError, RegisterProfile } from "@/src/features/auth/model/auth";
import { useAuthStore } from "@/src/features/auth/store/auth-store";
import { supabase } from "@/src/shared/supabase/supabase-client";

export type ProfileUpdate = {
  name: string;
  email: string;
  password?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(email: string, password: string): AuthFormError {
  const errors: AuthFormError = {};

  if (!emailPattern.test(email.trim())) errors.email = "Informe um e-mail valido.";
  if (password.length < 6) errors.password = "A senha deve ter pelo menos 6 caracteres.";

  return errors;
}

export function validateProfile(profile: RegisterProfile): AuthFormError {
  const errors: AuthFormError = {};

  if (!profile.firstName.trim()) errors.firstName = "Informe seu nome.";
  if (!profile.lastName.trim()) errors.lastName = "Informe seu sobrenome.";
  if (profile.phone.replace(/\D/g, "").length < 10) errors.phone = "Informe um telefone valido.";

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
      setError(getAuthErrorMessage(error));
      return false;
    }

    return true;
  };

  const signUpWithEmail = async (email: string, password: string, profile: RegisterProfile) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: profile.firstName.trim(),
          last_name: profile.lastName.trim(),
          phone: profile.phone.trim(),
        },
      },
    });

    setLoading(false);
    if (error) {
      setError(getAuthErrorMessage(error));
      return false;
    }

    if (!data.session) {
      setError("Conta criada. Confirme seu e-mail para continuar.");
      return false;
    }

    return true;
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signOut();

    setLoading(false);
    if (error) {
      setError(getAuthErrorMessage(error));
      return false;
    }

    return true;
  };

  const updateProfile = async ({ name, email, password }: ProfileUpdate) => {
    setLoading(true);
    setError(null);

    const [firstName, ...lastNameParts] = name.trim().split(/\s+/);
    const attributes: Parameters<typeof supabase.auth.updateUser>[0] = {
      data: {
        first_name: firstName,
        last_name: lastNameParts.join(" "),
      },
    };

    if (email.trim()) attributes.email = email.trim();
    if (password?.trim()) attributes.password = password;

    const { error } = await supabase.auth.updateUser(attributes);
    setLoading(false);
    if (error) {
      setError(getAuthErrorMessage(error));
      return false;
    }

    return true;
  };

  return {
    errorMessage,
    isLoading,
    setError,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  };
}

function getAuthErrorMessage(error: AuthError) {
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (code === "weak_password" || message.includes("password should be at least"))
    return "A senha deve ter pelo menos 8 caracteres, com uma letra minúscula e um caractere especial.";
  if (code === "email_address_invalid" || message.includes("invalid email"))
    return "Informe um e-mail válido.";
  if (message.includes("already registered") || message.includes("user already exists"))
    return "Este e-mail já possui uma conta.";
  if (message.includes("rate limit") || message.includes("too many requests"))
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (message.includes("signups not allowed"))
    return "O cadastro está desativado no projeto Supabase.";
  if (message.includes("missing-anon-key"))
    return "Configure a anon key do Supabase no arquivo .env.";
  if (message.includes("fetch") || message.includes("network"))
    return "Sem conexão com o Supabase. Verifique sua internet.";
  return "Não foi possível concluir a autenticação. Tente novamente.";
}
