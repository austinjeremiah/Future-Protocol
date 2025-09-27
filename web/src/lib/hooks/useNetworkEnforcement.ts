// lib/hooks/useNetworkEnforcement.ts - Enforce Filecoin Calibration network
import { useEffect } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { filecoinCalibration } from '../wagmi';

export function useNetworkEnforcement() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    // Auto-switch to Filecoin Calibration if connected to wrong network
    if (isConnected && chainId !== filecoinCalibration.id) {
      console.log(`Wrong network detected (${chainId}), switching to Filecoin Calibration (${filecoinCalibration.id})`);
      
      const performSwitch = async () => {
        try {
          await switchChain({ 
            chainId: filecoinCalibration.id 
          });
        } catch (error: any) {
          console.error('Failed to switch to Filecoin Calibration:', error);
          
          // Show user-friendly message
          alert(`Please manually switch to Filecoin Calibration testnet in your wallet:\n\nNetwork Name: ${filecoinCalibration.name}\nRPC URL: ${filecoinCalibration.rpcUrls.default.http[0]}\nChain ID: ${filecoinCalibration.id}\nCurrency: ${filecoinCalibration.nativeCurrency.symbol}`);
        }
      };

      performSwitch();
    }
  }, [isConnected, chainId, switchChain]);

  return {
    isCorrectNetwork: chainId === filecoinCalibration.id,
    targetNetwork: filecoinCalibration,
    currentChainId: chainId,
  };
}