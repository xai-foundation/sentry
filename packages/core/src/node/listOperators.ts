import { ethers } from "ethers";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";
import { RefereeAbi } from "../abis/index.js";

/**
 * Lists all operators for a particular address in the Referee contract.
 *
 * @param ownerAddress - The address to list operators for.
 * @param callback - Optional callback function to handle operators as they are retrieved.
 * @returns The operators for the given address.
 */
export async function listOperatorsForAddress(
    ownerAddress: string,
    callback?: (operator: string, index: number) => void
): Promise<string[]> {

    // Get the provider
    const provider = getProvider();

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // Get the number of operators
    const operatorCount = await contract.getOperatorCount(ownerAddress);

    // Get the addresses of all operators
    const operators = [];
    for (let i = 0; i < operatorCount; i++) {
        const operator = await contract.getOperatorAtIndex(ownerAddress, i);
        operators.push(operator);
        if (callback) {
            callback(operator, i);
        }
    }

    return operators;
}
