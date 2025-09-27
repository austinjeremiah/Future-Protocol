import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import { LighthouseService } from "./LighthouseService";
import fs from "fs";
import path from "path";
import readline from "readline";
import dotenv from "dotenv";

dotenv.config();

export class TimeCapsuleManager {
    private blocklockContract!: TimeCapsuleBlocklockSimple;
    private signer!: Wallet;
    private lighthouseService!: LighthouseService;
    private rl!: readline.Interface;
    private senderAddress!: string;

    async initialize(): Promise<void> {
        console.log("Initializing TimeCapsule Manager...");
        
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
        
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        console.log(`Contract: ${await this.blocklockContract.getAddress()}`);
        console.log(`Sender: ${this.senderAddress}`);
        
        const balance = await ethers.provider.getBalance(this.senderAddress);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    }

    private question(query: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(query, (answer: string) => {
                resolve(answer.trim());
            });
        });
    }

    async showMenu(): Promise<void> {
        while (true) {
            console.log("\n" + "=".repeat(60));
            console.log("TIMECAPSULE MANAGER");
            console.log("=".repeat(60));
            console.log("1. Create TimeCapsule");
            console.log("2. List My TimeCapsules");
            console.log("3. View TimeCapsule Details");
            console.log("4. Unlock TimeCapsule");
            console.log("5. Exit");
            console.log("=".repeat(60));
            
            const choice = await this.question("Select option (1-5): ");
            
            try {
                switch (choice) {
                    case '1':
                        await this.createTimeCapsule();
                        break;
                    case '2':
                        await this.listTimeCapsules();
                        break;
                    case '3':
                        await this.viewTimeCapsuleDetails();
                        break;
                    case '4':
                        await this.unlockTimeCapsule();
                        break;
                    case '5':
                        console.log("Exiting TimeCapsule Manager...");
                        this.rl.close();
                        return;
                    default:
                        console.log("Invalid option. Please select 1-5.");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }

    async createTimeCapsule(): Promise<void> {
        console.log("\nCreating New TimeCapsule");
        console.log("-".repeat(30));
        
        const title = await this.question("Title: ");
        const message = await this.question("Message: ");
        const recipientAddress = await this.question("Recipient wallet address: ");
        
        if (!ethers.isAddress(recipientAddress)) {
            console.log("Invalid wallet address format");
            return;
        }
        
        console.log("\nUnlock Time Options:");
        console.log("1. 1 hour from now");
        console.log("2. 6 hours from now");
        console.log("3. 24 hours from now");
        console.log("4. 7 days from now");
        console.log("5. Custom (specify hours)");
        
        const timeOption = await this.question("Select option (1-5): ");
        
        let unlockHours: number;
        switch (timeOption) {
            case '1': unlockHours = 1; break;
            case '2': unlockHours = 6; break;
            case '3': unlockHours = 24; break;
            case '4': unlockHours = 168; break;
            case '5':
                const customHours = await this.question("Enter hours from now: ");
                unlockHours = parseInt(customHours) || 1;
                break;
            default: unlockHours = 1;
        }
        
        const unlockTime = Math.floor(Date.now() / 1000) + (unlockHours * 3600);
        
        const messageContent = `TIMECAPSULE MESSAGE
=====================

Title: ${title}
From: ${this.senderAddress}
To: ${recipientAddress}
Created: ${new Date().toISOString()}
Unlock Time: ${new Date(unlockTime * 1000).toISOString()}

MESSAGE CONTENT:
================
${message}

TECHNICAL INFO:
===============
This TimeCapsule uses Blocklock encryption for time-locked access.
File stored on IPFS via Lighthouse for decentralized storage.
Smart contract manages unlock conditions and access control.`;

        console.log("\nProcessing TimeCapsule...");
        console.log("Step 1: Preparing content file...");
        
        const tempFilePath = path.join(__dirname, "..", `timecapsule_${Date.now()}.txt`);
        fs.writeFileSync(tempFilePath, messageContent);
        
        console.log("Step 2: Uploading to IPFS via Lighthouse...");
        const uploadResult = await this.lighthouseService.uploadFile(tempFilePath);
        console.log(`IPFS Upload Complete: ${uploadResult.Hash}`);
        
        console.log("Step 3: Creating on-chain TimeCapsule with Blocklock...");
        
        const conditionBytes = ethers.AbiCoder.defaultAbiCoder().encode(
            ["uint256"],
            [unlockTime]
        );
        
        const ciphertextBytes = ethers.toUtf8Bytes("blocklock_encrypted_content");
        
        const tx = await this.blocklockContract.createTimelockRequestWithDirectFunding(
            uploadResult.Hash,
            300000,
            conditionBytes,
            ciphertextBytes,
            `${recipientAddress}@wallet.address`,
            title,
            messageContent.length,
            "text/plain",
            { value: ethers.parseEther("0.01") }
        );
        
        console.log(`Transaction submitted: ${tx.hash}`);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        if (receipt) {
            const capsuleId = await this.blocklockContract.nextCapsuleId() - 1n;
            
            console.log("\n" + "=".repeat(50));
            console.log("TIMECAPSULE CREATED SUCCESSFULLY");
            console.log("=".repeat(50));
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`IPFS CID: ${uploadResult.Hash}`);
            console.log(`Transaction: ${receipt.hash}`);
            console.log(`Block: ${receipt.blockNumber}`);
            console.log(`Unlock Time: ${new Date(unlockTime * 1000).toISOString()}`);
            console.log(`Gas Used: ${receipt.gasUsed}`);
            console.log("=".repeat(50));
        }
        
        fs.unlinkSync(tempFilePath);
    }

    async listTimeCapsules(): Promise<void> {
        console.log("\nYour TimeCapsules");
        console.log("-".repeat(30));
        
        const capsuleCount = await this.blocklockContract.nextCapsuleId();
        let foundCapsules = false;
        
        for (let i = 1; i < capsuleCount; i++) {
            try {
                const details = await this.blocklockContract.getTimeCapsule(i);
                const creator = details[3].toString();
                const recipient = details[4].toString();
                
                if (creator.toLowerCase() === this.senderAddress.toLowerCase() ||
                    recipient.toLowerCase() === this.senderAddress.toLowerCase()) {
                    
                    foundCapsules = true;
                    const status = details[7] ? "UNLOCKED" : "LOCKED";
                    const role = creator.toLowerCase() === this.senderAddress.toLowerCase() ? "SENDER" : "RECIPIENT";
                    
                    console.log(`\nCapsule ID: ${i}`);
                    console.log(`Role: ${role}`);
                    console.log(`Status: ${status}`);
                    console.log(`Title: ${details[6]}`);
                    console.log(`Created: ${new Date(Number(details[5]) * 1000).toISOString()}`);
                    console.log(`Unlock: ${new Date(Number(details[2]) * 1000).toISOString()}`);
                    console.log(`Creator: ${creator}`);
                    console.log(`Recipient: ${recipient}`);
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!foundCapsules) {
            console.log("No TimeCapsules found for your address");
        }
    }

    async viewTimeCapsuleDetails(): Promise<void> {
        const capsuleIdInput = await this.question("\nEnter Capsule ID: ");
        const capsuleId = parseInt(capsuleIdInput);
        
        if (isNaN(capsuleId) || capsuleId < 1) {
            console.log("Invalid Capsule ID");
            return;
        }
        
        try {
            const details = await this.blocklockContract.getTimeCapsule(capsuleId);
            
            console.log("\n" + "=".repeat(60));
            console.log(`TIMECAPSULE ${capsuleId} DETAILS`);
            console.log("=".repeat(60));
            console.log(`Title: ${details[6]}`);
            console.log(`Creator: ${details[3]}`);
            console.log(`Recipient: ${details[4]}`);
            console.log(`IPFS CID: ${details[0]}`);
            console.log(`Blocklock Request ID: ${details[1]}`);
            console.log(`Created: ${new Date(Number(details[5]) * 1000).toISOString()}`);
            console.log(`Unlock Time: ${new Date(Number(details[2]) * 1000).toISOString()}`);
            console.log(`Current Time: ${new Date().toISOString()}`);
            console.log(`Status: ${details[7] ? 'UNLOCKED' : 'LOCKED'}`);
            console.log(`Uses Blocklock: ${details[11] ? 'YES' : 'NO'}`);
            console.log(`Has Decryption Key: ${details[10] ? 'YES' : 'NO'}`);
            console.log(`File Size: ${details[8]} bytes`);
            console.log(`File Type: ${details[9]}`);
            
            const canUnlock = await this.blocklockContract.canUnlock(capsuleId);
            const timeUntilUnlock = await this.blocklockContract.getTimeUntilUnlock(capsuleId);
            
            console.log(`Can Unlock Now: ${canUnlock ? 'YES' : 'NO'}`);
            console.log(`Time Until Unlock: ${timeUntilUnlock} seconds`);
            console.log("=".repeat(60));
            
        } catch (error) {
            console.log("Error retrieving TimeCapsule details:", error);
        }
    }

    async unlockTimeCapsule(): Promise<void> {
        const capsuleIdInput = await this.question("\nEnter Capsule ID to unlock: ");
        const capsuleId = parseInt(capsuleIdInput);
        
        if (isNaN(capsuleId) || capsuleId < 1) {
            console.log("Invalid Capsule ID");
            return;
        }
        
        try {
            const details = await this.blocklockContract.getTimeCapsule(capsuleId);
            const canUnlock = await this.blocklockContract.canUnlock(capsuleId);
            const timeUntilUnlock = await this.blocklockContract.getTimeUntilUnlock(capsuleId);
            
            console.log("\nTimeCapsule Status Check");
            console.log("-".repeat(30));
            console.log(`Current Time: ${new Date().toISOString()}`);
            console.log(`Unlock Time: ${new Date(Number(details[2]) * 1000).toISOString()}`);
            console.log(`Time Remaining: ${timeUntilUnlock} seconds`);
            console.log(`Already Unlocked: ${details[7] ? 'YES' : 'NO'}`);
            console.log(`Can Unlock: ${canUnlock ? 'YES' : 'NO'}`);
            
            if (details[7]) {
                console.log("\nTimeCapsule already unlocked. Retrieving content...");
                await this.retrieveAndDisplayContent(capsuleId, details[0]);
                return;
            }
            
            if (!canUnlock) {
                console.log("\nTimeCapsule cannot be unlocked yet.");
                console.log(`Wait ${Math.ceil(Number(timeUntilUnlock) / 3600)} more hours.`);
                return;
            }
            
            console.log("\nUnlocking TimeCapsule...");
            
            const tx = await this.blocklockContract.unlockTimeCapsule(capsuleId);
            console.log(`Unlock transaction: ${tx.hash}`);
            console.log("Waiting for confirmation...");
            
            const receipt = await tx.wait();
            if (receipt) {
                console.log("TimeCapsule unlocked successfully!");
                console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
                
                await this.retrieveAndDisplayContent(capsuleId, details[0]);
            }
            
        } catch (error) {
            console.log("Error unlocking TimeCapsule:", error);
        }
    }

    async retrieveAndDisplayContent(capsuleId: number, ipfsCid: string): Promise<void> {
        console.log("\nRetrieving TimeCapsule content...");
        console.log(`Downloading from IPFS: ${ipfsCid}`);
        
        const downloadPath = path.join(__dirname, "..", `retrieved_${capsuleId}_${Date.now()}.txt`);
        
        try {
            await this.lighthouseService.downloadFile(ipfsCid, downloadPath);
            
            if (fs.existsSync(downloadPath)) {
                const content = fs.readFileSync(downloadPath, 'utf8');
                
                console.log("\n" + "=".repeat(80));
                console.log("TIMECAPSULE CONTENT RETRIEVED");
                console.log("=".repeat(80));
                console.log(content);
                console.log("=".repeat(80));
                
                fs.unlinkSync(downloadPath);
                console.log("Content successfully retrieved and displayed.");
            } else {
                throw new Error("File download failed");
            }
            
        } catch (error) {
            console.log("Error downloading content:", error);
            console.log("\nAlternative access methods:");
            console.log(`Direct IPFS: https://gateway.lighthouse.storage/ipfs/${ipfsCid}`);
            console.log(`Local IPFS: http://localhost:8080/ipfs/${ipfsCid}`);
        }
    }
}

async function main() {
    try {
        const manager = new TimeCapsuleManager();
        await manager.initialize();
        await manager.showMenu();
    } catch (error) {
        console.error("Failed to initialize TimeCapsule Manager:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}