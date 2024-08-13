import { operatorState } from "./operatorState.js";
import { BulkOwnerOrPool } from "../operatorRuntime.js";
import { processClosedChallenge } from "./processClosedChallenge.js";

/**
 * Process past challenges from subgraph submissions
 * This will first sort all keys and their submissions by challenge and then process each challenge
 * This could block the thread since its not loading any additional information from any external resource so a await for a timeout is required
 * 
 * @param {bigint} challengeId - The challenge number.
 * @param {BulkOwnerOrPool[]} bulkOwnerAndPools - The list of owner and pools to claim for. In case we are calling this with subgraph data we will expect each wallet to have a list of bulkSubmissions.
 */
export const processPastChallenges = async (
    bulkOwnerAndPools: BulkOwnerOrPool[],
    openChallengeNumber: number,
    latestClaimableChallenge: number
) => {

    operatorState.cachedLogger(`Processing closed challenges ${openChallengeNumber} - ${latestClaimableChallenge} for ${bulkOwnerAndPools.length} wallets/pools.`);

    const challengeToAddresses: { [challenge: string]: BulkOwnerOrPool[] } = {}

    // For each key map all submissions to the challengeNumber
    for (let i = 0; i < bulkOwnerAndPools.length; i++) {
        const ownerOrPool = bulkOwnerAndPools[i];

        if (ownerOrPool.bulkSubmissions && ownerOrPool.bulkSubmissions.length) {
            //Map each submission of the key to the challengeNumber
            ownerOrPool.bulkSubmissions.forEach(s => {
                if (!challengeToAddresses[s.challengeId.toString()]) {
                    challengeToAddresses[s.challengeId.toString()] = []
                }
                challengeToAddresses[s.challengeId.toString()].push(ownerOrPool)
            })
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }

    // Sort all challenges that have unclaimed submissions by challengeNumber
    const openChallenges = Object.keys(challengeToAddresses);
    operatorState.cachedLogger(`Found ${openChallenges.length} challenges to process...`);
    openChallenges.sort(function (a, b) { return Number(b) - Number(a) });

    // Process each mapped challenge with only the wallets that have submissions
    for (let i = 0; i < openChallenges.length; i++) {
        operatorState.cachedLogger(`Processing closed challenge ${openChallenges[i]} for ${challengeToAddresses[openChallenges[i]].length} wallets/pools ...`);
        await processClosedChallenge(BigInt(openChallenges[i]), challengeToAddresses[openChallenges[i]]);

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }
}