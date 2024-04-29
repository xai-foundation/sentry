import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent,
} from "../generated/NodeLicense/NodeLicense"
import {
  NodeLicenseTransferEvent,
  SentryKey,
} from "../generated/schema"

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

  if (entity.from == new Address(0)) {
    //Minted new key
    let sentryKey = new SentryKey(entity.tokenId.toString())
    sentryKey.owner = entity.to
    sentryKey.keyId = entity.tokenId
    sentryKey.mintTimeStamp = entity.blockTimestamp
    sentryKey.assignedPool = new Address(0)
    sentryKey.submissions = [];
    sentryKey.save()
  }

}