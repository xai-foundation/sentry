import { ethers } from "ethers";
import { RefereeAbi } from "../abis/index.js";
import { config } from "../config.js";
import { getProvider } from "../index.js";

/**
 * Submission structure returned by the getSubmissionForChallenge function.
 */
export interface Submission {
    submitted: boolean;
    nodeLicenseId: number;
    successorStateRoot: string;
}

/**
 * Fetches the submission of a given challenge Id.
 * @param challengeId - The ID of the challenge.
 * @param _nodeLicenseId - The node license ID to look up for.
 * @returns The submission.
 */
export async function getSubmissionForChallenge(challengeId: bigint, _nodeLicenseId: bigint): Promise<Submission> {
    const provider = getProvider();
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
    const [
        submitted,
        nodeLicenseId,
        successorStateRoot
    ] = await refereeContract.getSubmissionForChallenge(challengeId, _nodeLicenseId);
    const submission: Submission = {
        submitted,
        nodeLicenseId,
        successorStateRoot
    }
    return submission;
}
