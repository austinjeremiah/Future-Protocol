import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import { LighthouseService } from "./LighthouseService";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export class ProfessionalTimeCapsule {
    private blocklockContract!: TimeCapsuleBlocklockSimple;
    private signer!: Wallet;
    private lighthouseService!: LighthouseService;
    private senderAddress!: string;

    async initialize(): Promise<void> {
        console.log("Initializing Professional TimeCapsule System...");
        
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("PRIVATE_KEY not found in environment");
        }

        this.signer = new Wallet(privateKey, ethers.provider);
        this.senderAddress = await this.signer.getAddress();
        
        this.blocklockContract = await ethers.getContractAt(
            "TimeCapsuleBlocklockSimple", 
            "0xf939f81b62a57157C6fA441bEb64B2E684382991",
            this.signer
        ) as TimeCapsuleBlocklockSimple;
        
        this.lighthouseService = new LighthouseService(process.env.LIGHTHOUSE_API_KEY!);
        
        console.log(`Contract Address: ${await this.blocklockContract.getAddress()}`);
        console.log(`Wallet Address: ${this.senderAddress}`);
        
        const balance = await ethers.provider.getBalance(this.senderAddress);
        console.log(`ETH Balance: ${ethers.formatEther(balance)} ETH`);
    }

    async createTimeCapsule(
        title: string,
        message: string,
        recipientEmail: string,
        unlockHours: number = 24
    ): Promise<void> {
        console.log(`\nCreating TimeCapsule: "${title}"`);
        console.log("-".repeat(50));
        
        const unlockTime = Math.floor(Date.now() / 1000) + (unlockHours * 3600);
        
        const messageContent = `TIMECAPSULE MESSAGE
=====================

Title: ${title}
From: ${this.senderAddress}
To: ${recipientEmail}
Created: ${new Date().toISOString()}
Unlock Time: ${new Date(unlockTime * 1000).toISOString()}

MESSAGE CONTENT:
================
${message}

TECHNICAL INFO:
===============
This TimeCapsule uses Lighthouse IPFS for decentralized storage.
Smart contract manages unlock conditions and access control.
Professional implementation with real on-chain functionality.`;

        console.log("Processing TimeCapsule...");
        
        const tempFilePath = path.join(__dirname, "..", `timecapsule_${Date.now()}.txt`);
        fs.writeFileSync(tempFilePath, messageContent);
        
        console.log("Uploading to IPFS via Lighthouse...");
        const uploadResult = await this.lighthouseService.uploadFile(tempFilePath);
        console.log(`IPFS CID: ${uploadResult.Hash}`);
        
        console.log("Creating on-chain TimeCapsule...");
        const tx = await this.blocklockContract.createSimpleTimeCapsule(
            uploadResult.Hash,
            "encryption_key_" + Date.now(),
            unlockTime,
            recipientEmail,
            title,
            messageContent.length,
            "text/plain"
        );
        
        console.log(`Transaction: ${tx.hash}`);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        if (receipt) {
            const capsuleId = await this.blocklockContract.nextCapsuleId() - 1n;
            
            console.log("\n" + "=".repeat(60));
            console.log("TIMECAPSULE CREATED SUCCESSFULLY");
            console.log("=".repeat(60));
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`IPFS CID: ${uploadResult.Hash}`);
            console.log(`Transaction: ${receipt.hash}`);
            console.log(`Block Number: ${receipt.blockNumber}`);
            console.log(`Unlock Time: ${new Date(unlockTime * 1000).toISOString()}`);
            console.log(`Gas Used: ${receipt.gasUsed}`);
            console.log(`IPFS Gateway: https://gateway.lighthouse.storage/ipfs/${uploadResult.Hash}`);
            console.log("=".repeat(60));
        }
        
        fs.unlinkSync(tempFilePath);
    }

    async listTimeCapsules(): Promise<void> {
        console.log("\nYour TimeCapsules");
        console.log("=".repeat(60));
        
        const capsuleCount = await this.blocklockContract.nextCapsuleId();
        console.log(`Total system capsules: ${capsuleCount}`);
        
        let foundCapsules = false;
        
        for (let i = 1; i < capsuleCount; i++) {
            try {
                const details = await this.blocklockContract.getTimeCapsule(i);
                const creator = details[3].toString();
                const recipient = details[4].toString();
                
                if (creator.toLowerCase() === this.senderAddress.toLowerCase() ||
                    recipient.toLowerCase().includes(this.senderAddress.toLowerCase())) {
                    
                    foundCapsules = true;
                    const status = details[7] ? "UNLOCKED" : "LOCKED";
                    const role = creator.toLowerCase() === this.senderAddress.toLowerCase() ? "CREATOR" : "RECIPIENT";
                    
                    console.log(`\nCapsule ID: ${i}`);
                    console.log(`Role: ${role}`);
                    console.log(`Status: ${status}`);
                    console.log(`Title: ${details[6]}`);
                    console.log(`IPFS CID: ${details[0]}`);
                    console.log(`Creator: ${creator}`);
                    console.log(`Recipient: ${recipient}`);
                    console.log(`Uses Blocklock: ${details[11] ? 'YES' : 'NO'}`);
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!foundCapsules) {
            console.log("No TimeCapsules found for your address");
        }
        console.log("=".repeat(60));
    }

    async unlockTimeCapsule(capsuleId: number): Promise<void> {
        console.log(`\nUnlocking TimeCapsule ID: ${capsuleId}`);
        console.log("-".repeat(50));
        
        try {
            const details = await this.blocklockContract.getTimeCapsule(capsuleId);
            const canUnlock = await this.blocklockContract.canUnlock(capsuleId);
            const timeUntilUnlock = await this.blocklockContract.getTimeUntilUnlock(capsuleId);
            
            console.log(`Title: ${details[6]}`);
            console.log(`Status: ${details[7] ? 'UNLOCKED' : 'LOCKED'}`);
            console.log(`Time Until Unlock: ${timeUntilUnlock} seconds`);
            console.log(`Can Unlock Now: ${canUnlock ? 'YES' : 'NO'}`);
            
            if (details[7]) {
                console.log("\nTimeCapsule already unlocked. Retrieving content...");
                await this.retrieveContent(capsuleId, details[0]);
                return;
            }
            
            if (!canUnlock) {
                console.log(`\nTimeCapsule cannot be unlocked yet.`);
                console.log(`Wait ${Math.ceil(Number(timeUntilUnlock) / 3600)} more hours.`);
                return;
            }
            
            console.log("\nUnlocking TimeCapsule...");
            const tx = await this.blocklockContract.unlockTimeCapsule(capsuleId);
            console.log(`Transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            if (receipt) {
                console.log("TimeCapsule unlocked successfully!");
                console.log(`Block: ${receipt.blockNumber}`);
                await this.retrieveContent(capsuleId, details[0]);
            }
            
        } catch (error) {
            console.error("Error unlocking TimeCapsule:", error);
        }
    }

    async retrieveContent(capsuleId: number, ipfsCid: string): Promise<void> {
        console.log(`\nRetrieving content from IPFS: ${ipfsCid}`);
        
        const downloadPath = path.join(__dirname, "..", `retrieved_${capsuleId}_${Date.now()}.txt`);
        
        try {
            await this.lighthouseService.downloadFile(ipfsCid, downloadPath);
            
            if (fs.existsSync(downloadPath)) {
                const content = fs.readFileSync(downloadPath, 'utf8');
                
                console.log("\n" + "=".repeat(80));
                console.log("TIMECAPSULE CONTENT");
                console.log("=".repeat(80));
                console.log(content);
                console.log("=".repeat(80));
                
                fs.unlinkSync(downloadPath);
            } else {
                throw new Error("File download failed");
            }
            
        } catch (error) {
            console.error("Error downloading content:", error);
            console.log(`\nDirect IPFS Access: https://gateway.lighthouse.storage/ipfs/${ipfsCid}`);
        }
    }
}

async function main() {
    const timeCapsule = new ProfessionalTimeCapsule();
    await timeCapsule.initialize();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'create':
            const title = args[1] || "Professional TimeCapsule";
            const message = args[2] || "This is a professional TimeCapsule message.";
            const recipient = args[3] || "recipient@example.com";
            const hours = parseInt(args[4]) || 24;
            await timeCapsule.createTimeCapsule(title, message, recipient, hours);
            break;
            
        case 'list':
            await timeCapsule.listTimeCapsules();
            break;
            
        case 'unlock':
            const capsuleId = parseInt(args[1]);
            if (isNaN(capsuleId)) {
                console.log("Please provide a valid capsule ID");
                return;
            }
            await timeCapsule.unlockTimeCapsule(capsuleId);
            break;
            
        default:
            console.log("\nProfessional TimeCapsule System");
            console.log("==============================");
            console.log("Commands:");
            console.log("  create [title] [message] [recipient] [hours] - Create new TimeCapsule");
            console.log("  list                                         - List your TimeCapsules");
            console.log("  unlock [capsuleId]                           - Unlock TimeCapsule");
            console.log("\nExamples:");
            console.log("  npm run timecapsule create \"My Message\" \"Hello World\" \"user@example.com\" 1");
            console.log("  npm run timecapsule list");
            console.log("  npm run timecapsule unlock 7");
    }
}

if (require.main === module) {
    main().catch(console.error);
}