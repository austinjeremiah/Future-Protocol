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
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock stats - replace with real data
  const stats = {
    total: 0,
    created: 0,
    received: 0,
    sealed: 0
  };

  const refreshCapsules = async () => {
    setLoading(true);
    // TODO: Implement actual capsule loading logic
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-black dark:border-neutral-700 dark:bg-black overflow-hidden">
        <div className="p-6 md:p-10 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Time Capsule Dashboard</h1>
              <p className="text-gray-400 mb-4">Manage and view your encrypted time capsules</p>
              {address && (
                <p className="text-sm text-gray-500">
                  Connected: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Total Capsules</h3>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Created</h3>
                <p className="text-2xl font-bold text-emerald-500">{stats.created}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Received</h3>
                <p className="text-2xl font-bold text-blue-500">{stats.received}</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-gray-400 text-sm font-medium mb-2">Sealed</h3>
                <p className="text-2xl font-bold text-purple-500">{stats.sealed}</p>
              </div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm">
                  All Capsules
                </button>
                <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">
                  Created by Me
                </button>
                <button className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">
                  Received
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={refreshCapsules}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  <svg 
                    className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                <Link
                  href="/home"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                >
                  + New Capsule
                </Link>
              </div>
            </div>

            {/* Capsules List or Empty State */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              {capsules.length === 0 ? (
                <div className="text-center py-12 px-6">
                  {/* Empty State Icon */}
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">No time capsules found</h3>
                  <p className="text-gray-400 text-center max-w-md mx-auto">
                    You haven't created or received any time capsules yet. 
                    Create your first capsule to preserve memories for the future.
                  </p>
                  
                  <div className="flex gap-4 mt-6 justify-center">
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
                // TODO: Capsules list view will go here
                <div className="p-6">
                  <p className="text-gray-400">Capsules list will be displayed here...</p>
                </div>
              )}
            </div>
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