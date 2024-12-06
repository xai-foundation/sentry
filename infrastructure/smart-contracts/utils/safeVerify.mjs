import hardhat from "hardhat";
const { network, run } = hardhat;

/**
 * Verifies the contract on chain using Hardhat.
 * @param contract - The contract instance, will be used to read the contractAddress and wait for deploy tx
 * @param contractAddress - The contract address, if undefined the contract instance needs to be provided
 * @param constructorArgs
 * @param contractPath - The path to the contract source if there are multiple contracts with the same byte code in the repo, this will fail without it
 * @param skipWaitForDeployTx - If set to true, the waiting for the deploy transaction will be skipped
 */
export async function safeVerify({ contract, contractAddress, constructorArgs = [], contractPath, skipWaitForDeployTx }) {

    if (!skipWaitForDeployTx) {
        let deploymentTransaction = null;
        if (contract) {
            deploymentTransaction = contract.deploymentTransaction();
        }

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
    }

    if (!contractAddress && contract) {
        contractAddress = await contract.getAddress();
    }
    
    console.log(`Verifying contract ${contractAddress} on network ${network.name}`);

    for (let i = 0; i < 5; i++) {
        try {
            const options = {
                address: contractAddress,
                constructorArguments: constructorArgs,
            }
            if (contractPath) {
                options.contract = contractPath;
            }
            await run("verify:verify", options);
            console.log(`Contract ${contractAddress} successfully verified`);
            return;
        } catch (error) {
            console.error(`Attempt ${i + 1} failed to verify contract ${contractAddress}:`, error);
            if (i < 4) {
                const waitTime = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // Random time between 5 and 20 seconds
                console.log(`Waiting for ${waitTime} seconds before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
        }
    }

    console.error(`Contract verification failed for ${contractAddress}.`);

}