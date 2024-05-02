import { Address, Bytes } from "@graphprotocol/graph-ts";
import {
  StakeKeys,
  UnstakeKeys,
  PoolCreated,
  PoolFactory
} from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  PoolFactoryStakeKeysEvent,
  PoolFactoryUnstakeKeysEvent,
  PoolFactoryPoolCreatedEvent,
  SentryWallet,
} from "../generated/schema"
import { updateSentryWallet } from "./utils/updateSentryWallet";

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

  let sentryWallet = SentryWallet.load(event.params.poolOwner.toHexString());

  if (sentryWallet) {
    sentryWallet = updateSentryWallet(PoolFactory.bind(event.address), sentryWallet);
    sentryWallet.save();
  }

}