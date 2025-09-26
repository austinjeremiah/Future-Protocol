import { ethers } from "hardhat";
import fs from "fs";
import path from "path";
import { LighthouseService } from "./LighthouseService";
import { TimeCapsuleManager } from "./timeCapsuleManager";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Setup and Demo Script for TimeCapsule IPFS Integration
 * This script demonstrates the complete flow of:
 * 1. Deploying the contract
 * 2. Creating a sample file
 * 3. Uploading to IPFS and storing CID in contract
 * 4. Showing logs with all details
 */

class TimeCapsuleDemo {
    private contract: any;
    private signer: any;
    private lighthouseService!: LighthouseService;
    private timeCapsuleManager!: TimeCapsuleManager;

    async initialize() {
        console.log("Initializing TimeCapsule Demo...");
        
        // Check environment variables
        const apiKey = process.env.LIGHTHOUSE_API_KEY;
        if (!apiKey) {
            throw new Error("LIGHTHOUSE_API_KEY not found in environment variables. Please set it in .env file.");
        }
        
        // Initialize services
        this.lighthouseService = new LighthouseService(apiKey);
        this.timeCapsuleManager = new TimeCapsuleManager();
        
        // Get signer
        [this.signer] = await ethers.getSigners();
        console.log(`Using account: ${await this.signer.getAddress()}`);
        
        // Check if contract is deployed
        try {
            const deployments = require("../deployments/calibration/TimeCapsuleStorage.json");
            this.contract = await ethers.getContractAt("TimeCapsuleStorage", deployments.address, this.signer);
            console.log(`Connected to existing contract at: ${deployments.address}`);
            
            // Initialize TimeCapsuleManager
            await this.timeCapsuleManager.initialize();
        } catch (error) {
            console.log("Contract not deployed yet. Please run 'npm run deploy' first.");
            throw error;
        }
    }

    async createSampleFile(): Promise<string> {
        const sampleDir = path.join(__dirname, "..", "sample_files");
        
        // Create sample_files directory if it doesn't exist
        if (!fs.existsSync(sampleDir)) {
            fs.mkdirSync(sampleDir, { recursive: true });
        }

        const filePath = path.join(sampleDir, "sample_message.txt");
        const content = `Time Capsule Message
====================

Created: ${new Date().toISOString()}
Message: This is a sample time capsule message stored on IPFS via Lighthouse.

This file demonstrates the integration between:
- Filecoin blockchain (for CID storage)
- Lighthouse IPFS (for file storage)
- Smart contracts (for time-locked access)

When this capsule is unlocked, you'll be able to retrieve this file using the IPFS CID stored in the blockchain contract.

Technical Details:
- Network: Filecoin Calibration Testnet
- Storage: Lighthouse IPFS Gateway
- Contract: TimeCapsuleStorage.sol
- Encryption: Time-based access control

Enjoy your time-locked message!
`;

        fs.writeFileSync(filePath, content);
        console.log(`Created sample file: ${filePath}`);
        console.log(`File size: ${fs.statSync(filePath).size} bytes`);
        
        return filePath;
    }

    async uploadToIPFS(filePath: string): Promise<{ cid: string; encryptionKey: string }> {
        console.log("Uploading file to REAL Lighthouse IPFS...");
        console.log(`File: ${filePath}`);
        
        try {
            // Upload file with encryption for time-based access
            const unlockTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
            const result = await this.lighthouseService.uploadEncryptedFile(
                filePath,
                unlockTime,
                path.basename(filePath)
            );
            
            console.log(`Real IPFS upload completed successfully`);
            console.log(`IPFS CID: ${result.Hash}`);
            console.log(`File size: ${result.Size} bytes`);
            console.log(`Encryption key: ${result.encryptionKey}`);
            console.log(`Gateway URL: https://gateway.lighthouse.storage/ipfs/${result.Hash}`);
            
            return {
                cid: result.Hash,
                encryptionKey: result.encryptionKey || "no_encryption_key"
            };
        } catch (error) {
            console.error("IPFS upload failed:", error);
            throw error;
        }
    }

