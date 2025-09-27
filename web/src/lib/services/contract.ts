// lib/services/contract.ts - Smart contract service
import { writeContract, readContract, getAccount } from '@wagmi/core';
import { config } from '../wagmi';
import { CONTRACT_CONFIG } from '../config';
import { TimeCapsule } from '../types';

export class ContractService {
  private contractAddress: `0x${string}`;
  private contractAbi: any[];

  constructor() {
    this.contractAddress = CONTRACT_CONFIG.address as `0x${string}`;
    this.contractAbi = CONTRACT_CONFIG.abi;
  }

  async createTimeCapsule(
    ipfsCid: string,
    recipientAddress: string,
    unlockTime: number,
    title: string,
    useBlocklock: boolean = false,
    fileSize: number = 1024,
    fileType: string = "text/plain"
  ): Promise<string> {
    const account = getAccount(config);
    if (!account.address) throw new Error('No wallet connected');

    console.log('Creating simple time capsule on blockchain...');
    console.log(`IPFS CID: ${ipfsCid}`);
    console.log(`Recipient: ${recipientAddress}`);
    console.log(`Unlock Time: ${new Date(unlockTime * 1000).toISOString()}`);

    return await writeContract(config, {
      address: this.contractAddress,
      abi: this.contractAbi,
      functionName: 'createSimpleTimeCapsule',
      args: [
        ipfsCid,                          // _ipfsCid
        "simple-encryption-key",          // _encryptionKey (placeholder)
        BigInt(unlockTime),               // _unlockTime
        recipientAddress,                 // _recipientEmail (using address as identifier)
        title,                           // _title
        BigInt(fileSize),                // _fileSize (actual file size)
        fileType                         // _fileType (actual MIME type)
      ],
    });
  }

  async getTimeCapsule(capsuleId: number): Promise<TimeCapsule> {
    const result = (await readContract(config, {
      address: this.contractAddress,
      abi: this.contractAbi,
      functionName: 'getTimeCapsule',
      args: [BigInt(capsuleId)],
    })) as any[];

    const canUnlock = await this.canUnlock(capsuleId);
    const timeUntilUnlock = await this.getTimeUntilUnlock(capsuleId);

    return {
      id: capsuleId,
      ipfsCid: result[0] as string,
      contentHash: result[0] as string,
      creator: result[3] as string,
      recipient: result[4] as string,
      title: result[6] as string,
      unlockTime: Number(result[5]),
      isUnlocked: result[7] as boolean,
      usesBlocklock: result[11] as boolean,
      createdAt: Number(result[2]),
      canUnlock,
      timeUntilUnlock: Number(timeUntilUnlock),
    };
  }

  async canUnlock(capsuleId: number): Promise<boolean> {
    const result = await readContract(config, {
      address: this.contractAddress,
      abi: this.contractAbi,
      functionName: 'canUnlock',
      args: [BigInt(capsuleId)],
    });
    return Boolean(result);
  }

  async getTimeUntilUnlock(capsuleId: number): Promise<bigint> {
    const result = await readContract(config, {
      address: this.contractAddress,
      abi: this.contractAbi,
      functionName: 'getTimeUntilUnlock',
      args: [BigInt(capsuleId)],
    });
    return Array.isArray(result) ? BigInt(result[0] || 0) : BigInt(result || 0);
  }

  async unlockTimeCapsule(capsuleId: number): Promise<string> {
    return await writeContract(config, {
      address: this.contractAddress,
      abi: this.contractAbi,
      functionName: 'unlockTimeCapsule',
      args: [BigInt(capsuleId)],
    });
  }

  async getUserTimeCapsules(): Promise<TimeCapsule[]> {
    const account = getAccount(config);
    if (!account.address) throw new Error('No wallet connected');

    const nextCapsuleId = (await readContract(config, {
      address: this.contractAddress,
      abi: this.contractAbi,
      functionName: 'nextCapsuleId',
      args: [],
    })) as any;

    const totalCapsules = Array.isArray(nextCapsuleId)
      ? Number(nextCapsuleId[0] || 0)
      : Number(nextCapsuleId || 0);

    const userCapsules: TimeCapsule[] = [];

    for (let i = 1; i < totalCapsules; i++) {
      try {
        const capsule = await this.getTimeCapsule(i);
        if (
          capsule.creator.toLowerCase() === account.address.toLowerCase() ||
          capsule.recipient.toLowerCase() === account.address.toLowerCase()
        ) {
          userCapsules.push(capsule);
        }
      } catch (error) {
        console.warn(`Could not fetch capsule ${i}:`, error);
      }
    }

    return userCapsules;
  }

  async getNextCapsuleId(): Promise<number> {
    const result = await readContract(config, {
      address: this.contractAddress,
      abi: this.contractAbi,
      functionName: 'nextCapsuleId',
      args: [],
    });
    return Array.isArray(result) ? Number(result[0] || 0) : Number(result || 0);
  }
}
