import { ethers } from "hardhat";
import { getBytes, Signer, Wallet } from "ethers";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition } from "blocklock-js";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import { LighthouseService } from "./LighthouseService";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export class ProfessionalBlocklockTimeCapsule {
    private blocklockContract!: TimeCapsuleBlocklockSimple;
    private signer!: Wallet;
    private lighthouseService!: LighthouseService;
    private senderAddress!: string;
    private blocklock!: Blocklock;

    async initialize(): Promise<void> {
        console.log("Initializing Professional Blocklock TimeCapsule System...");
        
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
        this.blocklock = Blocklock.createBaseSepolia(this.signer as unknown as Signer);
        
        console.log(`Contract Address: ${await this.blocklockContract.getAddress()}`);
        console.log(`Wallet Address: ${this.senderAddress}`);
        
        const balance = await ethers.provider.getBalance(this.senderAddress);
        console.log(`ETH Balance: ${ethers.formatEther(balance)} ETH`);
    }

    async createBlocklockTimeCapsule(
        title: string,
        message: string,
        recipientAddress: string,
        blockDelay: number = 10
    ): Promise<void> {
        console.log(`\nCreating Blocklock TimeCapsule: "${title}"`);
        console.log("-".repeat(60));
        
        const currentBlock = await ethers.provider.getBlockNumber();
        const targetBlock = BigInt(currentBlock + blockDelay);
        
        console.log(`Current block: ${currentBlock}`);
        console.log(`Target block: ${targetBlock}`);
        console.log(`Block delay: ${blockDelay} blocks`);
        
        const messageContent = `BLOCKLOCK TIMECAPSULE MESSAGE
===============================

Title: ${title}
From: ${this.senderAddress}
To: ${recipientAddress}
Created: ${new Date().toISOString()}
Current Block: ${currentBlock}
Target Block: ${targetBlock}

MESSAGE CONTENT:
================
${message}

TECHNICAL INFO:
===============
This TimeCapsule uses Blocklock encryption for time-locked access.
Content is encrypted with AES and the key is time-locked with Blocklock.
File stored on IPFS via Lighthouse for decentralized storage.
Smart contract manages unlock conditions and access control.`;

        console.log("\nStep 1: Generating AES encryption key...");
        const aesKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);
        
        console.log("Step 2: Encrypting content with AES...");
        const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
        let encryptedContent = cipher.update(messageContent, 'utf8', 'hex');
        encryptedContent += cipher.final('hex');
        
        const encryptedData = {
            iv: iv.toString('hex'),
            content: encryptedContent
        };
        
        console.log("Step 3: Encrypting AES key with Blocklock...");
        const keyForBlocklock = aesKey.slice(0, 31);
        const cipherMessage = this.blocklock.encrypt(keyForBlocklock, targetBlock);
        const encodedCiphertext = encodeCiphertextToSolidity(cipherMessage);
        
        console.log("Step 4: Storing encrypted content to IPFS...");
        const tempFilePath = path.join(__dirname, "..", `encrypted_timecapsule_${Date.now()}.json`);
        fs.writeFileSync(tempFilePath, JSON.stringify(encryptedData, null, 2));
        
        const uploadResult = await this.lighthouseService.uploadFile(tempFilePath);
        console.log(`IPFS CID: ${uploadResult.Hash}`);
        
        console.log("Step 5: Creating on-chain Blocklock request...");
        const conditionBytes = encodeCondition(targetBlock);
        const callbackGasLimit = 700000n;
        
        const [requestPrice] = await this.blocklock.calculateRequestPriceNative(callbackGasLimit);
        console.log(`Request price: ${ethers.formatEther(requestPrice)} ETH`);
        
        const balance = await ethers.provider.getBalance(this.senderAddress);
        if (balance < requestPrice) {
            throw new Error(`Insufficient balance. Need ${ethers.formatEther(requestPrice)} ETH`);
        }
        
        const ciphertextHex = typeof encodedCiphertext === 'string' ? encodedCiphertext : ethers.hexlify(encodedCiphertext);
        
        const tx = await this.blocklockContract.createTimelockRequestWithDirectFunding(
            uploadResult.Hash,
            callbackGasLimit,
            conditionBytes,
            ciphertextHex,
            `${recipientAddress}@wallet.address`,
            title,
            encryptedContent.length,
            "application/json",
            { value: requestPrice }
        );
        
        console.log(`Transaction: ${tx.hash}`);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        if (receipt) {
            const capsuleId = await this.blocklockContract.nextCapsuleId() - 1n;
            
            console.log("\n" + "=".repeat(70));
            console.log("BLOCKLOCK TIMECAPSULE CREATED SUCCESSFULLY");
            console.log("=".repeat(70));
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`Title: ${title}`);
            console.log(`IPFS CID: ${uploadResult.Hash}`);
            console.log(`Transaction: ${receipt.hash}`);
            console.log(`Block Number: ${receipt.blockNumber}`);
            console.log(`Target Block: ${targetBlock}`);
            console.log(`Gas Used: ${receipt.gasUsed.toLocaleString()}`);
            console.log(`Content Size: ${messageContent.length} bytes`);
            console.log(`Encrypted Size: ${encryptedContent.length} bytes`);
            console.log(`Network: Filecoin Calibration`);
            console.log(`Creator: ${this.senderAddress}`);
            console.log(`IPFS Gateway: https://gateway.lighthouse.storage/ipfs/${uploadResult.Hash}`);
            console.log("=".repeat(70));
        }
        
        fs.unlinkSync(tempFilePath);
    }

    async listBlocklockTimeCapsules(): Promise<void> {
        console.log("\nYour Blocklock TimeCapsules");
        console.log("=".repeat(70));
        
        const capsuleCount = await this.blocklockContract.nextCapsuleId();
        console.log(`Total system capsules: ${capsuleCount}`);
        
        let foundCapsules = false;
        
        for (let i = 1; i < capsuleCount; i++) {
            try {
                const details = await this.blocklockContract.getTimeCapsule(i);
                const creator = details[3].toString();
                const recipient = details[4].toString();
                
                if ((creator.toLowerCase() === this.senderAddress.toLowerCase() ||
                     recipient.toLowerCase().includes(this.senderAddress.toLowerCase())) &&
                     details[11]) {
                    
                    foundCapsules = true;
                    const status = details[7] ? "UNLOCKED" : "LOCKED";
                    const role = creator.toLowerCase() === this.senderAddress.toLowerCase() ? "CREATOR" : "RECIPIENT";
                    
                    const canUnlock = await this.blocklockContract.canUnlock(i);
                    
                    console.log(`\nCapsule ID: ${i}`);
                    console.log(`Role: ${role}`);
                    console.log(`Status: ${status}`);
                    console.log(`Title: ${details[6]}`);
                    console.log(`IPFS CID: ${details[0]}`);
                    console.log(`Blocklock Request ID: ${details[1]}`);
                    console.log(`Creator: ${creator}`);
                    console.log(`Recipient: ${recipient}`);
                    console.log(`Uses Blocklock: YES`);
                    console.log(`Can Unlock Now: ${canUnlock ? 'YES' : 'NO'}`);
                    console.log(`File Type: ${details[9]}`);
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!foundCapsules) {
            console.log("No Blocklock TimeCapsules found for your address");
        }
        console.log("=".repeat(70));
    }

    async unlockAndDecryptTimeCapsule(capsuleId: number): Promise<void> {
        console.log(`\nUnlocking Blocklock TimeCapsule ID: ${capsuleId}`);
        console.log("-".repeat(60));
        
        try {
            const details = await this.blocklockContract.getTimeCapsule(capsuleId);
            const canUnlock = await this.blocklockContract.canUnlock(capsuleId);
            const hasDecryptionKey = details[10];
            
            console.log(`Title: ${details[6]}`);
            console.log(`Status: ${details[7] ? 'UNLOCKED' : 'LOCKED'}`);
            console.log(`Uses Blocklock: ${details[11] ? 'YES' : 'NO'}`);
            console.log(`Can Unlock Now: ${canUnlock ? 'YES' : 'NO'}`);
            console.log(`Has Decryption Key: ${hasDecryptionKey ? 'YES' : 'NO'}`);
            
            if (!details[7] && canUnlock) {
                console.log("\nUnlocking TimeCapsule...");
                const tx = await this.blocklockContract.unlockTimeCapsule(capsuleId);
                console.log(`Transaction: ${tx.hash}`);
                
                const receipt = await tx.wait();
                if (receipt) {
                    console.log("TimeCapsule unlocked successfully!");
                }
            }
            
            console.log("\nRetrieving and decrypting content...");
            await this.retrieveAndDecryptContent(capsuleId, details[0]);
            
        } catch (error) {
            console.error("Error processing Blocklock TimeCapsule:", error);
        }
    }

    async retrieveAndDecryptContent(capsuleId: number, ipfsCid: string): Promise<void> {
        console.log(`\nRetrieving content from IPFS: ${ipfsCid}`);
        
        const downloadPath = path.join(__dirname, "..", `retrieved_${capsuleId}_${Date.now()}.json`);
        
        try {
            await this.lighthouseService.downloadFile(ipfsCid, downloadPath);
            
            if (fs.existsSync(downloadPath)) {
                const encryptedData = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
                
                console.log("Step 1: Downloaded encrypted data from IPFS");
                console.log("Step 2: Attempting to decrypt with Blocklock key...");
                
                const details = await this.blocklockContract.getTimeCapsule(capsuleId);
                const hasDecryptionKey = details[10];
                
                if (hasDecryptionKey) {
                    try {
                        const decryptionKeyBytes = details[9];
                        
                        const decryptionKey = Buffer.from(decryptionKeyBytes.slice(2), 'hex');
                        const ivBuffer = Buffer.from(encryptedData.iv, 'hex');
                        const decipher = crypto.createDecipheriv('aes-256-cbc', decryptionKey, ivBuffer);
                        let decryptedContent = decipher.update(encryptedData.content, 'hex', 'utf8');
                        decryptedContent += decipher.final('utf8');
                        
                        console.log("\n" + "=".repeat(80));
                        console.log("BLOCKLOCK TIMECAPSULE CONTENT DECRYPTED");
                        console.log("=".repeat(80));
                        console.log(decryptedContent);
                        console.log("=".repeat(80));
                        
                        console.log("Content successfully decrypted with Blocklock key!");
                        
                    } catch (decryptError) {
                        console.log("Error decrypting content:", decryptError);
                        console.log("Decryption key may not be ready or content format invalid");
                        
                        console.log("\n" + "=".repeat(80));
                        console.log("ENCRYPTED CONTENT (Unable to decrypt)");
                        console.log("=".repeat(80));
                        console.log("IV:", encryptedData.iv);
                        console.log("Content preview:", encryptedData.content.slice(0, 100) + "...");
                        console.log("=".repeat(80));
                    }
                } else {
                    console.log("Decryption key not yet available from Blocklock");
                    
                    console.log("\n" + "=".repeat(80));
                    console.log("ENCRYPTED CONTENT (Time-locked)");
                    console.log("=".repeat(80));
                    console.log("Content is still time-locked with Blocklock");
                    console.log("IV:", encryptedData.iv);
                    console.log("Encrypted size:", encryptedData.content.length, "characters");
                    console.log("Wait for unlock condition to be met");
                    console.log("=".repeat(80));
                }
                
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
    const timeCapsule = new ProfessionalBlocklockTimeCapsule();
    await timeCapsule.initialize();
    
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case 'create':
            const title = args[1] || "Professional Blocklock TimeCapsule";
            const message = args[2] || "This is a professional Blocklock TimeCapsule message with AES+Blocklock encryption.";
            const recipient = args[3] || "0x588F6b3169F60176c1143f8BaB47bCf3DeEbECdc";
            const blocks = parseInt(args[4]) || 10;
            await timeCapsule.createBlocklockTimeCapsule(title, message, recipient, blocks);
            break;
            
        case 'list':
            await timeCapsule.listBlocklockTimeCapsules();
            break;
            
        case 'unlock':
            const capsuleId = parseInt(args[1]);
            if (isNaN(capsuleId)) {
                console.log("Please provide a valid capsule ID");
                return;
            }
            await timeCapsule.unlockAndDecryptTimeCapsule(capsuleId);
            break;
            
        default:
            console.log("\nProfessional Blocklock TimeCapsule System");
            console.log("========================================");
            console.log("Commands:");
            console.log("  create [title] [message] [recipient] [blocks] - Create new Blocklock TimeCapsule");
            console.log("  list                                           - List your Blocklock TimeCapsules");
            console.log("  unlock [capsuleId]                             - Unlock and decrypt TimeCapsule");
            console.log("\nExamples:");
            console.log("  npx hardhat run scripts/professionalBlocklockTimeCapsule.ts --network calibration create");
            console.log("  npx hardhat run scripts/professionalBlocklockTimeCapsule.ts --network calibration list");
            console.log("  npx hardhat run scripts/professionalBlocklockTimeCapsule.ts --network calibration unlock 9");
    }
}

if (require.main === module) {
    main().catch(console.error);
}