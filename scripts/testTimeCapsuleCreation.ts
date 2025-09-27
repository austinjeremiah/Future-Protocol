import { ethers } from "hardhat";
import { TimeCapsuleBlocklockSimple } from "../typechain-types";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

async function testTimeCapsuleCreation() {
    console.log("Testing TimeCapsule Creation");
    console.log("============================");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY required");
    }

    const signer = new ethers.Wallet(privateKey, ethers.provider);
    const contract = await ethers.getContractAt(
        "TimeCapsuleBlocklockSimple", 
        "0xf939f81b62a57157C6fA441bEb64B2E684382991",
        signer
    ) as TimeCapsuleBlocklockSimple;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const currentBlock = await ethers.provider.getBlockNumber();
    const blockTimestamp = (await ethers.provider.getBlock(currentBlock))?.timestamp || currentTime;
    
    console.log(`Current time (Date.now): ${currentTime}`);
    console.log(`Current time (ISO): ${new Date(currentTime * 1000).toISOString()}`);
    console.log(`Block timestamp: ${blockTimestamp}`);
    console.log(`Block timestamp (ISO): ${new Date(blockTimestamp * 1000).toISOString()}`);
    console.log(`Time difference: ${currentTime - blockTimestamp} seconds`);
    
    // Test with different unlock times
    const testTimes = [
        { description: "10 seconds from now", offset: 10 },
        { description: "60 seconds from now", offset: 60 },
        { description: "10 seconds from block timestamp", blockOffset: 10 },
        { description: "60 seconds from block timestamp", blockOffset: 60 }
    ];
    
    for (const test of testTimes) {
        let unlockTime: number;
        if (test.blockOffset) {
            unlockTime = blockTimestamp + test.blockOffset;
        } else {
            unlockTime = currentTime + (test.offset || 10);
        }
        
        console.log(`\nTesting: ${test.description}`);
        console.log(`Unlock time: ${unlockTime}`);
        console.log(`Unlock time (ISO): ${new Date(unlockTime * 1000).toISOString()}`);
        console.log(`Difference from block timestamp: ${unlockTime - blockTimestamp} seconds`);
        
        try {
            const estimateGas = await contract.createSimpleTimeCapsule.estimateGas(
                `bafkrei${crypto.randomBytes(20).toString('hex')}`,
                crypto.randomBytes(32).toString('hex'),
                unlockTime,
                "test@example.com",
                `Test Creation - ${test.description}`,
                100,
                "text/plain"
            );
            console.log(`✅ Gas estimate successful: ${estimateGas}`);
            
            // Actually try creating the TimeCapsule
            const tx = await contract.createSimpleTimeCapsule(
                `bafkrei${crypto.randomBytes(20).toString('hex')}`,
                crypto.randomBytes(32).toString('hex'),
                unlockTime,
                "test@example.com",
                `Test Creation - ${test.description}`,
                100,
                "text/plain"
            );
            
            console.log(`✅ Transaction successful: ${tx.hash}`);
            const receipt = await tx.wait();
            console.log(`✅ Confirmed in block: ${receipt?.blockNumber}`);
            
            break; // If successful, we found working parameters
            
        } catch (error) {
            console.log(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

testTimeCapsuleCreation().catch(console.error);