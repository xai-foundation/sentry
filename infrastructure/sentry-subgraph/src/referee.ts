import {
  Referee,
  AssertionSubmitted as AssertionSubmittedEvent,
  ChallengeClosed as ChallengeClosedEvent,
  ChallengeExpired as ChallengeExpiredEvent,
  ChallengeSubmitted as ChallengeSubmittedEvent,
  RewardsClaimed as RewardsClaimedEvent,
  BatchRewardsClaimed as BatchRewardsClaimedEvent,
  Approval as ApprovalEvent,
  KycStatusChanged as KycStatusChangedEvent
} from "../generated/Referee/Referee"
import {
  Challenge,
  SentryWallet,
  Submission,
  SentryKey
} from "../generated/schema"
import { getInputFromEvent } from "./utils/getInputFromEvent"
import { updateChallenge } from "./utils/updateChallenge"

import { log, ethereum, BigInt } from "@graphprotocol/graph-ts"

export function handleAssertionSubmitted(event: AssertionSubmittedEvent): void {
  let submission = new Submission(event.params.challengeId.toString() + event.params.nodeLicenseId.toString())
  submission.nodeLicenseId = event.params.nodeLicenseId
  submission.challengeNumber = event.params.challengeId
  submission.claimed = false
  submission.claimAmount = BigInt.fromI32(0)

  let submissionStruct = Referee.bind(event.address).getSubmissionsForChallenges([event.params.challengeId], event.params.nodeLicenseId);
  submission.eligibleForPayout = submissionStruct[0].eligibleForPayout
  submission.assertionsStateRootOrConfirmData = submissionStruct[0].assertionStateRootOrConfirmData.toHexString()

  const sentryKey = SentryKey.load(event.params.nodeLicenseId.toString())
  if (sentryKey) {
    submission.sentryKey = event.params.nodeLicenseId.toString()
    submission.save()
  }

  if (submission.eligibleForPayout) {
    const challenge = Challenge.load(event.params.challengeId.toString())
    if (challenge) {
      challenge.numberOfEligibleClaimers = challenge.numberOfEligibleClaimers.plus(BigInt.fromI32(1))
      challenge.save()
    }
  }
}

export function handleChallengeClosed(event: ChallengeClosedEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeNumber.toString())
  if (challenge) {
    challenge.status = "OpenForClaims"
    challenge.save()
  }
}

export function handleChallengeExpired(event: ChallengeExpiredEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge) {
    challenge.status = "Expired"
    challenge.save()
  }
}

export function handleChallengeSubmitted(event: ChallengeSubmittedEvent): void {
  // create an entity for the challenge
  let challenge = new Challenge(event.params.challengeNumber.toString())

  // query the challenge struct from the contract
  const contract = Referee.bind(event.address)

  challenge.challengeNumber = event.params.challengeNumber
  challenge.status = "OpenForSubmissions"

  challenge = updateChallenge(contract, challenge)

  challenge.save()
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  // query for the challenge and update it
  let challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge) {
    challenge.amountClaimedByClaimers = challenge.amountClaimedByClaimers.plus(event.params.amount)
    challenge.save()

    const dataToDecode = getInputFromEvent(event)
    const decoded = ethereum.decode('(uint256,uint256)', dataToDecode)
    if (decoded) {
      const nodeLicenseId = decoded.toTuple()[0].toBigInt()
      const submission = Submission.load(event.params.challengeId.toString() + nodeLicenseId.toString())
      if (submission) {
        submission.claimed = true
        submission.claimAmount = event.params.amount
        submission.save()
      }
    }
  }

}

export function handleBatchRewardsClaimed(event: BatchRewardsClaimedEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge) {
    const dataToDecode = getInputFromEvent(event)
    const decoded = ethereum.decode('(uint256[],uint256,address)', dataToDecode)
    if (decoded) {
      const nodeLicenseIds = decoded.toTuple()[0].toBigIntArray()
      const reward = challenge.rewardAmountForClaimers.div(challenge.numberOfEligibleClaimers)

      for (let i = 0; i < nodeLicenseIds.length; i++) {
        const submission = Submission.load(event.params.challengeId.toString() + nodeLicenseIds[i].toString())
        const sentryKey = SentryKey.load(nodeLicenseIds[i].toString())

        if (sentryKey && submission) {
          const ownerWallet = SentryWallet.load(sentryKey.sentryWallet)
          if (ownerWallet) {
            if (
              ownerWallet.isKYCApproved &&
              sentryKey.mintTimeStamp < challenge.createdTimestamp &&
              !submission.claimed &&
              submission.eligibleForPayout
            ) {

              challenge.amountClaimedByClaimers = challenge.amountClaimedByClaimers.plus(reward)
              challenge.save()

              submission.claimed = true
              submission.claimAmount = reward
              submission.save()
            }
          }
        }
      }
    }
  }
}

export function handleKycStatusChanged(event: KycStatusChangedEvent): void {
  let sentryWallet = SentryWallet.load(event.params.wallet.toHexString())
  if (!sentryWallet) {
    sentryWallet = new SentryWallet(event.params.wallet.toHexString())
    sentryWallet.address = event.params.wallet
    sentryWallet.approvedOperators = []
  }
  sentryWallet.isKYCApproved = event.params.isKycApproved
  sentryWallet.save()
}

export function handleApproval(event: ApprovalEvent): void {

  let sentryWallet = SentryWallet.load(event.params.owner.toHexString())

  if (!sentryWallet) {
    sentryWallet = new SentryWallet(event.params.owner.toHexString())
    sentryWallet.address = event.params.owner
    sentryWallet.isKYCApproved = false
    sentryWallet.approvedOperators = []
  }

  const addApprovedOperators = sentryWallet.approvedOperators
  if (event.params.approved) {
    if (addApprovedOperators.indexOf(event.params.operator) == -1) {  // Check if the owner is not already in the array
      addApprovedOperators.push(event.params.operator)
      sentryWallet.approvedOperators = addApprovedOperators
      sentryWallet.save()
    }
  } else {
    const indexOfOperator = addApprovedOperators.indexOf(event.params.operator);
    if (indexOfOperator != -1) {
      addApprovedOperators.splice(indexOfOperator, 1)
      sentryWallet.approvedOperators = addApprovedOperators
      sentryWallet.save()
    }
  }
}