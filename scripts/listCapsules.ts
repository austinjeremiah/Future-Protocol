import { ethers } from "hardhat";
import { Wallet } from "ethers";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import dotenv from "dotenv";

dotenv.config();

async function listCapsules() {
    console.log("Connecting to contract...");
    
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
    console.log(`Sender: ${senderAddress}`);
    
    const balance = await ethers.provider.getBalance(senderAddress);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    console.log("\nYour TimeCapsules");
    console.log("-".repeat(50));
    
    const capsuleCount = await blocklockContract.nextCapsuleId();
    console.log(`Total capsules in system: ${capsuleCount}`);
    
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
                const role = creator.toLowerCase() === senderAddress.toLowerCase() ? "SENDER" : "RECIPIENT";
                
                console.log(`\nCapsule ID: ${i}`);
                console.log(`Role: ${role}`);
                console.log(`Status: ${status}`);
                console.log(`Title: ${details[6]}`);
                console.log(`Created: ${new Date(Number(details[5]) * 1000).toISOString()}`);
                console.log(`Unlock: ${new Date(Number(details[2]) * 1000).toISOString()}`);
                console.log(`Creator: ${creator}`);
                console.log(`Recipient: ${recipient}`);
                console.log(`IPFS CID: ${details[0]}`);
            }
        } catch (e) {
            console.log(`Error reading capsule ${i}:`, e.message);
            continue;
        }
    }
    
    if (!foundCapsules) {
        console.log("No TimeCapsules found for your address");
    }
}

listCapsules().catch(console.error);