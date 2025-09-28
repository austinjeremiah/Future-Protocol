"use client";

import React, { useState } from "react";
import type { FC } from "react";
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
import { TimeCapsuleService } from "@/lib/services/timecapsule";
import { LighthouseService } from "@/lib/services/lighthouse";
// ...existing code...

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
    capsuleId: '',
    privateKey: ''
  });
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockResult, setUnlockResult] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    content?: string;
  fileMetadata?: Record<string, unknown>;
  capsule?: Record<string, unknown>;
  }>({ type: null, message: '' });
  
  const [zkTLSLogs, setZkTLSLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Self Protocol Verification States
  const [showVerification, setShowVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUnlock = async () => {
    if (!address) {
      setUnlockResult({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!formData.capsuleId) {
      setUnlockResult({ type: 'error', message: 'Please enter a capsule ID' });
      return;
    }

    const capsuleId = parseInt(formData.capsuleId);
    if (isNaN(capsuleId) || capsuleId <= 0) {
      setUnlockResult({ type: 'error', message: 'Please enter a valid capsule ID (number)' });
      return;
    }

    // First step: Show Self Protocol verification
    if (!isVerified) {
      setShowVerification(true);
      setVerificationError(null);
      return;
    }

    // Second step: Proceed with actual unlock after verification
    setIsUnlocking(true);
    setUnlockResult({ type: null, message: '' });
    setZkTLSLogs([]);
    setShowLogs(true);

    try {
      const timeCapsuleService = new TimeCapsuleService();
      
      // Capture console logs for zkTLS process
      const originalConsoleLog = console.log;
      const logs: string[] = [];
      
  console.log = (...args: unknown[]) => {
        const logMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        logs.push(`[${new Date().toLocaleTimeString()}] ${logMessage}`);
        setZkTLSLogs([...logs]);
        originalConsoleLog(...args);
      };
      
      console.log(`🚀 Attempting to unlock capsule ${capsuleId} with zkTLS verification...`);
      
      const result = await timeCapsuleService.unlockTimeCapsule(capsuleId);

      // Restore original console.log
      console.log = originalConsoleLog;

      setUnlockResult({
        type: 'success',
        message: `🎉 Time capsule unlocked successfully! ${result.txHash ? `Transaction: ${result.txHash}` : ''}`,
        content: result.content,
        fileMetadata: result.fileMetadata,
        capsule: result.capsule
      });

      // Auto-download binary files (PDF, images, etc.)
      if (result.fileMetadata && !result.fileMetadata.isViewable) {
        console.log('🚀 Auto-downloading binary file for user...');
        setTimeout(async () => {
          try {
            const lighthouseService = new LighthouseService();
            await lighthouseService.downloadFileForUser(
              result.capsule.ipfsCid,
              `timecapsule-${result.capsule.title || 'file'}`
            );
            console.log('✅ Auto-download completed successfully');
          } catch (downloadError) {
            console.error('❌ Auto-download failed:', downloadError);
          }
        }, 1000); // Wait 1 second before auto-downloading
      }

  } catch (error) {
      // Restore original console.log
      console.log = console.log;
      
      console.error('❌ Error unlocking time capsule:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setUnlockResult({
        type: 'error',
        message: `Failed to unlock time capsule: ${errorMessage}`
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleDownloadFile = async () => {
    if (!unlockResult.capsule?.ipfsCid) return;
    
    setIsDownloading(true);
    try {
      const lighthouseService = new LighthouseService();
      await lighthouseService.downloadFileForUser(
        unlockResult.capsule.ipfsCid,
        `timecapsule-${unlockResult.capsule.title || 'file'}`
      );
      
      console.log('✅ File download initiated successfully');
    } catch (error) {
      console.error('❌ Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setShowVerification(false);
    setVerificationError(null);
    
    // Auto-trigger unlock after successful verification
    setTimeout(() => {
      handleUnlock();
    }, 500);
  };

  const handleVerificationError = (error: string) => {
    setVerificationError(error);
    setIsVerified(false);
  };

  const resetVerification = () => {
    setShowVerification(false);
    setIsVerified(false);
    setVerificationError(null);
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
                
                {/* Instructions */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start justify-center text-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-left">
                      <p className="text-blue-300 text-sm">
                        <strong>Secure Unlock Process:</strong>
                      </p>
                      <ol className="text-blue-200 text-xs mt-1 space-y-1">
                        <li>1. Enter the time capsule ID</li>
                        <li>2. Verify your identity using Self Protocol</li>
                        <li>3. Complete zkTLS verification</li>
                        <li>4. Access your time capsule content</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Capsule ID */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Capsule ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capsuleId"
                    value={formData.capsuleId}
                    onChange={handleInputChange}
                    placeholder="Enter capsule ID (e.g., 1, 2, 3...)"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    This is the unique capsule ID from when the time capsule was created
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

                {/* zkTLS Process Logs */}
                {showLogs && zkTLSLogs.length > 0 && (
                  <div className="bg-gray-900/80 border border-blue-500/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-blue-400 font-semibold text-sm flex items-center">
                        🔐 zkTLS Verification Process
                        {isUnlocking && (
                          <div className="ml-2 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </h3>
                      <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        {showLogs ? 'Hide' : 'Show'} Logs
                      </button>
                    </div>
                    <div className="bg-black/50 rounded p-3 max-h-48 overflow-y-auto font-mono text-xs text-green-400 leading-relaxed">
                      {zkTLSLogs.map((log, index) => (
                        <div key={index} className="mb-1 text-gray-300">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {unlockResult.type && (
                  <div className={`p-4 rounded-lg ${
                    unlockResult.type === 'success' 
                      ? 'bg-green-900/50 border border-green-500 text-green-300' 
                      : 'bg-red-900/50 border border-red-500 text-red-300'
                  }`}>
                    <div className="flex items-center">
                      {unlockResult.type === 'success' ? (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <span className="text-sm font-medium">{unlockResult.message}</span>
                        
                        {unlockResult.fileMetadata && (
                          <div className="mt-3 p-3 bg-gray-800 rounded border">
                            <h4 className="text-emerald-400 font-semibold text-sm mb-2">📁 File Information</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                              <div>Type: <span className="text-emerald-400">{unlockResult.fileMetadata.fileType}</span></div>
                              <div>Size: <span className="text-emerald-400">{unlockResult.fileMetadata.size} bytes</span></div>
                              <div>Format: <span className="text-emerald-400">{unlockResult.fileMetadata.contentType}</span></div>
                              <div>Viewable: <span className="text-emerald-400">{unlockResult.fileMetadata.isViewable ? 'Yes' : 'No'}</span></div>
                            </div>
                            
                            {!unlockResult.fileMetadata.isViewable && (
                              <button
                                onClick={handleDownloadFile}
                                disabled={isDownloading}
                                className="mt-3 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none text-sm flex items-center justify-center"
                              >
                                {isDownloading ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                      <path d="M14 2v6h6"/>
                                      <path d="M12 18v-6"/>
                                      <path d="M9 15l3 3 3-3"/>
                                    </svg>
                                    Download File
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {unlockResult.content && (
                          <div className="mt-2">
                            {unlockResult.fileMetadata?.fileType === 'Text' ? (
                              // Display actual text file content
                              <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                    <path d="M14 2v6h6"/>
                                  </svg>
                                  <span className="text-blue-300 text-sm font-medium">📄 Text File Content</span>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded border text-gray-100 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto font-mono leading-relaxed">
                                  {unlockResult.content}
                                </div>
                                <p className="mt-2 text-xs text-blue-400 italic">
                                  ✅ This is the actual content from the uploaded text file
                                </p>
                              </div>
                            ) : (
                              // Display file download information for binary files
                              <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                    <path d="M14 2v6h6"/>
                                    <path d="M12 18v-6"/>
                                    <path d="M9 15l3 3 3-3"/>
                                  </svg>
                                  <span className="text-green-300 text-sm font-medium">📁 File Download Ready</span>
                                </div>
                                <div className="p-3 bg-gray-800/50 rounded border text-gray-300 text-sm whitespace-pre-wrap">
                                  {unlockResult.content}
                                </div>
                                <p className="mt-2 text-xs text-green-400 italic">
                                  📥 The exact file uploaded by the sender will be downloaded
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {unlockResult.capsule && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              onClick={handleDownloadFile}
                              disabled={isDownloading}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded text-xs transition-colors flex items-center"
                            >
                              {isDownloading ? (
                                <>
                                  <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  📥 Download Original File
                                </>
                              )}
                            </button>
                            <a
                              href={`https://gateway.lighthouse.storage/ipfs/${unlockResult.capsule.ipfsCid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                              🔗 View on IPFS
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Unlock Button */}
                <button
                  onClick={handleUnlock}
                  disabled={!formData.capsuleId || !address || isUnlocking}
                  className={`w-full font-semibold py-4 px-8 rounded-lg transition-all duration-300 transform shadow-lg flex items-center justify-center ${
                    isVerified 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 hover:scale-105'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105'
                  } disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none text-white`}
                >
                  {isUnlocking ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        {isVerified ? (
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
                        ) : (
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM9 12l2 2 4-4"/>
                        )}
                      </svg>
                      {isVerified ? 'Unlock Time Capsule' : 'Verify Identity & Unlock'}
                    </>
                  )}
                </button>

                {/* Verification Status */}
                {isVerified && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM9 12l2 2 4-4"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-300 text-sm font-medium">Identity Verified Successfully ✓</p>
                          <p className="text-green-400/70 text-xs">You can now unlock the time capsule</p>
                        </div>
                      </div>
                      <button
                        onClick={resetVerification}
                        className="bg-green-700/30 hover:bg-green-700/50 text-green-300 px-3 py-1 rounded text-xs transition-colors border border-green-500/30"
                      >
                        Change Identity
                      </button>
                    </div>
                  </div>
                )}

                {verificationError && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-900/40 to-rose-900/40 border border-red-500/50 rounded-lg">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-red-300 text-sm font-medium">Verification Failed</p>
                        <p className="text-red-400/70 text-xs mt-1">{verificationError}</p>
                        <button
                          onClick={() => setShowVerification(true)}
                          className="mt-2 text-red-400 hover:text-red-300 text-xs underline"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Self Protocol Verification Modal */}
                {showVerification && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative max-w-lg w-full">
                      {/* Close Button */}
                      <button
                        onClick={resetVerification}
                        className="absolute -top-3 -right-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 z-10 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      {/* Verification Component removed: SelfProtocolVerification */}
                    </div>
                  </div>
                )}

                {/* Security Notice */}
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mt-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-blue-400 font-semibold text-sm mb-1">� zkTLS Security Features</h3>
                      <p className="text-blue-200 text-sm mb-2">
                        This unlock process includes advanced security features:
                      </p>
                      <ul className="text-blue-200 text-xs space-y-1">
                        <li>• zkTLS proof generation for time validation</li>
                        <li>• Multi-source NTP server verification</li>
                        <li>• Receiver authorization validation</li>
                        <li>• Blocklock decryption support</li>
                        <li>• All cryptographic operations performed locally</li>
                      </ul>
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
