'use client'

import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { filecoinCalibration } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

// Define Filecoin Calibration with TFIL token - Clean implementation
const filecoinCalibrationWithTFIL = {
  ...filecoinCalibration,
  name: 'Filecoin Calibration',
  nativeCurrency: {
    name: 'Test Filecoin',
    symbol: 'TFIL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
    },
    public: {
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Filscan Calibration',
      url: 'https://calibration.filscan.io',
    },
  },
}

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [filecoinCalibrationWithTFIL],
  [publicProvider()]
)

// Add MetaMask connector with clean options
const metaMaskConnector = new MetaMaskConnector({
  chains,
  options: {
    shimDisconnect: true,
  },
})

// Create wagmi config - Clean implementation with just MetaMask
const config = createConfig({
  autoConnect: true,
  connectors: [metaMaskConnector],
  publicClient,
  webSocketPublicClient,
})

// Create query client
const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <RainbowKitProvider chains={chains}>
          {children}
          <Toaster position="top-right" />
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}