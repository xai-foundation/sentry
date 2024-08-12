import { BulkSubmission } from "@sentry/sentry-subgraph-client";
import { BulkOwnerOrPool, claimBulkSubmissionRewards, NodeLicenseStatus, retry } from "../../index.js";
import { BulkSubmissionRPC, getBulkSubmissionForChallenge } from "../getBulkSubmissionForChallenge.js";
import { operatorState } from "./operatorState.js";
import { updateSentryAddressStatus } from "./updateSentryAddressStatus.js";

/**
 * Processes a closed challenge that can now be claimed.
 * @param {bigint} challengeId - The challenge number.
 * @param {BulkOwnerOrPool[]} bulkOwnerAndPools - The list of owner and pools to claim for. In case we are calling this with subgraph data we will expect each wallet to have a list of bulkSubmissions.
 */
export async function processClosedChallenge(
    challengeId: bigint,
    bulkOwnerAndPools: BulkOwnerOrPool[],
) {
    const beforeStatus: { [key: string]: string | undefined } = {}
    operatorState.cachedLogger(`Process closed challenge ${challengeId.toString()} for ${bulkOwnerAndPools.length} addresses...`);

    for (const ownerOrPool of bulkOwnerAndPools) {

        beforeStatus[ownerOrPool.address] = operatorState.sentryAddressStatusMap.get(ownerOrPool.address)?.status;
        updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.QUERYING_FOR_UNCLAIMED_SUBMISSIONS);

        try {

            let submission: BulkSubmission | BulkSubmissionRPC | undefined;

            if (ownerOrPool.bulkSubmissions) {

                submission = ownerOrPool.bulkSubmissions.find(s => {
                    return Number(s.challengeId) == Number(challengeId)
                });

            } else {
                submission = await retry(() => getBulkSubmissionForChallenge(challengeId, ownerOrPool.address), 3);
            }

            if (submission && !submission.claimed && submission.winningKeyCount > 0) {
                updateSentryAddressStatus(ownerOrPool.address, `Claiming esXAI...`);
                await retry(() => claimBulkSubmissionRewards([ownerOrPool.address], challengeId, operatorState.cachedSigner, operatorState.cachedLogger), 3);
                operatorState.cachedLogger(`Bulk claim successful for address ${ownerOrPool.address} and challenge ${challengeId.toString()}`);
            } else {
                updateSentryAddressStatus(ownerOrPool.address, beforeStatus[ownerOrPool.address] || "Waiting for next challenge");
            }

        } catch (error: any) {
            operatorState.cachedLogger(`Error processing submissions for address ${ownerOrPool.address} - ${error && error.message ? error.message : error}`);
        }
        updateSentryAddressStatus(ownerOrPool.address, beforeStatus[ownerOrPool.address] || "Waiting for next challenge");
    }
}