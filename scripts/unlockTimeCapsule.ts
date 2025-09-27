import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import { LighthouseService } from "./LighthouseService";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function unlockAndRetrieve(capsuleId: number) {
    console.log("Professional TimeCapsule System - Unlock & Retrieve");
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
    
    console.log(`Contract: ${await blocklockContract.getAddress()}`);
    console.log(`Your Wallet: ${senderAddress}`);
    console.log(`Unlocking Capsule ID: ${capsuleId}`);
    
    try {
        const details = await blocklockContract.getTimeCapsule(capsuleId);
        const canUnlock = await blocklockContract.canUnlock(capsuleId);
        const timeUntilUnlock = await blocklockContract.getTimeUntilUnlock(capsuleId);
        
        console.log(`\nTimeCapsule Details:`);
        console.log(`Title: ${details[6]}`);
        console.log(`Status: ${details[7] ? 'UNLOCKED' : 'LOCKED'}`);
        console.log(`IPFS CID: ${details[0]}`);
        console.log(`Creator: ${details[3]}`);
        console.log(`Recipient: ${details[4]}`);
        console.log(`Uses Blocklock: ${details[11] ? 'YES' : 'NO'}`);
        console.log(`Can Unlock Now: ${canUnlock ? 'YES' : 'NO'}`);
        console.log(`Time Until Unlock: ${timeUntilUnlock} seconds`);
        
        if (details[7]) {
            console.log("\nTimeCapsule already unlocked. Retrieving content...");
        } else if (canUnlock) {
            console.log("\nUnlocking TimeCapsule...");
            const tx = await blocklockContract.unlockTimeCapsule(capsuleId);
            console.log(`Transaction: ${tx.hash}`);
            
            const receipt = await tx.wait();
            if (receipt) {
                console.log("TimeCapsule unlocked successfully!");
                console.log(`Block: ${receipt.blockNumber}`);
            }
        } else {
            console.log(`\nTimeCapsule cannot be unlocked yet.`);
            console.log(`Wait ${Math.ceil(Number(timeUntilUnlock) / 3600)} more hours.`);
            return;
        }
        
        console.log(`\nRetrieving content from IPFS: ${details[0]}`);
        
        const downloadPath = path.join(__dirname, "..", `retrieved_${capsuleId}_${Date.now()}.txt`);
        
        try {
            await lighthouseService.downloadFile(details[0], downloadPath);
            
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
            console.error("Error downloading content:", error);
            console.log(`\nDirect IPFS Access: https://gateway.lighthouse.storage/ipfs/${details[0]}`);
        }
        
    } catch (error) {
        console.error("Error processing TimeCapsule:", error);
    }
}

// Get capsule ID from command line or use default
const capsuleId = process.argv[2] ? parseInt(process.argv[2]) : 2; // Default to capsule 2 (already unlocked)

unlockAndRetrieve(capsuleId).catch(console.error);