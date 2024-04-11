import {
  Referee,
  Approval as ApprovalEvent,
  AssertionCheckingToggled as AssertionCheckingToggledEvent,
  AssertionSubmitted as AssertionSubmittedEvent,
  ChallengeClosed as ChallengeClosedEvent,
  ChallengeExpired as ChallengeExpiredEvent,
  ChallengeSubmitted as ChallengeSubmittedEvent,
  ChallengerPublicKeyChanged as ChallengerPublicKeyChangedEvent,
  Initialized as InitializedEvent,
  InvalidSubmission as InvalidSubmissionEvent,
  KycStatusChanged as KycStatusChangedEvent,
  NodeLicenseAddressChanged as NodeLicenseAddressChangedEvent,
  RewardsClaimed as RewardsClaimedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  RollupAddressChanged as RollupAddressChangedEvent,
  StakedV1 as StakedV1Event,
  StakingEnabled as StakingEnabledEvent,
  UnstakeV1 as UnstakeV1Event,
  UpdateMaxStakeAmount as UpdateMaxStakeAmountEvent,
} from "../generated/Referee/Referee"
import {
  RefereeApprovalEvent,
  RefereeAssertionCheckingToggledEvent,
  RefereeAssertionSubmittedEvent,
  RefereeChallengeClosedEvent,
  RefereeChallengeExpiredEvent,
  RefereeChallengeSubmittedEvent,
  RefereeChallengerPublicKeyChangedEvent,
  RefereeInitializedEvent,
  RefereeInvalidSubmissionEvent,
  RefereeKycStatusChangedEvent,
  RefereeNodeLicenseAddressChangedEvent,
  RefereeRewardsClaimedEvent,
  RefereeRoleAdminChangedEvent,
  RefereeRoleGrantedEvent,
  RefereeRoleRevokedEvent,
  RefereeRollupAddressChangedEvent,
  RefereeStakedV1Event,
  RefereeStakingEnabledEvent,
  RefereeUnstakeV1Event,
  RefereeUpdateMaxStakeAmountEvent,
  Challenge
} from "../generated/schema"
import { Bytes } from "@graphprotocol/graph-ts";
import { updateChallenge } from "./utils/updateChallenge";

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
}

export function handleAssertionCheckingToggled(
  event: AssertionCheckingToggledEvent,
): void {
  let entity = new RefereeAssertionCheckingToggledEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newState = event.params.newState

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

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

export function handleChallengerPublicKeyChanged(
  event: ChallengerPublicKeyChangedEvent,
): void {
  let entity = new RefereeChallengerPublicKeyChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newChallengerPublicKey = event.params.newChallengerPublicKey

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new RefereeInitializedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInvalidSubmission(event: InvalidSubmissionEvent): void {
  let entity = new RefereeInvalidSubmissionEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.challengeId = event.params.challengeId
  entity.nodeLicenseId = event.params.nodeLicenseId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleKycStatusChanged(event: KycStatusChangedEvent): void {
  let entity = new RefereeKycStatusChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.wallet = event.params.wallet
  entity.isKycApproved = event.params.isKycApproved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleNodeLicenseAddressChanged(
  event: NodeLicenseAddressChangedEvent,
): void {
  let entity = new RefereeNodeLicenseAddressChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newNodeLicenseAddress = event.params.newNodeLicenseAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
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

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RefereeRoleAdminChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RefereeRoleGrantedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RefereeRoleRevokedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRollupAddressChanged(
  event: RollupAddressChangedEvent,
): void {
  let entity = new RefereeRollupAddressChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newRollupAddress = event.params.newRollupAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakedV1(event: StakedV1Event): void {
  let entity = new RefereeStakedV1Event(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.totalStaked = event.params.totalStaked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleStakingEnabled(event: StakingEnabledEvent): void {
  let entity = new RefereeStakingEnabledEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnstakeV1(event: UnstakeV1Event): void {
  let entity = new RefereeUnstakeV1Event(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.amount = event.params.amount
  entity.totalStaked = event.params.totalStaked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpdateMaxStakeAmount(
  event: UpdateMaxStakeAmountEvent,
): void {
  let entity = new RefereeUpdateMaxStakeAmountEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.prevAmount = event.params.prevAmount
  entity.newAmount = event.params.newAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
