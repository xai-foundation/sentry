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
        
        const assertionId = Number(challenge.assertionId);
        const confirmData = challenge.assertionStateRootOrConfirmData;

        compareWithCDN(assertionId, confirmData)
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

    operatorState.cachedLogger(`Received new challenge with number: ${challengeNumber}. Delayed challenges will still accrue rewards.`);
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
 * Compares a challenge assertion with the data fetched from the public CDN by the public Xai node.
 * This function attempts to retrieve the assertion data up to 3 times, with a delay between attempts.
 * If successful, it checks if the assertion ID matches the challenge's expected value.
 * 
 * @param {number} assertionId - The expected assertion ID from the challenge (provided by the Referee contract).
 * @param {string} confirmData - The identifier used to fetch assertion data from the CDN.
 * @returns {Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }>} 
 * A promise that resolves with the public node bucket information. 
 * If the assertion ID does not match, an error message is included in the result. 
 * Throws an error if the data could not be retrieved after multiple attempts.
 * 
 * @throws {Error} If the CDN request fails after 3 attempts or if an unexpected error occurs during fetching.
 */
async function compareWithCDN(assertionId: number, confirmData: string): Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }> {

    let attempt = 1;
    let publicNodeBucket: PublicNodeBucketInformation | undefined;
    let lastError;

    while (attempt <= 3) {
        try {
            publicNodeBucket = await getPublicNodeFromBucket(confirmData);
            break;
        } catch (error) {
            operatorState.cachedLogger(`Error loading assertion data from CDN for ${confirmData} with attempt ${attempt}.\n${error}`);
            lastError = error;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds before retrying
    }

    if (!publicNodeBucket) {
        throw new Error(`Failed to retrieve assertion data from CDN for ${confirmData} after ${attempt} attempts.\n${lastError}`);
    }

    if (publicNodeBucket.assertion !== assertionId) {
        return { publicNodeBucket, error: `Mismatch between PublicNode and Challenge assertion number '${assertionId}'!` };
    }

    return { publicNodeBucket }
}