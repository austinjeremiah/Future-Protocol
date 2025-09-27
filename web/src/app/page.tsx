"use client";

import LetterGlitch from '../components/LetterGlitch';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      router.push('/home');
    }
  }, [isConnected, address, router]);

  return (
    <div className="min-h-screen w-full relative">
      <LetterGlitch
        glitchSpeed={50}
        centerVignette={true}
        outerVignette={false}
        smooth={true}
      />
      {/* Connect Wallet Button - Centered */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {!isConnected ? (
          <div className="rainbowkit-connect-wrapper">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                authenticationStatus,
                mounted,
              }) => {
                const ready = mounted && authenticationStatus !== 'loading';
                const connected =
                  ready &&
                  account &&
                  chain &&
                  (!authenticationStatus ||
                    authenticationStatus === 'authenticated');

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      'style': {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            type="button"
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
                          >
                            Connect Wallet
                          </button>
                        );
                      }

                      return (
                        <Link 
                          href="/home"
                          className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
                        >
                          Launch App
                        </Link>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        ) : (
          <Link 
            href="/home"
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
          >
            Launch App
          </Link>
        )}
      </div>
    </div>
  );
}
