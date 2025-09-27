// components/NetworkStatus.tsx - Display current network status
"use client";

import { useChainId, useAccount } from 'wagmi';
import { filecoinCalibration } from '@/lib/wagmi';

export function NetworkStatus() {
  const chainId = useChainId();
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  const isCorrectNetwork = chainId === filecoinCalibration.id;

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium ${
      isCorrectNetwork 
        ? 'bg-green-900 text-green-200 border border-green-700' 
        : 'bg-red-900 text-red-200 border border-red-700'
    }`}>
      {isCorrectNetwork ? (
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>Filecoin Calibration</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-red-400 rounded-full"></span>
          <span>Wrong Network (ID: {chainId})</span>
        </div>
      )}
    </div>
  );
}