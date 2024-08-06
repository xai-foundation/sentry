import { PoolInfo, RefereeConfig, SentryKey, SentryWallet } from "@sentry/sentry-subgraph-client";
import { getBoostFactor as getBoostFactorRPC, getSubmissionsForChallenges, KEYS_PER_BATCH, NodeLicenseStatus, ProcessChallenge, submitMultipleAssertions } from "../../index.js";
import { operatorState } from "../operatorState.js";
import { updateNodeLicenseStatus } from "../updateNodeLicenseStatus.js";
import { createAssertionHashAndCheckPayout_V1 } from "./createAssertionHashAndCheckPayout.js";
import { calculateBoostFactor_V1 } from "./calculateBoostFactor.js";
import { retry } from "../../../index.js";

/**
 * Processes a new challenge for all the node licenses.
 * @param {bigint} challengeNumber - The challenge number.
 * @param {ProcessChallenge} challenge - The challenge object.
 * @param {Challenge} challenge - The challenge.
 */
export async function processNewChallenge_V1(
    challengeNumber: bigint,
    challenge: ProcessChallenge,
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
    sentryWalletMap?: { [address: string]: SentryWallet },
    mappedPools?: { [poolAddress: string]: PoolInfo },
    refereeConfig?: RefereeConfig
) {
    operatorState.cachedLogger(`Processing new challenge with number: ${challengeNumber}.`);
    operatorState.cachedBoostFactor = {};

    const batchedWinnerKeys: bigint[] = []

    operatorState.cachedLogger(`Checking eligibility for ${nodeLicenseIds.length} Keys.`);

    let nonWinnerKeysCount = 0;

    for (const nodeLicenseId of nodeLicenseIds) {

        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];

        // Check the nodeLicense eligibility for this challenge
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_MINT_TIMESTAMP_ELIGIBILITY);

        if (challenge.createdTimestamp <= sentryKey.mintTimeStamp) {
            operatorState.cachedLogger(`Sentry Key ${nodeLicenseId} is not eligible for challenge ${challengeNumber}.`);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
            continue;
        }

        // Check if nodeLicense is eligible for a payout
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_IF_ELIGIBLE_FOR_PAYOUT);

        try {
            let isPool = sentryKey.assignedPool != "0x";
            const keyOwner = isPool ? sentryKey.assignedPool : sentryKey.owner;
            if (!operatorState.cachedBoostFactor[keyOwner]) {
                if (mappedPools && refereeConfig && sentryWalletMap) {
                    operatorState.cachedBoostFactor[keyOwner] = calculateBoostFactor_V1(sentryKey, sentryWalletMap[sentryKey.owner], mappedPools, refereeConfig);
                    operatorState.cachedLogger(`Found chance boost of ${Number(operatorState.cachedBoostFactor[keyOwner]) / 100}% for ${isPool ? `pool: ${mappedPools[keyOwner].metadata[0]} (${keyOwner})` : `owner: ${keyOwner}`}`);
                } else {
                    operatorState.cachedBoostFactor[keyOwner] = await getBoostFactorRPC(keyOwner);
                    operatorState.cachedLogger(`Found chance boost of ${Number(operatorState.cachedBoostFactor[keyOwner]) / 100}% for ${isPool ? `pool:` : `owner:`} ${keyOwner}`);
                }
            }

            const [payoutEligible] = createAssertionHashAndCheckPayout_V1(nodeLicenseId, challengeNumber, operatorState.cachedBoostFactor[keyOwner], challenge.assertionStateRootOrConfirmData, challenge.challengerSignedHash);

            if (!payoutEligible) {
                nonWinnerKeysCount++;
                // cachedLogger(`Sentry Key ${nodeLicenseId} did not accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }
        } catch (error: any) {
            operatorState.cachedLogger(`Error checking payout eligible for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

        try {

            let hasSubmission;

            if (mappedPools && refereeConfig && sentryWalletMap) {
                const foundSubmission = sentryKey.submissions.find(s => s.challengeNumber.toString() == challengeNumber.toString());
                if (foundSubmission) {
                    hasSubmission = true;
                }

            } else {
                const [{ submitted }] = await retry(() => getSubmissionsForChallenges([challengeNumber], nodeLicenseId));
                if (submitted) {
                    hasSubmission = true;
                }
            }

            if (hasSubmission) {
                operatorState.cachedLogger(`Sentry Key ${nodeLicenseId} has submitted for challenge ${challengeNumber} by another node. If multiple nodes are running, this message can be ignored.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }

            batchedWinnerKeys.push(nodeLicenseId);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);

        } catch (error: any) {
            operatorState.cachedLogger(`Error submitting assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

    }

    operatorState.cachedLogger(`${nodeLicenseIds.length - nonWinnerKeysCount} / ${nodeLicenseIds.length} keys did accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);

    if (batchedWinnerKeys.length) {
        await submitMultipleAssertions(batchedWinnerKeys, challengeNumber, challenge.assertionStateRootOrConfirmData, KEYS_PER_BATCH, operatorState.cachedSigner, operatorState.cachedLogger);
    }
}