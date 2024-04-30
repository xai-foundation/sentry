import { Address } from "@graphprotocol/graph-ts";
import { StakeKeys, UnstakeKeys, StakeKeysCall, UnstakeKeysCall, PoolCreated, UpdatePoolDelegate } from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  PoolFactoryStakeKeysEvent,
  PoolFactoryUnstakeKeysEvent,
  PoolFactoryPoolCreatedEvent,
  PoolFactoryUpdatePoolDelegateEvent
} from "../generated/schema"

export function handleStakeKeys(event: StakeKeys): void {
  let entity = new PoolFactoryStakeKeysEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.user = event.params.user
  entity.pool = event.params.pool
  entity.amount = event.params.amount
  entity.totalUserKeysStaked = event.params.totalUserKeysStaked
  entity.totalKeysStaked = event.params.totalKeysStaked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUnstakeKeys(event: UnstakeKeys): void {
  let entity = new PoolFactoryUnstakeKeysEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.user = event.params.user
  entity.pool = event.params.pool
  entity.amount = event.params.amount
  entity.totalUserKeysStaked = event.params.totalUserKeysStaked
  entity.totalKeysStaked = event.params.totalKeysStaked

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePoolCreated(event: PoolCreated): void {
  let entity = new PoolFactoryPoolCreatedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.poolIndex = event.params.poolIndex
  entity.poolAddress = event.params.poolAddress
  entity.poolOwner = event.params.poolOwner
  entity.stakedKeyCount = event.params.stakedKeyCount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleUpdatePoolDelegate(event: UpdatePoolDelegate): void {
  let entity = new PoolFactoryUpdatePoolDelegateEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )

  entity.delegate = event.params.delegate
  entity.pool = event.params.pool

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}