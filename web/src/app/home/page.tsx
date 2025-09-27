"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { TimeCapsuleService } from "@/lib/services/timecapsule";
import { CreateTimeCapsuleData } from "@/lib/types";
import { useNetworkGuard } from "@/lib/hooks/useNetworkGuard";

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
      <Dashboard />
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

// Time capsule creation component
const Dashboard = () => {
  const { address } = useAccount();
  const { ensureCorrectNetwork, isCorrectNetwork, isSwitching, networkName } = useNetworkGuard();
  const [formData, setFormData] = useState({
    recipientAddress: '',
    unlockDate: '',
    unlockTime: '12:00',
    message: '',
    file: null as File | null
  });
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCapsule = async () => {
    if (!address) {
      setCreationStatus({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!formData.recipientAddress || !formData.unlockDate) {
      setCreationStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setIsCreating(true);
    setCreationStatus({ type: null, message: '' });

    try {
      // First, ensure we're on the correct network
      setCreationStatus({ type: null, message: 'Checking network...' });
      await ensureCorrectNetwork();

      setCreationStatus({ type: null, message: 'Creating time capsule...' });
      // Create unlock timestamp
      const unlockDateTime = new Date(`${formData.unlockDate}T${formData.unlockTime}`);
      const unlockTimestamp = Math.floor(unlockDateTime.getTime() / 1000);

      // Validate unlock time is in the future
      if (unlockTimestamp <= Math.floor(Date.now() / 1000)) {
        throw new Error('Unlock time must be in the future');
      }

      const timeCapsuleService = new TimeCapsuleService();
      
      const createData: CreateTimeCapsuleData = {
        title: `Time Capsule - ${new Date().toLocaleDateString()}`,
        message: formData.message || 'A message from the past...',
        recipientAddress: formData.recipientAddress,
        unlockTime: unlockTimestamp,
        file: formData.file || undefined
      };

      console.log('Creating time capsule...', createData);
      
      const result = await timeCapsuleService.createTimeCapsule(createData);

      setCreationStatus({
        type: 'success',
        message: `Time capsule created successfully! Capsule ID: ${result.capsuleId}, Transaction: ${result.txHash}`
      });

      // Reset form
      setFormData({
        recipientAddress: '',
        unlockDate: '',
        unlockTime: '12:00',
        message: '',
        file: null
      });

    } catch (error: any) {
      console.error('Error creating time capsule:', error);
      setCreationStatus({
        type: 'error',
        message: `Failed to create time capsule: ${error.message || 'Unknown error'}`
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 overflow-hidden">
        <div className="p-6 md:p-10 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                Create Time Capsule
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Preserve your precious memories for the future
              </p>
            </div>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload File *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 text-emerald-500 mb-4">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 10l5-5 5 5" />
                        <path d="M12 5v14" />
                      </svg>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      Drag and drop your file here, or{" "}
                      <label className="text-emerald-600 hover:text-emerald-700 cursor-pointer underline">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                        />
                      </label>
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: Photos, Videos, Audio, Documents (Max: 100MB)
                    </p>
                    {formData.file && (
                      <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                        Selected: {formData.file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Creator Address */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H19A2 2 0 0 0 21 19V9M19 19H5V3H14V9H19Z" />
                  </svg>
                  Your Address (Creator) *
                </label>
                <input
                  type="text"
                  value={address || ''}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  ✓ Auto-filled from connected wallet
                </p>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19A2 2 0 0 0 5 21H19A2 2 0 0 0 21 19V9M19 19H5V3H14V9H19Z" />
                  </svg>
                  Recipient Address *
                </label>
                <input
                  type="text"
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleInputChange}
                  placeholder="0x5678...efgh (recipient wallet address)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This person will be able to unlock the capsule after the unlock time
                </p>
              </div>

              {/* Unlock Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3M19 19H5V8H19V19Z" />
                    </svg>
                    Unlock Date *
                  </label>
                  <input
                    type="date"
                    name="unlockDate"
                    value={formData.unlockDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M15.5 13H11V7H12.5V11.5H15.5V13Z" />
                    </svg>
                    Unlock Time
                  </label>
                  <input
                    type="time"
                    name="unlockTime"
                    value={formData.unlockTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
                  </svg>
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write a message for the future..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Status Messages */}
              {creationStatus.type && (
                <div className={`p-4 rounded-lg ${
                  creationStatus.type === 'success' 
                    ? 'bg-green-100 border border-green-500 text-green-700' 
                    : 'bg-red-100 border border-red-500 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {creationStatus.type === 'success' ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm">{creationStatus.message}</span>
                  </div>
                </div>
              )}

              {/* Create Button */}
              <button
                onClick={handleCreateCapsule}
                disabled={!formData.recipientAddress || !formData.unlockDate || isCreating}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg flex items-center justify-center"
              >
                {isCreating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Time Capsule...
                  </>
                ) : (
                  'Create Time Capsule'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen w-full">
      <SidebarDemo />
    </div>
  );
}
