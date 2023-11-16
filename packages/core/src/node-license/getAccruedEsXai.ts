import { Submission, getSubmissionsForChallenges, listChallenges } from "../index.js";

export interface GetAccruedEsXaiResponse {
    submissions: Submission[],
    totalAccruedEsXai: bigint
}

/**
 * Fetches the accrued EsXai for a given node license ID.
 * @param nodeLicenseId - The ID of the node license.
 * @param callback - Optional callback function to handle the response as it accumulates.
 * @returns The accrued EsXai and the submissions.
 */
export async function getAccruedEsXai(
    nodeLicenseId: bigint,
    callback?: (response: GetAccruedEsXaiResponse) => Promise<void>,
): Promise<GetAccruedEsXaiResponse> {

    // create an object to keep track overtime
    const res: GetAccruedEsXaiResponse = {
        submissions: [],
        totalAccruedEsXai: BigInt(0),
    }

    // get a list of all challenges
    const challenges = await listChallenges(false);
    const challengeIds = challenges.map(([challengeId]) => challengeId);

    // get all the submissions for the challenges
    await getSubmissionsForChallenges(challengeIds, nodeLicenseId, async (submission, index) => {

        if (submission.submitted && !submission.claimed) {
            const [_, challenge] = challenges[index];
            const individualReward = challenge.rewardAmountForClaimers / challenge.numberOfEligibleClaimers;
            res.totalAccruedEsXai += individualReward;
            res.submissions.push(submission);

            // Call the callback with a safe copy of the response
            if (callback) {
                await callback({ ...res });
            }
        }
    });

    return res;
}

