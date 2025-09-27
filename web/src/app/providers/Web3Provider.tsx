"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

// 1. Using a default project ID - you should replace this with your own
const projectId = "2f05a7cde11b9f9225a9b4c7f1d3e8f6"; // Temporary project ID

// 2. Create wagmiConfig
const metadata = {
  name: "Future Protocol",
  description: "Future Protocol Web3 App",
  url: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"]
};

const chains = [mainnet, sepolia] as const;

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
});

// 3. Create modal only on client side
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
  });
}

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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}