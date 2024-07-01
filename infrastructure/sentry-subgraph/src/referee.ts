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
  PoolInfo,
  PoolChallenge
} from "../generated/schema"
import { checkIfSubmissionEligible } from "./utils/checkIfSubmissionEligible"
import { getBoostFactor } from "./utils/getBoostFactor"
import { getInputFromEvent } from "./utils/getInputFromEvent"
import { getMaxStakeAmount } from "./utils/getMaxStakeAmount"
import { getTxSignatureFromEvent } from "./utils/getTxSignatureFromEvent"
import { updateChallenge } from "./utils/updateChallenge"

import { ethereum, BigInt, Bytes, Address, log } from "@graphprotocol/graph-ts"
import { updatePoolChallengeOnClaim } from "./utils/updatePoolChallengeOnClaim"

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
  } else {
    refereeConfig.maxKeysPerPool = BigInt.fromI32(0)
  }

  refereeConfig.save();
}


export function handleAssertionSubmitted(event: AssertionSubmittedEvent): void {
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (!challenge) {
    log.warning("Failed to find challenge handleAssertionSubmitted: keyID: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  const sentryKey = SentryKey.load(event.params.nodeLicenseId.toString())
  if (!sentryKey) {
    log.warning("Failed to find sentryKey handleAssertionSubmitted: keyID: " + event.params.nodeLicenseId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  const sentryWallet = SentryWallet.load(sentryKey.sentryWallet)
  if (!sentryWallet) {
    log.warning("Failed to find sentryWallet handleAssertionSubmitted: keyID: " + event.params.nodeLicenseId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  const refereeConfig = RefereeConfig.load("RefereeConfig")
  if (!refereeConfig) {
    log.warning("Failed to find refereeConfig handleAssertionSubmitted TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  //submitAssertionToChallenge = 0xb48985e4
  //submitMultipleAssertions = 0xec6564bf
  const transactionSignature = getTxSignatureFromEvent(event)

  let submittedFrom = "unknown"
  if (transactionSignature == "0xb48985e4") {
    submittedFrom = "submitAssertion"
  } else if (transactionSignature == "0xec6564bf") {
    submittedFrom = "submitMultipleAssertions"
  }

  const submission = new Submission(event.params.challengeId.toString() + "_" + event.params.nodeLicenseId.toString())
  submission.nodeLicenseId = event.params.nodeLicenseId
  submission.challengeNumber = event.params.challengeId
  submission.claimed = false
  submission.claimAmount = BigInt.fromI32(0)
  submission.sentryKey = event.params.nodeLicenseId.toString()
  submission.challenge = challenge.id

  submission.createdTimestamp = event.block.timestamp
  submission.createdTxHash = event.transaction.hash
  submission.claimTimestamp = BigInt.fromI32(0)
  submission.claimTxHash = Bytes.fromI32(0)
  submission.claimedFrom = "unclaimed"
  submission.submittedFrom = submittedFrom

  let assertionStateRootOrConfirmData: Bytes = Bytes.fromI32(0);
  const dataToDecode = getInputFromEvent(event, true)
  let decoded: ethereum.Value | null;

  if (submittedFrom == "submitAssertion") {
    decoded = ethereum.decode('(uint256,uint256,bytes)', dataToDecode)
  } else {
    decoded = ethereum.decode('(uint256[],uint256,bytes)', dataToDecode)
  }

  if (decoded) {
    assertionStateRootOrConfirmData = decoded.toTuple()[2].toBytes()
  } else {
    log.warning(`Failed to decode handleAssertionSubmitted (${submittedFrom}) TX: ` + event.transaction.hash.toHexString(), [])
  }

  let stakeAmount = sentryWallet.v1EsXaiStakeAmount
  let keyCount = sentryWallet.keyCount.minus(sentryWallet.stakedKeyCount);
  const isKeyAssignedToPool = sentryKey.assignedPool.toHexString() != new Address(0).toHexString();

  const pool = PoolInfo.load(sentryKey.assignedPool.toHexString());
  // This if statement is only triggered if transaction was originated by a pool
  if (isKeyAssignedToPool) {
    stakeAmount = pool!.totalStakedEsXaiAmount //We need to expect the pool entity to exist when a key is assigned, else the subgraph should fail
    keyCount = pool!.totalStakedKeyAmount //We need to expect the pool entity to exist when a key is assigned, else the subgraph should fail
  }

  const maxStakeAmount = getMaxStakeAmount(stakeAmount, keyCount, refereeConfig.maxStakeAmountPerLicense)
  const boostFactor = getBoostFactor(
    maxStakeAmount,
    refereeConfig.stakeAmountTierThresholds,
    refereeConfig.stakeAmountBoostFactors,
    refereeConfig.version
  )

  const eligibleForPayout = checkIfSubmissionEligible(
    event.params.nodeLicenseId,
    event.params.challengeId,
    assertionStateRootOrConfirmData,
    challenge.challengerSignedHash,
    boostFactor,
    refereeConfig.version
  )

  submission.eligibleForPayout = eligibleForPayout
  submission.assertionsStateRootOrConfirmData = assertionStateRootOrConfirmData.toHexString()
  submission.save()

  if (isKeyAssignedToPool) {
    let poolChallenges = PoolChallenge.load(sentryKey.assignedPool.toHexString() + "_" + event.params.challengeId.toString())
    if (poolChallenges == null) {
      poolChallenges = new PoolChallenge(sentryKey.assignedPool.toHexString() + "_" + event.params.challengeId.toString())
      poolChallenges.pool = pool!.id; //We need to expect the pool entity to exist when a key is assigned, else the subgraph should fail
      poolChallenges.challenge = challenge.id
      poolChallenges.submittedKeyCount = BigInt.fromI32(0)
      poolChallenges.claimKeyCount = BigInt.fromI32(0)
      poolChallenges.totalClaimedEsXaiAmount = BigInt.fromI32(0)
      poolChallenges.eligibleSubmissionsCount = BigInt.fromI32(0)
      poolChallenges.totalStakedEsXaiAmount = stakeAmount
      poolChallenges.totalStakedKeyAmount = keyCount
    }

    poolChallenges.submittedKeyCount = poolChallenges.submittedKeyCount.plus(BigInt.fromI32(1))
    if (submission.eligibleForPayout) {
      poolChallenges.eligibleSubmissionsCount = poolChallenges.eligibleSubmissionsCount.plus(BigInt.fromI32(1))
    }
    poolChallenges.save()
  }

  if (submission.eligibleForPayout) {
    challenge.numberOfEligibleClaimers = challenge.numberOfEligibleClaimers.plus(BigInt.fromI32(1))
    challenge.save()
  }
}

export function handleChallengeClosed(event: ChallengeClosedEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeNumber.toString())
  if (challenge) {
    challenge.status = "OpenForClaims"
    challenge.save()
  } else {
    log.warning("Failed to find challenge handleChallengeClosed challengeId: " + event.params.challengeNumber.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
  }
}

export function handleChallengeExpired(event: ChallengeExpiredEvent): void {
  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (challenge) {
    challenge.status = "Expired"
    challenge.save()
  } else {
    log.warning("Failed to find challenge handleChallengeExpired challengeId: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
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
  const challenge = Challenge.load(event.params.challengeId.toString())

  if (!challenge) {
    log.warning("Failed to find challenge handleRewardsClaimed challengeId: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  if (getTxSignatureFromEvent(event) != "0x86bb8f37") {
    //custom claim call
    //try extracting from array
    const dataToDecode = getInputFromEvent(event, true)
    const decoded = ethereum.decode('(uint256[],uint256[])', dataToDecode)
    if (!decoded) {
      log.warning("Failed to decode (custom call) handleRewardsClaimed TX: " + event.transaction.hash.toHexString(), [])
      return;
    }

    const nodeLicenseIds = decoded.toTuple()[0].toBigIntArray()
    const challengeIds = decoded.toTuple()[1].toBigIntArray()

    let amountClaimedByClaimers = challenge.amountClaimedByClaimers;

    for (let i = 0; i < challengeIds.length; i++) {

      if (challengeIds[i].equals(event.params.challengeId)) {
        const nodeLicenseId = nodeLicenseIds[i]

        const submission = Submission.load(event.params.challengeId.toString() + "_" + nodeLicenseId.toString())
        if (!submission) {
          log.warning("Failed to find submission handleRewardsClaimed (custom): nodeLicenseId: " + nodeLicenseId.toString() + ", challengeId: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
          continue;
        }

        if (!submission.claimed) {
          submission.claimed = true
          submission.claimAmount = event.params.amount

          submission.claimTimestamp = event.block.timestamp
          submission.claimTxHash = event.transaction.hash
          submission.claimedFrom = "claimRewards"

          submission.save()
          amountClaimedByClaimers = amountClaimedByClaimers.plus(event.params.amount)
        
          //Load Sentry key data
          const sentryKey = SentryKey.load(nodeLicenseId.toString());
          if (!sentryKey) {
            log.warning("Failed to find sentryKey handleAssertionSubmitted: keyID: " + nodeLicenseId.toString() + ", TX: " + event.transaction.hash.toHexString(), []);
            return;
          }
          updatePoolChallengeOnClaim(event.params.challengeId, sentryKey, event.params.amount, event.transaction.hash);
        }
      }
    }

    challenge.amountClaimedByClaimers = amountClaimedByClaimers
    challenge.save()

  } else {

    const dataToDecode = getInputFromEvent(event, false)
    const decoded = ethereum.decode('(uint256,uint256)', dataToDecode)
    if (!decoded) {
      log.warning("Failed to decode handleRewardsClaimed TX: " + event.transaction.hash.toHexString(), [])
      return;
    }

    const nodeLicenseId = decoded.toTuple()[0].toBigInt()
    const submission = Submission.load(event.params.challengeId.toString() + "_" + nodeLicenseId.toString())
    if (!submission) {
      log.warning("Failed to find submission handleRewardsClaimed: nodeLicenseId: " + nodeLicenseId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
      return;
    }

    if (!submission.claimed) {
      submission.claimed = true;
      submission.claimAmount = event.params.amount;
      submission.claimTimestamp = event.block.timestamp;
      submission.claimTxHash = event.transaction.hash;
      submission.claimedFrom = "claimRewards";
      submission.save();

      challenge.amountClaimedByClaimers = challenge.amountClaimedByClaimers.plus(event.params.amount);
      challenge.save();

      //Load key data
      const sentryKey = SentryKey.load(nodeLicenseId.toString());
      if (!sentryKey) {
        log.warning("Failed to find sentryKey handleAssertionSubmitted: keyID: " + nodeLicenseId.toString() + ", TX: " + event.transaction.hash.toHexString(), []);
        return;
      }

      updatePoolChallengeOnClaim(event.params.challengeId, sentryKey, event.params.amount, event.transaction.hash);
    }
  }
}

export function handleBatchRewardsClaimed(event: BatchRewardsClaimedEvent): void {
  if (event.params.keysLength.equals(BigInt.fromI32(0))) {
    //Empty claim did not actually claim any esXai
    return;
  }

  // query for the challenge and update it
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (!challenge) {
    log.warning("Failed to find challenge handleBatchRewardsClaimed challengeId: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  if (getTxSignatureFromEvent(event) != "0xb4d6b7df") {
    log.warning("Custom function call for handleBatchRewardsClaimed, TX: " + event.transaction.hash.toHexString(), [])
  }

  const dataToDecode = getInputFromEvent(event, true)
  const decoded = ethereum.decode('(uint256[],uint256,address)', dataToDecode)
  if (!decoded) {
    log.warning("Failed to decode handleBatchRewardsClaimed TX: " + event.transaction.hash.toHexString(), [])
    return;
  }
  
  // Starting reward at 0 to account for case where number of eligible claimers is 0 causes division by 0
  let reward = BigInt.fromI32(0);
  const nodeLicenseIds = decoded.toTuple()[0].toBigIntArray()

  if (challenge.numberOfEligibleClaimers.gt(BigInt.fromI32(0))) {
    reward = challenge.rewardAmountForClaimers.div(challenge.numberOfEligibleClaimers)
  }

  for (let i = 0; i < nodeLicenseIds.length; i++) {
    const sentryKey = SentryKey.load(nodeLicenseIds[i].toString())

    if (!sentryKey) {
      log.warning("Failed to find sentryKey handleBatchRewardsClaimed TX: " + event.transaction.hash.toHexString() + ", challenge: " + event.params.challengeId.toString() + ", nodeLicenseId: " + nodeLicenseIds[i].toString(), [])
      continue;
    }

    const submission = Submission.load(event.params.challengeId.toString() + "_" + nodeLicenseIds[i].toString())
    if (!submission) {
      if (event.params.keysLength.lt(BigInt.fromI32(nodeLicenseIds.length))) {
        // If this batch claim claimed for more keys than the event counted, we can expect to not find the submission because the user probably claimed for keys that did not submit
        // We will only log to info to not spam the warning logs
        log.debug(
          "INFO: Failed to find submission handleBatchRewardsClaimed TX: " + event.transaction.hash.toHexString() + ", challenge: " + event.params.challengeId.toString() + ", nodeLicenseId: " + nodeLicenseIds[i].toString(),
          [
            event.transaction.hash.toHexString(),
            event.params.challengeId.toString(),
            nodeLicenseIds[i].toString()
          ]
        )
      } else {
        //If the event actually counted all keys submitted in the transaction we should find the submission and need to check this log manually
        log.warning("Failed to find submission handleBatchRewardsClaimed TX: " + event.transaction.hash.toHexString() + ", challenge: " + event.params.challengeId.toString() + ", nodeLicenseId: " + nodeLicenseIds[i].toString(), [])
      }
      continue;
    }
    
    // Load current referee config from the graph
    const refereeConfig = RefereeConfig.load("RefereeConfig");

    // If the referee config is not found, log a warning and skip the claim
    if (!refereeConfig) {
      log.warning("Failed to find refereeConfig handleBatchRewardsClaimed TX: " + event.transaction.hash.toHexString(), [])
      return;
    }
    
    // Set the referee version loaded from the graph
    const refereeVersion = refereeConfig.version;

    const ownerWallet = SentryWallet.load(sentryKey.sentryWallet)
    if (ownerWallet) {
      if (
        // Require KYC approval for all versions except 6 and below
        // DO NOT REMOVE THIS CHECK or the graph numbers will be incorrect
        (ownerWallet.isKYCApproved || refereeVersion.gt(BigInt.fromI32(6))) &&
        sentryKey.mintTimeStamp.lt(challenge.createdTimestamp) &&
        !submission.claimed &&
        submission.eligibleForPayout
      ) {

        challenge.amountClaimedByClaimers = challenge.amountClaimedByClaimers.plus(reward)
        challenge.save()

        submission.claimed = true
        submission.claimAmount = reward

        submission.claimTimestamp = event.block.timestamp
        submission.claimTxHash = event.transaction.hash
        submission.claimedFrom = "claimMultipleRewards"
        submission.save()

        updatePoolChallengeOnClaim(event.params.challengeId, sentryKey, reward, event.transaction.hash)
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
    }
  } else {
    const indexOfOperator = addApprovedOperators.indexOf(event.params.operator);
    if (indexOfOperator != -1) {
      addApprovedOperators.splice(indexOfOperator, 1)
      sentryWallet.approvedOperators = addApprovedOperators
    }
  }
  sentryWallet.save()
}

export function handleStakedV1(event: StakedV1): void {
  const sentryWallet = SentryWallet.load(event.params.user.toHexString())
  if (!sentryWallet) {
    log.warning("Failed to find sentryWallet handleStakedV1 TX: " + event.transaction.hash.toHexString(), [])
    return
  }
  sentryWallet.v1EsXaiStakeAmount = event.params.totalStaked
  sentryWallet.save()
}

export function handleUnstakeV1(event: UnstakeV1): void {
  const sentryWallet = SentryWallet.load(event.params.user.toHexString())
  if (!sentryWallet) {
    log.warning("Failed to find sentryWallet handleUnstakeV1 TX: " + event.transaction.hash.toHexString(), [])
    return
  }
  sentryWallet.v1EsXaiStakeAmount = event.params.totalStaked
  sentryWallet.save()
}