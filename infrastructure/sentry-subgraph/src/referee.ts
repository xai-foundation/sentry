import { PoolFactory } from "../generated/PoolFactory/PoolFactory";
import {
  Referee,
  AssertionSubmitted as AssertionSubmittedEvent,
  ChallengeClosed as ChallengeClosedEvent,
  ChallengeExpired as ChallengeExpiredEvent,
  ChallengeSubmitted as ChallengeSubmittedEvent,
  RewardsClaimed as RewardsClaimedEvent,
  Approval as ApprovalEvent
} from "../generated/Referee/Referee"
import {
  RefereeAssertionSubmittedEvent,
  RefereeChallengeClosedEvent,
  RefereeChallengeExpiredEvent,
  RefereeChallengeSubmittedEvent,
  RefereeRewardsClaimedEvent,
  Challenge,
  RefereeApprovalEvent,
  SentryWallet,
  Submission,
  SentryKey
} from "../generated/schema"
import { updateChallenge } from "./utils/updateChallenge";
import { updateSentryWallet } from "./utils/updateSentryWallet";
import { updateSubmission } from "./utils/updateSubmission";

import { log } from "@graphprotocol/graph-ts";

export function handleAssertionSubmitted(event: AssertionSubmittedEvent): void {
  let entity = new RefereeAssertionSubmittedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.challengeId = event.params.challengeId
  entity.nodeLicenseId = event.params.nodeLicenseId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // query for the challenge and update it
  let challenge = Challenge.load(event.params.challengeId.toString());
  if (challenge) {
    challenge = updateChallenge(Referee.bind(event.address), challenge)
    challenge.save()
  }

  // create new submission and update it
  let submission = new Submission(event.params.nodeLicenseId.toString());
  submission.nodeLicenseId = event.params.nodeLicenseId;

  submission = updateSubmission(Referee.bind(event.address), event.params.challengeId, submission)
  
  submission.save()

  let sentryKey = SentryKey.load(event.params.nodeLicenseId.toString());
  if (sentryKey) {
    let currentSubmissions = sentryKey.submissions;
    if (!currentSubmissions) {
      currentSubmissions = [];
    }
    currentSubmissions.push(submission.id);
    sentryKey.submissions = currentSubmissions;
    sentryKey.save();
  }
}

export function handleChallengeClosed(event: ChallengeClosedEvent): void {
  let entity = new RefereeChallengeClosedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.challengeNumber = event.params.challengeNumber

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // query for the challenge and update it
  let challenge = Challenge.load(event.params.challengeNumber.toString());
  if (challenge) {
    challenge = updateChallenge(Referee.bind(event.address), challenge)
    challenge.save()
  }
}

export function handleChallengeExpired(event: ChallengeExpiredEvent): void {
  let entity = new RefereeChallengeExpiredEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.challengeId = event.params.challengeId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // query for the challenge and update it
  let challenge = Challenge.load(event.params.challengeId.toString());
  if (challenge) {
    challenge = updateChallenge(Referee.bind(event.address), challenge)
    challenge.save()
  }

}

export function handleChallengeSubmitted(event: ChallengeSubmittedEvent): void {

  // process the event entity
  let entity = new RefereeChallengeSubmittedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.challengeNumber = event.params.challengeNumber

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // create an entity for the challenge
  let challenge = new Challenge(event.params.challengeNumber.toString())

  // query the challenge struct from the contract
  let contract = Referee.bind(event.address)

  challenge.challengeNumber = event.params.challengeNumber
  challenge.status = "OpenForSubmissions"

  challenge = updateChallenge(contract, challenge)

  challenge.save()
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  let entity = new RefereeRewardsClaimedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.challengeId = event.params.challengeId
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
  // query for the challenge and update it
  let challenge = Challenge.load(event.params.challengeId.toString());
  if (challenge) {
    challenge = updateChallenge(Referee.bind(event.address), challenge)
    challenge.save()
  }
}

export function handleApproval(event: ApprovalEvent): void {
  let entity = new RefereeApprovalEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  // TODO need to update updateSentryWallet
  
  // let sentryWallet = new SentryWallet(event.params.owner.toString());
  // sentryWallet.address = event.params.owner

  // sentryWallet = updateSentryWallet(Referee.bind(event.address), PoolFactory.bind(event.address), sentryWallet)
  // sentryWallet.save()
}