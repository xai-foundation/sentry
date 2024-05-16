import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  FoundationBasepointsUpdated,
  Initialized,
  RedemptionCancelled,
  RedemptionCompleted,
  RedemptionStarted,
  RedemptionStatusChanged,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
  WhitelistUpdated,
  XaiAddressChanged
} from "../generated/EsXai/EsXai"

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createFoundationBasepointsUpdatedEvent(
  newBasepoints: BigInt
): FoundationBasepointsUpdated {
  let foundationBasepointsUpdatedEvent =
    changetype<FoundationBasepointsUpdated>(newMockEvent())

  foundationBasepointsUpdatedEvent.parameters = new Array()

  foundationBasepointsUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newBasepoints",
      ethereum.Value.fromUnsignedBigInt(newBasepoints)
    )
  )

  return foundationBasepointsUpdatedEvent
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

export function createRedemptionCancelledEvent(
  user: Address,
  index: BigInt
): RedemptionCancelled {
  let redemptionCancelledEvent = changetype<RedemptionCancelled>(newMockEvent())

  redemptionCancelledEvent.parameters = new Array()

  redemptionCancelledEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  redemptionCancelledEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )

  return redemptionCancelledEvent
}

export function createRedemptionCompletedEvent(
  user: Address,
  index: BigInt
): RedemptionCompleted {
  let redemptionCompletedEvent = changetype<RedemptionCompleted>(newMockEvent())

  redemptionCompletedEvent.parameters = new Array()

  redemptionCompletedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  redemptionCompletedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )

  return redemptionCompletedEvent
}

export function createRedemptionStartedEvent(
  user: Address,
  index: BigInt
): RedemptionStarted {
  let redemptionStartedEvent = changetype<RedemptionStarted>(newMockEvent())

  redemptionStartedEvent.parameters = new Array()

  redemptionStartedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  redemptionStartedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )

  return redemptionStartedEvent
}

export function createRedemptionStatusChangedEvent(
  isActive: boolean
): RedemptionStatusChanged {
  let redemptionStatusChangedEvent = changetype<RedemptionStatusChanged>(
    newMockEvent()
  )

  redemptionStatusChangedEvent.parameters = new Array()

  redemptionStatusChangedEvent.parameters.push(
    new ethereum.EventParam("isActive", ethereum.Value.fromBoolean(isActive))
  )

  return redemptionStatusChangedEvent
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

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}

export function createWhitelistUpdatedEvent(
  account: Address,
  isAdded: boolean
): WhitelistUpdated {
  let whitelistUpdatedEvent = changetype<WhitelistUpdated>(newMockEvent())

  whitelistUpdatedEvent.parameters = new Array()

  whitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  whitelistUpdatedEvent.parameters.push(
    new ethereum.EventParam("isAdded", ethereum.Value.fromBoolean(isAdded))
  )

  return whitelistUpdatedEvent
}

export function createXaiAddressChangedEvent(
  newXaiAddress: Address
): XaiAddressChanged {
  let xaiAddressChangedEvent = changetype<XaiAddressChanged>(newMockEvent())

  xaiAddressChangedEvent.parameters = new Array()

  xaiAddressChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newXaiAddress",
      ethereum.Value.fromAddress(newXaiAddress)
    )
  )

  return xaiAddressChangedEvent
}
