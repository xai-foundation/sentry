import { Wallet } from "ethers";

/**
 * Verifies if the provided string is a valid private key
 * @param value - The string to be verified
 * @returns boolean - Returns true if the string is a valid private key, false otherwise
 */
export function verifyPrivateKey(value: string): boolean {
    try {
        new Wallet(value);
    } catch (e) { 
        return false; 
    }
    return true;
}

