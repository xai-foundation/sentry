import { StakeKeys, UnstakeKeys } from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  StakeKeysEvent as StakeKeysEventEntity,
  UnstakeKeysEvent as UnstakeKeysEventEntity
} from "../generated/schema"


export function handleStakeKeys(event: StakeKeys): void {
  let entity = new StakeKeysEventEntity(
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

  // let sentryKey = new SentryKey(event.params.)
}

export function handleUnstakeKeys(event: UnstakeKeys): void {
  let entity = new UnstakeKeysEventEntity(
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