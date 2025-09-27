import { ethers } from "hardhat";
import fs from "fs";

/**
 * Deploy TimeCapsuleBlocklock Contract
 */
async function main() {
    console.log("Deploying TimeCapsuleBlocklock contract...");
    
    const [signer] = await ethers.getSigners();
    console.log(`Deploying from: ${await s
        
        
        
        igner.getAddress()}`);
    
    // Blocklock sender address for Calibration testnet
    // Note: Replace with actual Blocklock sender address for your network
    // For testing, we'll use a placeholder address
    const blocklockSender = "0x1234567890123456789012345678901234567890"; // Placeholder
    
    console.log("Deploying contract...");
    
    const TimeCapsuleBlocklock = await ethers.getContractFactory("TimeCapsuleBlocklockSimple");
    
    // Deploy the simplified contract (no constructor args needed)
    const timeCapsuleBlocklock = await TimeCapsuleBlocklock.deploy();
    
    console.log(`Transaction hash: ${timeCapsuleBlocklock.deploymentTransaction()?.hash}`);
    
    // Wait for deployment
    console.log("Waiting for deployment confirmation...");
    await timeCapsuleBlocklock.waitForDeployment();
    
    const contractAddress = await timeCapsuleBlocklock.getAddress();
    console.log(`TimeCapsuleBlocklock deployed to: ${contractAddress}`);
    
    // Verify the contract is working
    const totalCapsules = await timeCapsuleBlocklock.getTotalCapsules();
    console.log(`Total capsules initialized: ${totalCapsules}`);
    
    // Test Blocklock price calculation
    try {
        const testUnlockTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        const price = await timeCapsuleBlocklock.getBlocklockPrice(200000, testUnlockTime);
        console.log(`Blocklock request price for 1 hour timelock: ${ethers.formatEther(price)} ETH`);
    } catch (error) {
        console.log("Could not get Blocklock price - this is expected if Blocklock sender is not correctly configured");
    }
    
    // Save deployment info
    const deploymentInfo = {
        address: contractAddress,
        network: "calibration",
        deploymentTime: new Date().toISOString(),
        transactionHash: timeCapsuleBlocklock.deploymentTransaction()?.hash,
        contractType: "TimeCapsuleBlocklockSimple"
    };
    
    // Create deployments directory
    const deploymentsDir = "deployments/calibration";
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info
    fs.writeFileSync(
        `${deploymentsDir}/TimeCapsuleBlocklock.json`, 
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`Deployment info saved to ${deploymentsDir}/TimeCapsuleBlocklock.json`);
    
    console.log("\nDeployment completed successfully!");
    console.log("=".repeat(50));
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Transaction Hash: ${deploymentInfo.transactionHash}`);
    console.log(`Network: ${deploymentInfo.network}`);
    console.log(`Blocklock Sender: ${blocklockSender}`);
    console.log(`Explorer: https://calibration.filfox.info/en/address/${contractAddress}`);
    console.log("=".repeat(50));
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});