import { ethers } from 'ethers';
import { getCurrentRefereeVersionFromGraph, NodeLicenseAbi, retry } from '../index.js';
import { config } from '../config.js';
import { RefereeConfig } from "@sentry/sentry-subgraph-client";
import { getProvider } from "../index.js";

/**
 * Checks if the current referee contract is compatible with bulk submission.
 * 
 * @param {RefereeConfig | undefined} refereeConfig - The configuration object for the referee, if already retrieved.
 * @returns {Promise<boolean>} - Returns `true` if the referee contract is compatible with bulk submission, otherwise `false`.
 */
export async function checkRefereeBulkSubmissionCompatible(
    refereeConfig?: RefereeConfig | undefined,
): Promise<boolean> {

    // If a refereeConfig is provided, check its version
    if (refereeConfig) {
        // If the version is greater than 6, it is compatible with bulk submission
        if (refereeConfig.version > 7) {
            return true;
        }
    } else {
        // If the refereeConfig is not provided, we can assume the graph is not healthy
        // Check the contract using the RPC to determine if it is compatible

        // Get the provider for the blockchain network
        const provider = getProvider();

        // Initialize a contract instance with the referee's ABI and address
        const nodeLicense = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

        let isCompatible = true;
        // Try to access a new storage variable in the referee contract to determine its version

        try {
        // Read the current maxSupply, should be 50K for pre bulk submission
        const maxSupply = await retry(() => nodeLicense.maxSupply()) as bigint;
        isCompatible = maxSupply > 50000n;

        } catch (error) {
            // If an error occurs, it indicates the contract is an older version
            isCompatible = false;
        }
        return isCompatible;

    }

    // Default return false if none of the above checks pass
    return false;
}
