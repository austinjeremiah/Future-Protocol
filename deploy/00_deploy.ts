import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Deploy TimeCapsuleStorage Contract
 */
const DeployTimeCapsuleStorage: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const [deployer] = await hre.ethers.getSigners()

    const { deploy } = hre.deployments

    console.log(`Deploying TimeCapsuleStorage from account: ${await deployer.getAddress()}`)

    // Deploy TimeCapsuleStorage
    const timeCapsuleStorage = await deploy("TimeCapsuleStorage", {
        from: await deployer.getAddress(),
        args: [],
        log: true,
        waitConfirmations: 2,
    })

    console.log(`TimeCapsuleStorage deployed to: ${timeCapsuleStorage.address}`)
    console.log(`Transaction hash: ${timeCapsuleStorage.transactionHash}`)
    console.log(`Gas used: ${timeCapsuleStorage.receipt?.gasUsed}`)
    
    // Verify the contract is working
    const contract = await hre.ethers.getContractAt("TimeCapsuleStorage", timeCapsuleStorage.address)
    const totalCapsules = await contract.getTotalCapsules()
    console.log(`Total capsules initialized: ${totalCapsules}`)
}

export default DeployTimeCapsuleStorage
