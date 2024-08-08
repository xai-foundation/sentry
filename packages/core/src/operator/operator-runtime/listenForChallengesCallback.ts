import axios from "axios";
import { PublicNodeBucketInformation } from "../index.js";
import { operatorState } from "./operatorState.js";
import { Challenge, config, getProvider, getSubgraphHealthStatus, RefereeAbi } from "../../index.js";
import { processNewChallenge_V1 } from "./operator-v1/processNewChallenge.js";
import { loadOperatorKeysFromGraph_V1 } from "./operator-v1/loadOperatorKeysFromGraph.js";
import { loadOperatorKeysFromRPC_V1 } from "./operator-v1/loadOperatorKeysFromRPC.js";
import { processClosedChallenges_V1 } from "./operator-v1/processClosedChallenges.js";
import { getCurrentRefereeVersionFromGraph } from "../../subgraph/getCurrentRefereeVersionFromGraph.js";
import { ethers } from 'ethers';

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
            // Get Referee Config from the subgraph
            // Load current referee config from the graph
            const refereeVersion: number = await getCurrentRefereeVersionFromGraph();

            if (refereeVersion > 6) {
                // TODO implement new function for newer versions of the Referee

            } else {
                const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } = await loadOperatorKeysFromGraph_V1(operatorState.operatorAddress, challengeNumber - 1n);
                await processNewChallenge_V1(challengeNumber, challenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);
                // check the previous challenge, that should be closed now
                if (challengeNumber > BigInt(1)) {
                    await processClosedChallenges_V1(challengeNumber - BigInt(1), nodeLicenseIds, sentryKeysMap, sentryWalletMap);
                }
            }

        } else {
            operatorState.cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: ${graphStatus.error}`)
            // Get Current Referee Version from the RPC
            const isNewReferee = await checkIfRefereeIsV2();

            if(isNewReferee){
                // TODO implement new function for newer versions of the Referee
            }else{
                const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC_V1(operatorState.operatorAddress);
    
                await processNewChallenge_V1(challengeNumber, challenge, nodeLicenseIds, sentryKeysMap);
                // check the previous challenge, that should be closed now
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


async function checkIfRefereeIsV2(): Promise<boolean> {
    const provider = getProvider();
    const referee = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
    let isVersion2 = true;

    try {
        await referee.refereeCalculationsAddress();
        
    } catch (error) {
        isVersion2 = false;
    }
    return isVersion2;
}