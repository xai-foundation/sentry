import { RefereeConfig } from "@sentry/sentry-subgraph-client";
import { BulkOwnerOrPool, getBoostFactor as getBoostFactorRPC, NodeLicenseStatus, ProcessChallenge, submitBulkAssertion } from "../index.js";
import { operatorState } from "./operatorState.js";
import { retry, getSubgraphHealthStatus } from "../../index.js";
import { updateSentryAddressStatus } from "./updateSentryAddressStatus.js";
import { getWinningKeyCount } from "./getWinningKeyCount.js";
import { getBulkSubmissionForChallenge } from "../getBulkSubmissionForChallenge.js";
import { ethers } from 'ethers';
import { getLastSubmittedAssertionIdAndTime } from "../../index.js";

/**
 * Processes a new challenge for all owners and pools, submit assertion if we have winning keys
 * @param {bigint} challengeId - The challenge number.
 * @param {ProcessChallenge} challenge - The challenge object for processing
 * @param {BulkOwnerOrPool[]} bulkOwnerAndPools - The list of owner and pools to submit for.
 * @param {RefereeConfig} refereeConfig - The current Referee configs in case the subgraph is healthy, used to calculate the boostFactor off-chain
 */
export async function processNewChallenge(
    challengeId: bigint,
    challenge: ProcessChallenge,
    bulkOwnerAndPools: BulkOwnerOrPool[],
    refereeConfig?: RefereeConfig
) {
    operatorState.cachedLogger(`Processing new challenge with number: ${challengeId}.`);
    operatorState.cachedLogger(`Checking eligibility for ${bulkOwnerAndPools.length} owners and pools.`);

    for (const ownerOrPool of bulkOwnerAndPools) {
        let confirmData = challenge.assertionStateRootOrConfirmData;

        updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.CHECKING_IF_ELIGIBLE_FOR_PAYOUT);

        try {
            let boostFactor: bigint;

            if (refereeConfig) {

                boostFactor = calculateBoostFactorLocally(
                    BigInt(ownerOrPool.stakedEsXaiAmount),
                    ownerOrPool.keyCount,
                    refereeConfig
                );

            } else {
                boostFactor = await getBoostFactorRPC(ownerOrPool.address);
            }

            operatorState.cachedLogger(
                `Found chance boost of ${Number(boostFactor) / 100}% for ${ownerOrPool.isPool ? `pool:` : `owner:`} ${ownerOrPool.name ? `${ownerOrPool.name} (${ownerOrPool.address})` : ownerOrPool.address}`
            );

            const winningKeyCount = getWinningKeyCount(
                ownerOrPool.keyCount,
                Number(boostFactor),
                ownerOrPool.address,
                challengeId,
                challenge.assertionStateRootOrConfirmData,
                challenge.challengerSignedHash
            );

            operatorState.cachedLogger(`${ownerOrPool.isPool ? "Pool" : "Wallet"} ${ownerOrPool.address} has ${winningKeyCount}/${ownerOrPool.keyCount} winning keys for challenge ${challengeId}`);

            if (winningKeyCount == 0) {
                updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }

        } catch (error: any) {
            operatorState.cachedLogger(`Error checking payout eligible for address ${ownerOrPool.address} to challenge ${challengeId} - ${error && error.message ? error.message : error}`);
            continue;
        }

        try {

            let hasSubmission;
            if (ownerOrPool.bulkSubmissions) {
                const foundSubmission = ownerOrPool.bulkSubmissions.find(s => {
                    return Number(s.challengeId) == Number(challengeId)
                });
                if (foundSubmission) {
                    hasSubmission = true;
                }
            } else {
                const submission = await retry(() => getBulkSubmissionForChallenge(challengeId, ownerOrPool.address), 3);
                if (submission.submitted) {
                    hasSubmission = true;
                }
            }

            if (hasSubmission) {
                operatorState.cachedLogger(`Address ${ownerOrPool.address} has submitted for challenge ${challengeId} by another node. If multiple nodes are running, this message can be ignored.`);
                updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }

            try {
                let lastSubmittedAssertion;

                const graphStatus = await getSubgraphHealthStatus();

                // Get the last submitted assertion Id from the subgraph or RPC
                if(graphStatus.healthy){                
                    // TODO Implement
                    // 1. Get the last submitted assertion from the subgraph
                    const lastSubmittedAssertionId = 0; // TODO Get last submitted assertion from the subgraph
                    lastSubmittedAssertion = lastSubmittedAssertionId;                
                }else{
                    // Get Last Submitted Assertion Id from RPC
                    const { lastSubmittedAssertionId } = await getLastSubmittedAssertionIdAndTime();
                    lastSubmittedAssertion = lastSubmittedAssertionId;
                }
                
                // Check if the submission should be a batch submission
                const isBatchSubmission = Number(challengeId) - Number(lastSubmittedAssertion) > 1

                // If we have multiple un-submitted assertions, we should submit them as a batch
                if(isBatchSubmission){

                    // Assemble an array of all un-submitted assertion Ids
                    const assertionIds = Array.from({ length: Number(challengeId) - lastSubmittedAssertion }, (_, i) => lastSubmittedAssertion + i + 1);    

                    // Use those Ids to retrieve the confirm data for each assertion
                    let listOfConfirmData: string[]; //TODO Implement getting these from the subgraph
                    if(graphStatus.healthy){
                        //TODO Implement
                        //2. Get the confirm data for each assertion from the subgraph
                        listOfConfirmData = ["0xConfirmData1", "0xConfirmData2", "0xConfirmData3"]; //TODO Get confirm data from the subgraph
                    }else{
                        // Get the confirm data from the RPC
                        listOfConfirmData = ["0xConfirmData1", "0xConfirmData2", "0xConfirmData3"];
                    }


                    // Encode the array of confirm data
                    const encodedData = listOfConfirmData.map(data => ethers.encodeBytes32String(data)).join('');

                    // Compute the Keccak-256 hash of the encoded data
                    const localHash = ethers.keccak256(encodedData);

                    // TODO Find the Challenger's public key
                    const challengerPublicKey = "0xChallengerPublicKey"; //TODO Set this to the challenger's public key
                    const isValid = verifyChallengerSignedHash(challengerPublicKey, localHash, challenge.challengerSignedHash);

                    if(!isValid){
                        operatorState.cachedLogger(`Challenger's signature is invalid for address ${ownerOrPool.address} to challenge ${challengeId}`);
                        // TODO How do we handle this?
                        // Notifications?
                        // Throw error?
                        // Break?
                    }
                    confirmData = localHash;
                }

                //Try to submit once, if we get error 54 we don't need to try again. Any other error, we should give it 2 more tries.
                await submitBulkAssertion(ownerOrPool.address, challengeId, confirmData, operatorState.cachedSigner);
            } catch (error: any) {
                if (error && error.message && error.message.includes('execution reverted: "54"')) {
                    // If error code is 54, we don't need to log the error, it just means for this pool we already submitted
                    operatorState.cachedLogger(`Address ${ownerOrPool.address} has submitted for challenge ${challengeId} by another node. If multiple nodes are running, this message can be ignored.`);
                    updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                    continue;
                }

                await retry(() => submitBulkAssertion(ownerOrPool.address, challengeId, confirmData, operatorState.cachedSigner), 2);
            }

            operatorState.cachedLogger(`Successfully submitted assertion for ${ownerOrPool.address}`);
            updateSentryAddressStatus(ownerOrPool.address, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);

        } catch (error: any) {
            operatorState.cachedLogger(`Error submitting assertion for address ${ownerOrPool.address} to challenge ${challengeId} - ${error && error.message ? error.message : error}`);
            continue;
        }
    }
}

