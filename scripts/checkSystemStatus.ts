import { ethers } from "hardhat";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import dotenv from "dotenv";

dotenv.config();

async function checkSystemStatus() {
    console.log("System Status Check");
    console.log("==================");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.log("❌ PRIVATE_KEY not found");
        return;
    }
    
    const signer = new ethers.Wallet(privateKey, ethers.provider);
    const address = await signer.getAddress();
    
    console.log(`Wallet Address: ${address}`);
    
    // Check balance
    const balance = await ethers.provider.getBalance(address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Check contract
    const contractAddress = "0xf939f81b62a57157C6fA441bEb64B2E684382991";
    const contract = await ethers.getContractAt(
        "TimeCapsuleBlocklockSimple", 
        contractAddress,
        signer
    ) as TimeCapsuleBlocklockSimple;
    
    console.log(`Contract Address: ${await contract.getAddress()}`);
    
    // Check next capsule ID
    try {
        const nextId = await contract.nextCapsuleId();
        console.log(`Next TimeCapsule ID: ${nextId}`);
        
        // Check a few recent capsules
        console.log("\nRecent TimeCapsules:");
        for (let i = Math.max(1, Number(nextId) - 3); i < nextId; i++) {
            try {
                const capsule = await contract.getTimeCapsule(i);
                console.log(`  ID ${i}: ${capsule[6]} - ${capsule[7] ? 'UNLOCKED' : 'LOCKED'}`);
            } catch (e) {
                console.log(`  ID ${i}: Error reading`);
            }
        }
        
        // Test contract call - check if we can call a simple function
        const currentBlock = await ethers.provider.getBlockNumber();
        console.log(`Current Block: ${currentBlock}`);
        
    } catch (error) {
        console.log("❌ Contract interaction failed:", error);
    }
}

checkSystemStatus().catch(console.error);