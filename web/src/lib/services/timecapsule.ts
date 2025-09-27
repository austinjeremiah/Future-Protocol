// lib/services/timecapsule.ts - Main service that combines contract and IPFS operations
import { ContractService } from './contract';
import { LighthouseService } from './lighthouse';
import { TimeCapsule, CreateTimeCapsuleData } from '../types';

export class TimeCapsuleService {
  private contractService: ContractService;
  private lighthouseService: LighthouseService;

  constructor() {
    this.contractService = new ContractService();
    this.lighthouseService = new LighthouseService();
  }

  /**
   * Create a complete time capsule with file upload and blockchain storage
   */
  async createTimeCapsule(data: CreateTimeCapsuleData): Promise<{
    txHash: string;
    ipfsCid: string;
    capsuleId: number;
  }> {
    try {
      console.log('Creating complete time capsule...');
      console.log('Data:', data);

      // Create message content
      const messageContent = this.formatTimeCapsuleContent(data);

      // Upload content to IPFS
      console.log('Uploading content to IPFS...');
      const ipfsResult = await this.lighthouseService.uploadText(
        messageContent,
        `timecapsule-${Date.now()}.txt`
      );

      console.log('Content uploaded to IPFS:', ipfsResult.Hash);

      // If there's a file, we could upload it separately or include it in the message
      // For now, we'll include file info in the message content

      // Create time capsule on blockchain
      console.log('Creating time capsule on blockchain...');
      const txHash = await this.contractService.createTimeCapsule(
        ipfsResult.Hash,
        data.recipientAddress,
        data.unlockTime,
        data.title,
        false, // useBlocklock - can be made configurable
        data.file ? data.file.size : 1024, // fileSize
        data.file ? data.file.type : "text/plain" // fileType
      );

      // Get the capsule ID (this is approximate - in production you'd get it from the transaction receipt)
      const nextCapsuleId = await this.contractService.getNextCapsuleId();
      const capsuleId = nextCapsuleId - 1;

      console.log('Time capsule created successfully!');
      console.log(`Capsule ID: ${capsuleId}`);
      console.log(`Transaction: ${txHash}`);
      console.log(`IPFS CID: ${ipfsResult.Hash}`);

      return {
        txHash,
        ipfsCid: ipfsResult.Hash,
        capsuleId
      };

    } catch (error) {
      console.error('Error creating time capsule:', error);
      throw error;
    }
  }

  /**
   * Unlock and retrieve a time capsule
   */
  async unlockTimeCapsule(capsuleId: number): Promise<{
    capsule: TimeCapsule;
    content: string;
    txHash?: string;
  }> {
    try {
      console.log(`Unlocking time capsule ${capsuleId}...`);

      // Get capsule details
      const capsule = await this.contractService.getTimeCapsule(capsuleId);

      // Check if it can be unlocked
      if (!capsule.canUnlock && !capsule.isUnlocked) {
        const timeUntil = capsule.timeUntilUnlock || 0;
        const hoursUntil = Math.ceil(timeUntil / 3600);
        throw new Error(`Time capsule cannot be unlocked yet. Wait ${hoursUntil} more hours.`);
      }

      let txHash: string | undefined;

      // Unlock on blockchain if not already unlocked
      if (!capsule.isUnlocked) {
        console.log('Unlocking on blockchain...');
        txHash = await this.contractService.unlockTimeCapsule(capsuleId);
      }

      // Retrieve content from IPFS
      console.log('Retrieving content from IPFS...');
      const content = await this.lighthouseService.downloadFile(capsule.ipfsCid);

      console.log('Time capsule unlocked and content retrieved!');

      return {
        capsule,
        content,
        txHash
      };

    } catch (error) {
      console.error(`Error unlocking time capsule ${capsuleId}:`, error);
      throw error;
    }
  }

  /**
   * Get all time capsules for the current user
   */
  async getUserTimeCapsules(): Promise<TimeCapsule[]> {
    return this.contractService.getUserTimeCapsules();
  }

  /**
   * Get time capsule details by ID
   */
  async getTimeCapsule(capsuleId: number): Promise<TimeCapsule> {
    return this.contractService.getTimeCapsule(capsuleId);
  }

  /**
   * Format time capsule content for storage
   */
  private formatTimeCapsuleContent(data: CreateTimeCapsuleData): string {
    const unlockDate = new Date(data.unlockTime * 1000);
    
    return `FUTURE PROTOCOL TIME CAPSULE
====================================

Title: ${data.title}
Created: ${new Date().toISOString()}
Unlock Time: ${unlockDate.toISOString()}
Recipient: ${data.recipientAddress}

MESSAGE:
========
${data.message}

${data.file ? `\nFILE ATTACHED: ${data.file.name} (${data.file.size} bytes)` : ''}

TECHNICAL DETAILS:
==================
- Created via Future Protocol Web Interface
- Stored on Filecoin Calibration Network
- IPFS Content Distribution
- Smart Contract Enforced Timing
- Decentralized Access Control

This time capsule was created using the Future Protocol system,
ensuring your message reaches the future exactly when intended.

Visit https://future-protocol.app to create your own time capsules!`;
  }

  /**
   * Helper function to format time until unlock
   */
  formatTimeUntilUnlock(seconds: number): string {
    if (seconds <= 0) return 'Can unlock now';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}