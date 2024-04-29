import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent,
} from "../generated/NodeLicense/NodeLicense"
import {
  NodeLicenseTransferEvent,
  SentryKey,
} from "../generated/schema"

import { log } from "@graphprotocol/graph-ts";

export function handleTransfer(event: TransferEvent): void {
  let entity = new NodeLicenseTransferEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  log.info(`${entity.from.toString()}, ${entity.from.toHexString()}, ${(new Address(0x0000000000000000000000000000000000000000)).toString()}`, [])

  if (entity.from.toHexString() == (new Address(0).toHexString())) {
    //Minted new key
    let sentryKey = new SentryKey(entity.tokenId.toString())
    sentryKey.owner = entity.to
    sentryKey.keyId = entity.tokenId
    sentryKey.mintTimeStamp = entity.blockTimestamp
    sentryKey.assignedPool = new Address(0x0000000000000000000000000000000000000000)
    sentryKey.submissions = [];
    sentryKey.save()
  }

}