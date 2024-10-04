import { BigInt, log } from "@graphprotocol/graph-ts";
import { AirdropSegmentStakeComplete } from "../generated/TinyKeysAirdrop/TinyKeysAirdrop"
import { PoolInfo, SentryWallet, SentryKey, PoolStake } from "../generated/schema"
/**
 * Handles the completion of an airdrop segment staking event. This function updates the relevant 
 * entities such as PoolInfo, SentryWallet, SentryKey, and PoolStake based on the event details.
 *
 * @param {AirdropSegmentStakeComplete} event - The event triggered when a segment of keys is staked 
 * as part of the tiny keys airdrop. Contains various parameters including the owner address, pool address, and key IDs.
 *
 * @returns {void} This function does not return any value.
 */

export function handleAirdropStakeSegmentComplete(event: AirdropSegmentStakeComplete): void {

        // Extract the data from the event
        const ownerAddress = event.params.owner.toHexString();
        const poolAddress = event.params.poolAddress.toHexString();
        const startingKeyId = event.params.startingKeyId;
        const endingKeyId = event.params.endingKeyId;
        const airdropQty = endingKeyId.minus(startingKeyId).plus(BigInt.fromI32(1));

        // Load the pool entity
        const pool = PoolInfo.load(poolAddress);

        // If the pool is not found, log a warning and return
        if (!pool) {
            log.warning("handleStakeKeys - pool is undefined " + poolAddress + ", TX: " + event.transaction.hash.toHexString(), []);
            return;
        }

        // Update the pool entity
        if (pool.owner == event.params.owner) {
            pool.ownerStakedKeys = pool.ownerStakedKeys.plus(airdropQty)
        }

        // Update the total staked key amount in the pool entity
        pool.totalStakedKeyAmount = pool.totalStakedKeyAmount.plus(airdropQty);

        // Saves the pool's changes
        pool.save();

        // Load the owner's Sentry Wallet entity
        const sentryWallet = SentryWallet.load(ownerAddress);

        // If the owner's Sentry Wallet is not found, log a warning and return
        if (!sentryWallet) {
            log.warning("HandleStakeKeys - SentryWallet is undefined " + ownerAddress + ", TX: " + event.transaction.hash.toHexString(), []);
            return;
        }

        // Update the owner's Sentry Wallet entity with the new staked key count
        sentryWallet.stakedKeyCount = sentryWallet.stakedKeyCount.plus(airdropQty);
        sentryWallet.save();

        // Populate the keyIdList with the key IDs between the starting and ending key IDs
        const autoStakeKeyIds = createKeyIdListFromStartEndKeyIds(startingKeyId, endingKeyId);

        // Loop through the key IDs and process them individually
        for (let i = 0; i < autoStakeKeyIds.length; i++) {
            const sentryKey = SentryKey.load(autoStakeKeyIds[i].toString())
            if (!sentryKey) {
                log.warning("Failed to find sentryKey on handleStakeKeys, processAirdropSegmentOnlyStake: TX: " + event.transaction.hash.toHexString() + ", keyId: " + autoStakeKeyIds[i].toString(), []);
                continue;
            }
            sentryKey.assignedPool = event.params.poolAddress;
            sentryKey.save();
        }

        // Update the User's Pool Stake

        // Load the Pool Stake entity
        const poolStakeId = poolAddress + "_" + ownerAddress;
        const poolStake = PoolStake.load(poolStakeId);

        // If the Pool Stake entity is not found, log a warning and return
        // This should not happen as the Pool Stake entity should be created when the user stakes the 
        // initial key that receives the airdrop
        if (!poolStake) {
            log.warning("handleStakeKeys - PoolStake is undefined " + poolStakeId + ", TX: " + event.transaction.hash.toHexString(), []);
            return;
        }

        // Update the Pool Stake entity with the new details
        poolStake.keyStakeAmount = poolStake.keyStakeAmount.plus(airdropQty);
        poolStake.save();

        return;
}


/**
 * Generates a list of sequential BigInt key IDs from a startKeyId to an endKeyId, inclusive.
 *
 * @param {BigInt} startKeyId - The starting key ID (inclusive).
 * @param {BigInt} endKeyId - The ending key ID (inclusive).
 * @returns {BigInt[]} An array of BigInt key IDs starting from startKeyId and ending with endKeyId.
 */

function createKeyIdListFromStartEndKeyIds(startKeyId: BigInt, endKeyId: BigInt): BigInt[] {

    // Initialize an empty array to hold the resulting list of key IDs
    const keyIdList: BigInt[] = [];

    // Start with the provided startKeyId
    let currentKeyId = startKeyId;

    // Loop until currentKeyId exceeds endKeyId (inclusive loop)
    while (currentKeyId <= endKeyId) {
        // Add the current key ID to the list
        keyIdList.push(currentKeyId);

        // Increment the current key ID by 1
        currentKeyId = currentKeyId.plus(BigInt.fromI32(1));
    }

    // Return the complete list of key IDs
    return keyIdList;
}

