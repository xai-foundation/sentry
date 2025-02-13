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
  UnstakeV1,
  NewBulkSubmission as NewBulkSubmissionEvent,
  UpdateBulkSubmission as UpdateBulkSubmissionEvent,
  BulkRewardsClaimed as BulkRewardsClaimedEvent,
} from "../generated/Referee/Referee"
import { 
  NodeConfirmed as NodeConfirmedEvent
} from "../generated/Rollup/Rollup"
import {
  Challenge,
  SentryWallet,
  Submission,
  SentryKey,
  RefereeConfig,
  PoolInfo,
  PoolChallenge,
  BulkSubmission,
  NodeConfirmation
} from "../generated/schema"
import { checkIfSubmissionEligible } from "./utils/checkIfSubmissionEligible"
import { getBoostFactor } from "./utils/getBoostFactor"
import { getInputFromEvent } from "./utils/getInputFromEvent"
import { getMaxStakeAmount } from "./utils/getMaxStakeAmount"
import { getTxSignatureFromEvent } from "./utils/getTxSignatureFromEvent"
import { updateChallenge } from "./utils/updateChallenge"

import { ethereum, BigInt, Bytes, Address, log, ByteArray, crypto } from "@graphprotocol/graph-ts"
import { updatePoolChallengeOnClaim } from "./utils/updatePoolChallengeOnClaim"
import { updateTotalAccruedRewards } from "./utils/updateTotalAccruedRewards"

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

  // if (event.params.version == 7) {
  //   //prepared for version 7
  // }

  refereeConfig.save();
}

