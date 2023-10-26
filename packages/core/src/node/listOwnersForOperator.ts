import { ethers } from "ethers";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";
import { RefereeAbi } from "../abis/index.js";

/**
 * Lists all owners for a particular operator in the Referee contract.
 *
 * @param operatorAddress - The address to list owners for.
 * @param callback - Optional callback function to handle owners as they are retrieved.
 * @returns The owners for the given operator.
 */
export async function listOwnersForOperator(
    operatorAddress: string,
    callback?: (owner: string, index: number) => void
): Promise<string[]> {

    // Get the provider
    const provider = getProvider();

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // Get the number of owners
    const ownerCount = await contract.getOwnerCountForOperator(operatorAddress);

    // Get the addresses of all owners
    const owners = [];
    for (let i = 0; i < ownerCount; i++) {
        const owner = await contract.getOwnerForOperatorAtIndex(operatorAddress, i);
        owners.push(owner);
        if (callback) {
            callback(owner, i);
        }
    }

    return owners;
}
