import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import { LighthouseService } from "./LighthouseService";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function createTestCapsule() {
    console.log("Creating test TimeCapsule...");
    
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
    
    console.log(`Contract: ${await blocklockContract.getAddress()}`);
    console.log(`Sender: ${senderAddress}`);
    
    // Test parameters
    const title = "Professional Test";
    const message = "This is a professional TimeCapsule test using real contracts.";
    const recipientAddress = "0x588F6b3169F60176c1143f8BaB47bCf3DeEbECdc";
    const unlockHours = 1; // 1 hour from now
    const unlockTime = Math.floor(Date.now() / 1000) + (unlockHours * 3600);
    
    const messageContent = `TIMECAPSULE MESSAGE
=====================

Title: ${title}
From: ${senderAddress}
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
    const uploadResult = await lighthouseService.uploadFile(tempFilePath);
    console.log(`IPFS Upload Complete: ${uploadResult.Hash}`);
    
    console.log("Step 3: Creating on-chain TimeCapsule with Blocklock...");
    
    const conditionBytes = ethers.AbiCoder.defaultAbiCoder().encode(
        ["uint256"],
        [unlockTime]
    );
    
    const ciphertextBytes = ethers.toUtf8Bytes("blocklock_encrypted_content");
    
    try {
        const tx = await blocklockContract.createTimelockRequestWithDirectFunding(
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
            const capsuleId = await blocklockContract.nextCapsuleId() - 1n;
            
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
            
            console.log("\nTesting TimeCapsule details retrieval...");
            const details = await blocklockContract.getTimeCapsule(capsuleId);
            console.log("Details retrieved successfully:");
            console.log(`- Title: ${details[6]}`);
            console.log(`- Creator: ${details[3]}`);
            console.log(`- Recipient: ${details[4]}`);
            console.log(`- IPFS CID: ${details[0]}`);
            console.log(`- Status: ${details[7] ? 'UNLOCKED' : 'LOCKED'}`);
            
            const canUnlock = await blocklockContract.canUnlock(capsuleId);
            const timeUntilUnlock = await blocklockContract.getTimeUntilUnlock(capsuleId);
            console.log(`- Can Unlock: ${canUnlock ? 'YES' : 'NO'}`);
            console.log(`- Time Until Unlock: ${timeUntilUnlock} seconds`);
        }
        
        fs.unlinkSync(tempFilePath);
        console.log("\nTimeCapsule creation test completed successfully!");
        
    } catch (error) {
        console.error("Error creating TimeCapsule:", error);
        fs.unlinkSync(tempFilePath);
    }
}

createTestCapsule().catch(console.error);