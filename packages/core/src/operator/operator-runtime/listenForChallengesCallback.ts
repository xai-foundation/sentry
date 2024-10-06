import { checkRefereeBulkSubmissionCompatible, loadOperatorKeysFromGraph_V1, loadOperatorKeysFromRPC_V1, loadOperatorWalletsFromGraph, loadOperatorWalletsFromRPC, operatorState, processClosedChallenge, processClosedChallenges_V1, processNewChallenge, processNewChallenge_V1, PublicNodeBucketInformation, validateConfirmData } from "../index.js";
import { Challenge, getSentryWalletsForOperator, getSubgraphHealthStatus, retry } from "../../index.js";
import { ethers } from "ethers";

/**
 * Update the status message for display in the operator desktop app key list
 * @param {bigint} nodeLicenseId - The nodeLicense key id.
 * @param {NodeLicenseStatus | string} newStatus - The new status to display
 */
export async function listenForChallengesCallback(challengeNumber: bigint, challenge: Challenge, event?: ethers.EventLog) {

    // Add a delay of 1 -300 seconds to the new challenge process so not all operators request the subgraph at the same time
    const delay = Math.floor(Math.random() * 301);

    await new Promise((resolve) => {
        setTimeout(resolve, delay * 1000);
    })

    operatorState.cachedLogger(`Received new challenge with number: ${challengeNumber}. Delayed challenges will still accrue rewards.`);

    const graphStatus = await getSubgraphHealthStatus();

    operatorState.cachedLogger(`Validating confirm data...`);

    const stateToPass = {
        previousChallengeAssertionId: operatorState.previousChallengeAssertionId,
        challengerPublicKey: operatorState.challengerPublicKey,
        onAssertionMissMatchCb: operatorState.onAssertionMissMatchCb,
        cachedLogger: operatorState.cachedLogger,
        refereeCalculationsAddress: operatorState.refereeCalculationsAddress
    };

    validateConfirmData(challenge, graphStatus.healthy, stateToPass, event)
        .then(validateSuccess => {
            if (validateSuccess) {
                operatorState.cachedLogger(`Validation finished successfully.`);
            } else {
                operatorState.cachedLogger(`===============================================`);
                operatorState.cachedLogger(`Validation finished with errors!`);
                operatorState.cachedLogger(`===============================================`);
            }
        });

    operatorState.previousChallengeAssertionId = challenge.assertionId;

    operatorState.cachedLogger(`Processing challenge...`);

    try {
        if (graphStatus.healthy) {
            // get the wallets, pools and referee config from the subgraph
            const submissionFilter = {};
            const { wallets, pools, refereeConfig: refereeConfigFromGraph } = await retry(() => getSentryWalletsForOperator(operatorState.operatorAddress, submissionFilter, operatorState.passedInOwnersAndPools));

            // Check if the referee has been upgraded to V2
            const refereeIsV2 = await checkRefereeBulkSubmissionCompatible(refereeConfigFromGraph);

            // If the referee is V2, we can process the new challenge using bulk submissions
            if (refereeIsV2) {
                const sentryWalletData = { wallets, pools }
                const ownerWalletsAndPools = await loadOperatorWalletsFromGraph(operatorState.operatorAddress, sentryWalletData)

                // process the new challenge using bulk submissions
                await processNewChallenge(challengeNumber, challenge, ownerWalletsAndPools, refereeConfigFromGraph);

                await processClosedChallenge(challengeNumber - BigInt(1), ownerWalletsAndPools);

            } else {
                // If the referee has not been upgraded to V2, we need to process the new challenge using individual submissions
                // get the keys from the subgraph
                const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } = await loadOperatorKeysFromGraph_V1(operatorState.operatorAddress, wallets, pools, refereeConfigFromGraph, challengeNumber - 1n);

                // process the new challenge using individual submissions
                await processNewChallenge_V1(challengeNumber, challenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);

                // check the previous challenge, that should be closed now
                if (challengeNumber > BigInt(1)) {
                    await processClosedChallenges_V1(challengeNumber - BigInt(1), nodeLicenseIds, sentryKeysMap, sentryWalletMap);
                }
            }

        } else {
            // If the subgraph is not healthy, we need to process the new challenge using RPC calls
            operatorState.cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: ${graphStatus.error}`);

            // Check if the referee has been upgraded to V2
            const refereeIsV2 = await checkRefereeBulkSubmissionCompatible();

            // If the referee is V2, we can process the new challenge using bulk submissions
            if (refereeIsV2) {
                //const { refereeConfig } = await getSentryWalletsForOperator(operatorState.operatorAddress, { latestChallengeNumber: challengeNumber, winningKeyCount: true, claimed: false }, operatorState.passedInOwnersAndPools);
                const ownerWalletsAndPools = await loadOperatorWalletsFromRPC(operatorState.operatorAddress);

                // process the new challenge using bulk submissions
                await processNewChallenge(challengeNumber, challenge, ownerWalletsAndPools);

                // Claim the previous challenge, that should be closed now and available for claiming
                await processClosedChallenge(challengeNumber - BigInt(1), ownerWalletsAndPools);

            } else {

                // If the referee has not been upgraded to V2, we need to process the new challenge using individual submissions

                // get the keys from the RPC
                const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC_V1(operatorState.operatorAddress);

                // process the new challenge using individual submissions
                await processNewChallenge_V1(challengeNumber, challenge, nodeLicenseIds, sentryKeysMap);

                // check the previous challenge, that should be closed now and available for claiming
                if (challengeNumber > BigInt(1)) {
                    await processClosedChallenges_V1(challengeNumber - BigInt(1), nodeLicenseIds, sentryKeysMap);
                }

            }
        }
    } catch (error: any) {
        operatorState.cachedLogger(`Error processing new challenge in listener callback: - ${error && error.message ? error.message : error}`);
    }
}
