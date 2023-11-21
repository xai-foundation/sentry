import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/RefereeAbi.js';
import { config } from '../config.js';
import { getProvider } from '../utils/getProvider.js';
import { getChallenge, Challenge } from "../index.js";

/**
 * Fetches all Challenges from the Referee contract.
 * @param openForSubmissions - Optional argument to filter challenges that are open for submissions.
 * @param callback - Optional callback function to handle challenges as they are retrieved.
 * @returns An array of challenges.
 */
export async function listChallenges(
    openForSubmissions?: boolean,
    callback?: (challengeNumber: bigint, challenge: Challenge) => Promise<void>,
): Promise<Array<[bigint, Challenge]>> {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

    // Get the count of challenges
    const challengeCount: bigint = await refereeContract.challengeCounter();

    // Initialize an array to store the challenges
    const challenges: Array<[bigint, Challenge]> = [];

    // Loop through the challenge count in reverse order and fetch each challenge
    for (let i = challengeCount - BigInt(1); i >= 0; i--) {
        const challenge = await getChallenge(i);
        if (openForSubmissions && !challenge.openForSubmissions) {
            break;
        }
        challenges.push([i + BigInt(0), challenge]);
        if (callback) {
            await callback(BigInt(i), challenge);
        }
    }

    return challenges;
}
