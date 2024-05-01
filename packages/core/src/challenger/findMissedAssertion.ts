import { ethers, keccak256 } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { RollupAdminLogicAbi } from "../abis/RollupAdminLogicAbi.js";
import { config } from '../config.js';
import { getProvider } from '../index.js';

/**
 * Finds the last assertion event from the rollup contract and returns the nodeNum if not already written to referee contract
 * @return A promise of the last missed assertion or null
 */
export async function findMissedAssertion(): Promise<number | null> {

    const provider = getProvider();
    const blockRangePerRequest = 10000;

    const contract = new ethers.Contract(
        config.rollupAddress,
        RollupAdminLogicAbi,
        provider
    )

    const latestBlock = await provider.getBlockNumber();

    let toBlock = latestBlock;
    let fromBlock = Math.max(latestBlock - blockRangePerRequest, 0);

    let loopCount = 0;
    let foundEvent;

    while (true) {

        const foundEvents = await contract.queryFilter(contract.filters.NodeConfirmed(), fromBlock, toBlock);
        if (foundEvents.length) {
            foundEvent = foundEvents[foundEvents.length - 1];
            break;
        }

        if (fromBlock == 0) {
            throw new Error("Did not find any past assertion events on the rollup contract until Block 0");
        }

        loopCount++;
        if (loopCount > 10) {
            throw new Error(`Did not find any past assertion events for up to ${loopCount * blockRangePerRequest} blocks - checked until block ${fromBlock}`);
        }

        toBlock = fromBlock - 1;
        fromBlock = Math.max(fromBlock - blockRangePerRequest, 0); // Decrement by 1000, but don't go below 0
    }

    if (!foundEvent) {
        throw new Error("Invalid completion of fetch event loop, did not find last assertion");
    }

    //Check if last found assertion event was posted to referee 
    const nodeNum = foundEvent.topics[1];
    const refereeContract = new ethers.Contract(
        config.refereeAddress,
        RefereeAbi,
        provider
    )
    const comboHash = keccak256(ethers.solidityPacked(['uint64', 'address'], [Number(nodeNum), ethers.getAddress(config.rollupAddress)]));
    const isSubmitted = await refereeContract.rollupAssertionTracker(comboHash);

    if (!isSubmitted) {
        return Number(nodeNum);
    }

    return null;
}