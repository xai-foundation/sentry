import { ethers } from "ethers";
import { Challenge, RefereeAbi, config, listChallenges, listNodeLicenses, listOwnersForOperator, listenForChallenges } from "../index.js";

/**
 * Operator runtime function.
 * @param {ethers.Signer} signer - The signer.
 * @returns {Promise<() => Promise<void>>} The stop function.
 */
export async function operatorRuntime(signer: ethers.Signer): Promise<() => Promise<void>> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // get the address of the operator
    const operatorAddress = await signer.getAddress();

    // get a list of all the owners that are added to this operator
    const owners = await listOwnersForOperator(operatorAddress);

    // get a list of all the node licenses for each of the owners
    let nodeLicenseIds: bigint[] = [];
    for (const owner of owners) {
        const licensesOfOwner = await listNodeLicenses(owner);
        nodeLicenseIds = [...nodeLicenseIds, ...licensesOfOwner];
    }

    // function to process the challenge for all the nodeLicenses
    async function processNewChallenge(challengeNumber: bigint, challenge: Challenge) {
        for (const nodeLicenseId of nodeLicenseIds) {

            // check the nodeLicense is eligible to submit to this challenge, it must have been minted, before the challenge was opened.
            // TODO

            // check to see if this nodeLicense would be eligible for a claim, if they are not, then go to next license.
            const [eligibleForClaim] = await refereeContract.createAssertionHashAndCheckPayout(nodeLicenseId, challengeNumber, "0x");
            if (!eligibleForClaim) {
                continue;
            }

            // check to see if this nodeLicense has already submitted, if we have, then go to next license
            // TODO

            // submit the claim to the challenge
            await refereeContract.sub
            
        }
    }

    // start a listener for new challenges
    const challengeNumberMap: { [challengeNumber: string]: boolean } = {};
    function listenForChallengesCallback(challengeNumber: bigint, challenge: Challenge) {
        if (!challengeNumberMap[challengeNumber.toString()]) {
            challengeNumberMap[challengeNumber.toString()] = true;
            processNewChallenge(challengeNumber, challenge);
        }
    }
    const closeChallengeListener = await listenForChallenges(listenForChallengesCallback);

    // find any open challenges
    void listChallenges(true, listenForChallengesCallback);

    async function stop() {
        await closeChallengeListener
    }

    return stop;
}