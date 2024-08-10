import { BulkSubmission, SentryKey, SentryWallet } from "@sentry/sentry-subgraph-client";
import { claimBulkSubmissionRewards, claimRewardsBulk, getSubmissionsForChallenges, KEYS_PER_BATCH, NodeLicenseStatus, retry } from "../../index.js";
import { BulkSubmissionRPC, getBulkSubmissionForChallenge } from "../getBulkSubmissionForChallenge.js";
import { operatorState } from "./operatorState.js";

export type BulkOwnerOrPool = {
    address: string,
    bulkSubmissions?: BulkSubmission[]
}

/**
 * Processes a closed challenge that can now be claimed.
 * @param {bigint} challengeId - The challenge number.
 * @param {BulkOwnerOrPool[]} bulkWallets - The list of owner and pools to claim for. In case we are calling this with subgraph data we will expect each wallet to have a list of bulkSubmissions.
 */
export async function processClosedChallenges(
    challengeId: bigint,
    bulkWallets: BulkOwnerOrPool[],
) {

    //TODO handle status map updates for state change 
    for (const wallet of bulkWallets) {

        let submission: BulkSubmission | BulkSubmissionRPC | undefined;

        if (wallet.bulkSubmissions) {

            submission = wallet.bulkSubmissions.find(s => {
                Number(s.challengeId) == Number(challengeId)
            });

        } else {
            submission = await retry(() => getBulkSubmissionForChallenge(challengeId, wallet.address), 3);
        }

        if (submission && !submission.claimed && submission.winningKeyCount > 0) {
            await retry(() => claimBulkSubmissionRewards([wallet.address], challengeId, operatorState.cachedSigner, operatorState.cachedLogger), 3);
        }
    }
}