import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { LighthouseService } from "./LighthouseService";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface TimeCapsuleData {
    filePath: string;
    title: string;
    recipientEmail: string;
    unlockDate: string; // Format: YYYY-MM-DD or YYYY-MM-DD HH:MM
    fileType?: string;
}

class TimeCapsuleManager {
    private lighthouseService: LighthouseService;
    private contract: any;
    
    constructor() {
        const apiKey = process.env.LIGHTHOUSE_API_KEY;
        if (!apiKey) {
            throw new Error("LIGHTHOUSE_API_KEY not found in environment variables");
        }
        this.lighthouseService = new LighthouseService(apiKey);
    }

    async initialize() {
        try {
            // Get the deployed contract
            const deployments = await import("../deployments/calibration/TimeCapsuleStorage.json");
            const contractAddress = deployments.address;
            
            console.log(`Connecting to TimeCapsuleStorage at: ${contractAddress}`);
            
            const [signer] = await ethers.getSigners();
            this.contract = await ethers.getContractAt("TimeCapsuleStorage", contractAddress, signer);
            
            console.log(`Connected to contract successfully`);
            console.log(`Using signer: ${await signer.getAddress()}`);
            
        } catch (error) {
            console.error("Error initializing TimeCapsuleManager:", error);
            throw error;
        }
    }

