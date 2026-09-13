import { QueryClientProvider } from "@tanstack/react-query";
import { SQLiteProvider } from "expo-sqlite";
import type { PropsWithChildren } from "react";

import { databaseName, migrateDatabase } from "@/src/shared/database/database";
import { queryClient } from "@/src/shared/query/query-client";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <SQLiteProvider databaseName={databaseName} onInit={migrateDatabase}>
        {children}
      </SQLiteProvider>
    </QueryClientProvider>
  );
}
