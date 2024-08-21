import axios from "axios";
import { checkRefereeBulkSubmissionCompatible, loadOperatorKeysFromGraph_V1, loadOperatorKeysFromRPC_V1, loadOperatorWalletsFromGraph, loadOperatorWalletsFromRPC, operatorState, processClosedChallenge, processClosedChallenges_V1, processNewChallenge, processNewChallenge_V1, PublicNodeBucketInformation } from "../index.js";
import { Challenge, config, getSentryWalletsForOperator, getSubgraphHealthStatus, retry } from "../../index.js";

/**
 * Update the status message for display in the operator desktop app key list
 * @param {bigint} nodeLicenseId - The nodeLicense key id.
 * @param {NodeLicenseStatus | string} newStatus - The new status to display
 */
export async function listenForChallengesCallback(challengeNumber: bigint, challenge: Challenge, event?: any) {

    if (event && challenge.rollupUsed === config.rollupAddress) {
        compareWithCDN(challenge)
            .then(({ publicNodeBucket, error }) => {
                if (error) {
                    operatorState.onAssertionMissMatchCb(publicNodeBucket, challenge, error);
                    return;
                }
                operatorState.cachedLogger(`Comparison between PublicNode and Challenger was successful.`);
            })
            .catch(error => {
                operatorState.cachedLogger(`Error on CND check for challenge ${Number(challenge.assertionId)}.`);
                operatorState.cachedLogger(`${error.message}.`);
            });
    }

    operatorState.cachedLogger(`Received new challenge with number: ${challengeNumber}.`);
    operatorState.cachedLogger(`Processing challenge...`);

    // Add a delay of 1 -300 seconds to the new challenge process so not all operators request the subgraph at the same time
    const delay = Math.floor(Math.random() * 301);
    await new Promise((resolve) => {
        setTimeout(resolve, delay * 1000);
    })

    try {
        const graphStatus = await getSubgraphHealthStatus();
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

// Helper function to request the assertion from the public node's CDN
async function getPublicNodeFromBucket(confirmHash: string) {
    const url = `https://sentry-public-node.xai.games/assertions/${confirmHash.toLowerCase()}.json`;
    const response = await axios.get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Invalid response status " + response.status);
    }
}

/**
 * Compare a challenge with an assertion posted to the public CDN by the public Xai node.
 * @param {Challenge} challenge - The challenge from the Referee contract.
 * @returns {Promise<() => Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }>>} Returns the assertion data from the CDN or an error on miss match.
 */
async function compareWithCDN(challenge: Challenge): Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }> {

    let attempt = 1;
    let publicNodeBucket: PublicNodeBucketInformation | undefined;
    let lastError;

    while (attempt <= 3) {
        try {
            publicNodeBucket = await getPublicNodeFromBucket(challenge.assertionStateRootOrConfirmData);
            break;
        } catch (error) {
            operatorState.cachedLogger(`Error loading assertion data from CDN for ${challenge.assertionStateRootOrConfirmData} with attempt ${attempt}.\n${error}`);
            lastError = error;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 20000));
    }

    if (!publicNodeBucket) {
        throw new Error(`Failed to retrieve assertion data from CDN for ${challenge.assertionStateRootOrConfirmData} after ${attempt} attempts.\n${lastError}`);
    }

    if (publicNodeBucket.assertion !== Number(challenge.assertionId)) {
        return { publicNodeBucket, error: `Miss match between PublicNode and Challenge assertion number '${challenge.assertionId}'!` };
    }

    return { publicNodeBucket }
}