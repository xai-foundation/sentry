import {
  Referee,
  AssertionSubmitted as AssertionSubmittedEvent,
  ChallengeClosed as ChallengeClosedEvent,
  ChallengeExpired as ChallengeExpiredEvent,
  ChallengeSubmitted as ChallengeSubmittedEvent,
  RewardsClaimed as RewardsClaimedEvent,
  BatchRewardsClaimed as BatchRewardsClaimedEvent,
  Approval as ApprovalEvent,
  KycStatusChanged as KycStatusChangedEvent,
  Initialized,
  StakedV1,
  UnstakeV1
} from "../generated/Referee/Referee"
import {
  Challenge,
  SentryWallet,
  Submission,
  SentryKey,
  RefereeConfig,
  PoolInfo
} from "../generated/schema"
import { checkIfSubmissionEligible } from "./utils/checkIfSubmissionEligible"
import { getBoostFactor } from "./utils/getBoostFactor"
import { getInputFromEvent } from "./utils/getInputFromEvent"
import { getMaxStakeAmount } from "./utils/getMaxStakeAmount"
import { getTxSignatureFromEvent } from "./utils/getTxSignatureFromEvent"
import { updateChallenge } from "./utils/updateChallenge"

import { log, ethereum, BigInt, Bytes, Address } from "@graphprotocol/graph-ts"

export function handleInitialized(event: Initialized): void {

  let refereeConfig = RefereeConfig.load("RefereeConfig");

  if (!refereeConfig) {
    refereeConfig = new RefereeConfig("RefereeConfig");
  }

  refereeConfig.version = BigInt.fromI32(event.params.version)

  const referee = Referee.bind(event.address);
  if (event.params.version == 1) {
    refereeConfig.maxStakeAmountPerLicense = BigInt.fromI32(0)
    refereeConfig.stakeAmountTierThresholds = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)]
    refereeConfig.stakeAmountBoostFactors = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)]
  } else {
    refereeConfig.maxStakeAmountPerLicense = referee.maxStakeAmountPerLicense()

    refereeConfig.stakeAmountTierThresholds = [
      referee.stakeAmountTierThresholds(BigInt.fromI32(0)),
      referee.stakeAmountTierThresholds(BigInt.fromI32(1)),
      referee.stakeAmountTierThresholds(BigInt.fromI32(2)),
      referee.stakeAmountTierThresholds(BigInt.fromI32(3))
    ]

    refereeConfig.stakeAmountBoostFactors = [
      referee.stakeAmountBoostFactors(BigInt.fromI32(0)),
      referee.stakeAmountBoostFactors(BigInt.fromI32(1)),
      referee.stakeAmountBoostFactors(BigInt.fromI32(2)),
      referee.stakeAmountBoostFactors(BigInt.fromI32(3))
    ]
  }

  if (event.params.version > 3) {
    refereeConfig.maxKeysPerPool = referee.maxKeysPerPool()
  }else{
    refereeConfig.maxKeysPerPool = BigInt.fromI32(0)
  }

  refereeConfig.save();
}


