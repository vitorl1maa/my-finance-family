import { QueryClientProvider } from "@tanstack/react-query";
import { SQLiteProvider } from "expo-sqlite";
import { type PropsWithChildren, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useAuthStore } from "@/src/features/auth/store/auth-store";
import { databaseName, migrateDatabase } from "@/src/shared/database/database";
import { queryClient } from "@/src/shared/query/query-client";
import { supabase } from "@/src/shared/supabase/supabase-client";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SQLiteProvider databaseName={databaseName} onInit={migrateDatabase}>
          <AuthSessionSync>{children}</AuthSessionSync>
        </SQLiteProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

function AuthSessionSync({ children }: PropsWithChildren) {
  const setSession = useAuthStore((state) => state.setSession);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let mounted = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setInitialized(true);
      })
      .catch(() => {
        if (mounted) setInitialized(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setInitialized, setSession]);

  return children;
}
