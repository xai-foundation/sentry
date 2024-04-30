import { Submission } from "../../generated/schema";
import { Referee } from "../../generated/Referee/Referee"
import { BigInt } from "@graphprotocol/graph-ts";

/**
 * Bind a referee contract and pass in the submission entity, this function will lookup all necessary data from the contract
 * and update the submission entity with the new data. This function does not save the entity, if you need it saved, save it
 * after calling this function.
 * 
 * This function also assumes the submission number is already set on the entity.
 */
export function updateSubmission(referee: Referee, challengeId: BigInt, submission: Submission): Submission {


    // query for the challenge struct
    let submissionStruct = referee.getSubmissionsForChallenges([challengeId], submission.nodeLicenseId);

    if (submissionStruct.length) {
        // update any static fields
        submission.submitted = submissionStruct[0].submitted;
        submission.claimed = submissionStruct[0].claimed;
        submission.eligibleForPayout = submissionStruct[0].eligibleForPayout;
        submission.assertionsStateRootOrConfirmData = submissionStruct[0].assertionStateRootOrConfirmData.toString();
    }

    return submission;
}