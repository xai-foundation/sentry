import {
  Referee,
  AssertionSubmitted as AssertionSubmittedEvent,
  ChallengeClosed as ChallengeClosedEvent,
  ChallengeExpired as ChallengeExpiredEvent,
  ChallengeSubmitted as ChallengeSubmittedEvent,
  RewardsClaimed as RewardsClaimedEvent,
} from "../generated/Referee/Referee"
import {
  RefereeAssertionSubmittedEvent,
  RefereeChallengeClosedEvent,
  RefereeChallengeExpiredEvent,
  RefereeChallengeSubmittedEvent,
  RefereeRewardsClaimedEvent,
  Challenge
} from "../generated/schema"
import { updateChallenge } from "./utils/updateChallenge";

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

  // query for the challenge and update it
  let challenge = Challenge.load(event.params.challengeId.toString());
  if (challenge) {
    challenge = updateChallenge(Referee.bind(event.address), challenge)
    challenge.save()
  }

  entity.save()
}