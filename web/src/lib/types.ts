// lib/types.ts - TypeScript interfaces for the application
export interface TimeCapsule {
  id: number;
  ipfsCid: string;
  contentHash?: string;
  creator: string;
  recipient: string;
  title: string;
  unlockTime: number;
  isUnlocked: boolean;
  usesBlocklock: boolean;
  createdAt: number;
  canUnlock?: boolean;
  timeUntilUnlock?: number;
}

export interface CreateTimeCapsuleData {
  title: string;
  message: string;
  recipientAddress: string;
  unlockTime: number;
  file?: File;
}

export interface UploadResponse {
  Hash: string;
  Name: string;
  Size: string;
}

export interface ContractConfig {
  address: string;
  abi: unknown[];
}

export interface LighthouseConfig {
  apiKey: string;
  gateway: string;
}