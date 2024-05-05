import { Address } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent,
} from "../generated/NodeLicense/NodeLicense"
import {
  SentryKey,
  SentryWallet,
} from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
  let sentryWallet = SentryWallet.load(event.params.to.toHexString())
  if (!sentryWallet) {
    sentryWallet = new SentryWallet(event.params.to.toHexString())
    sentryWallet.address = event.params.to
    sentryWallet.approvedOperators = []
    sentryWallet.isKYCApproved = false
    sentryWallet.save();
  }

  let sentryKey = SentryKey.load(event.params.tokenId.toString())
  if (!sentryKey) {
    sentryKey = new SentryKey(event.params.tokenId.toString())
    sentryKey.owner = event.params.to
    sentryKey.keyId = event.params.tokenId
    sentryKey.mintTimeStamp = event.block.timestamp
    sentryKey.sentryWallet = event.params.to.toHexString()
    sentryKey.assignedPool = new Address(0)
    sentryKey.save()
  } else {
    sentryKey.owner = event.params.to
    sentryKey.sentryWallet = event.params.to.toHexString()
    sentryKey.save()
  }
}