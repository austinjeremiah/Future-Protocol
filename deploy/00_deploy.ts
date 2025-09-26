import { DeployFunction } from "hardhat-deploy/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"

/**
 * Deploy Counter Contract
 */
const DeployCounter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const [deployer] = await hre.ethers.getSigners()

    const { deploy } = hre.deployments

    // Deploy Counter
    const counter = await deploy("Counter", {
        from: await deployer.getAddress(),
        args: [],
        log: true,
        waitConfirmations: 2,
    })

    console.log(`✅ Counter deployed to: ${counter.address}`)
}

export default DeployCounter
