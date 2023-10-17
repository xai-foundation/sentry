import { getProvider } from "./getProvider.js";
import { ethers } from "ethers";

/**
 * This function is used to get the closest block to a given timestamp.
 * It uses a binary search algorithm to traverse the block numbers and find the one we want.
 * The function was adapted from the article at https://medium.com/@hanyi.lol/how-to-get-a-block-number-by-timestamp-fefde4c69162
 * @param {number} timestamp - The timestamp to find the closest block for. This should be in seconds
 * @returns {Promise<{closestBlock: ethers.providers.Block, previousBlock: ethers.providers.Block, nextBlock: ethers.providers.Block}>} - The closest block and its adjacent blocks.
 */
export default async function getClosestBlock(timestamp: number): Promise<{closestBlock: ethers.Block, previousBlock: ethers.Block, nextBlock: ethers.Block}> {

    const provider = getProvider();

    let minBlockNumber = 0
    let maxBlockNumber = await provider.getBlockNumber();
    let closestBlockNumber = Math.floor((maxBlockNumber + minBlockNumber) / 2)
    let closestBlock = await provider.getBlock(closestBlockNumber);
    let foundExactBlock = false

    while (minBlockNumber <= maxBlockNumber) {
        if (!closestBlock) {
            throw new Error(`There was an getting the closest block, when finding the timestamp ${timestamp}.`);
        }

        if (closestBlock.timestamp === timestamp) {
            foundExactBlock = true
            break;
        } else if (closestBlock.timestamp > timestamp) {
            maxBlockNumber = closestBlockNumber - 1
        } else {
            minBlockNumber = closestBlockNumber + 1
        }

        closestBlockNumber = Math.floor((maxBlockNumber + minBlockNumber) / 2)
        closestBlock = await provider.getBlock(closestBlockNumber);
    }

    const previousBlockNumber = closestBlockNumber - 1
    const previousBlock = await provider.getBlock(previousBlockNumber);
    const nextBlockNumber = closestBlockNumber + 1
    const nextBlock = await provider.getBlock(nextBlockNumber);

    if (!previousBlock) {
        throw new Error(`There was an getting the previous block, when finding the timestamp ${timestamp}.`);
    }

    if (!closestBlock) {
        throw new Error(`There was an getting the closest block, when finding the timestamp ${timestamp}.`);
    }

    if (!nextBlock) {
        throw new Error(`There was an getting the next block, when finding the timestamp ${timestamp}.`);
    }

    return { closestBlock, previousBlock, nextBlock };
}
