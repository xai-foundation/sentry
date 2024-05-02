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
import { filterItems } from "./utils/filterItems";
import { updateChallenge } from "./utils/updateChallenge";
import { updateSentryWallet } from "./utils/updateSentryWallet";
import { updateSubmission } from "./utils/updateSubmission";

import { Bytes, log } from "@graphprotocol/graph-ts";

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

  //TODO update submissions 
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
  let sentryWallet = SentryWallet.load(event.params.operator.toHexString());


  if (!sentryWallet) {
    sentryWallet = new SentryWallet(event.params.operator.toHexString())
    sentryWallet.address = event.params.operator
    sentryWallet.approvedOwners = []
    sentryWallet.ownedPools = []
  }

  log.warning(`SentryWallet Address: ${sentryWallet.address.toHexString()}`, []);

  let addApprovedOwners: Bytes[] | null = [];
  if (sentryWallet) {
    if (sentryWallet.approvedOwners) {
      addApprovedOwners = sentryWallet.approvedOwners
    }
  }


  if (addApprovedOwners != null && addApprovedOwners.length > 0) {
    log.warning(`Add ApprovedOwners: ${addApprovedOwners[0].toHexString()}`, []);
  }

  if (event.params.approved) {
    if (addApprovedOwners != null && addApprovedOwners.length && addApprovedOwners.indexOf(event.params.owner) == -1) {  // Check if the owner is not already in the array
      addApprovedOwners.push(event.params.owner as Bytes);

      log.warning(`Add ApprovedOwners after push: ${addApprovedOwners[0].toHexString()}`, []);
    }


  } else if (addApprovedOwners != null && addApprovedOwners.length > 0) {
    addApprovedOwners = filterItems(Bytes.fromHexString(event.params.owner.toHexString()), addApprovedOwners);
    log.warning(`Start updating sentryWallet: ${addApprovedOwners[0].toHexString()}`, []);
  }
  sentryWallet.approvedOwners = addApprovedOwners

  sentryWallet = updateSentryWallet(PoolFactory.bind(event.address), sentryWallet)
  sentryWallet.save()
}    