export function handleAssertionSubmitted(event: AssertionSubmittedEvent): void {
  // Load current referee config from the graph
  const refereeConfig = RefereeConfig.load("RefereeConfig");

  // If the referee config is not found, log a warning and skip the claim
  if (!refereeConfig) {
    log.warning("Failed to find refereeConfig handleAssertionSubmitted TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

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

  challenge = updateChallenge(contract, challenge, event)

  challenge.save()
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {

  if (getTxSignatureFromEvent(event) == "0xb4d6b7df") {
    //If this event was triggered from calling "claimMultipleRewards" we don't need to process as it will be handled in the batchClaim handler
    return;
  }

  // Load current referee config from the graph
  const refereeConfig = RefereeConfig.load("RefereeConfig");

  // If the referee config is not found, log a warning and skip the claim
  if (!refereeConfig) {
    log.warning("Failed to find refereeConfig handleRewardsClaimed TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

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
          updateTotalAccruedRewards(sentryKey, event.params.amount, event)
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
      updateTotalAccruedRewards(sentryKey, event.params.amount, event)
    }
  }
}

export function handleBatchRewardsClaimed(event: BatchRewardsClaimedEvent): void {

  if (getTxSignatureFromEvent(event) == "0x86bb8f37") {
    //If this event was triggered from calling "claimReward" we don't need to process as it will be handled in the claim handler
    return;
  }

  // Load current referee config from the graph
  const refereeConfig = RefereeConfig.load("RefereeConfig");

  // If the referee config is not found, log a warning and skip the claim
  if (!refereeConfig) {
    log.warning("Failed to find refereeConfig handleBatchRewardsClaimed TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

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

    const ownerWallet = SentryWallet.load(sentryKey.sentryWallet)
    if (!ownerWallet) {
      log.warning("Failed to find ownerWallet in handleBatchRewardsClaimed TX: " + event.transaction.hash.toHexString() + ", challenge: " + event.params.challengeId.toString() + ", nodeLicenseId: " + nodeLicenseIds[i].toString(), [])
      return;
    }

    if (
      (refereeConfig.version.gt(BigInt.fromI32(6)) || ownerWallet.isKYCApproved) &&
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
      updateTotalAccruedRewards(sentryKey, reward, event)
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
    sentryWallet.totalAccruedAssertionRewards = BigInt.fromI32(0)
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
    sentryWallet.totalAccruedAssertionRewards = BigInt.fromI32(0)
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

export function handleNewBulkSubmission(event: NewBulkSubmissionEvent): void {

  const challenge = Challenge.load(event.params.challengeId.toString())
  if (!challenge) {
    log.warning("Failed to find challenge handleNewBulkSubmission: keyID: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  const bulkSubmission = new BulkSubmission(event.params.bulkAddress.toHexString() + "_" + event.params.challengeId.toString())
  bulkSubmission.challengeId = event.params.challengeId
  bulkSubmission.bulkAddress = event.params.bulkAddress
  bulkSubmission.challenge = challenge.id

  //will always be either sentry wallet or pool
  const pool = PoolInfo.load(event.params.bulkAddress.toHexString())
  if (pool) {
    bulkSubmission.poolInfo = pool.id
    bulkSubmission.isPool = true
    let poolChallenges = PoolChallenge.load(event.params.bulkAddress.toHexString() + "_" + event.params.challengeId.toString())
    if (poolChallenges == null) {
      poolChallenges = new PoolChallenge(event.params.bulkAddress.toHexString() + "_" + event.params.challengeId.toString())
      poolChallenges.pool = pool.id;
      poolChallenges.challenge = challenge.id
      poolChallenges.claimKeyCount = BigInt.fromI32(0)
      poolChallenges.totalClaimedEsXaiAmount = BigInt.fromI32(0)
      poolChallenges.eligibleSubmissionsCount = BigInt.fromI32(0)
      poolChallenges.totalStakedEsXaiAmount = pool.totalStakedEsXaiAmount
      poolChallenges.totalStakedKeyAmount = pool.totalStakedKeyAmount
    }
    poolChallenges.submittedKeyCount = event.params.stakedKeys
    poolChallenges.eligibleSubmissionsCount = event.params.winningKeys
    poolChallenges.save()
  } else {
    bulkSubmission.isPool = false
    const sentryWallet = SentryWallet.load(event.params.bulkAddress.toHexString())
    if (!sentryWallet) {
      log.warning("Failed to find sentryWallet handleNewBulkSubmission: bulkAddress: " + event.params.bulkAddress.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
      return;
    }
    bulkSubmission.sentryWallet = sentryWallet.id
  }

  bulkSubmission.keyCount = event.params.stakedKeys
  bulkSubmission.winningKeyCount = event.params.winningKeys
  bulkSubmission.claimedRewardsAmount = BigInt.fromI32(0)
  bulkSubmission.createdTimestamp = event.block.timestamp
  bulkSubmission.createdTxHash = event.transaction.hash
  bulkSubmission.claimTimestamp = BigInt.fromI32(0)
  bulkSubmission.claimTxHash = Bytes.fromI32(0)
  bulkSubmission.claimed = false
  bulkSubmission.save()

  challenge.numberOfEligibleClaimers = challenge.numberOfEligibleClaimers.plus(event.params.winningKeys)
  challenge.save()
}

export function handleUpdateBulkSubmission(event: UpdateBulkSubmissionEvent): void {
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (!challenge) {
    log.warning("Failed to find challenge handleUpdateBulkSubmission: keyID: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  const bulkSubmission = BulkSubmission.load(event.params.bulkAddress.toHexString() + "_" + event.params.challengeId.toString())
  if (!bulkSubmission) {
    log.warning("Failed to find bulkSubmission in handleUpdateBulkSubmission for challenge " + event.params.challengeId.toHexString() + " and poolAdress: " + event.params.bulkAddress.toHexString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return
  }

  bulkSubmission.keyCount = event.params.stakedKeys
  bulkSubmission.winningKeyCount = event.params.winningKeys
  bulkSubmission.save()

  let poolChallenges = PoolChallenge.load(event.params.bulkAddress.toHexString() + "_" + event.params.challengeId.toString())
  if (poolChallenges == null) {
    log.warning("Failed to find poolChallenges in handleUpdateBulkSubmission for challenge " + event.params.challengeId.toHexString() + " and poolAdress: " + event.params.bulkAddress.toHexString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return
  }

  poolChallenges.submittedKeyCount = event.params.stakedKeys
  poolChallenges.eligibleSubmissionsCount = event.params.winningKeys
  poolChallenges.save()

  if (event.params.increase.gt(BigInt.fromI32(0))) {
    challenge.numberOfEligibleClaimers = challenge.numberOfEligibleClaimers.plus(event.params.increase)
  } else {
    challenge.numberOfEligibleClaimers = challenge.numberOfEligibleClaimers.minus(event.params.decrease)
  }
  challenge.save()
}

export function handleBulkRewardsClaimed(event: BulkRewardsClaimedEvent): void {
  const challenge = Challenge.load(event.params.challengeId.toString())
  if (!challenge) {
    log.warning("Failed to find challenge handleBulkRewardsClaimed: keyID: " + event.params.challengeId.toString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return;
  }

  let bulkSubmission = BulkSubmission.load(event.params.bulkAddress.toHexString() + "_" + event.params.challengeId.toString())
  if (!bulkSubmission) {
    log.warning("Failed to find bulkSubmission in handleBulkRewardsClaimed for challenge " + event.params.challengeId.toHexString() + " and poolAdress: " + event.params.bulkAddress.toHexString() + ", TX: " + event.transaction.hash.toHexString(), [])
    return
  }

  bulkSubmission.claimedRewardsAmount = event.params.totalReward
  bulkSubmission.claimTimestamp = event.block.timestamp
  bulkSubmission.claimTxHash = event.transaction.hash
  bulkSubmission.claimed = true
  bulkSubmission.save()

  if (bulkSubmission.isPool) {
    let poolChallenges = PoolChallenge.load(event.params.bulkAddress.toHexString() + "_" + event.params.challengeId.toString())
    if (poolChallenges == null) {
      log.warning("Failed to find poolChallenges in handleBulkRewardsClaimed for challenge " + event.params.challengeId.toHexString() + " and poolAdress: " + event.params.bulkAddress.toHexString() + ", TX: " + event.transaction.hash.toHexString(), [])
      return
    }

    poolChallenges.claimKeyCount = event.params.winningKeys;
    poolChallenges.totalClaimedEsXaiAmount = event.params.totalReward;
    poolChallenges.save()

    challenge.amountClaimedByClaimers = challenge.amountClaimedByClaimers.plus(event.params.totalReward);
    challenge.save();

    const pool = PoolInfo.load(event.params.bulkAddress.toHexString());
    if (!pool) {
      log.warning("Failed to find pool handleBulkRewardsClaimed: pool: " + event.params.bulkAddress.toHexString() + ", TX: " + event.transaction.hash.toHexString(), []);
      return;
    }
    pool.totalAccruedAssertionRewards = pool.totalAccruedAssertionRewards.plus(event.params.totalReward)
    pool.save()

  } else {
    const sentryWallet = SentryWallet.load(event.params.bulkAddress.toHexString());
    if (!sentryWallet) {
      log.warning("Failed to find sentryWallet handleBulkRewardsClaimed: wallet: " + event.params.bulkAddress.toHexString() + ", TX: " + event.transaction.hash.toHexString(), []);
      return;
    }
    sentryWallet.totalAccruedAssertionRewards = sentryWallet.totalAccruedAssertionRewards.plus(event.params.totalReward)
    sentryWallet.save()
  }

}

export function handleNodeConfirmed(event: NodeConfirmedEvent): void {
  //subgraph entity id is nodeNum since its already unique
  const nodeConfirmedEvent = new NodeConfirmation(
    event.params.nodeNum.toString()
  )
  nodeConfirmedEvent.nodeNum = event.params.nodeNum;
  nodeConfirmedEvent.blockHash = event.params.blockHash;
  nodeConfirmedEvent.sendRoot = event.params.sendRoot;

  //constructing confirmHash exactly how its built in the smart contract (RollupLib.confirmHash)
  let blockHashBytes = nodeConfirmedEvent.blockHash;
  let sendRootBytes = nodeConfirmedEvent.sendRoot;

  if (!blockHashBytes || !sendRootBytes) {
    log.warning("Failed to assign null event value to variable", []);
    return;
  }

  //confirmData = keccak256(blockHash + sendRoot)
  let concatenatedHexStr = blockHashBytes.concat(sendRootBytes).toHexString();
  let concatenatedByteArray = ByteArray.fromHexString(concatenatedHexStr);
  let confirmHashByteArray = crypto.keccak256(concatenatedByteArray);
  let confirmHashHexStr = confirmHashByteArray.toHexString();

  //assign confirm data
  nodeConfirmedEvent.confirmData = confirmHashHexStr;

  //temporarily set challenge to placeholder value, set correct value in challenge handler
  nodeConfirmedEvent.challenge = null;
  
  nodeConfirmedEvent.save();
}
