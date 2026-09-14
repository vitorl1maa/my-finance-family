import { QueryClientProvider } from "@tanstack/react-query";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect, type PropsWithChildren } from "react";

import { useAuthStore } from "@/src/features/auth/store/auth-store";
import { databaseName, migrateDatabase } from "@/src/shared/database/database";
import { queryClient } from "@/src/shared/query/query-client";
import { supabase } from "@/src/shared/supabase/supabase-client";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName={databaseName} onInit={migrateDatabase}>
        <AuthSessionSync>{children}</AuthSessionSync>
      </SQLiteProvider>
    </QueryClientProvider>
  );
}

function AuthSessionSync({ children }: PropsWithChildren) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setSession]);

  return children;
}
