import { Address } from "@graphprotocol/graph-ts"
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  ClaimableChanged as ClaimableChangedEvent,
  FundsReceiverChanged as FundsReceiverChangedEvent,
  FundsWithdrawn as FundsWithdrawnEvent,
  Initialized as InitializedEvent,
  PricingTierSetOrAdded as PricingTierSetOrAddedEvent,
  PromoCodeCreated as PromoCodeCreatedEvent,
  PromoCodeRemoved as PromoCodeRemovedEvent,
  ReferralReward as ReferralRewardEvent,
  ReferralRewardPercentagesChanged as ReferralRewardPercentagesChangedEvent,
  RefundOccurred as RefundOccurredEvent,
  RewardClaimed as RewardClaimedEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  Transfer as TransferEvent,
  WhitelistAmountRedeemed as WhitelistAmountRedeemedEvent,
  WhitelistAmountUpdatedByAdmin as WhitelistAmountUpdatedByAdminEvent,
} from "../generated/NodeLicense/NodeLicense"
import {
  NodeLicenseApprovalEvent,
  NodeLicenseApprovalForAllEvent,
  NodeLicenseClaimableChangedEvent,
  NodeLicenseFundsReceiverChangedEvent,
  NodeLicenseFundsWithdrawnEvent,
  NodeLicenseInitializedEvent,
  NodeLicensePricingTierSetOrAddedEvent,
  NodeLicensePromoCodeCreatedEvent,
  NodeLicensePromoCodeRemovedEvent,
  NodeLicenseReferralRewardEvent,
  NodeLicenseReferralRewardPercentagesChangedEvent,
  NodeLicenseRefundOccurredEvent,
  NodeLicenseRewardClaimedEvent,
  NodeLicenseRoleAdminChangedEvent,
  NodeLicenseRoleGrantedEvent,
  NodeLicenseRoleRevokedEvent,
  NodeLicenseTransferEvent,
  NodeLicenseWhitelistAmountRedeemedEvent,
  NodeLicenseWhitelistAmountUpdatedByAdminEvent,
  SentryKey,
} from "../generated/schema"

export function handleApproval(event: ApprovalEvent): void {
  let entity = new NodeLicenseApprovalEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.approved = event.params.approved
  entity.tokenId = event.params.tokenId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleApprovalForAll(event: ApprovalForAllEvent): void {
  let entity = new NodeLicenseApprovalForAllEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.approved = event.params.approved

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleClaimableChanged(event: ClaimableChangedEvent): void {
  let entity = new NodeLicenseClaimableChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.admin = event.params.admin
  entity.newClaimableState = event.params.newClaimableState

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFundsReceiverChanged(
  event: FundsReceiverChangedEvent,
): void {
  let entity = new NodeLicenseFundsReceiverChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.admin = event.params.admin
  entity.newFundsReceiver = event.params.newFundsReceiver

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFundsWithdrawn(event: FundsWithdrawnEvent): void {
  let entity = new NodeLicenseFundsWithdrawnEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.admin = event.params.admin
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new NodeLicenseInitializedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePricingTierSetOrAdded(
  event: PricingTierSetOrAddedEvent,
): void {
  let entity = new NodeLicensePricingTierSetOrAddedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.index = event.params.index
  entity.price = event.params.price
  entity.quantity = event.params.quantity

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePromoCodeCreated(event: PromoCodeCreatedEvent): void {
  let entity = new NodeLicensePromoCodeCreatedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.promoCode = event.params.promoCode
  entity.recipient = event.params.recipient

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePromoCodeRemoved(event: PromoCodeRemovedEvent): void {
  let entity = new NodeLicensePromoCodeRemovedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.promoCode = event.params.promoCode

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReferralReward(event: ReferralRewardEvent): void {
  let entity = new NodeLicenseReferralRewardEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.buyer = event.params.buyer
  entity.referralAddress = event.params.referralAddress
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReferralRewardPercentagesChanged(
  event: ReferralRewardPercentagesChangedEvent,
): void {
  let entity = new NodeLicenseReferralRewardPercentagesChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.referralDiscountPercentage = event.params.referralDiscountPercentage
  entity.referralRewardPercentage = event.params.referralRewardPercentage

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRefundOccurred(event: RefundOccurredEvent): void {
  let entity = new NodeLicenseRefundOccurredEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.refundee = event.params.refundee
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardClaimed(event: RewardClaimedEvent): void {
  let entity = new NodeLicenseRewardClaimedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.claimer = event.params.claimer
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new NodeLicenseRoleAdminChangedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new NodeLicenseRoleGrantedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new NodeLicenseRoleRevokedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

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

export function handleWhitelistAmountRedeemed(
  event: WhitelistAmountRedeemedEvent,
): void {
  let entity = new NodeLicenseWhitelistAmountRedeemedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.redeemer = event.params.redeemer
  entity.newAmount = event.params.newAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWhitelistAmountUpdatedByAdmin(
  event: WhitelistAmountUpdatedByAdminEvent,
): void {
  let entity = new NodeLicenseWhitelistAmountUpdatedByAdminEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.redeemer = event.params.redeemer
  entity.newAmount = event.params.newAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
