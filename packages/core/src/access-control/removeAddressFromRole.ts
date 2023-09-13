import { ethers } from "ethers";
import { config } from "../config";

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
    const contract = new ethers.Contract(config.refereeContractAddress, [
        // The ABI of the revokeRole and hasRole functions
        "function revokeRole(bytes32 role, address account) public",
        "function hasRole(bytes32 role, address account) public view returns (bool)",
    ], signer);

    // Calculate the role hash
    const roleHash = ethers.keccak256(ethers.toUtf8Bytes(role));

    // Check if the address has the role
    const hasRole = await contract.hasRole(roleHash, address);
    if (!hasRole) {
        throw new Error(`Address ${address} does not have role ${role}`);
    }

    // Remove the role from the address
    const tx = await contract.revokeRole(roleHash, address);

    return tx;
}