// lib/hooks/useNetworkGuard.ts - Network protection for operations
"use client";

import { useChainId, useSwitchChain, useAccount } from 'wagmi';
import { filecoinCalibration } from '../wagmi';
import { useState, useCallback } from 'react';

export function useNetworkGuard() {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);

  const isCorrectNetwork = chainId === filecoinCalibration.id;

  const ensureCorrectNetwork = useCallback(async (): Promise<boolean> => {
    if (!isConnected) {
      throw new Error('Please connect your wallet first');
    }

    if (chainId === filecoinCalibration.id) {
      return true; // Already on correct network
    }

    console.log(`Switching from chain ${chainId} to Filecoin Calibration (${filecoinCalibration.id})`);
    setIsSwitching(true);

    try {
      await switchChain({ 
        chainId: filecoinCalibration.id 
      });
      
      // Wait a moment for the switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSwitching(false);
      return true;
    } catch (error: any) {
      setIsSwitching(false);
      console.error('Failed to switch to Filecoin Calibration:', error);
      
      // Show detailed error message
      const errorMsg = `❌ Network Switch Required!\n\n` +
        `Current Network: Chain ID ${chainId}\n` +
        `Required Network: ${filecoinCalibration.name} (Chain ID ${filecoinCalibration.id})\n\n` +
        `Please manually switch to Filecoin Calibration in your wallet:\n` +
        `• Network Name: ${filecoinCalibration.name}\n` +
        `• RPC URL: ${filecoinCalibration.rpcUrls.default.http[0]}\n` +
        `• Chain ID: ${filecoinCalibration.id}\n` +
        `• Currency: ${filecoinCalibration.nativeCurrency.symbol}\n\n` +
        `Error: ${error.message}`;
        
      alert(errorMsg);
      throw new Error('Network switch required. Please switch to Filecoin Calibration manually.');
    }
  }, [isConnected, chainId, switchChain]);

  return {
    isCorrectNetwork,
    isConnected,
    currentChainId: chainId,
    targetChainId: filecoinCalibration.id,
    isSwitching,
    ensureCorrectNetwork,
    networkName: filecoinCalibration.name,
  };
}