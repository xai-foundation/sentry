import {
  Transfer as TransferEvent,
} from "../generated/NodeLicense/NodeLicense"
import {
  NodeLicenseTransferEvent,
  SentryKey,
  SentryWallet,
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

  if (entity.from.toHexString() == "0x0000000000000000000000000000000000000000") {
    //Minted new key
    let sentryKey = new SentryKey(entity.tokenId.toString())
    sentryKey.owner = entity.to
    sentryKey.keyId = entity.tokenId
    sentryKey.mintTimeStamp = entity.blockTimestamp
    sentryKey.submissions = [];
    sentryKey.save()
  }

  let sentryWallet = SentryWallet.load(event.params.to.toHexString());


  if (!sentryWallet) {
    sentryWallet = new SentryWallet(event.params.to.toHexString())
    sentryWallet.address = event.params.to
    sentryWallet.approvedOwners = []
    sentryWallet.ownedPools = []
    sentryWallet.save();
  }

}