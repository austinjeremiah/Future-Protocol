// components/SetupChecker.tsx - Check if environment is properly configured
"use client";

import { useState, useEffect } from 'react';

export function SetupChecker() {
  const [setupStatus, setSetupStatus] = useState<{
    lighthouse: boolean;
    walletConnect: boolean;
    isComplete: boolean;
  }>({
    lighthouse: false,
    walletConnect: false,
    isComplete: false
  });

  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check environment variables
    const lighthouseKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
    const wcProjectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

    const lighthouse = Boolean(lighthouseKey && lighthouseKey !== '' && lighthouseKey !== 'your_lighthouse_api_key_here');
    const walletConnect = Boolean(wcProjectId && wcProjectId !== '' && wcProjectId !== 'your_walletconnect_project_id_here');
    const isComplete = lighthouse && walletConnect;

    setSetupStatus({
      lighthouse,
      walletConnect,
      isComplete
    });

    // Auto-show guide if setup is incomplete
    if (!isComplete) {
      setShowGuide(true);
    }
  }, []);

  if (setupStatus.isComplete) {
    return null; // Don't show anything if setup is complete
  }

  return (
    <>
      {/* Floating setup indicator */}
      <div className="fixed bottom-20 left-4 z-50 bg-red-900 border border-red-700 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-red-400">⚠️</span>
          <span className="text-red-200 text-sm font-medium">Setup Required</span>
          <button
            onClick={() => setShowGuide(true)}
            className="text-red-300 hover:text-red-100 text-xs underline"
          >
            Fix Now
          </button>
        </div>
      </div>

      {/* Setup guide modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">🚀 Setup Required</h2>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Status checks */}
              <div className="space-y-4 mb-6">
                <div className={`p-3 rounded-lg border ${
                  setupStatus.lighthouse 
                    ? 'bg-green-900 border-green-700' 
                    : 'bg-red-900 border-red-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span>{setupStatus.lighthouse ? '✅' : '❌'}</span>
                    <span className="text-white font-medium">Lighthouse IPFS API Key</span>
                  </div>
                  {!setupStatus.lighthouse && (
                    <p className="text-red-300 text-sm mt-2">
                      Missing NEXT_PUBLIC_LIGHTHOUSE_API_KEY in .env.local
                    </p>
                  )}
                </div>

                <div className={`p-3 rounded-lg border ${
                  setupStatus.walletConnect 
                    ? 'bg-green-900 border-green-700' 
                    : 'bg-red-900 border-red-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span>{setupStatus.walletConnect ? '✅' : '❌'}</span>
                    <span className="text-white font-medium">WalletConnect Project ID</span>
                  </div>
                  {!setupStatus.walletConnect && (
                    <p className="text-red-300 text-sm mt-2">
                      Missing NEXT_PUBLIC_WC_PROJECT_ID in .env.local
                    </p>
                  )}
                </div>
              </div>

              {/* Quick setup instructions */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-white font-bold mb-3">Quick Setup Steps:</h3>
                
                {!setupStatus.lighthouse && (
                  <div className="mb-4">
                    <h4 className="text-emerald-400 font-medium mb-2">1. Get Lighthouse API Key</h4>
                    <ol className="text-gray-300 text-sm space-y-1 ml-4">
                      <li>• Go to <a href="https://lighthouse.storage" target="_blank" className="text-blue-400 hover:text-blue-300">lighthouse.storage</a></li>
                      <li>• Sign up for free account</li>
                      <li>• Get your API key from dashboard</li>
                      <li>• Add to .env.local: <code className="bg-gray-700 px-1 rounded">NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_key</code></li>
                    </ol>
                  </div>
                )}

                {!setupStatus.walletConnect && (
                  <div className="mb-4">
                    <h4 className="text-blue-400 font-medium mb-2">2. Get WalletConnect Project ID</h4>
                    <ol className="text-gray-300 text-sm space-y-1 ml-4">
                      <li>• Go to <a href="https://cloud.walletconnect.com" target="_blank" className="text-blue-400 hover:text-blue-300">cloud.walletconnect.com</a></li>
                      <li>• Create free project</li>
                      <li>• Copy your Project ID</li>
                      <li>• Add to .env.local: <code className="bg-gray-700 px-1 rounded">NEXT_PUBLIC_WC_PROJECT_ID=your_id</code></li>
                    </ol>
                  </div>
                )}

                <div className="mt-4 p-3 bg-yellow-900 border border-yellow-700 rounded">
                  <p className="text-yellow-200 text-sm">
                    <strong>Important:</strong> After adding the API keys, restart your development server with <code className="bg-yellow-800 px-1 rounded">npm run dev</code>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between">
                <a
                  href="https://github.com/austinjeremiah/Future-Protocol/blob/main/API_SETUP_GUIDE.md"
                  target="_blank"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  📖 Full Setup Guide
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition-colors"
                >
                  🔄 Check Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}