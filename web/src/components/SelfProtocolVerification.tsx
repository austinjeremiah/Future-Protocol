"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries, 
  getUniversalLink,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";

interface SelfProtocolVerificationProps {
  onVerificationSuccess: () => void;
  onVerificationError: (error: string) => void;
  capsuleId?: number;
}

export default function SelfProtocolVerification({ 
  onVerificationSuccess, 
  onVerificationError,
  capsuleId 
}: SelfProtocolVerificationProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<any | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'qr' | 'scanning' | 'processing'>('qr');
  
  // Use actual user ID from connected wallet or generate one
  const [userId] = useState(ethers.ZeroAddress);
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], []);

  // Initialize Self Protocol
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Future Protocol",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "test-scope",
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png", 
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex", 
        userDefinedData: `Hello welcome to Future Protocol! Verify identity to unlock Time Capsule ${capsuleId || 'Unknown'}`,
        disclosures: {
          name: true,
          minimumAge: 18,
          excludedCountries: excludedCountries,
          nationality: true,
          date_of_birth: true,
        }
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
      onVerificationError("Failed to initialize verification system");
    }
  }, [excludedCountries, userId, capsuleId, onVerificationError]);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleSuccessfulVerification = () => {
    setVerificationStep('scanning');
    displayToast("QR Code scanned! Verifying identity...");
    
    setTimeout(() => {
      setVerificationStep('processing');
      setIsVerifying(true);
      displayToast("Identity verified! Processing unlock...");
    }, 1000);
    
    setTimeout(() => {
      setIsVerifying(false);
      onVerificationSuccess();
    }, 2500);
  };

  const handleVerificationError = () => {
    displayToast("Verification failed. Please try again.");
    onVerificationError("Identity verification failed");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 p-6">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <svg className="w-8 h-8 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
          <h2 className="text-xl font-bold text-white">Identity Verification Required</h2>
        </div>
        <p className="text-sm text-gray-300">
          Scan QR code with Self Protocol App to verify your identity and unlock Time Capsule {capsuleId}
        </p>
      </div>

      {/* Verification Steps Indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${verificationStep === 'qr' ? 'text-blue-400' : verificationStep === 'scanning' || verificationStep === 'processing' ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${verificationStep === 'qr' ? 'border-blue-400 bg-blue-400/20' : verificationStep === 'scanning' || verificationStep === 'processing' ? 'border-green-400 bg-green-400/20' : 'border-gray-500'}`}>
              {(verificationStep === 'scanning' || verificationStep === 'processing') ? '✓' : '1'}
            </div>
            <span className="text-xs font-medium">Scan QR</span>
          </div>
          <div className={`w-8 h-0.5 ${verificationStep === 'scanning' || verificationStep === 'processing' ? 'bg-green-400' : 'bg-gray-600'}`}></div>
          <div className={`flex items-center ${verificationStep === 'scanning' ? 'text-blue-400' : verificationStep === 'processing' ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${verificationStep === 'scanning' ? 'border-blue-400 bg-blue-400/20' : verificationStep === 'processing' ? 'border-green-400 bg-green-400/20' : 'border-gray-500'}`}>
              {verificationStep === 'processing' ? '✓' : verificationStep === 'scanning' ? '⚡' : '2'}
            </div>
            <span className="text-xs font-medium">Verify</span>
          </div>
          <div className={`w-8 h-0.5 ${verificationStep === 'processing' ? 'bg-green-400' : 'bg-gray-600'}`}></div>
          <div className={`flex items-center ${verificationStep === 'processing' ? 'text-blue-400' : 'text-gray-500'}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${verificationStep === 'processing' ? 'border-blue-400 bg-blue-400/20 animate-pulse' : 'border-gray-500'}`}>
              {verificationStep === 'processing' ? '🔓' : '3'}
            </div>
            <span className="text-xs font-medium">Unlock</span>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {selfApp ? (
            <div className="p-4 bg-white rounded-lg">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccessfulVerification}
                onError={() => {
                  displayToast("Error: Failed to verify identity");
                  onVerificationError("Identity verification failed");
                }}
              />
            </div>
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-700/50 animate-pulse flex items-center justify-center rounded-lg border border-gray-600">
              <p className="text-gray-400 text-sm">Loading Self Protocol QR Code...</p>
            </div>
          )}
          
          {/* Scanning Overlay */}
          {verificationStep === 'scanning' && (
            <div className="absolute inset-0 bg-green-900/80 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-2 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zM9 12l2 2 4-4"/>
                </svg>
                <p className="text-green-300 text-sm font-medium">Verifying Identity...</p>
              </div>
            </div>
          )}
          
          {/* Processing Overlay */}
          {verificationStep === 'processing' && (
            <div className="absolute inset-0 bg-blue-900/80 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-blue-400 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-blue-300 text-sm font-medium">Processing Unlock...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 mb-4">
        <button
          type="button"
          onClick={copyToClipboard}
          disabled={!universalLink || isVerifying}
          className="w-full bg-gray-700 hover:bg-gray-600 transition-colors text-white py-2 px-4 rounded-lg text-sm disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {linkCopied ? "Copied!" : "Copy Universal Link"}
        </button>

        <button
          type="button"
          onClick={openSelfApp}
          disabled={!universalLink || isVerifying}
          className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white py-2 px-4 rounded-lg text-sm disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Self App
        </button>
      </div>

      {/* User Address Display */}
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
        <div className="text-center">
          <span className="text-gray-400 text-xs uppercase tracking-wide block mb-1">Verification Address</span>
          <div className="text-xs font-mono text-gray-300 break-all">
            {userId}
          </div>
        </div>
      </div>

      {/* Verification Status */}
      {isVerifying && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-500/50 rounded-lg">
          <div className="flex items-center justify-center">
            <svg className="animate-spin w-4 h-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-green-300 text-sm">Processing verification...</span>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg animate-fade-in text-sm z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}