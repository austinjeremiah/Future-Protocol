"use client";

import LetterGlitch from '../components/LetterGlitch';
import Link from 'next/link';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected && address) {
      router.push('/home');
    }
  }, [isConnected, address, router]);

  const handleConnect = async () => {
    await open();
  };

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
          <button
            onClick={handleConnect}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 border border-white/20 backdrop-blur-sm"
          >
            Connect Wallet
          </button>
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
