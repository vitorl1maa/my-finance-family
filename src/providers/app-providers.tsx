import { SQLiteProvider } from "expo-sqlite";
import type { PropsWithChildren } from "react";

import { databaseName, migrateDatabase } from "@/src/shared/database/database";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={databaseName} onInit={migrateDatabase}>
      {children}
    </SQLiteProvider>
  );
}
