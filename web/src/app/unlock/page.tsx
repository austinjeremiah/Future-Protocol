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
      <UnlockContent />
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

const UnlockContent = () => {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    fileId: '',
    privateKey: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUnlock = () => {
    // TODO: Implement unlock logic
    console.log('Unlocking time capsule with data:', formData);
    alert('Time capsule unlock functionality will be implemented soon!');
  };

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-black dark:border-neutral-700 dark:bg-black overflow-hidden">
        <div className="p-6 md:p-10 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 border border-emerald-500 rounded-xl p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-emerald-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                  </svg>
                  <h1 className="text-3xl font-bold text-white">Unlock Time Capsule</h1>
                </div>
              </div>

              <div className="space-y-6">
                {/* File ID */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    File ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fileId"
                    value={formData.fileId}
                    onChange={handleInputChange}
                    placeholder="Enter file ID (bytes32 format)"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This is the unique file ID (bytes32) from the blockchain contract
                  </p>
                </div>

                {/* Your Address */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Your Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address || ''}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                  <div className="flex items-center mt-1">
                    <svg className="w-4 h-4 text-emerald-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-emerald-500 text-sm">Auto-filled from connected wallet</span>
                  </div>
                </div>

                {/* Private Key */}
                <div>
                  <label className="flex items-center text-sm font-medium text-white mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31.84 2.41 2 2.83V23h2v-3.17c1.16-.41 2-1.51 2-2.83 0-1.66-1.34-3-3-3zm13-9v4c0 1.1-.9 2-2 2h-1v2c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h1V4c0-2.76 2.24-5 5-5s5 2.24 5 5v2h1c1.1 0 2 .9 2 2zM12 4c-1.66 0-3 1.34-3 3v2h6V7c0-1.66-1.34-3-3-3z"/>
                    </svg>
                    Private Key <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="privateKey"
                    value={formData.privateKey}
                    onChange={handleInputChange}
                    placeholder="Paste your private key here..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none font-mono text-sm"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This is the private key you received when creating the capsule
                  </p>
                </div>

                {/* Unlock Button */}
                <button
                  onClick={handleUnlock}
                  disabled={!formData.fileId || !formData.privateKey || !address}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  Unlock Time Capsule
                </button>

                {/* Security Notice */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mt-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-blue-400 font-semibold text-sm mb-1">🔒 Security Notice</h3>
                      <p className="text-blue-200 text-sm">
                        Your private key is processed locally and never sent to our servers. 
                        Make sure you're the intended recipient before unlocking the capsule.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UnlockPage() {
  return (
    <div className="min-h-screen w-full">
      <SidebarDemo />
    </div>
  );
}
