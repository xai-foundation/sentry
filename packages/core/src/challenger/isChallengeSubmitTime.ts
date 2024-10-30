import { config } from "../config.js";
import { getLatestChallenge } from "./getLatestChallenge.js";
import { Challenge } from "./index.js";

export async function isChallengeSubmitTime(): Promise<{isSubmitTime:boolean, currentChallenge: Challenge}> {

	    // Get Last Challenge Data
		const [_, currentChallenge] = await getLatestChallenge();
		const lastChallengeTime = Number(currentChallenge.createdTimestamp);
	
		// Calculate the minimum time to submit an assertion
		const minimumTimeToSubmit = lastChallengeTime + config.minSecondsBetweenChallenges;

		const isSubmitTime = Math.floor(Date.now() / 1000) > minimumTimeToSubmit;

	return  {isSubmitTime, currentChallenge};
}
