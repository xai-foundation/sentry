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
export function listenForChallenges(callback: (challengeNumber: bigint, challenge: Challenge, event: any) => void, log: (log: string) => void = () => {}): () => void {
    let intervalId: NodeJS.Timeout;
    let refereeContract: ethers.Contract;
    let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.AlchemyProvider;

    const challengeNumberMap: { [challengeNumber: string]: boolean } = {};

    const startListening = () => {
        log(`[${new Date().toISOString()}] Starting to listen for ChallengeSubmitted events`);

        if (intervalId) {
            log(`[${new Date().toISOString()}] Clearing existing interval and listeners`);
            clearInterval(intervalId);
            if (refereeContract) {
                refereeContract.removeAllListeners("ChallengeSubmitted");
            }
        }

        log(`[${new Date().toISOString()}] Creating provider and contract instance`);
        provider = getProvider("https://arb-mainnet.g.alchemy.com/v2/p_LSgTIj_JtEt3JPM7IZIZFL1a70yvQJ", true);

        refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

        log(`[${new Date().toISOString()}] Setting up listener for ChallengeSubmitted events`);
        refereeContract.on("ChallengeSubmitted", async (challengeNumber, event) => {
            if (!challengeNumberMap[challengeNumber.toString()]) {
                log(`[${new Date().toISOString()}] ChallengeSubmitted event received for new challengeNumber: ${challengeNumber}`);
                challengeNumberMap[challengeNumber.toString()] = true;

                const challenge = await getChallenge(challengeNumber);

                void callback(challengeNumber, challenge, event);
            }
        });

        log(`[${new Date().toISOString()}] Setting up interval to recreate listener every 4 minutes`);
        intervalId = setInterval(startListening, 4 * 60 * 1000);
    };

    log(`[${new Date().toISOString()}] Starting initial listening`);
    startListening();

    return () => {
        log(`[${new Date().toISOString()}] Stopping listening for ChallengeSubmitted events`);
        clearInterval(intervalId);
        refereeContract.removeAllListeners("ChallengeSubmitted");
    };
}
