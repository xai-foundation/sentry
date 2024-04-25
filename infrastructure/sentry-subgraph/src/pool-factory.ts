import { Address } from "@graphprotocol/graph-ts";
import { StakeKeys, UnstakeKeys, StakeKeysCall, UnstakeKeysCall } from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  StakeKeysEvent as StakeKeysEventEntity,
  UnstakeKeysEvent as UnstakeKeysEventEntity
} from "../generated/schema"


export function handleStakeKeysCall(call: StakeKeysCall): void {
  // entity.pool = call.inputs.pool
  //TODO we will have to update the Pool entity here!

  let keyIds = call.inputs.keyIds;

  for (let i = 0; i < keyIds.length; i++) {

    let sentryKey = SentryKey.load(keyIds[i].toString());

    //SentryKey Entity needs to be created on mint!
    if (sentryKey) {
      sentryKey.assignedPool = call.inputs.pool;
      sentryKey.save()
    }
  }
}


export function handleUnstakeKeysCall(call: UnstakeKeysCall): void {
  // entity.pool = call.inputs.pool
  //TODO we will have to update the Pool entity here!

  let keyIds = call.inputs.keyIds;

  for (let i = 0; i < keyIds.length; i++) {

    let sentryKey = SentryKey.load(keyIds[i].toString());

    //SentryKey Entity needs to be created on mint!
    if (sentryKey) {
      sentryKey.assignedPool = new Address(0);
      sentryKey.save()
    }

  }

  // Proceed with your logic using keyIds...
}

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