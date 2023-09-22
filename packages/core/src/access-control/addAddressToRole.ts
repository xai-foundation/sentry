import { ethers } from "ethers";
import { config } from "../config";
import { RefereeAbi } from "../abis";

/**
 * Adds a role to an address in the Referee contract.
 *
 * @param signer - The ethers.js signer to use.
 * @param role - The role to add to the address.
 * @param address - The address to add the role to.
 * @returns A promise that resolves when the transaction has been sent.
 */
export async function addAddressToRole(
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

    // Check if the address already has the role
    const hasRole = await contract.hasRole(roleHash, address);
    if (hasRole) {
        throw new Error(`Address ${address} already has role ${role}`);
    }

    // Add the role to the address
    const tx = await contract.grantRole(roleHash, address);

    return tx;
}