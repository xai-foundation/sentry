import {
  Approval as ApprovalEvent,
  FoundationBasepointsUpdated as FoundationBasepointsUpdatedEvent,
  Initialized as InitializedEvent,
  RedemptionCancelled as RedemptionCancelledEvent,
  RedemptionCompleted as RedemptionCompletedEvent,
  RedemptionStarted as RedemptionStartedEvent,
  RedemptionStatusChanged as RedemptionStatusChangedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Transfer as TransferEvent,
  WhitelistUpdated as WhitelistUpdatedEvent,
  XaiAddressChanged as XaiAddressChangedEvent,
} from "../generated/EsXai/EsXai"
import {
  EsXaiApprovalEvent,
  EsXaiFoundationBasepointsUpdatedEvent,
  EsXaiInitializedEvent,
  EsXaiRedemptionCancelledEvent,
  EsXaiRedemptionCompletedEvent,
  EsXaiRedemptionStartedEvent,
  EsXaiRedemptionStatusChangedEvent,
  EsXaiRoleAdminChangedEvent,
  EsXaiRoleGrantedEvent,
  EsXaiRoleRevokedEvent,
  EsXaiTransferEvent,
  EsXaiWhitelistUpdatedEvent,
  EsXaiXaiAddressChangedEvent,
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new EsXaiApprovalEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.spender = event.params.spender
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFoundationBasepointsUpdated(
  event: FoundationBasepointsUpdatedEvent,
): void {
  let entity = new EsXaiFoundationBasepointsUpdatedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newBasepoints = event.params.newBasepoints

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new EsXaiInitializedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedemptionCancelled(
  event: RedemptionCancelledEvent,
): void {
  let entity = new EsXaiRedemptionCancelledEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.index = event.params.index

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedemptionCompleted(
  event: RedemptionCompletedEvent,
): void {
  let entity = new EsXaiRedemptionCompletedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.index = event.params.index

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedemptionStarted(event: RedemptionStartedEvent): void {
  let entity = new EsXaiRedemptionStartedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.index = event.params.index

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRedemptionStatusChanged(
  event: RedemptionStatusChangedEvent,
): void {
  let entity = new EsXaiRedemptionStatusChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.isActive = event.params.isActive

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new EsXaiRoleAdminChangedEvent(
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
  let entity = new EsXaiRoleGrantedEvent(
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
  let entity = new EsXaiRoleRevokedEvent(
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

export function handleTransfer(event: TransferEvent): void {
  let entity = new EsXaiTransferEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWhitelistUpdated(event: WhitelistUpdatedEvent): void {
  let entity = new EsXaiWhitelistUpdatedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.account = event.params.account
  entity.isAdded = event.params.isAdded

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleXaiAddressChanged(event: XaiAddressChangedEvent): void {
  let entity = new EsXaiXaiAddressChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newXaiAddress = event.params.newXaiAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
