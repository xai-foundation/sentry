import { network, run } from "hardhat";
import { Contract } from "ethers";

/**
 * Interface for the arguments of safeVerify function.
 */
interface SafeVerifyArgs {
    contract: Contract;
    constructorArgs?: any[];
}

/**
 * Verifies the contract on chain using Hardhat.
 * @param args - The arguments for the function.
 */
async function safeVerify({contract, constructorArgs = []}: SafeVerifyArgs): Promise<void> {
    // Wait for 5 confirmations before verifying
    const deploymentTransaction = contract.deploymentTransaction();
    if (deploymentTransaction === null) {
        // If deploymentTransaction is null, listen for the next block
        await new Promise((resolve) => {
            network.provider.on('block', () => {
                resolve(null);
            });
        });
    } else {
        await deploymentTransaction.wait(5);
    }

    console.log(`Verifying contract ${contract.address} on network ${network.name}`);

    try {
        await run("verify:verify", {
            address: contract.address,
            constructorArguments: constructorArgs,
        });
        console.log(`Contract ${contract.address} successfully verified`);
    } catch (error) {
        console.error(`Failed to verify contract ${contract.address}:`, error);
    }
}