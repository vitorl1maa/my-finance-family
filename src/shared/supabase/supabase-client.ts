import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://argkcsjojefhpmbzovyn.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "missing-anon-key";

const secureStorage = {
  getItem: async (key: string) => {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue) return secureValue;

    const legacyValue = await AsyncStorage.getItem(key);
    if (!legacyValue) return null;

    await SecureStore.setItemAsync(key, legacyValue);
    await AsyncStorage.removeItem(key);
    return legacyValue;
  },
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
