import { Challenge } from "../../generated/schema";
import { Referee } from "../../generated/Referee/Referee"

/**
 * Bind a referee contract and pass in the challenge entity, this function will lookup all necessary data from the contract
 * and update the challenge entity with the new data. This function does not save the entity, if you need it saved, save it
 * after calling this function.
 * 
 * This function also assumes the challenge number is already set on the entity.
 */
export function updateChallenge(referee: Referee, challenge: Challenge): Challenge {

    // query for the challenge struct
    let challengeStruct = referee.getChallenge(challenge.challengeNumber);

    // determine the status
    if (challengeStruct.openForSubmissions) {
        challenge.status = "OpenForSubmissions";
    } else {
        challenge.status = "OpenForClaims";
    }

    if (challengeStruct.expiredForRewarding) {
        challenge.status = "Expired";
    }

    // update any static fields
    challenge.assertionId = challengeStruct.assertionId;
    challenge.assertionStateRootOrConfirmData = challengeStruct.assertionStateRootOrConfirmData;
    challenge.assertionTimestamp = challengeStruct.assertionTimestamp;
    challenge.challengerSignedHash = challengeStruct.challengerSignedHash;
    challenge.activeChallengerPublicKey = challengeStruct.activeChallengerPublicKey;
    challenge.rollupUsed = challengeStruct.rollupUsed;
    challenge.createdTimestamp = challengeStruct.createdTimestamp;
    challenge.totalSupplyOfNodesAtChallengeStart = challengeStruct.totalSupplyOfNodesAtChallengeStart;
    challenge.rewardAmountForClaimers = challengeStruct.rewardAmountForClaimers;
    challenge.amountForGasSubsidy = challengeStruct.amountForGasSubsidy;
    challenge.numberOfEligibleClaimers = challengeStruct.numberOfEligibleClaimers;
    challenge.amountClaimedByClaimers = challengeStruct.amountClaimedByClaimers;

    return challenge;
}

