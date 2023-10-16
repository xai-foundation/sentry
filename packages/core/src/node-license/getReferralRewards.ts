import { Filter, FilterByBlockHash, ethers } from 'ethers';
import { NodeLicenseAbi } from '../abis/index.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';
import getClosestBlock from '../utils/getClosestBlock.js';

/**
 * Structure for referral rewards.
 */
export interface ReferralReward {
    address: string;
    transactions: Array<{
        transactionHash: string;
        buyer: string,
        amount: bigint,
    }>;
    totalReceived: bigint;
}

/**
 * Fetches all referral rewards from the NodeLicense contract.
 * @param startTimestamp - Optional start timestamp in ms.
 * @param endTimestamp - Optional end timestamp in ms.
 * @param buyerAddress - Optional buyer address.
 * @param referralAddress - Optional referral address.
 * @param callback - Optional callback function that is called whenever a new set of logs is fetched.
 * @returns An object of addresses to their referral rewards.
 */
export async function getReferralRewards(startTimestamp?: number, endTimestamp?: number, buyerAddress?: string, referralAddress?: string, callback?: (logs: ethers.Log[]) => void): Promise<{ [key: string]: ReferralReward }> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Initialize an object to store the referral rewards
    const rewards: { [key: string]: ReferralReward } = {};

    // Get the filter for ReferralReward events
    const filter = nodeLicenseContract.filters.ReferralReward(buyerAddress || null, referralAddress || null, null);

    // Define the block range for fetching logs
    const blockRange = 1000;

    // Get the start and end blocks
    const startBlock = startTimestamp ? (await getClosestBlock(startTimestamp)).closestBlock.number : config.nodeLicenseDeployedBlockNumber;
    const endBlock = endTimestamp ? (await getClosestBlock(endTimestamp)).closestBlock.number : await provider.getBlockNumber();

    // Initialize an array to store the logs
    let logs: ethers.Log[] = [];

    // Fetch the logs in batches of 1000 blocks
    for (let i = startBlock; i <= endBlock; i += blockRange) {
        const blockFilter: Filter | FilterByBlockHash = {
            ...filter,
            fromBlock: i,
            toBlock: Math.min(i + blockRange - 1, endBlock),
            address: config.nodeLicenseAddress
        };

        // Get the logs for the ReferralReward events in the current block range
        const batchLogs = await provider.getLogs(blockFilter);

        // Add the batch logs to the total logs
        logs = [...logs, ...batchLogs];

        // Call the callback function if it is provided
        if (callback) {
            callback(batchLogs);
        }
    }

    // Parse the logs
    for (const log of logs) {
        const event = nodeLicenseContract.interface.parseLog({
            topics: [...log.topics],
            data: log.data
        });

        if (!event) {
            console.error(`There was an error finding the event for the transaction '${log.transactionHash}'.`);
            continue;
        }

        // Get the address and amount from the event
        const [
            buyer,
            address,
            amount
        ] = event.args;

        // If the address is already in the object, update the transactions and totalReceived
        if (rewards[address]) {
            const reward = rewards[address];
            reward.transactions.push({
                transactionHash: log.transactionHash,
                buyer,
                amount,
            });
            reward.totalReceived += amount;
        }

        // Otherwise, add a new entry to the object
        else {
            rewards[address] = {
                address: address,
                transactions: [{
                    transactionHash: log.transactionHash,
                    buyer,
                    amount,
                }],
                totalReceived: amount
            };
        }
    }

    return rewards;
}
