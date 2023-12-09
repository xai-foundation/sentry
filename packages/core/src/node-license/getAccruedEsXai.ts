import {Submission, getSubmissionsForChallenges, listChallenges} from "../index.js";

export interface GetAccruedEsXaiResponse {
	submissions: Submission[],
	totalAccruedEsXai: bigint,
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

		if (submission.submitted && !submission.claimed && submission.eligibleForPayout) {
			const [_, challenge] = challenges[index];
			const individualReward = challenge.rewardAmountForClaimers / challenge.numberOfEligibleClaimers;
			res.totalAccruedEsXai += individualReward;
			res.submissions.push(submission);

			// Call the callback with a safe copy of the response
			if (callback) {
				await callback({...res});
			}
		}
	});

	return res;
}

export type GetAccruedEsXaiBulkResponse = { [nodeLicenseId: string]: GetAccruedEsXaiResponse };

/**
 * Fetches the accrued EsXai for a list of node license IDs in bulk.
 * @param nodeLicenseIds - The list of node license IDs.
 * @param callback - Optional callback function to handle the response as it accumulates.
 * @returns An object mapping node license IDs to their respective accrued EsXai and the submissions.
 */
export async function getAccruedEsXaiBulk(
	nodeLicenseIds: bigint[],
	callback?: (response: GetAccruedEsXaiBulkResponse) => Promise<void>,
): Promise<GetAccruedEsXaiBulkResponse> {

	// create an object to store the responses
	const responses: { [nodeLicenseId: string]: GetAccruedEsXaiResponse } = {};
	for (const nodeLicenseId of nodeLicenseIds) {
		responses[nodeLicenseId.toString()] = {
			submissions: [],
			totalAccruedEsXai: BigInt(0),
		}
	}

	// call the callback from getAccruedEsXaiBulk
	if (callback) {
		await callback(responses);
	}

	// iterate over each node license ID
	for (const nodeLicenseId of nodeLicenseIds) {

		// define a new callback function to pass into getAccruedEsXai
		const newCallback = async (response: GetAccruedEsXaiResponse) => {

			// update the responses object
			responses[nodeLicenseId.toString()] = {...response};

			// call the callback from getAccruedEsXaiBulk
			if (callback) {
				await callback(responses);
			}
		};

		// get the accrued EsXai for the current node license ID
		await getAccruedEsXai(nodeLicenseId, newCallback);
	}

	return responses;
}
