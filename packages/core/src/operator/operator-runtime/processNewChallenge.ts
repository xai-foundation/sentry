import { RefereeConfig } from "@sentry/sentry-subgraph-client";
import { BulkOwnerOrPool, getBoostFactor as getBoostFactorRPC, NodeLicenseStatus, ProcessChallenge, submitBulkAssertion } from "../index.js";
import { operatorState } from "./operatorState.js";
import { retry } from "../../index.js";
import { updateSentryAddressStatus } from "./updateSentryAddressStatus.js";
import { getWinningKeyCount } from "./getWinningKeyCount.js";
import { getBulkSubmissionForChallenge } from "../getBulkSubmissionForChallenge.js";

/**
 * Processes a new challenge for all owners and pools, submit assertion if we have winning keys
 * @param {bigint} challengeId - The challenge number.
 * @param {ProcessChallenge} challenge - The challenge object for processing
 * @param {BulkOwnerOrPool[]} bulkOwnerAndPools - The list of owner and pools to submit for.
 * @param {RefereeConfig} refereeConfig - The current Referee configs in case the subgraph is healthy, used to calculate the boostFactor off-chain
 */
export async function processNewChallenge(
    challengeId: bigint,
    challenge: ProcessChallenge,
    bulkOwnerAndPools: BulkOwnerOrPool[],
    refereeConfig?: RefereeConfig
) {
    operatorState.cachedLogger(`Processing new challenge with number: ${challengeId}.`);
    operatorState.cachedLogger(`Checking eligibility for ${bulkOwnerAndPools.length} owners and pools.`);

    for (const ownerOrPool of bulkOwnerAndPools) {

        updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.CHECKING_IF_ELIGIBLE_FOR_PAYOUT);

        try {
            let boostFactor: bigint;

            if (refereeConfig) {

                boostFactor = calculateBoostFactorLocally(
                    BigInt(ownerOrPool.stakedEsXaiAmount),
                    ownerOrPool.keyCount,
                    refereeConfig
                );

            } else {
                boostFactor = await getBoostFactorRPC(ownerOrPool.address);
            }

            operatorState.cachedLogger(
                `Found chance boost of ${Number(boostFactor) / 100}% for ${ownerOrPool.isPool ? `pool:` : `owner:`} ${ownerOrPool.name ? `${ownerOrPool.name} (${ownerOrPool.address})` : ownerOrPool.address}`
            );

            const winningKeyCount = getWinningKeyCount(
                ownerOrPool.keyCount,
                Number(boostFactor),
                ownerOrPool.address,
                challengeId,
                challenge.assertionStateRootOrConfirmData,
                challenge.challengerSignedHash
            );

            operatorState.cachedLogger(`${ownerOrPool.isPool ? "Pool" : "Wallet"} ${ownerOrPool.address} has ${winningKeyCount}/${ownerOrPool.keyCount} winning keys for challenge ${challengeId}`);

            if (winningKeyCount == 0) {
                updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }

        } catch (error: any) {
            operatorState.cachedLogger(`Error checking payout eligible for address ${ownerOrPool.address} to challenge ${challengeId} - ${error && error.message ? error.message : error}`);
            continue;
        }

        try {

            let hasSubmission;
            if (ownerOrPool.bulkSubmissions) {
                const foundSubmission = ownerOrPool.bulkSubmissions.find(s => {
                    return Number(s.challengeId) == Number(challengeId)
                });
                if (foundSubmission) {
                    hasSubmission = true;
                }
            } else {
                const submission = await retry(() => getBulkSubmissionForChallenge(challengeId, ownerOrPool.address), 3);
                if (submission.submitted) {
                    hasSubmission = true;
                }
            }

            if (hasSubmission) {
                operatorState.cachedLogger(`Address ${ownerOrPool.address} has submitted for challenge ${challengeId} by another node. If multiple nodes are running, this message can be ignored.`);
                updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }

            try {
                //Try to submit once, if we get error 54 we don't need to try again. Any other error, we should give it 2 more tries.
                await submitBulkAssertion(ownerOrPool.address, challengeId, challenge.assertionStateRootOrConfirmData, operatorState.cachedSigner);
            } catch (error: any) {
                if (error && error.message && error.message.includes('execution reverted: "54"')) {
                    // If error code is 54, we don't need to log the error, it just means for this pool we already submitted
                    operatorState.cachedLogger(`Address ${ownerOrPool.address} has submitted for challenge ${challengeId} by another node. If multiple nodes are running, this message can be ignored.`);
                    updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                    continue;
                }

                await retry(() => submitBulkAssertion(ownerOrPool.address, challengeId, challenge.assertionStateRootOrConfirmData, operatorState.cachedSigner), 2);
            }

            operatorState.cachedLogger(`Successfully submitted assertion for ${ownerOrPool.address}`);
            updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);

        } catch (error: any) {
            operatorState.cachedLogger(`Error submitting assertion for address ${ownerOrPool.address} to challenge ${challengeId} - ${error && error.message ? error.message : error}`);
            continue;
        }
    }
}

/**
 * Helper function to calculate the boost factor off-chain. This requires the current Referee config from the subgraph
 * 
 * @param stakedEsXAIAmount amount of staked esXAI
 * @param keyCount amount of staked keys in a pool / amount of unstaked keys for an owner, used to calculate the maxStakeAmount
 * @param {RefereeConfig} refereeConfig the Referee config from the subgraph
 * @return {bigint} The payout chance boostFactor. 200 for double the chance.
 */
const calculateBoostFactorLocally = (
    stakedEsXAIAmount: bigint,
    keyCount: number,
    refereeConfig: RefereeConfig
): bigint => {

    const maxStakeAmount = BigInt(keyCount) * BigInt(refereeConfig.maxStakeAmountPerLicense);
    if (stakedEsXAIAmount > maxStakeAmount) {
        stakedEsXAIAmount = maxStakeAmount;
    }

    if (stakedEsXAIAmount < refereeConfig.stakeAmountTierThresholds[0]) {
        return BigInt(100)
    }

    for (let tier = 1; tier < refereeConfig.stakeAmountTierThresholds.length; tier++) {
        if (stakedEsXAIAmount < refereeConfig.stakeAmountTierThresholds[tier]) {
            return refereeConfig.stakeAmountBoostFactors[tier - 1];
        }
    }

    return refereeConfig.stakeAmountBoostFactors[refereeConfig.stakeAmountTierThresholds.length - 1];
}