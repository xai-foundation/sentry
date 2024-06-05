import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  AssertionCheckingToggled,
  AssertionSubmitted,
  ChallengeClosed,
  ChallengeExpired,
  ChallengeSubmitted,
  ChallengerPublicKeyChanged,
  Initialized,
  InvalidSubmission,
  KycStatusChanged,
  NodeLicenseAddressChanged,
  RewardsClaimed,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  RollupAddressChanged,
  StakedV1,
  StakingEnabled,
  UnstakeV1,
  UpdateMaxStakeAmount
} from "../generated/Referee/Referee"

export function createApprovalEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalEvent
}

export function createAssertionCheckingToggledEvent(
  newState: boolean
): AssertionCheckingToggled {
  let assertionCheckingToggledEvent = changetype<AssertionCheckingToggled>(
    newMockEvent()
  )

  assertionCheckingToggledEvent.parameters = new Array()

  assertionCheckingToggledEvent.parameters.push(
    new ethereum.EventParam("newState", ethereum.Value.fromBoolean(newState))
  )

  return assertionCheckingToggledEvent
}

export function createAssertionSubmittedEvent(
  challengeId: BigInt,
  nodeLicenseId: BigInt
): AssertionSubmitted {
  let assertionSubmittedEvent = changetype<AssertionSubmitted>(newMockEvent())

  assertionSubmittedEvent.parameters = new Array()

  assertionSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  assertionSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "nodeLicenseId",
      ethereum.Value.fromUnsignedBigInt(nodeLicenseId)
    )
  )

  return assertionSubmittedEvent
}

export function createChallengeClosedEvent(
  challengeNumber: BigInt
): ChallengeClosed {
  let challengeClosedEvent = changetype<ChallengeClosed>(newMockEvent())

  challengeClosedEvent.parameters = new Array()

  challengeClosedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeNumber",
      ethereum.Value.fromUnsignedBigInt(challengeNumber)
    )
  )

  return challengeClosedEvent
}

export function createChallengeExpiredEvent(
  challengeId: BigInt
): ChallengeExpired {
  let challengeExpiredEvent = changetype<ChallengeExpired>(newMockEvent())

  challengeExpiredEvent.parameters = new Array()

  challengeExpiredEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )

  return challengeExpiredEvent
}

export function createChallengeSubmittedEvent(
  challengeNumber: BigInt
): ChallengeSubmitted {
  let challengeSubmittedEvent = changetype<ChallengeSubmitted>(newMockEvent())

  challengeSubmittedEvent.parameters = new Array()

  challengeSubmittedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeNumber",
      ethereum.Value.fromUnsignedBigInt(challengeNumber)
    )
  )

  return challengeSubmittedEvent
}

export function createChallengerPublicKeyChangedEvent(
  newChallengerPublicKey: Bytes
): ChallengerPublicKeyChanged {
  let challengerPublicKeyChangedEvent = changetype<ChallengerPublicKeyChanged>(
    newMockEvent()
  )

  challengerPublicKeyChangedEvent.parameters = new Array()

  challengerPublicKeyChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newChallengerPublicKey",
      ethereum.Value.fromBytes(newChallengerPublicKey)
    )
  )

  return challengerPublicKeyChangedEvent
}

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}

export function createInvalidSubmissionEvent(
  challengeId: BigInt,
  nodeLicenseId: BigInt
): InvalidSubmission {
  let invalidSubmissionEvent = changetype<InvalidSubmission>(newMockEvent())

  invalidSubmissionEvent.parameters = new Array()

  invalidSubmissionEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  invalidSubmissionEvent.parameters.push(
    new ethereum.EventParam(
      "nodeLicenseId",
      ethereum.Value.fromUnsignedBigInt(nodeLicenseId)
    )
  )

  return invalidSubmissionEvent
}

