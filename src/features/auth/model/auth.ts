export type RegisterProfile = {
  firstName: string;
  lastName: string;
  phone: string;
};

export type AuthFormError = Partial<Record<'email' | 'password' | 'confirmPassword' | keyof RegisterProfile, string>>;
