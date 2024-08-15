import { getLatestChallenge } from "../../challenger/getLatestChallenge.js";
import { getLatestChallengeFromGraph } from "../../subgraph/getLatestChallengeFromGraph.js";
import { getSentryWalletsForOperator } from "../../subgraph/getSentryWalletsForOperator.js";
import { getSubgraphHealthStatus } from "../../subgraph/getSubgraphHealthStatus.js";
import { retry } from "../../utils/retry.js";
import { listenForChallenges } from "../listenForChallenges.js";
import { MAX_CHALLENGE_CLAIM_AMOUNT } from "../operatorRuntime.js";
import { listenForChallengesCallback } from "./listenForChallengesCallback.js";
import { loadOperatorWalletsFromGraph } from "./loadOperatorWalletsFromGraph.js";
import { loadOperatorWalletsFromRPC } from "./loadOperatorWalletsFromRPC.js";
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

    const graphStatus = await getSubgraphHealthStatus();
    if (graphStatus.healthy) {
        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        const openChallenge = await retry(() => getLatestChallengeFromGraph());

        // Calculate the latest challenge we should load from the graph
        const latestClaimableChallenge = Number(openChallenge.challengeNumber) <= MAX_CHALLENGE_CLAIM_AMOUNT ? 1 : Number(openChallenge.challengeNumber) - MAX_CHALLENGE_CLAIM_AMOUNT;
        
        const { wallets, pools, refereeConfig } = await retry(() => getSentryWalletsForOperator(operatorState.operatorAddress, { latestChallengeNumber: BigInt(latestClaimableChallenge), winningKeyCount: true, claimed: false }, operatorState.passedInOwnersAndPools));
        
        const bulkOwnersAndPools = await loadOperatorWalletsFromGraph(operatorState.operatorAddress, { wallets, pools }, BigInt(latestClaimableChallenge));
        
        await processNewChallenge(openChallenge.challengeNumber, openChallenge, bulkOwnersAndPools, refereeConfig);

        logFunction(`Processing open challenges.`);

        //Remove submissions for current challenge so we don't process it again
        bulkOwnersAndPools.forEach(b => {
            const foundSubmission = b.bulkSubmissions!.find(s => {
                return Number(s.challengeId) == Number(openChallenge.challengeNumber)
            });
            if (foundSubmission) {
                b.bulkSubmissions!.splice(b.bulkSubmissions!.indexOf(foundSubmission), 1);
            }
        });

        processPastChallenges(
            bulkOwnersAndPools,
            openChallenge.challengeNumber,
            latestClaimableChallenge
        ).then(() => {
            logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
        });

    } else {
        operatorState.cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: DEV MODE ALTERNATE HEALTH`)

        const bulkOwnersAndPools = await loadOperatorWalletsFromRPC(operatorState.operatorAddress);

        const [latestChallengeNumber, latestChallenge] = await getLatestChallenge();

        await processNewChallenge(latestChallengeNumber, latestChallenge, bulkOwnersAndPools);
        await processClosedChallenge(latestChallengeNumber - 1n, bulkOwnersAndPools);

        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
    }

    return closeChallengeListener;
}