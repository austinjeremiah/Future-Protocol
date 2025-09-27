import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import { LighthouseService } from "./LighthouseService";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function listAllTimeCapsules() {
    console.log("Professional TimeCapsule System - List View");
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
    
    console.log(`Contract: ${await blocklockContract.getAddress()}`);
    console.log(`Your Wallet: ${senderAddress}`);
    
    const balance = await ethers.provider.getBalance(senderAddress);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    console.log("\nYour TimeCapsules");
    console.log("=".repeat(60));
    
    const capsuleCount = await blocklockContract.nextCapsuleId();
    console.log(`Total system capsules: ${capsuleCount}`);
    
    let foundCapsules = false;
    
    for (let i = 1; i < capsuleCount; i++) {
        try {
            const details = await blocklockContract.getTimeCapsule(i);
            const creator = details[3].toString();
            const recipient = details[4].toString();
            
            if (creator.toLowerCase() === senderAddress.toLowerCase() ||
                recipient.toLowerCase().includes(senderAddress.toLowerCase())) {
                
                foundCapsules = true;
                const status = details[7] ? "UNLOCKED" : "LOCKED";
                const role = creator.toLowerCase() === senderAddress.toLowerCase() ? "CREATOR" : "RECIPIENT";
                
                const canUnlock = await blocklockContract.canUnlock(i);
                const timeUntilUnlock = await blocklockContract.getTimeUntilUnlock(i);
                
                console.log(`\nCapsule ID: ${i}`);
                console.log(`Role: ${role}`);
                console.log(`Status: ${status}`);
                console.log(`Title: ${details[6]}`);
                console.log(`IPFS CID: ${details[0]}`);
                console.log(`Creator: ${creator}`);
                console.log(`Recipient: ${recipient}`);
                console.log(`Uses Blocklock: ${details[11] ? 'YES' : 'NO'}`);
                console.log(`Can Unlock Now: ${canUnlock ? 'YES' : 'NO'}`);
                console.log(`Time Until Unlock: ${timeUntilUnlock} seconds`);
                console.log(`File Size: ${details[8]} bytes`);
                console.log(`File Type: ${details[9]}`);
                console.log(`IPFS Gateway: https://gateway.lighthouse.storage/ipfs/${details[0]}`);
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

listAllTimeCapsules().catch(console.error);