export function handleAssertionSubmitted(event: AssertionSubmittedEvent): void {
  const challenge = Challenge.load(event.params.challengeId.toString())
  let submission = new Submission(event.params.challengeId.toString() + event.params.nodeLicenseId.toString())
  submission.nodeLicenseId = event.params.nodeLicenseId
  submission.challengeNumber = event.params.challengeId
  submission.claimed = false
  submission.claimAmount = BigInt.fromI32(0)

  const sentryKey = SentryKey.load(event.params.nodeLicenseId.toString())
  if (sentryKey) {
    submission.sentryKey = event.params.nodeLicenseId.toString()
  }

  let assertionStateRootOrConfirmData: Bytes = Bytes.fromI32(0);
  const dataToDecode = getInputFromEvent(event)
  //submitAssertionToChallenge = 0xb48985e4
  //submitMultipleAssertions = 0xec6564bf
  const isSubmitMultiple = getTxSignatureFromEvent(event) == "0xec6564bf"
  if (isSubmitMultiple) {
    const decoded = ethereum.decode('(uint256[],uint256,bytes)', dataToDecode)
    if (decoded) {
      assertionStateRootOrConfirmData = decoded.toTuple()[2].toBytes()
    }
  } else {
    const decoded = ethereum.decode('(uint256,uint256,bytes)', dataToDecode)
    if (decoded) {
      assertionStateRootOrConfirmData = decoded.toTuple()[2].toBytes()
    }
  }

  let sentryWallet = SentryWallet.load(sentryKey!.sentryWallet)
  let stakeAmount = sentryWallet!.esXaiStakeAmount
  let keyCount = sentryWallet!.keyCount.minus(sentryWallet!.stakedKeyCount)
  if (sentryKey!.assignedPool.toHexString() != (new Address(0).toHexString())) {
    const pool = PoolInfo.load(sentryKey!.assignedPool.toHexString())
    stakeAmount = pool!.totalStakedEsXaiAmount
    keyCount = pool!.totalStakedKeyAmount
  }

  let refereeConfig = RefereeConfig.load("RefereeConfig")
  const maxStakeAmount = getMaxStakeAmount(stakeAmount, keyCount, refereeConfig!.maxStakeAmountPerLicense)
  const boostFactor = getBoostFactor(
    maxStakeAmount,
    refereeConfig!.stakeAmountTierThresholds,
    refereeConfig!.stakeAmountBoostFactors,
    refereeConfig!.version
  )

  const eligibleForPayout = checkIfSubmissionEligible(
    event.params.nodeLicenseId,
    event.params.challengeId,
    assertionStateRootOrConfirmData,
    challenge!.challengerSignedHash,
    boostFactor,
    refereeConfig!.version
  )

  let submissionStruct = Referee.bind(event.address).getSubmissionsForChallenges([event.params.challengeId], event.params.nodeLicenseId);
  log.warning("THIS IS MY COMPARE", [submissionStruct[0].eligibleForPayout.toString(), eligibleForPayout.toString()])
  log.warning(submissionStruct[0].eligibleForPayout.toString(), [])
  log.warning(eligibleForPayout.toString(), [])

  submission.eligibleForPayout = eligibleForPayout
  submission.assertionsStateRootOrConfirmData = assertionStateRootOrConfirmData.toString()
  
  submission.save()

  if (submission.eligibleForPayout) {
    if (challenge) {
      challenge.numberOfEligibleClaimers = challenge.numberOfEligibleClaimers.plus(BigInt.fromI32(1))
      challenge.save()
    }
  }
}

export function handleChallengeClosed(event: ChallengeClosedEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeNumber.toString())
  if (challenge) {
    challenge.status = "OpenForClaims"
    challenge.save()
  }
}

export function handleChallengeExpired(event: ChallengeExpiredEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge) {
    challenge.status = "Expired"
    challenge.save()
  }
}

export function handleChallengeSubmitted(event: ChallengeSubmittedEvent): void {
  // create an entity for the challenge
  let challenge = new Challenge(event.params.challengeNumber.toString())

  // query the challenge struct from the contract
  const contract = Referee.bind(event.address)

  challenge.challengeNumber = event.params.challengeNumber
  challenge.status = "OpenForSubmissions"

  challenge = updateChallenge(contract, challenge)

  challenge.save()
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  // query for the challenge and update it
  let challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge) {
    challenge.amountClaimedByClaimers = challenge.amountClaimedByClaimers.plus(event.params.amount)
    challenge.save()

    const dataToDecode = getInputFromEvent(event)
    const decoded = ethereum.decode('(uint256,uint256)', dataToDecode)
    if (decoded) {
      const nodeLicenseId = decoded.toTuple()[0].toBigInt()
      const submission = Submission.load(event.params.challengeId.toString() + nodeLicenseId.toString())
      if (submission) {
        submission.claimed = true
        submission.claimAmount = event.params.amount
        submission.save()
      }
    }
  }

}

