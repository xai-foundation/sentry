import { operatorState } from "./operatorState.js";
import { PublicNodeBucketInformation } from "../../index.js";
import axios from "axios";

    /**
 * Compares a challenge assertion with the data fetched from the public CDN by the public Xai node.
 * This function attempts to retrieve the assertion data up to 3 times, with a delay between attempts.
 * If successful, it checks if the assertion ID matches the challenge's expected value.
 * 
 * @param {number} assertionId - The expected assertion ID from the challenge (provided by the Referee contract).
 * @param {string} confirmData - The identifier used to fetch assertion data from the CDN.
 * @returns {Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }>} 
 * A promise that resolves with the public node bucket information. 
 * If the assertion ID does not match, an error message is included in the result. 
 * Throws an error if the data could not be retrieved after multiple attempts.
 * 
 * @throws {Error} If the CDN request fails after 3 attempts or if an unexpected error occurs during fetching.
 */
export async function compareWithCDN(assertionId: number, confirmData: string): Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }> {

    let attempt = 1;
    let publicNodeBucket: PublicNodeBucketInformation | undefined;
    let lastError;

    while (attempt <= 3) {
        try {
            publicNodeBucket = await getPublicNodeFromBucket(confirmData);
            break;
        } catch (error) {
            operatorState.cachedLogger(`Error loading assertion data from CDN for ${confirmData} with attempt ${attempt}.\n${error}`);
            lastError = error;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds before retrying
    }

    if (!publicNodeBucket) {
        throw new Error(`Failed to retrieve assertion data from CDN for ${confirmData} after ${attempt} attempts.\n${lastError}`);
    }

    if (publicNodeBucket.assertion !== assertionId) {
        return { publicNodeBucket, error: `Mismatch between PublicNode and Challenge assertion number '${assertionId}'!` };
    }

    return { publicNodeBucket }
}

// Helper function to request the assertion from the public node's CDN
async function getPublicNodeFromBucket(confirmHash: string) {
    const url = `https://sentry-public-node.xai.games/assertions/${confirmHash.toLowerCase()}.json`;
    const response = await axios.get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Invalid response status " + response.status);
    }
}