/**
 * Helper function to calculate the boost factor off-chain. This requires the current Referee config from the subgraph
 * 
 * @param stakedEsXAIAmount amount of staked esXAI
 * @param keyCount amount of staked keys in a pool / amount of unstaked keys for an owner, used to calculate the maxStakeAmount
 * @param {RefereeConfig} refereeConfig the Referee config from the subgraph
 * @return {bigint} The payout chance boostFactor. 200 for double the chance.
 */
const calculateBoostFactorLocally = (
    stakedEsXAIAmount: bigint,
    keyCount: number,
    refereeConfig: RefereeConfig
): bigint => {

    const maxStakeAmount = BigInt(keyCount) * BigInt(refereeConfig.maxStakeAmountPerLicense);
    if (stakedEsXAIAmount > maxStakeAmount) {
        stakedEsXAIAmount = maxStakeAmount;
    }

    if (stakedEsXAIAmount < refereeConfig.stakeAmountTierThresholds[0]) {
        return BigInt(100)
    }

    for (let tier = 1; tier < refereeConfig.stakeAmountTierThresholds.length; tier++) {
        if (stakedEsXAIAmount < refereeConfig.stakeAmountTierThresholds[tier]) {
            return refereeConfig.stakeAmountBoostFactors[tier - 1];
        }
    }

    return refereeConfig.stakeAmountBoostFactors[refereeConfig.stakeAmountTierThresholds.length - 1];
}


const verifyChallengerSignedHash = (challengerPublicKey: string, confirmData: string, challengerSignedHash: string): boolean => {

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(confirmData, challengerSignedHash);

    // Verify the signature
    const isValid = recoveredAddress.toLowerCase() === challengerPublicKey.toLowerCase();

    return isValid;
};