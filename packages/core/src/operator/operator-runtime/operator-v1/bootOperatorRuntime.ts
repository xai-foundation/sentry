import { getLatestChallenge, getLatestChallengeFromGraph, getSubgraphHealthStatus, listenForChallenges, MAX_CHALLENGE_CLAIM_AMOUNT, retry } from "../../../index.js";
import { listenForChallengesCallback } from "../listenForChallengesCallback.js";
import { processNewChallenge } from "./processNewChallenge.js";
import { findSubmissionOnSentryKey } from "../findSubmissionOnSentryKey.js";
import { operatorState } from "../operatorState.js";
import { loadOperatorKeysFromGraph, processPastChallenges } from "../index.js";
import { loadOperatorKeysFromRPC } from "./loadOperatorKeysFromRPC.js";

/**
 * Looks up payout boostFactor based on the staking tier.
 * @return The payout chance boostFactor. 200 for double the chance.
 */
export const bootOperatorRuntime = async (
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

        // Load all sentryKey objects including all winning and unclaimed submissions up until latestClaimableChallenge
        const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } =
            await retry(() => loadOperatorKeysFromGraph(operatorState.operatorAddress, BigInt(latestClaimableChallenge)));

        await processNewChallenge(BigInt(openChallenge.challengeNumber), openChallenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);
        logFunction(`Processing open challenges.`);

        //Remove submissions for current challenge so we don't process it again
        nodeLicenseIds.forEach(n => {
            const found = findSubmissionOnSentryKey(sentryKeysMap[n.toString()], BigInt(openChallenge.challengeNumber));
            if (found) {
                sentryKeysMap[n.toString()].submissions.splice(found.index, 1);
            }
        });

        //Process all past challenges check for unclaimed
        processPastChallenges(
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

        const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC(operatorState.operatorAddress);

        const [latestChallengeNumber, latestChallenge] = await getLatestChallenge();
        await processNewChallenge(latestChallengeNumber, latestChallenge, nodeLicenseIds, sentryKeysMap);

        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
    }

    return closeChallengeListener;
}