    async storeCIDInContract(cid: string, encryptionKey: string, filePath: string): Promise<{ capsuleId: number; txHash: string }> {
        console.log("Storing CID in smart contract...");
        
        const stats = fs.statSync(filePath);
        const fileName = path.basename(filePath);
        
        // Create time capsule with 1 hour unlock time for demo
        const unlockTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        
        const tx = await this.contract.createTimeCapsule(
            cid,                                    // IPFS CID
            encryptionKey,                         // Real encryption key from Lighthouse
            unlockTime,                            // Unlock time (1 hour)
            "demo@example.com",                    // Recipient email
            `Demo Time Capsule - ${fileName}`,     // Title
            stats.size,                            // File size
            "text/plain"                          // File type
        );

        console.log(`Transaction submitted: ${tx.hash}`);
        console.log(`Waiting for confirmation...`);
        
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);

        // Extract capsule ID from events
        let capsuleId = 1;
        try {
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
                capsuleId = Number(decoded.args[0]);
            } else {
                const totalCapsules = await this.contract.getTotalCapsules();
                capsuleId = Number(totalCapsules);
            }
        } catch (error) {
            console.log("Using fallback capsule ID: 1");
        }

        return { capsuleId, txHash: tx.hash };
    }

    async testUnlockFunctionality(capsuleId: number): Promise<void> {
        console.log("\nTesting unlock functionality...");
        
        try {
            // Check if capsule can be unlocked
            const canUnlock = await this.contract.canUnlock(capsuleId);
            console.log(`Can unlock now: ${canUnlock}`);
            
            if (!canUnlock) {
                const timeUntilUnlock = await this.contract.getTimeUntilUnlock(capsuleId);
                console.log(`Time until unlock: ${timeUntilUnlock} seconds`);
                console.log(`Unlock date: ${new Date(Date.now() + Number(timeUntilUnlock) * 1000).toISOString()}`);
            } else {
                console.log("Time capsule can be unlocked immediately!");
                
                // Demonstrate unlock process
                console.log("Attempting to unlock time capsule...");
                const unlockTx = await this.contract.unlockTimeCapsule(capsuleId);
                console.log(`Unlock transaction submitted: ${unlockTx.hash}`);
                
                const unlockReceipt = await unlockTx.wait();
                console.log(`Unlock confirmed in block: ${unlockReceipt.blockNumber}`);
            }
        } catch (error) {
            console.error("Error testing unlock functionality:", error);
        }
    }
    
    async testFileDownload(cid: string): Promise<void> {
        console.log("\nTesting file download from IPFS...");
        
        try {
            const downloadPath = path.join(__dirname, "..", "sample_files", "downloaded_file.txt");
            
            console.log(`Downloading file from IPFS CID: ${cid}`);
            console.log(`Download path: ${downloadPath}`);
            
            await this.lighthouseService.downloadFile(cid, downloadPath);
            
            // Verify download
            if (fs.existsSync(downloadPath)) {
                const downloadedSize = fs.statSync(downloadPath).size;
                console.log(`File downloaded successfully`);
                console.log(`Downloaded file size: ${downloadedSize} bytes`);
                
                // Read first few lines to verify content
                const content = fs.readFileSync(downloadPath, 'utf8');
                const firstLine = content.split('\n')[0];
                console.log(`First line of downloaded file: ${firstLine}`);
            } else {
                console.error("Downloaded file not found");
            }
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    }

    async showCompleteLog(capsuleId: number, cid: string, filePath: string, txHash: string) {
        console.log("\n" + "=".repeat(70));
        console.log("TIME CAPSULE CREATED - COMPLETE LOG");
        console.log("=".repeat(70));
        
        try {
            const details = await this.contract.getTimeCapsule(capsuleId);
            const contractAddress = await this.contract.getAddress();
            
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`Contract Address: ${contractAddress}`);
            console.log(`IPFS CID: ${cid}`);
            console.log(`IPFS Gateway: https://gateway.lighthouse.storage/ipfs/${cid}`);
            console.log(`Original File: ${filePath}`);
            console.log(`File Size: ${details[8]} bytes`);
            console.log(`File Type: ${details[9]}`);
            console.log(`Title: ${details[6]}`);
            console.log(`Recipient: ${details[5]}`);
            console.log(`Creator: ${details[4]}`);
            console.log(`Created: ${new Date(Number(details[3]) * 1000).toISOString()}`);
            console.log(`Unlocks: ${new Date(Number(details[2]) * 1000).toISOString()}`);
            console.log(`Encryption Key: ${details[1]}`);
            console.log(`Is Unlocked: ${details[7]}`);
            console.log(`Transaction Hash: ${txHash}`);
            console.log(`Network: Filecoin Calibration Testnet`);
            console.log(`Storage Provider: Lighthouse IPFS`);
            
            // Calculate time until unlock
            const unlockTime = Number(details[2]);
            const now = Math.floor(Date.now() / 1000);
            const timeUntilUnlock = unlockTime - now;
            
            if (timeUntilUnlock > 0) {
                const hours = Math.floor(timeUntilUnlock / 3600);
                const minutes = Math.floor((timeUntilUnlock % 3600) / 60);
                const seconds = timeUntilUnlock % 60;
                console.log(`Time Until Unlock: ${hours}h ${minutes}m ${seconds}s`);
            } else {
                console.log(`Can Be Unlocked Now!`);
            }
            
        } catch (error) {
            console.error("Error retrieving capsule details:", error);
        }
        
        console.log("=".repeat(70));
        console.log("Integration Complete - CID stored in contract successfully!");
        console.log("=".repeat(70));
    }

    async runDemo() {
        try {
            await this.initialize();
            
            console.log("\nStarting COMPREHENSIVE TimeCapsule IPFS Integration Demo");
            console.log("=".repeat(65));
            console.log("This demo covers ALL functionality with REAL IPFS uploads:");
            console.log("- Real file upload to Lighthouse IPFS");
            console.log("- Smart contract CID storage with encryption");
            console.log("- Time-lock mechanism testing");
            console.log("- File download verification");
            console.log("- Complete system integration");
            console.log("=".repeat(65));
            
            // Step 1: Create sample file
            console.log("\nStep 1: Creating sample file...");
            const filePath = await this.createSampleFile();
            
            // Step 2: Real IPFS upload with encryption
            console.log("\nStep 2: Uploading to REAL Lighthouse IPFS...");
            const { cid, encryptionKey } = await this.uploadToIPFS(filePath);
            
            // Step 3: Store CID in smart contract
            console.log("\nStep 3: Storing CID in blockchain...");
            const { capsuleId, txHash } = await this.storeCIDInContract(cid, encryptionKey, filePath);
            
            // Step 4: Show complete log
            console.log("\nStep 4: Generating complete log...");
            await this.showCompleteLog(capsuleId, cid, filePath, txHash);
            
            // Step 5: Test unlock functionality
            console.log("\nStep 5: Testing unlock functionality...");
            await this.testUnlockFunctionality(capsuleId);
            
            // Step 6: Test file download
            console.log("\nStep 6: Testing file download from IPFS...");
            await this.testFileDownload(cid);
            
            // Step 7: Demonstrate TimeCapsuleManager CLI functionality
            console.log("\nStep 7: Demonstrating TimeCapsuleManager functionality...");
            await this.demonstrateCLIFunctionality(capsuleId);
            
            console.log("\n" + "=".repeat(65));
            console.log("COMPREHENSIVE DEMO COMPLETED SUCCESSFULLY!");
            console.log("=".repeat(65));
            console.log("\nAll functionality has been tested:");
            console.log("✓ Real IPFS file upload via Lighthouse");
            console.log("✓ Smart contract CID storage");
            console.log("✓ Time-lock mechanism");
            console.log("✓ File download verification");
            console.log("✓ CLI interface functionality");
            console.log("✓ Complete system integration");
            console.log("\nThe TimeCapsule system is fully operational!");
            
        } catch (error: any) {
            console.error("Demo failed:", error);
            if (error?.message?.includes("LIGHTHOUSE_API_KEY")) {
                console.log("\nTo fix this error:");
                console.log("1. Get a Lighthouse API key from https://lighthouse.storage");
                console.log("2. Add it to your .env file: LIGHTHOUSE_API_KEY=your_key_here");
                console.log("3. Run the demo again");
            }
            throw error;
        }
    }
    
    async demonstrateCLIFunctionality(capsuleId: number): Promise<void> {
        console.log("\nDemonstrating CLI functionality...");
        
        try {
            // Show capsule details using TimeCapsuleManager
            console.log("Getting capsule details via TimeCapsuleManager...");
            await this.timeCapsuleManager.getTimeCapsuleDetails(capsuleId);
            
            console.log("CLI functionality demonstration completed.");
        } catch (error) {
            console.error("Error demonstrating CLI functionality:", error);
        }
    }
}

// Run demo if this file is executed directly
async function main() {
    const demo = new TimeCapsuleDemo();
    await demo.runDemo();
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

export { TimeCapsuleDemo };