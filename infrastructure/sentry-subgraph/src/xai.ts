import {
  Approval as ApprovalEvent,
  ConvertedToEsXai as ConvertedToEsXaiEvent,
  EsXaiAddressSet as EsXaiAddressSetEvent,
  Initialized as InitializedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Transfer as TransferEvent,
} from "../generated/Xai/Xai"
import {
  XaiApprovalEvent,
  XaiConvertedToEsXaiEvent,
  XaiEsXaiAddressSetEvent,
  XaiInitializedEvent,
  XaiRoleAdminChangedEvent,
  XaiRoleGrantedEvent,
  XaiRoleRevokedEvent,
  XaiTransferEvent,
} from "../generated/schema"

export function handleXaiApproval(event: ApprovalEvent): void {
  let entity = new XaiApprovalEvent(
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

export function handleXaiConvertedToEsXai(event: ConvertedToEsXaiEvent): void {
  let entity = new XaiConvertedToEsXaiEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.user = event.params.user
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleXaiEsXaiAddressSet(event: EsXaiAddressSetEvent): void {
  let entity = new XaiEsXaiAddressSetEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newEsXaiAddress = event.params.newEsXaiAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleXaiInitialized(event: InitializedEvent): void {
  let entity = new XaiInitializedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleXaiRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new XaiRoleAdminChangedEvent(
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

export function handleXaiRoleGranted(event: RoleGrantedEvent): void {
  let entity = new XaiRoleGrantedEvent(
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

export function handleXaiRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new XaiRoleRevokedEvent(
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

export function handleXaiTransfer(event: TransferEvent): void {
  let entity = new XaiTransferEvent(
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
