import { StrictMode, Suspense, lazy, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Loaded only in development, so the devtools bundle is never shipped to prod.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : null;

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        {children}
        {ReactQueryDevtools && (
          <Suspense>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </StrictMode>
  );
}
