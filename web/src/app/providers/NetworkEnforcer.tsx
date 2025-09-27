"use client";

import { useEffect, ReactNode } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { filecoinCalibration } from '@/lib/wagmi';

interface NetworkEnforcerProps {
  children: ReactNode;
}

export function NetworkEnforcer({ children }: NetworkEnforcerProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // Auto-switch to Filecoin Calibration if connected to wrong network
    if (isConnected && chainId !== filecoinCalibration.id) {
      console.log(`Wrong network detected (Chain ID: ${chainId}), switching to Filecoin Calibration (Chain ID: ${filecoinCalibration.id})`);
      
      const switchToFilecoin = async () => {
        try {
          await switchChain({ 
            chainId: filecoinCalibration.id 
          });
          console.log('Successfully switched to Filecoin Calibration');
        } catch (error: any) {
          console.error('Failed to switch to Filecoin Calibration:', error);
          
          // Show user-friendly instructions
          setTimeout(() => {
            alert(`⚠️ Wrong Network Detected!\n\nPlease manually switch to Filecoin Calibration testnet in your wallet:\n\n📋 Network Details:\n• Network Name: ${filecoinCalibration.name}\n• RPC URL: ${filecoinCalibration.rpcUrls.default.http[0]}\n• Chain ID: ${filecoinCalibration.id}\n• Currency Symbol: ${filecoinCalibration.nativeCurrency.symbol}\n\n🎯 This app only works on Filecoin Calibration testnet!`);
          }, 1000);
        }
      };

      switchToFilecoin();
    }
  }, [isConnected, chainId, switchChain]);

  // Show network warning if on wrong network
  if (isConnected && chainId !== filecoinCalibration.id) {
    return (
      <div className="min-h-screen bg-red-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-900 border border-red-700 rounded-lg p-6 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-100 mb-2">Wrong Network</h2>
          <p className="text-red-200 mb-4">
            You're connected to <strong>Chain ID {chainId}</strong>
          </p>
          <p className="text-red-300 mb-4">
            This app only works on <strong>Filecoin Calibration</strong> testnet.
          </p>
          <div className="bg-red-800 rounded p-3 mb-4 text-sm text-red-200">
            <div><strong>Network:</strong> {filecoinCalibration.name}</div>
            <div><strong>Chain ID:</strong> {filecoinCalibration.id}</div>
            <div><strong>RPC URL:</strong> {filecoinCalibration.rpcUrls.default.http[0]}</div>
            <div><strong>Currency:</strong> {filecoinCalibration.nativeCurrency.symbol}</div>
          </div>
          <button
            onClick={() => switchChain({ chainId: filecoinCalibration.id })}
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded transition-colors"
          >
            Switch to Filecoin Calibration
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}