export function handleBatchRewardsClaimed(event: BatchRewardsClaimedEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge) {
    const dataToDecode = getInputFromEvent(event)
    const decoded = ethereum.decode('(uint256[],uint256,address)', dataToDecode)
    if (decoded) {
      const nodeLicenseIds = decoded.toTuple()[0].toBigIntArray()
      const reward = challenge.rewardAmountForClaimers.div(challenge.numberOfEligibleClaimers)

      for (let i = 0; i < nodeLicenseIds.length; i++) {
        const submission = Submission.load(event.params.challengeId.toString() + nodeLicenseIds[i].toString())
        const sentryKey = SentryKey.load(nodeLicenseIds[i].toString())

        if (sentryKey && submission) {
          const ownerWallet = SentryWallet.load(sentryKey.sentryWallet)
          if (ownerWallet) {
            if (
              ownerWallet.isKYCApproved &&
              sentryKey.mintTimeStamp < challenge.createdTimestamp &&
              !submission.claimed &&
              submission.eligibleForPayout
            ) {

              challenge.amountClaimedByClaimers = challenge.amountClaimedByClaimers.plus(reward)
              challenge.save()

              submission.claimed = true
              submission.claimAmount = reward
              submission.save()
            }
          }
        }
      }
    }
  }
}

export function handleKycStatusChanged(event: KycStatusChangedEvent): void {
  let sentryWallet = SentryWallet.load(event.params.wallet.toHexString())
  if (!sentryWallet) {
    sentryWallet = new SentryWallet(event.params.wallet.toHexString())
    sentryWallet.address = event.params.wallet
    sentryWallet.approvedOperators = []
    sentryWallet.v1EsXaiStakeAmount = BigInt.fromI32(0)
    sentryWallet.esXaiStakeAmount = BigInt.fromI32(0)
    sentryWallet.keyCount = BigInt.fromI32(0)
    sentryWallet.stakedKeyCount = BigInt.fromI32(0)
    sentryWallet.keyCount = BigInt.fromI32(0)
  }

  sentryWallet.isKYCApproved = event.params.isKycApproved
  sentryWallet.save()
}

export function handleApproval(event: ApprovalEvent): void {

  let sentryWallet = SentryWallet.load(event.params.owner.toHexString())

  if (!sentryWallet) {
    sentryWallet = new SentryWallet(event.params.owner.toHexString())
    sentryWallet.address = event.params.owner
    sentryWallet.isKYCApproved = false
    sentryWallet.approvedOperators = []
    sentryWallet.v1EsXaiStakeAmount = BigInt.fromI32(0)
    sentryWallet.esXaiStakeAmount = BigInt.fromI32(0)
    sentryWallet.keyCount = BigInt.fromI32(0)
    sentryWallet.stakedKeyCount = BigInt.fromI32(0)
    sentryWallet.keyCount = BigInt.fromI32(0)
  }

  const addApprovedOperators = sentryWallet.approvedOperators
  if (event.params.approved) {
    if (addApprovedOperators.indexOf(event.params.operator) == -1) {  // Check if the owner is not already in the array
      addApprovedOperators.push(event.params.operator)
      sentryWallet.approvedOperators = addApprovedOperators
      sentryWallet.save()
    }
  } else {
    const indexOfOperator = addApprovedOperators.indexOf(event.params.operator);
    if (indexOfOperator != -1) {
      addApprovedOperators.splice(indexOfOperator, 1)
      sentryWallet.approvedOperators = addApprovedOperators
      sentryWallet.save()
    }
  }
}

export function handleStakedV1(event: StakedV1): void {
  let sentryWallet = SentryWallet.load(event.params.user.toHexString())
  if (sentryWallet) {
    sentryWallet.v1EsXaiStakeAmount = event.params.totalStaked
  }
}

export function handleUnstakeV1(event: UnstakeV1): void {
  let sentryWallet = SentryWallet.load(event.params.user.toHexString())
  if (sentryWallet) {
    sentryWallet.v1EsXaiStakeAmount = event.params.totalStaked
  }
}