"use client";

import React, { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TimeCapsuleService } from "@/lib/services/timecapsule";
import { TimeCapsule } from "@/lib/types";
import { useEffect } from "react";

export function SidebarDemo() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    disconnect();
    router.push('/');
  };

  const links = [
    {
      label: "Create",
      href: "/home",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Unlock",
      href: "/unlock",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Dashboard",
      href: "/Dashboard",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-12 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet",
                href: "#",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {address ? address.slice(0, 2) : "W"}
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <DashboardContent />
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xl font-bold whitespace-pre text-black dark:text-white"
      >
        Future Protocol
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

const DashboardContent = () => {
  const { address } = useAccount();
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeCapsuleService = new TimeCapsuleService();

  // Calculate stats from actual capsules
  const stats = {
    total: capsules.length,
    created: capsules.filter(c => c.creator.toLowerCase() === address?.toLowerCase()).length,
    received: capsules.filter(c => c.recipient.toLowerCase() === address?.toLowerCase()).length,
    sealed: capsules.filter(c => !c.isUnlocked).length
  };

  const refreshCapsules = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Loading time capsules...');
      const userCapsules = await timeCapsuleService.getUserTimeCapsules();
      setCapsules(userCapsules);
      console.log(`Loaded ${userCapsules.length} time capsules`);
    } catch (error: any) {
      console.error('Error loading time capsules:', error);
      setError(`Failed to load time capsules: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load capsules when component mounts or address changes
  useEffect(() => {
    if (address) {
      refreshCapsules();
    }
  }, [address]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-emerald-500 font-bold text-xl mr-4">TONE</div>
            <Link 
              href="/home" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Time Capsule Dashboard</h1>
            <p className="text-gray-400 mb-4">Manage and view your encrypted time capsules</p>
            <div className="text-sm text-gray-500">
              Connected: <span className="text-emerald-500 font-mono">{address || 'Not connected'}</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Total Capsules</h3>
              <div className="text-3xl font-bold text-emerald-500 mb-1">{stats.total}</div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Created by You</h3>
              <div className="text-3xl font-bold text-blue-500 mb-1">{stats.created}</div>
              <div className="text-xs text-gray-500">Files you sent</div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Sent to You</h3>
              <div className="text-3xl font-bold text-emerald-500 mb-1">{stats.received}</div>
              <div className="text-xs text-gray-500">Files you received</div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
              <h3 className="text-gray-400 text-sm mb-2">Sealed</h3>
              <div className="text-3xl font-bold text-yellow-500 mb-1">{stats.sealed}</div>
              <div className="text-xs text-emerald-500">Server: online</div>
            </div>
          </div>

          {/* Your Time Capsules Section */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Your Time Capsules</h2>
              <button
                onClick={refreshCapsules}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Refresh Capsules
              </button>
            </div>

            <div className="border border-gray-600 rounded-lg p-4 mb-4">
              <div className="text-gray-300 text-sm mb-2">
                Loading capsules for: <span className="font-mono text-emerald-500">{address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Not connected'}</span>
              </div>
              <div className="text-gray-500 text-sm">
                This will show all capsules you created or received
              </div>
            </div>
          </div>

          {/* Time Capsules List */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Time Capsules</h2>
            
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                <div className="text-red-400 font-medium">Error Loading Capsules</div>
                <div className="text-red-300 text-sm mt-1">{error}</div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                <span className="ml-3 text-gray-400">Loading time capsules...</span>
              </div>
            ) : capsules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                {/* Empty State Icon */}
                <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">No time capsules found</h3>
                <p className="text-gray-400 text-center max-w-md">
                  You haven't created or received any time capsules yet. 
                  Create your first capsule to preserve memories for the future.
                </p>
                
                <div className="flex gap-4 mt-6">
                  <Link
                    href="/home"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Create Capsule
                  </Link>
                  <Link
                    href="/unlock"
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Unlock Capsule
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {capsules.map((capsule) => (
                  <div key={capsule.id} className="bg-gray-800 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-500 font-mono text-sm">#{capsule.id}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          capsule.isUnlocked 
                            ? 'bg-green-900 text-green-300' 
                            : new Date() >= new Date(capsule.unlockTime)
                            ? 'bg-yellow-900 text-yellow-300'
                            : 'bg-blue-900 text-blue-300'
                        }`}>
                          {capsule.isUnlocked 
                            ? 'Unlocked' 
                            : new Date() >= new Date(capsule.unlockTime)
                            ? 'Ready to Unlock'
                            : 'Sealed'
                          }
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          capsule.creator.toLowerCase() === address?.toLowerCase()
                            ? 'bg-purple-900 text-purple-300'
                            : 'bg-orange-900 text-orange-300'
                        }`}>
                          {capsule.creator.toLowerCase() === address?.toLowerCase() ? 'Created' : 'Received'}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(capsule.unlockTime).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>From:</strong> 
                      <span className="font-mono ml-1 text-emerald-400">
                        {capsule.creator.slice(0, 6)}...{capsule.creator.slice(-4)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-2">
                      <strong>To:</strong> 
                      <span className="font-mono ml-1 text-blue-400">
                        {capsule.recipient.slice(0, 6)}...{capsule.recipient.slice(-4)}
                      </span>
                    </div>

                    {capsule.contentHash && (
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>IPFS Hash:</strong> 
                        <span className="font-mono ml-1">{capsule.contentHash.slice(0, 20)}...</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs text-gray-500">
                        Unlock: {new Date(capsule.unlockTime).toLocaleString()}
                      </div>
                      {!capsule.isUnlocked && new Date() >= new Date(capsule.unlockTime) && (
                        <Link
                          href={`/unlock?id=${capsule.id}`}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Unlock Now
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full">
      <SidebarDemo />
    </div>
  );
}
