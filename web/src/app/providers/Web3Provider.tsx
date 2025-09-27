"use client";

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from '@/lib/wagmi';
import { NetworkEnforcer } from './NetworkEnforcer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <NetworkEnforcer>
            {children}
          </NetworkEnforcer>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}