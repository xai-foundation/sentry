import { ethers } from "ethers";
import { RefereeAbi } from "../abis/index.js";
import { config } from "../config.js";
import { getProvider } from "../index.js";
import { retry } from "../index.js";

/**
 * Submission structure returned by the Referee function.
 */
export interface BulkSubmission {
    submitted: boolean;
    claimed: boolean;
    keyCount: bigint;
    winningKeyCount: bigint;
    assertionStateRootOrConfirmData: string;
    challengeId: bigint;
}

/**
 * Fetches the submissions of a given challenge Id.
 * @param challengeId - The challenge Id.
 * @param bulkAddress - The address of the submission.
 * @returns {BulkSubmission} The submissions.
 */
export async function getBulkSubmissionForChallenge(
    challengeId: bigint,
    bulkAddress: string,
): Promise<BulkSubmission> {
    const provider = getProvider();
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    const submission = await retry(async () => await refereeContract.bulkSubmissions(challengeId, bulkAddress));

    return { ...submission, challengeId };
}
