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
  XaiApproval,
  XaiConvertedToEsXai,
  XaiEsXaiAddressSet,
  XaiInitialized,
  XaiRoleAdminChanged,
  XaiRoleGranted,
  XaiRoleRevoked,
  XaiTransfer,
} from "../generated/schema"

export function handleXaiApproval(event: ApprovalEvent): void {
  let entity = new XaiApproval(
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
  let entity = new XaiConvertedToEsXai(
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
  let entity = new XaiEsXaiAddressSet(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.newEsXaiAddress = event.params.newEsXaiAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleXaiInitialized(event: InitializedEvent): void {
  let entity = new XaiInitialized(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleXaiRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new XaiRoleAdminChanged(
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
  let entity = new XaiRoleGranted(
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
  let entity = new XaiRoleRevoked(
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
  let entity = new XaiTransfer(
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
