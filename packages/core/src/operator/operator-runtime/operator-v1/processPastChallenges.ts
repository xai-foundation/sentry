import { SentryKey, SentryWallet } from "@sentry/sentry-subgraph-client";
import { operatorState } from "../operatorState.js";
import { processClosedChallenges_V1 } from "./processClosedChallenges.js";

// Process past challenges from subgraph submissions
// This will first sort all keys and their submissions by challenge and then process each challenge
// This could block the thread since its not loading any additional information from any external resource so a await for a timeout is required
// In future updates it should be considered to run this in its own thread but the desktop client and cli will both have to support the implementation
export const processPastChallenges_V1 = async (
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
    sentryWalletMap: { [owner: string]: SentryWallet },
    openChallengeNumber: number,
    latestClaimableChallenge: number
) => {

    operatorState.cachedLogger(`Processing closed challenges ${openChallengeNumber} - ${latestClaimableChallenge} for ${nodeLicenseIds.length} keys.`);

    const challengeToKeys: { [challenge: string]: bigint[] } = {}

    // For each key map all submissions to the challengeNumber
    for (let i = 0; i < nodeLicenseIds.length; i++) {
        const keyId = nodeLicenseIds[i].toString();

        if (sentryKeysMap[keyId].submissions.length) {
            //Map each submission of the key to the challengeNumber
            sentryKeysMap[keyId].submissions.forEach(s => {
                if (!challengeToKeys[s.challengeNumber.toString()]) {
                    challengeToKeys[s.challengeNumber.toString()] = []
                }
                challengeToKeys[s.challengeNumber.toString()].push(nodeLicenseIds[i])
            })
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }

    // Sort all challenges that have unclaimed submissions by challengeNumber
    const openChallenges = Object.keys(challengeToKeys);
    operatorState.cachedLogger(`Found ${openChallenges.length} challenges to process...`);
    openChallenges.sort(function (a, b) { return Number(b) - Number(a) });

    // Process each mapped challenge with only the keys that have submissions
    for (let i = 0; i < openChallenges.length; i++) {
        operatorState.cachedLogger(`Processing closed challenge ${openChallenges[i]} for ${challengeToKeys[openChallenges[i]].length} keys ...`);
        await processClosedChallenges_V1(BigInt(openChallenges[i]), challengeToKeys[openChallenges[i]], sentryKeysMap, sentryWalletMap);

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }
}