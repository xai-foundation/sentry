import { ethers } from "ethers";
import { getLatestChallenge } from "../../challenger/getLatestChallenge.js";
import { getRefereeCalculationsAddress } from "../../index.js";
import { getLatestChallengeFromGraph } from "../../subgraph/getLatestChallengeFromGraph.js";
import { getSentryWalletsForOperator } from "../../subgraph/getSentryWalletsForOperator.js";
import { getSubgraphHealthStatus } from "../../subgraph/getSubgraphHealthStatus.js";
import { retry } from "../../utils/retry.js";
import { checkRefereeBulkSubmissionCompatible } from "../checkRefereeBulkSubmissionCompatible.js";
import { getChallengerPublicKey } from "../index.js";
import { listenForChallenges } from "../listenForChallenges.js";
import { MAX_CHALLENGE_CLAIM_AMOUNT } from "../operatorRuntime.js";
import { findSubmissionOnSentryKey } from "./findSubmissionOnSentryKey.js";
import { listenForChallengesCallback } from "./listenForChallengesCallback.js";
import { loadOperatorWalletsFromGraph } from "./loadOperatorWalletsFromGraph.js";
import { loadOperatorWalletsFromRPC } from "./loadOperatorWalletsFromRPC.js";
import { loadOperatorKeysFromGraph_V1 } from "./operator-v1/loadOperatorKeysFromGraph.js";
import { loadOperatorKeysFromRPC_V1 } from "./operator-v1/loadOperatorKeysFromRPC.js";
import { processNewChallenge_V1 } from "./operator-v1/processNewChallenge.js";
import { processPastChallenges_V1 } from "./operator-v1/processPastChallenges.js";
import { operatorState } from "./operatorState.js";
import { processClosedChallenge } from "./processClosedChallenge.js";
import { processNewChallenge } from "./processNewChallenge.js";
import { processPastChallenges } from "./processPastChallenges.js";


/**
 * Startup the operatorRuntime challenger listener as well as process previous challenges
 */
export const bootOperatorRuntime = async (
    logFunction: (log: string) => void
): Promise<() => void> => {
    let closeChallengeListener: () => void;
    logFunction(`Started listener for new challenges.`);

    operatorState.challengerPublicKey = await getChallengerPublicKey();

    const graphStatus = await getSubgraphHealthStatus();
    if (graphStatus.healthy) {
        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        const openChallenge = await retry(() => getLatestChallengeFromGraph());

        operatorState.previousChallengeAssertionId = openChallenge.assertionId;

        // Calculate the latest challenge we should load from the graph
        const latestClaimableChallenge = Number(openChallenge.challengeNumber) <= MAX_CHALLENGE_CLAIM_AMOUNT ? 1 : Number(openChallenge.challengeNumber) - MAX_CHALLENGE_CLAIM_AMOUNT;

        const { wallets, pools, refereeConfig } = await retry(() => getSentryWalletsForOperator(operatorState.operatorAddress, { latestChallengeNumber: BigInt(latestClaimableChallenge), winningKeyCount: true, claimed: false }, operatorState.passedInOwnersAndPools));

        logFunction(`Processing open challenges. Challenges should occur roughly once per hour. Rewards will still accrue even if challenges are delayed.`);

        // Check if the referee has been upgraded to V2
        const refereeIsV2 = await checkRefereeBulkSubmissionCompatible(refereeConfig);

        // If the referee is V2
        if (refereeIsV2) {
            // If referee calculations address is not set, set it
            if (operatorState.refereeCalculationsAddress === "") {
                try {
                    operatorState.refereeCalculationsAddress = await getRefereeCalculationsAddress();
                } catch (error) {
                    // TODO confirm if we should throw an error here
                    logFunction(`Error fetching referee calculations address: ${(error as Error).message}`);
                }
            }

            // Load the operator wallets from the graph
            const bulkOwnersAndPools = await loadOperatorWalletsFromGraph(operatorState.operatorAddress, { wallets, pools }, BigInt(latestClaimableChallenge));

            // Process the current challenge
            await processNewChallenge(openChallenge.challengeNumber, openChallenge, bulkOwnersAndPools, refereeConfig);

            // Remove submissions for current challenge so we don't process it again
            bulkOwnersAndPools.forEach(b => {
                const foundSubmission = b.bulkSubmissions!.find(s => {
                    return Number(s.challengeId) == Number(openChallenge.challengeNumber)
                });
                if (foundSubmission) {
                    b.bulkSubmissions!.splice(b.bulkSubmissions!.indexOf(foundSubmission), 1);
                }
            });

            // Process the past challenges
            processPastChallenges(
                bulkOwnersAndPools,
                openChallenge.challengeNumber,
                latestClaimableChallenge
            ).then(() => {
                logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
            });


        } else {
            // If the referee is not V2

            // Load the operator keys from the graph
            const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig: refereeConfigFromGraph } = await loadOperatorKeysFromGraph_V1(operatorState.operatorAddress, wallets, pools, refereeConfig, BigInt(latestClaimableChallenge));

            // Process the new challenge using individual submissions
            await processNewChallenge_V1(openChallenge.challengeNumber, openChallenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfigFromGraph);

            //Remove submissions for current challenge so we don't process it again
            nodeLicenseIds.forEach(n => {
                const found = findSubmissionOnSentryKey(sentryKeysMap[n.toString()], BigInt(openChallenge.challengeNumber));
                if (found) {
                    sentryKeysMap[n.toString()].submissions.splice(found.index, 1);
                }
            });

            //Process all past challenges check for unclaimed
            processPastChallenges_V1(
                nodeLicenseIds,
                sentryKeysMap,
                sentryWalletMap,
                openChallenge.challengeNumber,
                latestClaimableChallenge
            ).then(() => {
                logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
            });
        }


    } else {
        closeChallengeListener = listenForChallenges(listenForChallengesCallback)
        // If the subgraph is not healthy
        operatorState.cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: ${graphStatus.error}`);

        // Check if the referee has been upgraded to V2
        const refereeIsV2 = await checkRefereeBulkSubmissionCompatible();

        // Get the latest challenge from the RPC
        const [latestChallengeNumber, latestChallenge] = await getLatestChallenge();

        operatorState.previousChallengeAssertionId = latestChallenge.assertionId;

        logFunction(`Processing open challenges. Challenges should occur roughly once per hour. Rewards will still accrue even if challenges are delayed.`);

        // If the referee is V2
        if (refereeIsV2) {
            // If referee calculations address is not set, set it
            if (operatorState.refereeCalculationsAddress === "") {
                try {
                    operatorState.refereeCalculationsAddress = await getRefereeCalculationsAddress();
                } catch (error) {
                    // TODO confirm if we should throw an error here
                    logFunction(`Error fetching referee calculations address: ${(error as Error).message}`);
                }
            }

            // Load the operator wallets from the RPC
            const bulkOwnersAndPools = await loadOperatorWalletsFromRPC(operatorState.operatorAddress);

            // Process the current challenge
            await processNewChallenge(latestChallengeNumber, latestChallenge, bulkOwnersAndPools);

            // Process the past challenges
            await processClosedChallenge(latestChallengeNumber - 1n, bulkOwnersAndPools);

        } else {

            // If the referee is not V2, get the keys from the RPC
            const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC_V1(operatorState.operatorAddress);

            // process the new challenge using individual submissions
            await processNewChallenge_V1(latestChallengeNumber, latestChallenge, nodeLicenseIds, sentryKeysMap);
        }

        logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
    }

    return closeChallengeListener;
};
