import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent,
} from "../generated/NodeLicense/NodeLicense"
import {
  SentryKey,
  SentryWallet,
} from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
  // We need to ignore keys greater than the totalSupply on deploy of the TK airdrop, so they won't get picked up by the operator
  if (event.params.tokenId.gt(BigInt.fromI32(35180))) {
    return;
  }

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
    sentryWallet.totalAccruedAssertionRewards = BigInt.fromI32(0)
  }

  sentryWallet.keyCount = sentryWallet.keyCount.plus(BigInt.fromI32(1))
  sentryWallet.save();

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

  //Decrease the keyCount of the from address if not a mint event
  if (event.params.from != Address.zero()) {
    const fromSentryWallet = SentryWallet.load(event.params.from.toHexString());
    if (fromSentryWallet) {
      fromSentryWallet.keyCount = fromSentryWallet.keyCount.minus(BigInt.fromI32(1));
      fromSentryWallet.save();
    } else {
      log.warning("Failed to find SentryWallet for from address: " + event.params.from.toHexString() + ", TX: " + event.transaction.hash.toHexString(), []);
    }
  }
}