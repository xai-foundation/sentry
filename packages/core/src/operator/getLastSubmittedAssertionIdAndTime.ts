import { ethers } from "ethers";
import { RefereeAbi } from "../abis/index.js";
import { config } from "../config.js";
import { getProvider } from "../index.js";
import { Challenge } from "../index.js";

/**
 * Retrieves the last submitted assertion ID and the associated timestamp.
 *
 * This function interacts with a smart contract (the "Referee" contract) to get the most recent 
 * assertion ID and the time when the assertion was submitted. The assertion ID is determined 
 * by the current challenge counter in the contract, and the time is derived from the 
 * assertion's timestamp in the challenge.
 *
 * @returns {Promise<{ assertionId: number, time: number }>} 
 * An object containing the last assertion ID (`assertionId`) and the associated timestamp (`time`).
 */
export async function getLastSubmittedAssertionIdAndTime(): Promise<{ assertionId: number, time: number }> {
    
    // Get the Ethereum provider instance using a custom utility function
    const provider = getProvider();
    
    // Create a new instance of the Referee contract with the provided ABI and provider
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, provider);
    
    // Retrieve the current challenge counter from the contract
    // This counter indicates the number of challenges submitted so far
    const counter = await refereeContract.challengeCounter();
    
    // Calculate the assertion ID for the last submitted challenge
    // The assertion ID is one less than the current counter
    const assertionId = Number((counter - BigInt(1))).valueOf(); 
    
    // Fetch the details of the challenge associated with the last assertion ID
    const challenge: Challenge = await refereeContract.challenges(assertionId);
    
    // Extract and convert the assertion timestamp to a JavaScript Number
    const time = Number(challenge.assertionTimestamp).valueOf();
    
    // Return the assertion ID and the timestamp as an object
    return { assertionId, time };
}
