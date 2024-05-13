import { ethers } from "ethers";
import { RefereeAbi } from "../abis/index.js";
import { config } from "../config.js";
import { getProvider } from "../index.js";
import { retry } from "../index.js";

/**
 * Submission structure returned by the getSubmissionsForChallenges function.
 */
export interface Submission {
    submitted: boolean;
    claimed: boolean;
    eligibleForPayout: boolean;
    nodeLicenseId: number;
    assertionStateRootOrConfirmData: string;
    challengeId: bigint;
}

/**
 * Fetches the submissions of a given array of challenge Ids.
 * @param challengeIds - The array of challenge IDs.
 * @param _nodeLicenseId - The node license ID to look up for.
 * @param callback - Optional callback function to handle submissions as they are retrieved.
 * @param chunkSize - The size of each chunk to fetch. Defaults to 20.
 * @returns The submissions.
 */
export async function getSubmissionsForChallenges(
    challengeIds: bigint[],
    _nodeLicenseId: bigint,
    callback?: (submission: Submission, index: number) => Promise<void>,
    chunkSize: number = 20,
): Promise<Submission[]> {
    const provider = getProvider();
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
    const submissions: Submission[] = [];
    for (let i = 0; i < challengeIds.length; i += chunkSize) {
        const chunk = challengeIds.slice(i, i + chunkSize);
        const results = await retry(async () => await refereeContract.getSubmissionsForChallenges(chunk, _nodeLicenseId));
        for (let j = 0; j < results.length; j++) {
            const result = results[j];
            const [
                submitted,
                claimed,
                eligibleForPayout,
                nodeLicenseId,
                assertionStateRootOrConfirmData,
            ] = result;
            const submission: Submission = {
                submitted,
                claimed,
                eligibleForPayout,
                nodeLicenseId,
                assertionStateRootOrConfirmData,
                challengeId: chunk[j], // Assigning the challengeId from the chunk to the submission
            };
            submissions.push(submission);
            if (callback) {
                await callback(submission, i + j);
            }
        }
    }
    return submissions;
}
