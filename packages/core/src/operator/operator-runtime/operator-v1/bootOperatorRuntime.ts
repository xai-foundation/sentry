import { getLatestChallenge, getLatestChallengeFromGraph, getSentryWalletsForOperator, getSubgraphHealthStatus, listenForChallenges, MAX_CHALLENGE_CLAIM_AMOUNT, retry } from "../../../index.js";
import { listenForChallengesCallback } from "../listenForChallengesCallback.js";
import { processNewChallenge_V1 } from "./processNewChallenge.js";
import { findSubmissionOnSentryKey } from "../findSubmissionOnSentryKey.js";
import { operatorState } from "../operatorState.js";
import { loadOperatorKeysFromGraph_V1, processPastChallenges_V1 } from "../index.js";
import { loadOperatorKeysFromRPC_V1 } from "./loadOperatorKeysFromRPC.js";

/**
 * Startup the operatorRuntime challenger listener as well as process previous challenges
 */
export const bootOperatorRuntime_V1 = async (
    logFunction: (log: string) => void
): Promise<() => void> => {
    let closeChallengeListener: () => void;
    logFunction(`Started listener for new challenges.`);

    const graphStatus = await getSubgraphHealthStatus();
    if (graphStatus.healthy) {
        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        const openChallenge = await retry(() => getLatestChallengeFromGraph());
        // Calculate the latest challenge we should load from the graph
        const latestClaimableChallenge = Number(openChallenge.challengeNumber) <= MAX_CHALLENGE_CLAIM_AMOUNT ? 1 : Number(openChallenge.challengeNumber) - MAX_CHALLENGE_CLAIM_AMOUNT;
    
        const { wallets, pools, refereeConfig:refereeConfigFromGraph } = await retry(() => getSentryWalletsForOperator(operatorState.operatorAddress, { latestChallengeNumber: BigInt(latestClaimableChallenge), winningKeyCount: true, claimed: false }, operatorState.passedInOwnersAndPools));

        // Load all sentryKey objects including all winning and unclaimed submissions up until latestClaimableChallenge
        const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } =
            await retry(() => loadOperatorKeysFromGraph_V1(operatorState.operatorAddress, wallets, pools, refereeConfigFromGraph, BigInt(latestClaimableChallenge)));

        await processNewChallenge_V1(BigInt(openChallenge.challengeNumber), openChallenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);
        logFunction(`Processing open challenges. Challenges should occur roughly once per hour. Rewards will still accrue even if challenges are delayed.`);

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
        })

    } else {
        operatorState.cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: ${graphStatus.error}`)

        const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC_V1(operatorState.operatorAddress);

        const [latestChallengeNumber, latestChallenge] = await getLatestChallenge();
        await processNewChallenge_V1(latestChallengeNumber, latestChallenge, nodeLicenseIds, sentryKeysMap);

        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
    }

    return closeChallengeListener;
}