export function createKycStatusChangedEvent(
  wallet: Address,
  isKycApproved: boolean
): KycStatusChanged {
  let kycStatusChangedEvent = changetype<KycStatusChanged>(newMockEvent())

  kycStatusChangedEvent.parameters = new Array()

  kycStatusChangedEvent.parameters.push(
    new ethereum.EventParam("wallet", ethereum.Value.fromAddress(wallet))
  )
  kycStatusChangedEvent.parameters.push(
    new ethereum.EventParam(
      "isKycApproved",
      ethereum.Value.fromBoolean(isKycApproved)
    )
  )

  return kycStatusChangedEvent
}

export function createNodeLicenseAddressChangedEvent(
  newNodeLicenseAddress: Address
): NodeLicenseAddressChanged {
  let nodeLicenseAddressChangedEvent = changetype<NodeLicenseAddressChanged>(
    newMockEvent()
  )

  nodeLicenseAddressChangedEvent.parameters = new Array()

  nodeLicenseAddressChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newNodeLicenseAddress",
      ethereum.Value.fromAddress(newNodeLicenseAddress)
    )
  )

  return nodeLicenseAddressChangedEvent
}

export function createRewardsClaimedEvent(
  challengeId: BigInt,
  amount: BigInt
): RewardsClaimed {
  let rewardsClaimedEvent = changetype<RewardsClaimed>(newMockEvent())

  rewardsClaimedEvent.parameters = new Array()

  rewardsClaimedEvent.parameters.push(
    new ethereum.EventParam(
      "challengeId",
      ethereum.Value.fromUnsignedBigInt(challengeId)
    )
  )
  rewardsClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return rewardsClaimedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createRollupAddressChangedEvent(
  newRollupAddress: Address
): RollupAddressChanged {
  let rollupAddressChangedEvent = changetype<RollupAddressChanged>(
    newMockEvent()
  )

  rollupAddressChangedEvent.parameters = new Array()

  rollupAddressChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newRollupAddress",
      ethereum.Value.fromAddress(newRollupAddress)
    )
  )

  return rollupAddressChangedEvent
}

export function createStakedV1Event(
  user: Address,
  amount: BigInt,
  totalStaked: BigInt
): StakedV1 {
  let stakedV1Event = changetype<StakedV1>(newMockEvent())

  stakedV1Event.parameters = new Array()

  stakedV1Event.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  stakedV1Event.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  stakedV1Event.parameters.push(
    new ethereum.EventParam(
      "totalStaked",
      ethereum.Value.fromUnsignedBigInt(totalStaked)
    )
  )

  return stakedV1Event
}

export function createStakingEnabledEvent(): StakingEnabled {
  let stakingEnabledEvent = changetype<StakingEnabled>(newMockEvent())

  stakingEnabledEvent.parameters = new Array()

  return stakingEnabledEvent
}

export function createUnstakeV1Event(
  user: Address,
  amount: BigInt,
  totalStaked: BigInt
): UnstakeV1 {
  let unstakeV1Event = changetype<UnstakeV1>(newMockEvent())

  unstakeV1Event.parameters = new Array()

  unstakeV1Event.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  unstakeV1Event.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  unstakeV1Event.parameters.push(
    new ethereum.EventParam(
      "totalStaked",
      ethereum.Value.fromUnsignedBigInt(totalStaked)
    )
  )

  return unstakeV1Event
}

export function createUpdateMaxStakeAmountEvent(
  prevAmount: BigInt,
  newAmount: BigInt
): UpdateMaxStakeAmount {
  let updateMaxStakeAmountEvent = changetype<UpdateMaxStakeAmount>(
    newMockEvent()
  )

  updateMaxStakeAmountEvent.parameters = new Array()

  updateMaxStakeAmountEvent.parameters.push(
    new ethereum.EventParam(
      "prevAmount",
      ethereum.Value.fromUnsignedBigInt(prevAmount)
    )
  )
  updateMaxStakeAmountEvent.parameters.push(
    new ethereum.EventParam(
      "newAmount",
      ethereum.Value.fromUnsignedBigInt(newAmount)
    )
  )

  return updateMaxStakeAmountEvent
}
