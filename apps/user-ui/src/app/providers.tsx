'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useUser from '../hooks/useUser';
import { WebSocketProvider } from '../context/WebSocketContext';

const Providers = ({ children }: Readonly<{ children: ReactNode }>) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
    </QueryClientProvider>
  );
};

const ProvidersWithWebSocket = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  return (
    <>
      {user ? (
        <WebSocketProvider user={user}>{children}</WebSocketProvider>
      ) : (
        children
      )}
    </>
  );
};

export default Providers;
