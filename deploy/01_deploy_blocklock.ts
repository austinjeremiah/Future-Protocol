import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Deploy TimeCapsuleBlocklock Contract with Blocklock Integration
 */
const DeployTimeCapsuleBlocklock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const [deployer] = await hre.ethers.getSigners()

    const { deploy } = hre.deployments

    console.log(`Deploying TimeCapsuleBlocklock from account: ${await deployer.getAddress()}`)

    // Blocklock sender address for Calibration testnet
    // Note: Replace with actual Blocklock sender address for your network
    const blocklockSender = "0x0000000000000000000000000000000000000000" // Placeholder - replace with actual address

    // Deploy TimeCapsuleBlocklock
    const timeCapsuleBlocklock = await deploy("TimeCapsuleBlocklock", {
        from: await deployer.getAddress(),
        args: [blocklockSender],
        log: true,
        waitConfirmations: 2,
        value: hre.ethers.parseEther("0.1"), // Send some ETH for Blocklock operations
    })

    console.log(`TimeCapsuleBlocklock deployed to: ${timeCapsuleBlocklock.address}`)
    console.log(`Transaction hash: ${timeCapsuleBlocklock.transactionHash}`)
    console.log(`Gas used: ${timeCapsuleBlocklock.receipt?.gasUsed}`)
    
    // Verify the contract is working
    const contract = await hre.ethers.getContractAt("TimeCapsuleBlocklock", timeCapsuleBlocklock.address)
    const totalCapsules = await contract.getTotalCapsules()
    console.log(`Total capsules initialized: ${totalCapsules}`)

    // Test Blocklock price calculation
    try {
        const testUnlockTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        const price = await contract.getBlocklockPrice(200000, testUnlockTime)
        console.log(`Blocklock request price for 1 hour timelock: ${hre.ethers.formatEther(price)} ETH`)
    } catch (error) {
        console.log("Could not get Blocklock price - this is expected if Blocklock sender is not set correctly")
    }
}

export default DeployTimeCapsuleBlocklock