    /**
     * Create a complete time capsule: upload to IPFS and store CID on blockchain
     */
    async createTimeCapsule(data: TimeCapsuleData): Promise<void> {
        try {
            console.log("Starting time capsule creation process...");
            console.log(`File: ${data.filePath}`);
            console.log(`Title: ${data.title}`);
            console.log(`Recipient: ${data.recipientEmail}`);
            console.log(`Unlock date: ${data.unlockDate}`);
            
            // Validate file exists
            if (!fs.existsSync(data.filePath)) {
                throw new Error(`File not found: ${data.filePath}`);
            }

            // Parse unlock time
            const unlockTime = this.parseUnlockTime(data.unlockDate);
            console.log(`Parsed unlock time: ${new Date(unlockTime * 1000).toISOString()}`);
            
            // Get file info
            const stats = fs.statSync(data.filePath);
            const fileSize = stats.size;
            const fileType = data.fileType || this.getFileType(data.filePath);
            
            console.log(`File size: ${fileSize} bytes`);
            console.log(`File type: ${fileType}`);

            // Step 1: Upload to Lighthouse IPFS (REAL UPLOAD)
            console.log("\nStep 1: Uploading to REAL Lighthouse IPFS...");
            const uploadResult = await this.lighthouseService.uploadEncryptedFile(
                data.filePath,
                unlockTime,
                path.basename(data.filePath)
            );

            console.log(`Real IPFS upload completed`);
            console.log(`IPFS CID: ${uploadResult.Hash}`);
            console.log(`Encryption key: ${uploadResult.encryptionKey}`);
            console.log(`File accessible at: https://gateway.lighthouse.storage/ipfs/${uploadResult.Hash}`);

            // Step 2: Store CID in smart contract
            console.log("\nStep 2: Storing CID in smart contract...");
            
            const tx = await this.contract.createTimeCapsule(
                uploadResult.Hash,
                uploadResult.encryptionKey || "",
                unlockTime,
                data.recipientEmail,
                data.title,
                fileSize,
                fileType
            );

            console.log(`Transaction submitted: ${tx.hash}`);
            console.log(`Waiting for confirmation...`);
            
            const receipt = await tx.wait();
            console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
            console.log(`Gas used: ${receipt.gasUsed.toString()}`);

            // Extract capsule ID from events
            const capsuleId = await this.extractCapsuleIdFromReceipt(receipt);
            
            // Step 3: Log complete details
            console.log("\nTIME CAPSULE CREATED SUCCESSFULLY");
            console.log("=====================================");
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`IPFS CID: ${uploadResult.Hash}`);
            console.log(`File: ${data.filePath}`);
            console.log(`Title: ${data.title}`);
            console.log(`Recipient: ${data.recipientEmail}`);
            console.log(`File Size: ${fileSize} bytes`);
            console.log(`File Type: ${fileType}`);
            console.log(`Creation Time: ${new Date().toISOString()}`);
            console.log(`Unlock Time: ${new Date(unlockTime * 1000).toISOString()}`);
            console.log(`Encryption Key: ${uploadResult.encryptionKey}`);
            console.log(`Contract Address: ${await this.contract.getAddress()}`);
            console.log(`Transaction Hash: ${tx.hash}`);
            console.log(`IPFS Gateway URL: https://gateway.lighthouse.storage/ipfs/${uploadResult.Hash}`);
            console.log("=====================================");

        } catch (error) {
            console.error("Error creating time capsule:", error);
            throw error;
        }
    }

    /**
     * Unlock a time capsule if the time has come
     */
    async unlockTimeCapsule(capsuleId: number, downloadPath?: string): Promise<void> {
        try {
            console.log(`Attempting to unlock time capsule ID: ${capsuleId}`);

            // Check if capsule can be unlocked
            const canUnlock = await this.contract.canUnlock(capsuleId);
            if (!canUnlock) {
                const timeUntilUnlock = await this.contract.getTimeUntilUnlock(capsuleId);
                const unlockDate = new Date(Date.now() + (Number(timeUntilUnlock) * 1000));
                throw new Error(`Capsule cannot be unlocked yet. Time remaining: ${timeUntilUnlock}s (unlocks at: ${unlockDate.toISOString()})`);
            }

            // Unlock the capsule
            console.log("Unlocking capsule...");
            const tx = await this.contract.unlockTimeCapsule(capsuleId);
            
            console.log(`Unlock transaction: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`Unlock confirmed in block: ${receipt.blockNumber}`);

            // Get capsule details
            const capsuleDetails = await this.contract.getTimeCapsule(capsuleId);
            const cid = capsuleDetails[0]; // ipfsCid

            console.log(`Retrieved IPFS CID: ${cid}`);

            // Download file if path provided
            if (downloadPath && cid) {
                console.log(`Downloading file to: ${downloadPath}`);
                await this.lighthouseService.downloadFile(cid, downloadPath);
                console.log(`File downloaded successfully`);
            }

            // Log unlock details
            console.log("\nTIME CAPSULE UNLOCKED SUCCESSFULLY");
            console.log("====================================");
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`IPFS CID: ${cid}`);
            console.log(`Unlock Time: ${new Date().toISOString()}`);
            console.log(`Transaction Hash: ${tx.hash}`);
            console.log(`IPFS Gateway URL: https://gateway.lighthouse.storage/ipfs/${cid}`);
            if (downloadPath) {
                console.log(`Downloaded to: ${downloadPath}`);
            }
            console.log("====================================");

        } catch (error) {
            console.error("Error unlocking time capsule:", error);
            throw error;
        }
    }

    /**
     * Get details of a specific time capsule
     */
    async getTimeCapsuleDetails(capsuleId: number): Promise<void> {
        try {
            console.log(`Getting details for time capsule ID: ${capsuleId}`);
            
            const details = await this.contract.getTimeCapsule(capsuleId);
            const canUnlock = await this.contract.canUnlock(capsuleId);
            const timeUntilUnlock = await this.contract.getTimeUntilUnlock(capsuleId);

            console.log("\nTIME CAPSULE DETAILS");
            console.log("=======================");
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`IPFS CID: ${details[0]}`);
            console.log(`Encryption Key: ${details[1]}`);
            console.log(`Unlock Time: ${new Date(Number(details[2]) * 1000).toISOString()}`);
            console.log(`Creation Time: ${new Date(Number(details[3]) * 1000).toISOString()}`);
            console.log(`Creator: ${details[4]}`);
            console.log(`Recipient Email: ${details[5]}`);
            console.log(`Title: ${details[6]}`);
            console.log(`Is Unlocked: ${details[7]}`);
            console.log(`File Size: ${details[8]} bytes`);
            console.log(`File Type: ${details[9]}`);
            console.log(`Can Unlock Now: ${canUnlock}`);
            if (!canUnlock && Number(timeUntilUnlock) > 0) {
                console.log(`Time Until Unlock: ${timeUntilUnlock}s (${new Date(Date.now() + Number(timeUntilUnlock) * 1000).toISOString()})`);
            }
            console.log(`IPFS Gateway URL: https://gateway.lighthouse.storage/ipfs/${details[0]}`);
            console.log("=======================");

        } catch (error) {
            console.error("Error getting time capsule details:", error);
            throw error;
        }
    }

    private parseUnlockTime(dateString: string): number {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateString}. Use YYYY-MM-DD or YYYY-MM-DD HH:MM`);
        }
        
        const now = Date.now() / 1000;
        const unlockTime = Math.floor(date.getTime() / 1000);
        
        if (unlockTime <= now) {
            throw new Error("Unlock time must be in the future");
        }
        
        return unlockTime;
    }

    private getFileType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
            '.txt': 'text/plain',
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.mp4': 'video/mp4',
            '.mp3': 'audio/mpeg',
            '.zip': 'application/zip',
            '.json': 'application/json'
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }

    private async extractCapsuleIdFromReceipt(receipt: any): Promise<number> {
        try {
            // Look for TimeCapsuleCreated event
            const event = receipt.logs.find((log: any) => {
                try {
                    const decoded = this.contract.interface.parseLog(log);
                    return decoded.name === 'TimeCapsuleCreated';
                } catch {
                    return false;
                }
            });

            if (event) {
                const decoded = this.contract.interface.parseLog(event);
                return Number(decoded.args[0]); // capsuleId is the first parameter
            }
            
            // Fallback: get the latest capsule ID
            const totalCapsules = await this.contract.getTotalCapsules();
            return Number(totalCapsules);
        } catch (error) {
            console.warn("Could not extract capsule ID from receipt, using total count");
            const totalCapsules = await this.contract.getTotalCapsules();
            return Number(totalCapsules);
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
TimeCapsule Manager - CLI Interface
==================================

Commands:
  create <file_path> <title> <recipient_email> <unlock_date> [file_type]
    - Create a new time capsule
    - unlock_date format: YYYY-MM-DD or "YYYY-MM-DD HH:MM"
    - Example: create ./myfile.txt "My Message" user@example.com "2024-12-25 10:00"

  unlock <capsule_id> [download_path]
    - Unlock a time capsule and optionally download the file
    - Example: unlock 1 ./downloaded_file.txt

  details <capsule_id>
    - Get details of a specific time capsule
    - Example: details 1

  status
    - Show contract status and total capsules

Environment Variables Required:
- LIGHTHOUSE_API_KEY: Your Lighthouse API key
- PRIVATE_KEY: Your wallet private key (for contract interactions)
        `);
        return;
    }

    const command = args[0];
    const manager = new TimeCapsuleManager();
    
    try {
        await manager.initialize();

        switch (command) {
            case 'create':
                if (args.length < 5) {
                    console.error("Usage: create <file_path> <title> <recipient_email> <unlock_date> [file_type]");
                    return;
                }
                await manager.createTimeCapsule({
                    filePath: args[1],
                    title: args[2],
                    recipientEmail: args[3],
                    unlockDate: args[4],
                    fileType: args[5]
                });
                break;

            case 'unlock':
                if (args.length < 2) {
                    console.error("Usage: unlock <capsule_id> [download_path]");
                    return;
                }
                await manager.unlockTimeCapsule(parseInt(args[1]), args[2]);
                break;

            case 'details':
                if (args.length < 2) {
                    console.error("Usage: details <capsule_id>");
                    return;
                }
                await manager.getTimeCapsuleDetails(parseInt(args[1]));
                break;

            case 'status':
                console.log("Contract Status");
                console.log("==================");
                // Add status functionality here
                break;

            default:
                console.error(`Unknown command: ${command}`);
                break;
        }
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

// Run the CLI if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

export { TimeCapsuleManager };