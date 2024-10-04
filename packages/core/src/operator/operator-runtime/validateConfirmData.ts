import { Challenge, config, getConfirmDataAndHash, PublicNodeBucketInformation, verifyChallengerSignedHash } from "../../index.js";
import axios from "axios";
import { ethers } from "ethers";


export async function validateConfirmData(
    currentChallenge: Challenge, 
    subgraphIsHealthy: boolean,
    operatorState: {
        previousChallengeAssertionId: BigInt;
        challengerPublicKey: string;
        onAssertionMissMatchCb?: (publicNodeBucket: PublicNodeBucketInformation | undefined, currentChallenge: Challenge, error: string) => void;
        cachedLogger?: (message: string) => void;
        refereeCalculationsAddress: string;
    }, 
    event?: ethers.EventLog,
): Promise<void> {
    const logger = operatorState.cachedLogger || console.log;

        if (event && currentChallenge.rollupUsed === config.rollupAddress) {

            const currentAssertionId = Number(currentChallenge.assertionId);                // Destructure Current Assertion ID     
            let assertionIds: number[] = [];                                                // Create an array to store the assertion IDs  

            // Loop through the assertion IDs and add them to the array
            for (let id = Number(operatorState.previousChallengeAssertionId) + 1; id <= currentAssertionId; id++) {
                assertionIds.push(id);
            }

            const isBatch = assertionIds.length > 1;                                        // Check if the challenge is a batch or single challenge        
            let confirmDataList: string[] = [];                                             // Create an array to store the confirm data for each assertionId    
            
            const errors = [];              

            if (isBatch) {   
                try {
                    const { confirmData, confirmHash } = await getConfirmDataAndHash(assertionIds, subgraphIsHealthy, operatorState.refereeCalculationsAddress);
                    confirmDataList = confirmData;                                                                      // Set the confirm data list  
                    if(confirmHash !== currentChallenge.assertionStateRootOrConfirmData){
                        const errorMessage = `Mismatch between PublicNode and Challenge assertion number '${currentAssertionId}'!`;
                        errors.push({ assertionId: currentAssertionId, publicNodeBucket: undefined, error: errorMessage });
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';               
                    operatorState.onAssertionMissMatchCb?.(undefined, currentChallenge, errorMessage);
                    logger(`Error loading assertion data from CDN for ${currentChallenge.assertionStateRootOrConfirmData}.\n${errorMessage}`);
                    return;
                }                                                    
            } else {
                confirmDataList = [currentChallenge.assertionStateRootOrConfirmData];           // Set the initial confirm data assuming a single challenge
            }


            // Validate the confirm data for each assertionId
            for (let i = 0; i < confirmDataList.length; i++) {
                const confirmData = confirmDataList[i];
                const assertionId = assertionIds[i];

                try {
                    const { publicNodeBucket, error } = await compareWithCDN(assertionId, confirmData, logger);

                    if (error) {
                        errors.push({ assertionId, publicNodeBucket, error });
                    }else{
                        logger(`Comparison between PublicNode and Challenger was successful for assertion ${assertionId}.`);
                    }

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                    errors.push({ assertionId, publicNodeBucket: undefined, error: errorMessage });
                }
            }

            // Verify the Challenger Signed Hash
            const publicKey = operatorState.challengerPublicKey;
            const assertionId = currentChallenge.assertionId;
            const prevAssertionId = operatorState.previousChallengeAssertionId;
            const confirmData = currentChallenge.assertionStateRootOrConfirmData;
            const timestamp = currentChallenge.assertionTimestamp;
            const signature = currentChallenge.challengerSignedHash;

            const signatureIsValid = verifyChallengerSignedHash(publicKey, assertionId, prevAssertionId, confirmData, timestamp, signature);   
            
            if (!signatureIsValid) {
                errors.push({ assertionId: currentAssertionId, publicNodeBucket: undefined, error: 'Challenger signature verification failed.' });
            }

            // Log all errors together
            if (errors.length > 0) {
                const errorLog = errors.map(e => `Assertion ${e.assertionId}: ${e.error}, ${e.publicNodeBucket}`).join('\n');
                operatorState.onAssertionMissMatchCb?.(undefined, currentChallenge, errorLog);
                logger(`Encountered errors during validation:\n${errorLog}`);
            }
        }
}



/**
* Compares a challenge assertion with the data fetched from the public CDN by the public Xai node.
* This function attempts to retrieve the assertion data up to 3 times, with a delay between attempts.
* If successful, it checks if the assertion ID matches the challenge's expected value.
* 
* @param {number} assertionId - The expected assertion ID from the challenge (provided by the Referee contract).
* @param {string} confirmData - The identifier used to fetch assertion data from the CDN.
* @returns {Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }>} 
* A promise that resolves with the public node bucket information. 
* If the assertion ID does not match, an error message is included in the result. 
* Throws an error if the data could not be retrieved after multiple attempts.
* 
* @throws {Error} If the CDN request fails after 3 attempts or if an unexpected error occurs during fetching.
*/
async function compareWithCDN(
    assertionId: number,
    confirmData: string,
    logger: (message: string) => void
): Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }> {

    let attempt = 1;
    let publicNodeBucket: PublicNodeBucketInformation | undefined;
    let lastError;

    while (attempt <= 3) {
        try {
            publicNodeBucket = await getPublicNodeFromBucket(confirmData);
            break;
        } catch (error) {
            logger(`Error loading assertion data from CDN for ${confirmData} with attempt ${attempt}.\n${error}`);
            lastError = error;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds before retrying
    }

    if (!publicNodeBucket) {
        throw new Error(`Failed to retrieve assertion data from CDN for ${confirmData} after ${attempt} attempts.\n${lastError}`);
    }

    if (publicNodeBucket.assertion !== assertionId) {
        return { publicNodeBucket, error: `Mismatch between PublicNode and Challenge assertion number '${assertionId}'!` };
    }

    return { publicNodeBucket }
}

// Helper function to request the assertion from the public node's CDN
async function getPublicNodeFromBucket(confirmHash: string) {
    const url = `https://sentry-public-node.xai.games/assertions/${confirmHash.toLowerCase()}.json`;
    const response = await axios.get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Invalid response status " + response.status);
    }
}

