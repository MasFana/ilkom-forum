"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";
import { DEFAULT_STALE_TIME_MS } from "@/lib/config";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  }));
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-right" richColors expand={false} />
    </QueryClientProvider>
  );
}
