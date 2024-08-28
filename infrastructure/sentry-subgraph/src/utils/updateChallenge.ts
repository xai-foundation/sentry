import { Challenge, NodeConfirmation } from "../../generated/schema";
import { Referee } from "../../generated/Referee/Referee"
import { BigInt, log } from "@graphprotocol/graph-ts";

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

    //initialize nodeConfirmations field
    challenge.nodeConfirmations = [];

    //set challenge id range and load previous challenge entity
    const currentChallengeId = challenge.challengeNumber;
    const previousChallengeId = currentChallengeId.minus(BigInt.fromI32(1));
    const previousChallenge = Challenge.load(previousChallengeId.toString());

    //previous challenge not found, therefore on the first challenge
    if (!previousChallenge) {
        challenge.nodeConfirmations = [challenge.assertionId.toString()];
        return challenge;
    }

    //execute based on gap between previous and current assertion id
    const assertionIdGapSize = challenge.assertionId.minus(previousChallenge.assertionId);
    if (assertionIdGapSize.equals(BigInt.fromI32(1))) { //gap == 1 (no gap)
        //push single nodeConfirmed event into array
        challenge.nodeConfirmations = [challenge.assertionId.toString()];
    } else if (assertionIdGapSize.gt(BigInt.fromI32(1))) { //gap > 1
        //push multiple nodeConfirmed events into array
        let tempArray: string[] = [];
        for (let i = previousChallenge.assertionId; i < challenge.assertionId; i = i.plus(BigInt.fromI32(1))) {
            tempArray.push(i.toString());
        }
        challenge.nodeConfirmations = tempArray;
    }

    return challenge;
}

