import { ethers } from "hardhat";
import fs from "fs";

async function main() {
    console.log("Deploying TimeCapsuleStorage contract...");
    
    // Get the signer
    const [signer] = await ethers.getSigners();
    console.log(`Deploying from: ${await signer.getAddress()}`);
    
    // Get the contract factory
    const TimeCapsuleStorage = await ethers.getContractFactory("TimeCapsuleStorage");
    
    console.log("Deploying contract...");
    
    // Deploy the contract
    const timeCapsuleStorage = await TimeCapsuleStorage.deploy();
    
    console.log(`Transaction hash: ${timeCapsuleStorage.deploymentTransaction()?.hash}`);
    
    // Wait for deployment
    console.log("Waiting for deployment confirmation...");
    await timeCapsuleStorage.waitForDeployment();
    
    const contractAddress = await timeCapsuleStorage.getAddress();
    console.log(`TimeCapsuleStorage deployed to: ${contractAddress}`);
    
    // Verify the contract is working
    const totalCapsules = await timeCapsuleStorage.getTotalCapsules();
    console.log(`Total capsules initialized: ${totalCapsules}`);
    
    // Save deployment info
    const deploymentInfo = {
        address: contractAddress,
        network: "calibration",
        deploymentTime: new Date().toISOString(),
        transactionHash: timeCapsuleStorage.deploymentTransaction()?.hash
    };
    
    // Create deployments directory
    const deploymentsDir = "deployments/calibration";
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info
    fs.writeFileSync(
        `${deploymentsDir}/TimeCapsuleStorage.json`, 
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`Deployment info saved to ${deploymentsDir}/TimeCapsuleStorage.json`);
    
    console.log("\nDeployment completed successfully!");
    console.log("=".repeat(50));
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Transaction Hash: ${deploymentInfo.transactionHash}`);
    console.log(`Network: ${deploymentInfo.network}`);
    console.log(`Explorer: https://calibration.filfox.info/en/address/${contractAddress}`);
    console.log("=".repeat(50));
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});