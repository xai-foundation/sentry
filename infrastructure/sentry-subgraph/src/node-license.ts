import { Address, BigInt } from "@graphprotocol/graph-ts"
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
    sentryWallet.v1EsXaiStakeAmount = BigInt.fromI32(0)
    sentryWallet.esXaiStakeAmount = BigInt.fromI32(0)
    sentryWallet.keyCount = BigInt.fromI32(0)
    sentryWallet.stakedKeyCount = BigInt.fromI32(0)
  }
  
  sentryWallet.keyCount = sentryWallet.keyCount.plus(BigInt.fromI32(1))
  sentryWallet.save();

  //TODO should keys ever be transferable we need to decrease the keyCount of the from address

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