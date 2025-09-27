// lib/wagmi.ts - Wagmi configuration
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi/chains';

// Define the Filecoin Calibration network (testnet) with complete configuration
export const filecoinCalibration: Chain = {
  id: 314159,
  name: 'Filecoin Calibration',
  nativeCurrency: {
    decimals: 18,
    name: 'Calibration filecoin',
    symbol: 'tFIL',
  },
  rpcUrls: {
    default: { 
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
      webSocket: ['wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1']
    },
    public: { 
      http: ['https://api.calibration.node.glif.io/rpc/v1'],
      webSocket: ['wss://wss.calibration.node.glif.io/apigw/lotus/rpc/v1']
    },
  },
  blockExplorers: {
    default: { 
      name: 'Filfox Calibration', 
      url: 'https://calibration.filfox.info/en',
      apiUrl: 'https://calibration.filfox.info/api'
    },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 322000,
    },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'Future Protocol Time Capsule',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo-project-id',
  chains: [filecoinCalibration], // Only Filecoin Calibration - no other networks
  ssr: true,
  batch: {
    multicall: true,
  },
});