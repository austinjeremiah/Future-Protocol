import { ethers } from "hardhat";
import { getBytes, Signer, Wallet } from "ethers";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition, encodeParams } from "blocklock-js";
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
    private blocklock!: Blocklock;

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
        try {
            this.blocklock = Blocklock.createBaseSepolia(this.signer as unknown as Signer);
        } catch (error) {
            console.log("Blocklock initialization failed, using simplified encryption");
        }
        
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
        
        console.log("\nUnlock Block Options:");
        console.log("1. 10 blocks from now");
        console.log("2. 50 blocks from now");
        console.log("3. 100 blocks from now");
        console.log("4. 500 blocks from now");
        console.log("5. Custom block count");
        
        const blockOption = await this.question("Select option (1-5): ");
        
        let unlockBlocks: number;
        switch (blockOption) {
            case '1': unlockBlocks = 10; break;
            case '2': unlockBlocks = 50; break;
            case '3': unlockBlocks = 100; break;
            case '4': unlockBlocks = 500; break;
            case '5':
                const customBlocks = await this.question("Enter blocks from now: ");
                unlockBlocks = parseInt(customBlocks) || 10;
                break;
            default: unlockBlocks = 10;
        }
        
        const currentBlock = await ethers.provider.getBlockNumber();
        const targetBlock = BigInt(currentBlock + unlockBlocks);
        
        const messageContent = `TIMECAPSULE MESSAGE
=====================

Title: ${title}
From: ${this.senderAddress}
To: ${recipientAddress}
Created: ${new Date().toISOString()}
Target Block: ${targetBlock}
Current Block: ${currentBlock}

MESSAGE CONTENT:
================
${message}

TECHNICAL INFO:
===============
This TimeCapsule uses Blocklock encryption for time-locked access.
File stored on IPFS via Lighthouse for decentralized storage.
Smart contract manages unlock conditions and access control.`;

        console.log("\nProcessing TimeCapsule...");
        console.log("Step 1: Encrypting message with Blocklock...");
        
        const messageBytes = ethers.toUtf8Bytes(messageContent);
        const cipherMessage = this.blocklock.encrypt(messageBytes, targetBlock);
        const encodedCiphertext = encodeCiphertextToSolidity(cipherMessage);
        
        console.log("Step 2: Creating encrypted file...");
        const tempFilePath = path.join(__dirname, "..", `encrypted_timecapsule_${Date.now()}.bin`);
        const ciphertextHex = typeof encodedCiphertext === 'string' ? encodedCiphertext : ethers.hexlify(encodedCiphertext);
        fs.writeFileSync(tempFilePath, Buffer.from(ciphertextHex.slice(2), 'hex'));
        
        console.log("Step 3: Uploading encrypted file to IPFS...");
        const uploadResult = await this.lighthouseService.uploadFile(tempFilePath);
        console.log(`IPFS Upload Complete: ${uploadResult.Hash}`);
        
        console.log("Step 4: Creating on-chain TimeCapsule with Blocklock...");
        
        const conditionBytes = encodeCondition(targetBlock);
        const callbackGasLimit = 700000n;
        const [requestPrice] = await this.blocklock.calculateRequestPriceNative(callbackGasLimit);
        
        console.log(`Target block: ${targetBlock}`);
        console.log(`Callback gas limit: ${callbackGasLimit}`);
        console.log(`Request price: ${ethers.formatEther(requestPrice)} ETH`);
        
        const balance = await ethers.provider.getBalance(this.senderAddress);
        if (balance < requestPrice) {
            throw new Error(`Insufficient balance. Need ${ethers.formatEther(requestPrice)} ETH`);
        }
        
        const tx = await this.blocklockContract.createTimelockRequestWithDirectFunding(
            uploadResult.Hash,
            callbackGasLimit,
            conditionBytes,
            ciphertextHex,
            `${recipientAddress}@wallet.address`,
            title,
            Buffer.from(ciphertextHex.slice(2), 'hex').length,
            "application/octet-stream",
            { value: requestPrice }
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
            console.log(`Target Block: ${targetBlock}`);
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
        
        const downloadPath = path.join(__dirname, "..", `retrieved_${capsuleId}_${Date.now()}.bin`);
        
        try {
            await this.lighthouseService.downloadFile(ipfsCid, downloadPath);
            
            if (fs.existsSync(downloadPath)) {
                console.log("Step 1: Downloaded encrypted file from IPFS");
                
                const details = await this.blocklockContract.getTimeCapsule(capsuleId);
                const hasDecryptionKey = details[10];
                
                if (hasDecryptionKey) {
                    console.log("Step 2: Decryption key available, decrypting content...");
                    
                    try {
                        const encryptedData = fs.readFileSync(downloadPath);
                        const encryptedHex = "0x" + encryptedData.toString('hex');
                        
                        const decryptionKey = details[9];
                        const decryptedBytes = await this.blocklock.decrypt(encryptedHex, decryptionKey);
                        const decryptedContent = ethers.toUtf8String(decryptedBytes);
                        
                        console.log("\n" + "=".repeat(80));
                        console.log("TIMECAPSULE CONTENT DECRYPTED");
                        console.log("=".repeat(80));
                        console.log(decryptedContent);
                        console.log("=".repeat(80));
                        
                        console.log("Content successfully decrypted and displayed.");
                    } catch (decryptError) {
                        console.log("Error decrypting content:", decryptError);
                        console.log("Content may still be time-locked or decryption key not available");
                        
                        const encryptedData = fs.readFileSync(downloadPath);
                        console.log("\n" + "=".repeat(80));
                        console.log("ENCRYPTED TIMECAPSULE CONTENT");
                        console.log("=".repeat(80));
                        console.log("Encrypted data size:", encryptedData.length, "bytes");
                        console.log("Hex preview:", encryptedData.toString('hex').slice(0, 100) + "...");
                        console.log("=".repeat(80));
                    }
                } else {
                    console.log("Step 2: Decryption key not yet available");
                    
                    const encryptedData = fs.readFileSync(downloadPath);
                    console.log("\n" + "=".repeat(80));
                    console.log("ENCRYPTED TIMECAPSULE CONTENT");
                    console.log("=".repeat(80));
                    console.log("Content is still time-locked");
                    console.log("Encrypted data size:", encryptedData.length, "bytes");
                    console.log("Wait for unlock time to access decrypted content");
                    console.log("=".repeat(80));
                }
                
                fs.unlinkSync(downloadPath);
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