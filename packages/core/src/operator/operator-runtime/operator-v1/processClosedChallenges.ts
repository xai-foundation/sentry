import { SentryKey, SentryWallet } from "@sentry/sentry-subgraph-client";
import { claimRewardsBulk, getSubmissionsForChallenges, KEYS_PER_BATCH, NodeLicenseStatus } from "../../index.js";
import { operatorState } from "../operatorState.js";
import { updateNodeLicenseStatus_V1 } from "./updateNodeLicenseStatus.js";
import { checkKycStatus, retry } from "../../../index.js";
import { findSubmissionOnSentryKey } from "../findSubmissionOnSentryKey.js";

/**
 * Processes a closed challenge that can now be claimed.
 * @param {bigint} challengeId - The challenge number.
 * @param {bigint[]} nodeLicenseIds - The list of keyIds to process
 * @param {{ [keyId: string]: SentryKey }} sentryKeysMap - A mapping keyId to key metadata
 * @param {{ [owner: string]: SentryWallet }} sentryWalletMap - A mapping walletAddress to owner metadata
 */
export async function processClosedChallenges_V1(
    challengeId: bigint,
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
    sentryWalletMap?: { [owner: string]: SentryWallet }
) {
    const challengeToEligibleNodeLicensesMap: Map<bigint, bigint[]> = new Map();
    const beforeStatus: { [key: string]: string | undefined } = {}
    const nonKYCWallets: { [wallet: string]: number } = {}
    const ownerKYCStatus: { [keyId: string]: boolean } = {};

    for (const nodeLicenseId of nodeLicenseIds) {

        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];
        beforeStatus[nodeLicenseId.toString()] = operatorState.nodeLicenseStatusMap.get(nodeLicenseId)?.status;
        updateNodeLicenseStatus_V1(nodeLicenseId, NodeLicenseStatus.QUERYING_FOR_UNCLAIMED_SUBMISSIONS);
        operatorState.safeStatusCallback();

        try {
            let hasSubmission: boolean = false;
            if (sentryWalletMap) {
                ownerKYCStatus[sentryKey.owner] = sentryWalletMap[sentryKey.owner].isKYCApproved;

                const found = findSubmissionOnSentryKey(sentryKey, challengeId);
                if (found) {
                    hasSubmission = true;
                }
            } else {
                const foundSubmission = await retry(() => getSubmissionsForChallenges([challengeId], nodeLicenseId), 3);
                if (foundSubmission[0] && foundSubmission[0].eligibleForPayout && !foundSubmission[0].claimed) {
                    hasSubmission = true;
                }
            }

            if (!hasSubmission) {
                updateNodeLicenseStatus_V1(nodeLicenseId, beforeStatus[nodeLicenseId.toString()] || "Waiting for next challenge");
                operatorState.safeStatusCallback();
                continue;
            }

            updateNodeLicenseStatus_V1(nodeLicenseId, `Checking KYC Status`);
            operatorState.safeStatusCallback();

            let isKYC: boolean = false;
            if (sentryWalletMap) {
                isKYC = sentryWalletMap[sentryKey.owner].isKYCApproved;
            } else {
                //If we are running on RPC we should not check every single pool key that did not come from an owner for KYC. 
                //The Referee will let the transaction go through but won't claim
                if (sentryKey.assignedPool != "0x") {
                    isKYC = true;
                } else {
                    //Cache KYC status on owner basis for each challenge
                    if (ownerKYCStatus[sentryKey.owner] === undefined) {
                        const [{ isKycApproved }] = await retry(async () => await checkKycStatus([sentryKey.owner]));
                        ownerKYCStatus[sentryKey.owner] = isKycApproved
                    }
                    isKYC = ownerKYCStatus[sentryKey.owner];
                }
            }

            if (isKYC) {
                if (!challengeToEligibleNodeLicensesMap.has(challengeId)) {
                    challengeToEligibleNodeLicensesMap.set(challengeId, []);
                }
                challengeToEligibleNodeLicensesMap.get(challengeId)?.push(BigInt(nodeLicenseId));

                updateNodeLicenseStatus_V1(nodeLicenseId, `Claiming esXAI...`);
                operatorState.safeStatusCallback();
            } else {

                if (!nonKYCWallets[sentryKey.owner]) {
                    nonKYCWallets[sentryKey.owner] = 0;
                }
                nonKYCWallets[sentryKey.owner]++;

                updateNodeLicenseStatus_V1(nodeLicenseId, `Cannot Claim, Failed KYC`);
                operatorState.safeStatusCallback();
            }

        } catch (error: any) {
            operatorState.cachedLogger(`Error processing submissions for Sentry Key ${nodeLicenseId} - ${error && error.message ? error.message : error}`);
        }
    }

    const nonKYC = Object.keys(nonKYCWallets);
    if (nonKYC.length) {
        operatorState.cachedLogger(`Failed KYC check for ${nonKYC.length} owners: `);
        nonKYC.forEach(w => {
            operatorState.cachedLogger(`${w} (${nonKYCWallets[w]} keys)`);
        })
    }

    // Iterate over the map and call processClaimForChallenge for each challenge with its unique list of eligible nodeLicenseIds
    for (const [challengeId, nodeLicenseIds] of challengeToEligibleNodeLicensesMap) {
        const uniqueNodeLicenseIds = [...new Set(nodeLicenseIds)]; // Remove duplicates
        if (uniqueNodeLicenseIds.length > 0) {
            await processClaimForChallenge(challengeId, uniqueNodeLicenseIds, sentryKeysMap);
            uniqueNodeLicenseIds.forEach(key => {
                if (beforeStatus[key.toString()]) {
                    updateNodeLicenseStatus_V1(key, beforeStatus[key.toString()]!);
                }
            });
            operatorState.safeStatusCallback();
        }
    }
}

// Helper function to process claim in batches
async function processClaimForChallenge(challengeNumber: bigint, eligibleNodeLicenseIds: bigint[], sentryKeysMap: { [keyId: string]: SentryKey }) {
    const claimGroups: Map<string, bigint[]> = new Map();

    // Group eligible nodeLicenseIds by their claimForAddressInBatch
    for (const nodeLicenseId of eligibleNodeLicenseIds) {
        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];
        let isPool = sentryKey.assignedPool != "0x";

        let claimForAddressInBatch: string;

        // Determine the claimForAddressInBatch based on whether the key is in a pool
        if (isPool) {
            claimForAddressInBatch = sentryKey.assignedPool;
        } else {
            claimForAddressInBatch = sentryKey.owner;
        }

        if (!claimGroups.has(claimForAddressInBatch)) {
            claimGroups.set(claimForAddressInBatch, []);
        }
        claimGroups.get(claimForAddressInBatch)?.push(nodeLicenseId);
    }

    // Perform the bulk claim for each group
    for (const [claimForAddress, nodeLicenses] of claimGroups) {
        if (nodeLicenses.length === 0) continue; // Skip if no licenses to claim for

        try {
            await claimRewardsBulk(nodeLicenses, challengeNumber, claimForAddress, KEYS_PER_BATCH, operatorState.cachedSigner, operatorState.cachedLogger);
            operatorState.cachedLogger(`Bulk claim successful for address ${claimForAddress} and challenge ${challengeNumber}`);
        } catch (error: any) {
            operatorState.cachedLogger(`Error during bulk claim for address ${claimForAddress} and challenge ${challengeNumber}: ${error.message}`);
        }
    }
}