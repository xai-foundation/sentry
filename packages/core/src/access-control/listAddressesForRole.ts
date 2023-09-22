import { ethers } from "ethers";
import { getProvider } from "../utils/getProvider";
import { config } from "../config";
import { RefereeAbi } from "../abis";

/**
 * Lists all addresses that have a particular role in the Referee contract.
 *
 * @param role - The role to list addresses for.
 * @param callback - Optional callback function to handle addresses as they are retrieved.
 * @returns The addresses that have the given role.
 */
export async function listAddressesForRole(
    role: string,
    callback?: (address: string) => void
): Promise<string[]> {

    // Get the provider
    const provider = getProvider();

    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // check to see the role exists on the contract
    if (contract[role] === undefined) {
        throw new Error(`role ${role} does not exist on the referee`);
    }

    // Calculate the role hash
    const roleHash = await contract[role]();

    // Get the number of members
    const memberCount = await contract.getRoleMemberCount(roleHash);

    // Get the addresses of all members
    const addresses = [];
    for (let i = 0; i < memberCount; i++) {
        const address = await contract.getRoleMember(roleHash, i);
        addresses.push(address);
        if (callback) {
            callback(address);
        }
    }

    return addresses;
}