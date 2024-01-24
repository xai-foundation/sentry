import {Challenge, getChallenge} from "./getChallenge.js";
import {getProvider, retry} from "../utils/index.js";
import {ethers} from "ethers";
import {config} from "../config.js";
import {RefereeAbi} from "../abis/index.js";

/**
 * Fetches the latestChallengeId and challenge.
 * @returns An array containing the challengeId as the first item, and challenge as the second.
 */
export async function getLatestChallenge(): Promise<[bigint, Challenge]> {

	// Get the provider
	const provider = getProvider();

	// Create an instance of the Referee contract
	const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);

	// Get the count of challenges
	const latestChallengeId: bigint = (await refereeContract.challengeCounter()) - BigInt(1)
	const challenge = await getChallenge(latestChallengeId);

	return [latestChallengeId, challenge]
}
