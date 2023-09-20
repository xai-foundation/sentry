import { network, run } from "hardhat";
import { BaseContract } from "ethers";

/**
 * Interface for the arguments of safeVerify function.
 */
interface SafeVerifyArgs {
    contract: BaseContract;
    constructorArgs?: any[];
}

/**
 * Verifies the contract on chain using Hardhat.
 * @param args - The arguments for the function.
 */
export async function safeVerify({contract, constructorArgs = []}: SafeVerifyArgs): Promise<void> {

    const deploymentTransaction = contract.deploymentTransaction();

    if (deploymentTransaction === null) {
        console.log("Waiting for new block before verifying...")
        // If deploymentTransaction is null, listen for the next block
        // If 2 minutes pass without a new block, then just proceed instead
        const timeout = new Promise((resolve) => setTimeout(resolve, 120000)); // 2 minutes
        await Promise.race([
            new Promise((resolve) => network.provider.on('block', () => resolve(null))),
            timeout
        ]);
    } else {
        console.log("Waiting for confirmation before verifying...")
        // Wait for confirmation before verifying
        await deploymentTransaction.wait();
    }

    const contractAddress = await contract.getAddress();
    console.log(`Verifying contract ${contractAddress} on network ${network.name}`);

    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
        });
        console.log(`Contract ${contractAddress} successfully verified`);
    } catch (error) {
        console.error(`Failed to verify contract ${contractAddress}:`, error);
    }
}