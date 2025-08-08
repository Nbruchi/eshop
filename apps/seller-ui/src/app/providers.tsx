'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as JotaiProvider } from 'jotai';
import { WebSocketProvider } from '../context/WebSocketContext';
import useSeller from '../hooks/useSeller';

interface Props {
  children?: ReactNode;
}

const Providers = ({ children }: Props) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <ProvidersWithWebSocket>{children}</ProvidersWithWebSocket>
      </QueryClientProvider>
    </JotaiProvider>
  );
};

const ProvidersWithWebSocket = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const { seller, isLoading } = useSeller();

  if (isLoading) return null;

  return (
    <>
      {seller ? (
        <WebSocketProvider seller={seller}>{children}</WebSocketProvider>
      ) : (
        children
      )}
    </>
  );
};

export default Providers;
