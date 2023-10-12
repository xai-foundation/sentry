import { ethers } from "ethers";
import { config } from "../config.js";
import { RefereeAbi } from "../abis/index.js";

/**
 * Removes a role from an address in the Referee contract.
 *
 * @param signer - The ethers.js signer to use.
 * @param role - The role to remove from the address.
 * @param address - The address to remove the role from.
 * @returns A promise that resolves when the transaction has been sent.
 */
export async function removeAddressFromRole(
    signer: ethers.Signer,
    role: string,
    address: string
): Promise<ethers.ContractTransaction> {
    
    // Create a contract instance
    const contract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Check to see the role exists on the contract
    if (contract[role] === undefined) {
        throw new Error(`role ${role} does not exist on the referee`);
    }

    // Calculate the role hash
    const roleHash = await contract[role]();

    // Check if the address has the role
    const hasRole = await contract.hasRole(roleHash, address);
    if (!hasRole) {
        throw new Error(`Address ${address} does not have role ${role}`);
    }

    // Remove the role from the address
    const tx = await contract.revokeRole(roleHash, address);

    return tx;
}