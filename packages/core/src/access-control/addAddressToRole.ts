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
    const contract = new ethers.Contract(config.refereeContractAddress, RefereeAbi, signer);

    // Calculate the role hash
    const roleHash = ethers.keccak256(ethers.toUtf8Bytes(role));

    // Check if the address already has the role
    const hasRole = await contract.hasRole(roleHash, address);
    if (hasRole) {
        throw new Error(`Address ${address} already has role ${role}`);
    }

    // Add the role to the address
    const tx = await contract.grantRole(roleHash, address);

    return tx;
}