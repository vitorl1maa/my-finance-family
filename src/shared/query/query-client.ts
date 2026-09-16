import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnReconnect: true,
    },
  },
});
