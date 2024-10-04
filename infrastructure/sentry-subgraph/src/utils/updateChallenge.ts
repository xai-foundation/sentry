import { Challenge, NodeConfirmation, RefereeConfig } from "../../generated/schema";
import { ChallengeSubmitted, Referee } from "../../generated/Referee/Referee"
import { BigInt, log } from "@graphprotocol/graph-ts";

/**
 * Bind a referee contract and pass in the challenge entity, this function will lookup all necessary data from the contract
 * and update the challenge entity with the new data. This function does not save the entity, if you need it saved, save it
 * after calling this function.
 * 
 * This function also assumes the challenge number is already set on the entity.
 */
export function updateChallenge(referee: Referee, challenge: Challenge, event: ChallengeSubmitted): Challenge {

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

    //return early here because assertion checking was not turned on until this block number
    let firstAssertionCheckingBlockNumber = 176156007;
    if (event.block.number.lt(BigInt.fromI32(firstAssertionCheckingBlockNumber))) {
        return challenge;
    }

    //set challenge id range and load previous challenge entity
    const currentChallengeId = challenge.challengeNumber;
    const previousChallengeId = currentChallengeId.minus(BigInt.fromI32(1));
    const previousChallenge = Challenge.load(previousChallengeId.toString());

    //previous challenge not found, therefore on the first challenge
    //also doubles as a null guard
    if (!previousChallenge) {
        //set challenge field in NodeConfirmed event to challenge id and save
        let nodeConfirmation = NodeConfirmation.load(challenge.assertionId.toString());
        if (!nodeConfirmation) {
            log.warning(`Failed to load nodeConfirmation entity with id: ${challenge.assertionId}`, []);
            return challenge;
        }
        nodeConfirmation.challenge = challenge.id;
        nodeConfirmation.save();
        return challenge;
    }

    //execute based on gap between previous and current assertion id
    const assertionIdGapSize = challenge.assertionId.minus(previousChallenge.assertionId);
    if (assertionIdGapSize.equals(BigInt.fromI32(1))) { //gap size == 1 (no gap)
        //set challenge field in this NodeConfirmation entity
        let nodeConfirmation = NodeConfirmation.load(challenge.assertionId.toString());
        if (!nodeConfirmation) {
            log.warning(`Failed to load nodeConfirmation entity with id: ${challenge.assertionId}`, []);
            return challenge;
        }
        nodeConfirmation.challenge = challenge.id;
        nodeConfirmation.save();
    } else if (assertionIdGapSize.gt(BigInt.fromI32(1))) { //gap size > 1
        const refereeConfig = RefereeConfig.load("RefereeConfig");
        if (!refereeConfig) {
            log.warning("Failed to find refereeConfig", [])
            let nodeConfirmation = NodeConfirmation.load(challenge.assertionId.toString());
            if (!nodeConfirmation) {
                log.warning(`Failed to load nodeConfirmation entity with id: ${challenge.assertionId}`, []);
                return challenge;
            }
            nodeConfirmation.challenge = challenge.id;
            nodeConfirmation.save();
            return challenge;
        }
        if (refereeConfig.version.lt(BigInt.fromI32(6))) {
            let nodeConfirmation = NodeConfirmation.load(challenge.assertionId.toString());
            if (!nodeConfirmation) {
                log.warning(`Failed to load nodeConfirmation entity with id: ${challenge.assertionId}`, []);
                return challenge;
            }
            nodeConfirmation.challenge = challenge.id;
            nodeConfirmation.save();
            return challenge;
        }
        //set challenge field in each NodeConfirmed event in gap
        for (let i = previousChallenge.assertionId; i < challenge.assertionId; i = i.plus(BigInt.fromI32(1))) {
            // setNodeConfirmedChallengeId(i, challenge.id);
            let nodeConfirmation = NodeConfirmation.load(i.toString());
            if (!nodeConfirmation) {
                log.warning(`Failed to load nodeConfirmation entity with id: ${i.toString()}`, []);
                continue;
            }
            nodeConfirmation.challenge = challenge.id;
            nodeConfirmation.save();
        }
    }

    return challenge;
}
