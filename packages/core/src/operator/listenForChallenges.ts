import { ethers } from "ethers";
import { RefereeAbi } from "../abis/RefereeAbi.js";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";
import { Challenge, getChallenge } from "../index.js";

/**
 * Listens for ChallengeSubmitted events and triggers a callback function when the event is emitted.
 * Keeps a map of challengeNumbers that have called the callback to ensure uniqueness.
 * @param callback - The callback function to be triggered when ChallengeSubmitted event is emitted.
 * @returns A function that can be called to stop listening for the event.
 */
export function listenForChallenges(callback: (challengeNumber: bigint, challenge: Challenge, event: any) => void): () => void {
    // get a provider for the arb one network
    const provider = getProvider(config.arbitrumOneWebSocketUrl);

    // create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // create a map to keep track of challengeNumbers that have called the callback
    const challengeNumberMap: { [challengeNumber: string]: boolean } = {};

    // listen for the ChallengeSubmitted event
    refereeContract.on("ChallengeSubmitted", async (challengeNumber, event) => {

        // if the challengeNumber has not been seen before, call the callback and add it to the map
        if (!challengeNumberMap[challengeNumber.toString()]) {
            challengeNumberMap[challengeNumber.toString()] = true;

            // lookup the challenge
            const challenge = await getChallenge(challengeNumber);

            void callback(challengeNumber, challenge, event);
        }
    });

    // return a function that can be used to stop listening for the event
    return () => {
        refereeContract.removeAllListeners("ChallengeSubmitted");
    };
}
