import { ethers } from "ethers";
import { RefereeAbi } from "../abis/RefereeAbi.js";
import { getProvider } from "../utils/getProvider.js";
import { config } from "../config.js";
import { Challenge, getChallenge } from "../index.js";
import { resilientEventListener } from "../utils/resilientEventListener.js";

/**
 * Listens for ChallengeSubmitted events and triggers a callback function when the event is emitted.
 * Keeps a map of challengeNumbers that have called the callback to ensure uniqueness.
 * @param callback - The callback function to be triggered when ChallengeSubmitted event is emitted.
 * @returns A function that can be called to stop listening for the event.
 */
export function listenForChallenges(callback: (challengeNumber: bigint, challenge: Challenge, event: any) => void, simulateError: boolean = true): () => void {
    const challengeNumberMap: { [challengeNumber: string]: boolean } = {};

    const listener = resilientEventListener({
        rpcUrl: config.arbitrumOneWebSocketUrl,
        contractAddress: config.refereeAddress,
        abi: RefereeAbi,
        eventName: "ChallengeSubmitted",
        log: console.info,
        callback: async (log, error) => {
            if (error) {
                console.error(`Error listening for ChallengeSubmitted event: ${error.message}`);
                return;
            }

            const challengeNumber = BigInt(log?.args[0]);

            // Conditionally simulate an error for testing
            try {
                if (simulateError) {
                    throw new Error('Simulated error for testing purposes');
                }

                if (!challengeNumberMap[challengeNumber.toString()]) {
                    challengeNumberMap[challengeNumber.toString()] = true;

                    const challenge = await getChallenge(challengeNumber);
                    void callback(challengeNumber, challenge, log);
                }
            } catch (error) {
                console.error(`Error caught in listenForChallenges callback`);
                throw error; // Propagate the error up the call stack
            }
        }
    });

    return () => {
        listener.stop();
    };
}
