// components/NetworkSetupGuide.tsx - Help users add Filecoin Calibration network
"use client";

import { useState } from 'react';
import { filecoinCalibration } from '@/lib/wagmi';

export function NetworkSetupGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const addFilecoinNetwork = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${filecoinCalibration.id.toString(16)}`, // Convert to hex
            chainName: filecoinCalibration.name,
            nativeCurrency: {
              name: filecoinCalibration.nativeCurrency.name,
              symbol: filecoinCalibration.nativeCurrency.symbol,
              decimals: filecoinCalibration.nativeCurrency.decimals,
            },
            rpcUrls: filecoinCalibration.rpcUrls.default.http,
            blockExplorerUrls: filecoinCalibration.blockExplorers ? [filecoinCalibration.blockExplorers.default.url] : [],
          }],
        });
        
        // Switch to the network after adding
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${filecoinCalibration.id.toString(16)}` }],
        });
        
        alert('✅ Successfully added and switched to Filecoin Calibration!');
      } catch (error: any) {
        console.error('Failed to add network:', error);
        alert(`❌ Failed to add network: ${error.message}`);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('📋 Copied to clipboard!');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        🛠️ Network Setup
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Add Filecoin Calibration</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            This app requires Filecoin Calibration testnet. Add it to your wallet:
          </p>

          <button
            onClick={addFilecoinNetwork}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            🚀 Auto-Add Network to MetaMask
          </button>

          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-white font-medium mb-2">Manual Setup:</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                <span className="text-gray-300">Network Name:</span>
                <button
                  onClick={() => copyToClipboard(filecoinCalibration.name)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {filecoinCalibration.name}
                </button>
              </div>
              
              <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                <span className="text-gray-300">RPC URL:</span>
                <button
                  onClick={() => copyToClipboard(filecoinCalibration.rpcUrls.default.http[0])}
                  className="text-blue-400 hover:text-blue-300 text-xs break-all"
                >
                  {filecoinCalibration.rpcUrls.default.http[0]}
                </button>
              </div>
              
              <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                <span className="text-gray-300">Chain ID:</span>
                <button
                  onClick={() => copyToClipboard(filecoinCalibration.id.toString())}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {filecoinCalibration.id}
                </button>
              </div>
              
              <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                <span className="text-gray-300">Currency:</span>
                <button
                  onClick={() => copyToClipboard(filecoinCalibration.nativeCurrency.symbol)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {filecoinCalibration.nativeCurrency.symbol}
                </button>
              </div>
              
              <div className="bg-gray-800 p-2 rounded flex justify-between items-center">
                <span className="text-gray-300">Explorer:</span>
                <a
                  href={filecoinCalibration.blockExplorers?.default.url || 'https://calibration.filfox.info/en'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Filfox ↗
                </a>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 border border-blue-700 p-3 rounded text-xs text-blue-200">
            <div className="font-medium mb-1">💡 Need test tokens?</div>
            <div>Get free tFIL from the <a href="https://faucet.calibration.fildev.network/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Calibration Faucet ↗</a></div>
          </div>
        </div>
      </div>
    </div>
  );
}