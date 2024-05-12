import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  ClaimableChanged,
  FundsReceiverChanged,
  FundsWithdrawn,
  Initialized,
  PricingTierSetOrAdded,
  PromoCodeCreated,
  PromoCodeRemoved,
  ReferralReward,
  ReferralRewardPercentagesChanged,
  RefundOccurred,
  RewardClaimed,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Transfer,
  WhitelistAmountRedeemed,
  WhitelistAmountUpdatedByAdmin
} from "../generated/NodeLicense/NodeLicense"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createClaimableChangedEvent(
  admin: Address,
  newClaimableState: boolean
): ClaimableChanged {
  let claimableChangedEvent = changetype<ClaimableChanged>(newMockEvent())

  claimableChangedEvent.parameters = new Array()

  claimableChangedEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  claimableChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newClaimableState",
      ethereum.Value.fromBoolean(newClaimableState)
    )
  )

  return claimableChangedEvent
}

export function createFundsReceiverChangedEvent(
  admin: Address,
  newFundsReceiver: Address
): FundsReceiverChanged {
  let fundsReceiverChangedEvent = changetype<FundsReceiverChanged>(
    newMockEvent()
  )

  fundsReceiverChangedEvent.parameters = new Array()

  fundsReceiverChangedEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  fundsReceiverChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newFundsReceiver",
      ethereum.Value.fromAddress(newFundsReceiver)
    )
  )

  return fundsReceiverChangedEvent
}

export function createFundsWithdrawnEvent(
  admin: Address,
  amount: BigInt
): FundsWithdrawn {
  let fundsWithdrawnEvent = changetype<FundsWithdrawn>(newMockEvent())

  fundsWithdrawnEvent.parameters = new Array()

  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("admin", ethereum.Value.fromAddress(admin))
  )
  fundsWithdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return fundsWithdrawnEvent
}

export function createInitializedEvent(version: i32): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(version))
    )
  )

  return initializedEvent
}

export function createPricingTierSetOrAddedEvent(
  index: BigInt,
  price: BigInt,
  quantity: BigInt
): PricingTierSetOrAdded {
  let pricingTierSetOrAddedEvent = changetype<PricingTierSetOrAdded>(
    newMockEvent()
  )

  pricingTierSetOrAddedEvent.parameters = new Array()

  pricingTierSetOrAddedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  pricingTierSetOrAddedEvent.parameters.push(
    new ethereum.EventParam("price", ethereum.Value.fromUnsignedBigInt(price))
  )
  pricingTierSetOrAddedEvent.parameters.push(
    new ethereum.EventParam(
      "quantity",
      ethereum.Value.fromUnsignedBigInt(quantity)
    )
  )

  return pricingTierSetOrAddedEvent
}

export function createPromoCodeCreatedEvent(
  promoCode: string,
  recipient: Address
): PromoCodeCreated {
  let promoCodeCreatedEvent = changetype<PromoCodeCreated>(newMockEvent())

  promoCodeCreatedEvent.parameters = new Array()

  promoCodeCreatedEvent.parameters.push(
    new ethereum.EventParam("promoCode", ethereum.Value.fromString(promoCode))
  )
  promoCodeCreatedEvent.parameters.push(
    new ethereum.EventParam("recipient", ethereum.Value.fromAddress(recipient))
  )

  return promoCodeCreatedEvent
}

export function createPromoCodeRemovedEvent(
  promoCode: string
): PromoCodeRemoved {
  let promoCodeRemovedEvent = changetype<PromoCodeRemoved>(newMockEvent())

  promoCodeRemovedEvent.parameters = new Array()

  promoCodeRemovedEvent.parameters.push(
    new ethereum.EventParam("promoCode", ethereum.Value.fromString(promoCode))
  )

  return promoCodeRemovedEvent
}

export function createReferralRewardEvent(
  buyer: Address,
  referralAddress: Address,
  amount: BigInt
): ReferralReward {
  let referralRewardEvent = changetype<ReferralReward>(newMockEvent())

  referralRewardEvent.parameters = new Array()

  referralRewardEvent.parameters.push(
    new ethereum.EventParam("buyer", ethereum.Value.fromAddress(buyer))
  )
  referralRewardEvent.parameters.push(
    new ethereum.EventParam(
      "referralAddress",
      ethereum.Value.fromAddress(referralAddress)
    )
  )
  referralRewardEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return referralRewardEvent
}

export function createReferralRewardPercentagesChangedEvent(
  referralDiscountPercentage: BigInt,
  referralRewardPercentage: BigInt
): ReferralRewardPercentagesChanged {
  let referralRewardPercentagesChangedEvent =
    changetype<ReferralRewardPercentagesChanged>(newMockEvent())

  referralRewardPercentagesChangedEvent.parameters = new Array()

  referralRewardPercentagesChangedEvent.parameters.push(
    new ethereum.EventParam(
      "referralDiscountPercentage",
      ethereum.Value.fromUnsignedBigInt(referralDiscountPercentage)
    )
  )
  referralRewardPercentagesChangedEvent.parameters.push(
    new ethereum.EventParam(
      "referralRewardPercentage",
      ethereum.Value.fromUnsignedBigInt(referralRewardPercentage)
    )
  )

  return referralRewardPercentagesChangedEvent
}

export function createRefundOccurredEvent(
  refundee: Address,
  amount: BigInt
): RefundOccurred {
  let refundOccurredEvent = changetype<RefundOccurred>(newMockEvent())

  refundOccurredEvent.parameters = new Array()

  refundOccurredEvent.parameters.push(
    new ethereum.EventParam("refundee", ethereum.Value.fromAddress(refundee))
  )
  refundOccurredEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return refundOccurredEvent
}

export function createRewardClaimedEvent(
  claimer: Address,
  amount: BigInt
): RewardClaimed {
  let rewardClaimedEvent = changetype<RewardClaimed>(newMockEvent())

  rewardClaimedEvent.parameters = new Array()

  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("claimer", ethereum.Value.fromAddress(claimer))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return rewardClaimedEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createWhitelistAmountRedeemedEvent(
  redeemer: Address,
  newAmount: i32
): WhitelistAmountRedeemed {
  let whitelistAmountRedeemedEvent = changetype<WhitelistAmountRedeemed>(
    newMockEvent()
  )

  whitelistAmountRedeemedEvent.parameters = new Array()

  whitelistAmountRedeemedEvent.parameters.push(
    new ethereum.EventParam("redeemer", ethereum.Value.fromAddress(redeemer))
  )
  whitelistAmountRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "newAmount",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newAmount))
    )
  )

  return whitelistAmountRedeemedEvent
}

export function createWhitelistAmountUpdatedByAdminEvent(
  redeemer: Address,
  newAmount: i32
): WhitelistAmountUpdatedByAdmin {
  let whitelistAmountUpdatedByAdminEvent =
    changetype<WhitelistAmountUpdatedByAdmin>(newMockEvent())

  whitelistAmountUpdatedByAdminEvent.parameters = new Array()

  whitelistAmountUpdatedByAdminEvent.parameters.push(
    new ethereum.EventParam("redeemer", ethereum.Value.fromAddress(redeemer))
  )
  whitelistAmountUpdatedByAdminEvent.parameters.push(
    new ethereum.EventParam(
      "newAmount",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(newAmount))
    )
  )

  return whitelistAmountUpdatedByAdminEvent
}
