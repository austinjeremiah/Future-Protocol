import { ethers } from "hardhat";
import { getBytes, Signer, Wallet } from "ethers";
import { Blocklock, encodeCiphertextToSolidity, encodeCondition } from "blocklock-js";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import { LighthouseService } from "./LighthouseService";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function testBlocklockTimeCapsule() {
    console.log("Testing Blocklock TimeCapsule Integration");
    console.log("=".repeat(60));
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY not found in environment");
    }

    const signer = new Wallet(privateKey, ethers.provider);
    const senderAddress = await signer.getAddress();
    
    const blocklockContract = await ethers.getContractAt(
        "TimeCapsuleBlocklockSimple", 
        "0xf939f81b62a57157C6fA441bEb64B2E684382991",
        signer
    ) as TimeCapsuleBlocklockSimple;
    
    const lighthouseService = new LighthouseService(process.env.LIGHTHOUSE_API_KEY!);
    const blocklock = Blocklock.createBaseSepolia(signer as unknown as Signer);
    
    console.log(`Contract: ${await blocklockContract.getAddress()}`);
    console.log(`Wallet: ${senderAddress}`);
    
    const balance = await ethers.provider.getBalance(senderAddress);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    const title = "Blocklock Integration Test";
    const message = "This message is encrypted with Blocklock and stored on IPFS.";
    const recipientAddress = "0x588F6b3169F60176c1143f8BaB47bCf3DeEbECdc";
    
    const currentBlock = await ethers.provider.getBlockNumber();
    const targetBlock = BigInt(currentBlock + 10);
    
    const messageContent = `BLOCKLOCK TIMECAPSULE TEST
============================

Title: ${title}
From: ${senderAddress}
To: ${recipientAddress}
Created: ${new Date().toISOString()}
Current Block: ${currentBlock}
Target Block: ${targetBlock}

MESSAGE:
${message}

This content is encrypted with Blocklock technology.`;

    try {
        console.log("\nStep 1: Encrypting content with Blocklock...");
        console.log(`Current block: ${currentBlock}`);
        console.log(`Target block: ${targetBlock}`);
        
        const messageBytes = ethers.toUtf8Bytes(messageContent);
        const cipherMessage = blocklock.encrypt(messageBytes, targetBlock);
        const encodedCiphertext = encodeCiphertextToSolidity(cipherMessage);
        
        console.log("Step 2: Storing encrypted content to file...");
        const tempFilePath = path.join(__dirname, "..", `blocklock_test_${Date.now()}.bin`);
        const ciphertextHex = typeof encodedCiphertext === 'string' ? encodedCiphertext : ethers.hexlify(encodedCiphertext);
        fs.writeFileSync(tempFilePath, Buffer.from(ciphertextHex.slice(2), 'hex'));
        
        console.log("Step 3: Uploading to IPFS...");
        const uploadResult = await lighthouseService.uploadFile(tempFilePath);
        console.log(`IPFS CID: ${uploadResult.Hash}`);
        
        console.log("Step 4: Creating Blocklock request...");
        const conditionBytes = encodeCondition(targetBlock);
        const callbackGasLimit = 700000n;
        
        const [requestPrice] = await blocklock.calculateRequestPriceNative(callbackGasLimit);
        console.log(`Request price: ${ethers.formatEther(requestPrice)} ETH`);
        
        if (balance < requestPrice) {
            throw new Error(`Insufficient balance. Need ${ethers.formatEther(requestPrice)} ETH`);
        }
        
        const tx = await blocklockContract.createTimelockRequestWithDirectFunding(
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
        
        console.log(`Transaction: ${tx.hash}`);
        console.log("Waiting for confirmation...");
        
        const receipt = await tx.wait();
        if (receipt) {
            const capsuleId = await blocklockContract.nextCapsuleId() - 1n;
            
            console.log("\n" + "=".repeat(60));
            console.log("BLOCKLOCK TIMECAPSULE CREATED");
            console.log("=".repeat(60));
            console.log(`Capsule ID: ${capsuleId}`);
            console.log(`IPFS CID: ${uploadResult.Hash}`);
            console.log(`Transaction: ${receipt.hash}`);
            console.log(`Block: ${receipt.blockNumber}`);
            console.log(`Target Block: ${targetBlock}`);
            console.log(`Gas Used: ${receipt.gasUsed}`);
            console.log(`Encrypted Size: ${Buffer.from(ciphertextHex.slice(2), 'hex').length} bytes`);
            console.log("=".repeat(60));
            
            console.log("\nTesting retrieval...");
            const details = await blocklockContract.getTimeCapsule(capsuleId);
            console.log(`Status: ${details[7] ? 'UNLOCKED' : 'LOCKED'}`);
            console.log(`Uses Blocklock: ${details[11] ? 'YES' : 'NO'}`);
            console.log(`Has Decryption Key: ${details[10] ? 'YES' : 'NO'}`);
            
            const canUnlock = await blocklockContract.canUnlock(capsuleId);
            console.log(`Can Unlock: ${canUnlock ? 'YES' : 'NO'}`);
            
            console.log("\nBlocklock TimeCapsule integration test completed successfully!");
        }
        
        fs.unlinkSync(tempFilePath);
        
    } catch (error) {
        console.error("Error in Blocklock integration test:", error);
    }
}

testBlocklockTimeCapsule().catch(console.error);