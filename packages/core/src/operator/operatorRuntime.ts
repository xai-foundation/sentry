import { ethers } from "ethers";
import {
    Challenge,
    config,
    getMintTimestamp,
    getSubmissionsForChallenges,
    listChallenges,
    listNodeLicenses,
    listOwnersForOperator,
    listenForChallenges,
    getProvider,
    version,
    getBoostFactor,
    getOwnerOrDelegatePools,
    getKeysOfPool,
    submitMultipleAssertions,
    claimRewardsBulk,
    getUserInteractedPools,
    getUserStakedKeysOfPool,
    checkKycStatus
} from "../index.js";
import { retry } from "../index.js";
import axios from "axios";
import { PoolFactoryAbi } from "../abis/PoolFactoryAbi.js";

export enum NodeLicenseStatus {
    WAITING_IN_QUEUE = "Booting Operator For Key", // waiting to do an action, but in a queue
    FETCHING_MINT_TIMESTAMP = "Eligibility Lookup",
    WAITING_FOR_NEXT_CHALLENGE = "Running, esXAI Will Accrue Every Few Days",
    CHECKING_MINT_TIMESTAMP_ELIGIBILITY = "Eligibility Check",
    CHECKING_IF_ELIGIBLE_FOR_PAYOUT = "Applying Reward Algorithm",
    SUBMITTING_ASSERTION_TO_CHALLENGE = "Reward Algorithm Successful",
    QUERYING_FOR_UNCLAIMED_SUBMISSIONS = "Checking for Unclaimed Rewards"
}

export interface NodeLicenseInformation {
    ownerPublicKey: string
    status: string | NodeLicenseStatus;
}

export type NodeLicenseStatusMap = Map<bigint, NodeLicenseInformation>;

export type PublicNodeBucketInformation = {
    assertion: number,
    blockHash: string,
    sendRoot: string,
    confirmHash: string
}

type CachedSubmissionStatus = {
    submitted: boolean,
    claimed: boolean,
    // eligible: boolean,
    eligibleForPayout: boolean
}
type ChallengeCache = {
    [keyId: string]: CachedSubmissionStatus
}
const challengeCache: {
    [challenge: string]: ChallengeCache
} = {}

let owners: string[];
let cachedSigner: ethers.Signer;
let cachedLogger: (log: string) => void;
let safeStatusCallback: () => void;
let onAssertionMissMatchCb: (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => void;
const nodeLicenseIds: bigint[] = [];
const mintTimestamps: { [nodeLicenseId: string]: bigint } = {};
const nodeLicenseStatusMap: NodeLicenseStatusMap = new Map();
const challengeNumberMap: { [challengeNumber: string]: boolean } = {};
let cachedBoostFactor: { [ownerAddress: string]: bigint } = {};
let operatorAddress: string;
let keyIdToPoolAddress: { [keyId: string]: string } = {};
let operatorPoolAddresses: string[];
const isKYCMap: { [keyId: string]: boolean } = {};
const keyToOwner: { [keyId: string]: string } = {}; //Used to remember the owner of the key should it have been put into the pool list
let ownerStakedKey: { [keyId: string]: string } = {}; //Used to remember if a key came from an owner and was staked into a pool we don't operate
const KEYS_PER_BATCH = 100;

async function getPublicNodeFromBucket(confirmHash: string) {
    const url = `https://sentry-public-node.xai.games/assertions/${confirmHash.toLowerCase()}.json`;
    const response = await axios.get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Invalid response status " + response.status);
    }
}

/**
 * Compare a challenge with an assertion posted to the public CDN by the public Xai node.
 * @param {Challenge} challenge - The challenge from the Referee contract.
 * @returns {Promise<() => Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }>>} Returns the assertion data from the CDN or an error on miss match.
 */
async function compareWithCDN(challenge: Challenge): Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }> {

    let attempt = 1;
    let publicNodeBucket: PublicNodeBucketInformation | undefined;
    let lastError;

    while (attempt <= 3) {
        try {
            publicNodeBucket = await getPublicNodeFromBucket(challenge.assertionStateRootOrConfirmData);
            break;
        } catch (error) {
            cachedLogger(`Error loading assertion data from CDN for ${challenge.assertionStateRootOrConfirmData} with attempt ${attempt}.\n${error}`);
            lastError = error;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 20000));
    }

    if (!publicNodeBucket) {
        throw new Error(`Failed to retrieve assertion data from CDN for ${challenge.assertionStateRootOrConfirmData} after ${attempt} attempts.\n${lastError}`);
    }

    if (publicNodeBucket.assertion !== Number(challenge.assertionId)) {
        return { publicNodeBucket, error: `Miss match between PublicNode and Challenge assertion number '${challenge.assertionId}'!` };
    }

    return { publicNodeBucket }
}

function updateNodeLicenseStatus(nodeLicenseId: bigint, newStatus: NodeLicenseStatus | string) {
    const nodeLicenseInfo = nodeLicenseStatusMap.get(nodeLicenseId);
    if (nodeLicenseInfo) {
        nodeLicenseInfo.status = newStatus;
        nodeLicenseStatusMap.set(nodeLicenseId, nodeLicenseInfo);
        safeStatusCallback();
    } else {
        cachedLogger(`NodeLicenseId ${nodeLicenseId} not found in nodeLicenseStatusMap.`);
    }
}

const createAssertionHashAndCheckPayout = (nodeLicenseId: bigint, challengeId: bigint, boostFactor: bigint, confirmData: string, challengerSignedHash: string): [boolean, string] => {
    const assertionHash = ethers.keccak256(ethers.solidityPacked(["uint256", "uint256", "bytes", "bytes"], [nodeLicenseId, challengeId, confirmData, challengerSignedHash]));
    return [Number((BigInt(assertionHash) % BigInt(10_000))) < Number(boostFactor), assertionHash];
}

const checkV2Enabled = async (): Promise<boolean> => {
    const provider = getProvider();
    const poolFactoryContract = new ethers.Contract(config.poolFactoryAddress, PoolFactoryAbi, provider);
    try {
        const enabled = await poolFactoryContract.stakingEnabled();
        return enabled
    } catch (error: any) {
        const errorMessage: string = error && error.message ? error.message : error;
        if (!errorMessage.includes("missing revert data")) {
            cachedLogger(`Error: Failed to load staking enabled from PoolFactory ` + errorMessage);
        }
        return false;
    }
}

const reloadPoolKeys = async () => {
    operatorPoolAddresses = await getOwnerOrDelegatePools(operatorAddress);

    if (operatorPoolAddresses.length) {


        //We have pools, add all new keys, update all pool addresses and remove all unstaked keys if they were not in the list before
        const currentPoolKeys: { [key: string]: string } = {};

        cachedLogger(`Found ${operatorPoolAddresses.length} pools for operator.`);

        for (const pool of operatorPoolAddresses) {
            //Check every key and find out if its already in the nodeLicenseIds list
            cachedLogger(`Fetching node licenses for pool ${pool}.`);

            const keys = await getKeysOfPool(pool);

            for (const key of keys) {

                if (ownerStakedKey[key.toString()]) {
                    //Make sure we don't keep them in this map so we don't remove them when re-syncing
                    delete ownerStakedKey[key.toString()];
                }

                isKYCMap[key.toString()] = true; //If key is in pool it has to be KYCd
                currentPoolKeys[key.toString()] = pool;

                if (!nodeLicenseIds.includes(BigInt(key))) {
                    //Add the key from the pool to the list
                    cachedLogger(`Fetched Sentry Key ${key.toString()} staked in pool ${pool}.`);
                    nodeLicenseStatusMap.set(key, {
                        ownerPublicKey: pool,
                        status: NodeLicenseStatus.WAITING_IN_QUEUE,
                    });
                    nodeLicenseIds.push(key);
                } else {
                    //We already operate that key, if its from an owner, we need to remember the previous saved owner
                    const nodeLicenseInfo = nodeLicenseStatusMap.get(key);
                    if (nodeLicenseInfo) {
                        if (!keyToOwner[key.toString()]) {
                            //This key came from an owner not a pool, save the owner
                            keyToOwner[key.toString()] = nodeLicenseInfo.ownerPublicKey;
                        }

                        //set the owner to the pool for the batch claim later
                        nodeLicenseInfo.ownerPublicKey = pool;
                        nodeLicenseStatusMap.set(key, nodeLicenseInfo);
                        safeStatusCallback();
                    }
                }
            }
        }

        //We have the refreshed list of pool keys
        //We need to remove every key that was added from the previous pool keys and is not in the current keys anymore because it got unstaked
        const cachedPoolKeys = Object.keys(keyIdToPoolAddress);
        if (cachedPoolKeys.length > 0) {
            for (const key of cachedPoolKeys) {
                if (!currentPoolKeys[key]) {

                    isKYCMap[key.toString()] = false; //Remove kyc cache

                    if (keyToOwner[key]) {
                        //If the key was in the list before any pools
                        //We just want to update the owner back to the key owner
                        const nodeLicenseInfo = nodeLicenseStatusMap.get(BigInt(key));
                        if (nodeLicenseInfo) {
                            nodeLicenseInfo.ownerPublicKey = keyToOwner[key];
                            nodeLicenseStatusMap.set(BigInt(key), nodeLicenseInfo);
                            safeStatusCallback();
                        }

                    } else {
                        //If the key came only from a pool then we remove from the list of keys
                        cachedLogger(`Removing unstaked key ${key} from operator list.`);
                        const indexOfKeyInList = nodeLicenseIds.indexOf(BigInt(key));
                        if (indexOfKeyInList > -1) {
                            nodeLicenseIds.splice(indexOfKeyInList, 1);
                            nodeLicenseStatusMap.delete(BigInt(key));
                        }

                    }
                }
            }
        }

        //Update current key to pool map
        keyIdToPoolAddress = currentPoolKeys;

    } else {

        //We dont have any pools anymore, we need to remove all keys from the list that came from pools only
        const poolKeys = Object.keys(keyIdToPoolAddress);
        if (poolKeys.length > 0) {
            for (const key of poolKeys) {
                const indexOfKeyInList = nodeLicenseIds.indexOf(BigInt(key));
                if (indexOfKeyInList > -1) {

                    isKYCMap[key.toString()] = false; //Remove kyc cache
                    if (keyToOwner[key]) {
                        //If we had this key as approved operator / owner we just map back the owner key
                        const nodeLicenseInfo = nodeLicenseStatusMap.get(BigInt(key));
                        if (nodeLicenseInfo) {
                            nodeLicenseInfo.ownerPublicKey = keyToOwner[key];
                            nodeLicenseStatusMap.set(BigInt(key), nodeLicenseInfo);
                            safeStatusCallback();
                        }

                    } else {
                        nodeLicenseIds.splice(indexOfKeyInList, 1);
                        nodeLicenseStatusMap.delete(BigInt(key));
                        safeStatusCallback();
                    }

                }
            }

            keyIdToPoolAddress = {};
        }
    }
}

const saveSubmissionStatus = (challengeNumber: bigint, nodeLicenseId: bigint, status: CachedSubmissionStatus) => {
    challengeCache[challengeNumber.toString()][nodeLicenseId.toString()] = status;
}

/**
 * Processes a new challenge for all the node licenses.
 * @param {bigint} challengeNumber - The challenge number.
 * @param {Challenge} challenge - The challenge.
 */
async function processNewChallenge(challengeNumber: bigint, challenge: Challenge) {
    cachedLogger(`Processing new challenge with number: ${challengeNumber}.`);
    cachedBoostFactor = {};

    const stakingV2Enabled = await checkV2Enabled();
    const batchedWinnerKeys: bigint[] = []
    if (stakingV2Enabled) {
        await reloadPoolKeys();
        await syncOwnerStakedKeys();
    }

    if (!challengeCache[challengeNumber.toString()]) {
        challengeCache[challengeNumber.toString()] = {};
    }

    for (const nodeLicenseId of nodeLicenseIds) {

        cachedLogger(`Checking eligibility for nodeLicenseId ${nodeLicenseId}.`);

        // Check the nodeLicense eligibility for this challenge
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_MINT_TIMESTAMP_ELIGIBILITY);

        if (challenge.createdTimestamp <= mintTimestamps[nodeLicenseId.toString()]) {
            cachedLogger(`Sentry Key ${nodeLicenseId} is not eligible for challenge ${challengeNumber}.`);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
            saveSubmissionStatus(challengeNumber, nodeLicenseId, {
                submitted: false,
                claimed: false,
                eligibleForPayout: false
            })
            continue;
        }

        // Check if nodeLicense is eligible for a payout
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_IF_ELIGIBLE_FOR_PAYOUT);

        try {
            const keyOwner = nodeLicenseStatusMap.get(nodeLicenseId)?.ownerPublicKey as string;
            if (!cachedBoostFactor[keyOwner]) {
                try {
                    cachedBoostFactor[keyOwner] = await getBoostFactor(keyOwner);
                    cachedLogger(`Found chance boost of ${Number(cachedBoostFactor[keyOwner]) / 100}% for ${keyIdToPoolAddress[nodeLicenseId.toString()] ? "pool" : "owner"} ${keyOwner}`);

                } catch (error: any) {
                    const errorMessage: string = error && error.message ? error.message : error;
                    if (errorMessage.includes("missing revert data")) {
                        cachedLogger(`INFO: boostFactor will be enabled on staking release`);
                        cachedBoostFactor[keyOwner] = 100n;
                    } else {
                        cachedLogger(`Error loading boostFactor: ${errorMessage}`);
                        throw new Error(`Error loading boostFactor: ${errorMessage}`);
                    }
                }
            }

            const [payoutEligible] = createAssertionHashAndCheckPayout(nodeLicenseId, challengeNumber, cachedBoostFactor[keyOwner], challenge.assertionStateRootOrConfirmData, challenge.challengerSignedHash);

            if (!payoutEligible) {
                cachedLogger(`Sentry Key ${nodeLicenseId} did not accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                saveSubmissionStatus(challengeNumber, nodeLicenseId, {
                    submitted: false,
                    claimed: false,
                    eligibleForPayout: false
                });
                continue;
            }
        } catch (error: any) {
            cachedLogger(`Error checking payout eligible for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

        try {
            const [{ submitted }] = await retry(() => getSubmissionsForChallenges([challengeNumber], nodeLicenseId));
            if (submitted) {
                cachedLogger(`Sentry Key ${nodeLicenseId} has submitted for challenge ${challengeNumber} by another node. If multiple nodes are running, this message can be ignored.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                saveSubmissionStatus(challengeNumber, nodeLicenseId, {
                    submitted: true,
                    claimed: false,
                    eligibleForPayout: true
                });
                continue;
            }

            cachedLogger(`Adding Sentry Key ${nodeLicenseId} to batch for bulk submission for challenge ${challengeNumber}.`);
            batchedWinnerKeys.push(nodeLicenseId);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);

        } catch (error: any) {
            cachedLogger(`Error submitting assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

        // cachedLogger(`Submitted assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber}. You have accrued esXAI.`);

    }

    if (batchedWinnerKeys.length) {
        await submitMultipleAssertions(batchedWinnerKeys, challengeNumber, challenge.assertionStateRootOrConfirmData, KEYS_PER_BATCH, cachedSigner, cachedLogger);
        batchedWinnerKeys.forEach(key => {
            saveSubmissionStatus(challengeNumber, key, {
                submitted: true,
                claimed: false,
                eligibleForPayout: true
            });
        })
        cachedLogger(`Submitted assertion for ${batchedWinnerKeys.length} Sentry Keys `);
    }
}

async function processClaimForChallenge(challengeNumber: bigint, eligibleNodeLicenseIds: bigint[]) {
    const claimGroups: Map<string, bigint[]> = new Map();

    // Group eligible nodeLicenseIds by their claimForAddressInBatch
    for (const nodeLicenseId of eligibleNodeLicenseIds) {
        let claimForAddressInBatch: string;

        // Determine the claimForAddressInBatch based on whether the key is in a pool
        if (keyIdToPoolAddress[nodeLicenseId.toString()]) {
            claimForAddressInBatch = keyIdToPoolAddress[nodeLicenseId.toString()];
        } else {
            const nodeLicenseInfo = nodeLicenseStatusMap.get(nodeLicenseId);
            claimForAddressInBatch = nodeLicenseInfo ? nodeLicenseInfo.ownerPublicKey : '';
        }

        if (!claimGroups.has(claimForAddressInBatch)) {
            claimGroups.set(claimForAddressInBatch, []);
        }
        claimGroups.get(claimForAddressInBatch)?.push(nodeLicenseId);
    }

    // Perform the bulk claim for each group
    for (const [claimForAddress, nodeLicenses] of claimGroups) {
        if (nodeLicenses.length === 0) continue; // Skip if no licenses to claim for

        try {
            await claimRewardsBulk(nodeLicenses, challengeNumber, claimForAddress, KEYS_PER_BATCH, cachedSigner, cachedLogger);
            cachedLogger(`Bulk claim successful for address ${claimForAddress} and challenge ${challengeNumber}`);
        } catch (error: any) {
            cachedLogger(`Error during bulk claim for address ${claimForAddress} and challenge ${challengeNumber}: ${error.message}`);
        }
    }
}

async function processClosedChallenges(challengeId: bigint) {
    const challengeToEligibleNodeLicensesMap: Map<bigint, bigint[]> = new Map();

    if (!challengeCache[challengeId.toString()]) {
        challengeCache[challengeId.toString()] = {};
    }

    const beforeStatus: { [key: string]: string | undefined } = {}

    for (const nodeLicenseId of nodeLicenseIds) {
        beforeStatus[nodeLicenseId.toString()] = nodeLicenseStatusMap.get(nodeLicenseId)?.status;
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.QUERYING_FOR_UNCLAIMED_SUBMISSIONS);
        safeStatusCallback();

        cachedLogger(`Checking KYC status of '${nodeLicenseStatusMap.get(nodeLicenseId)?.ownerPublicKey}' for Sentry Key '${nodeLicenseId}'.`);
        updateNodeLicenseStatus(nodeLicenseId, `Checking KYC Status`);
        safeStatusCallback();
        let isKycApproved: boolean = isKYCMap[nodeLicenseId.toString()];
        if (!isKYCMap[nodeLicenseId.toString()]) {
            try {
                [{ isKycApproved }] = await retry(async () => await checkKycStatus([nodeLicenseStatusMap.get(nodeLicenseId)!.ownerPublicKey]));
            } catch (error: any) {
                cachedLogger(`Error checking KYC for Sentry Key ${nodeLicenseId} - ${error && error.message ? error.message : error}`);
                updateNodeLicenseStatus(nodeLicenseId, `Failed to check KYC status`);
                safeStatusCallback();
                continue;
            }
        }

        if (!isKycApproved) {
            cachedLogger(`Checked KYC status of '${nodeLicenseStatusMap.get(nodeLicenseId)?.ownerPublicKey}' for Sentry Key '${nodeLicenseId}'. It was not KYC'd and not able to claim the reward.`);
            updateNodeLicenseStatus(nodeLicenseId, `Cannot Claim, Failed KYC`);
            safeStatusCallback();
            continue;

        } else {
            isKYCMap[nodeLicenseId.toString().toString()] = true;
            cachedLogger(`Requesting esXAI reward for challenge '${challengeId}'.`);
            updateNodeLicenseStatus(nodeLicenseId, `Requesting esXAI reward for challenge '${challengeId}'.`);
            safeStatusCallback();
        }

        try {

            if (!challengeCache[challengeId.toString()][nodeLicenseId.toString()]) {
                cachedLogger(`Checking for unclaimed rewards on Sentry Key '${nodeLicenseId}'.`);
                const submissions = await getSubmissionsForChallenges([challengeId], nodeLicenseId);
                if (submissions.length) {
                    saveSubmissionStatus(challengeId, nodeLicenseId, {
                        submitted: true,
                        claimed: submissions[0].claimed,
                        eligibleForPayout: submissions[0].eligibleForPayout
                    });
                } else {
                    saveSubmissionStatus(challengeId, nodeLicenseId, {
                        submitted: false,
                        claimed: false,
                        eligibleForPayout: false
                    });
                }
            }

            let submissionStatus = challengeCache[challengeId.toString()][nodeLicenseId.toString()];

            if (submissionStatus.submitted && submissionStatus.eligibleForPayout && !submissionStatus.claimed) {
                // const challengeId = submission.challengeId;
                if (!challengeToEligibleNodeLicensesMap.has(challengeId)) {
                    challengeToEligibleNodeLicensesMap.set(challengeId, []);
                }
                challengeToEligibleNodeLicensesMap.get(challengeId)?.push(BigInt(nodeLicenseId));
            }
            // });
        } catch (error: any) {
            cachedLogger(`Error processing submissions for Sentry Key ${nodeLicenseId} - ${error && error.message ? error.message : error}`);
        }
    }

    // Iterate over the map and call processClaimForChallenge for each challenge with its unique list of eligible nodeLicenseIds
    for (const [challengeId, nodeLicenseIds] of challengeToEligibleNodeLicensesMap) {
        const uniqueNodeLicenseIds = [...new Set(nodeLicenseIds)]; // Remove duplicates
        if (uniqueNodeLicenseIds.length > 0) {
            await processClaimForChallenge(challengeId, uniqueNodeLicenseIds);
            uniqueNodeLicenseIds.forEach(key => {
                saveSubmissionStatus(challengeId, key, {
                    submitted: true,
                    claimed: true,
                    eligibleForPayout: true,
                });

                if (beforeStatus[key.toString()]) {
                    updateNodeLicenseStatus(key, beforeStatus[key.toString()]!);
                }
            });
            
            safeStatusCallback();
        }
    }
}

// start a listener for new challenges
async function listenForChallengesCallback(challengeNumber: bigint, challenge: Challenge, event?: any) {

    if (event && challenge.rollupUsed === config.rollupAddress) {
        compareWithCDN(challenge)
            .then(({ publicNodeBucket, error }) => {
                if (error) {
                    onAssertionMissMatchCb(publicNodeBucket, challenge, error);
                    return;
                }
                cachedLogger(`Comparison between PublicNode and Challenger was successful.`);
            })
            .catch(error => {
                cachedLogger(`Error on CND check for challenge ${Number(challenge.assertionId)}.`);
                cachedLogger(`${error.message}.`);
            });
    }

    if (challenge.openForSubmissions) {
        cachedLogger(`Received new challenge with number: ${challengeNumber}.`);
        if (!challengeNumberMap[challengeNumber.toString()]) {
            challengeNumberMap[challengeNumber.toString()] = true;
            await processNewChallenge(challengeNumber, challenge);
        }
    } else {
        cachedLogger(`Looking for previously accrued rewards on Challenge '${challengeNumber}'.`);
    }

    // check the previous challenge, that should be closed now
    if (challengeNumber > BigInt(1)) {
        await processClosedChallenges(challengeNumber - BigInt(1));
    }
}


// Sync all staked keys from owners to their pools so we load the correct boostFactor and do the correct bulk claim
// This will load all staked keys for each owner for all pools they have staked in
async function syncOwnerStakedKeys() {

    const currentOwnerStakedKeys: { [keyId: string]: string } = {};

    for (const owner of owners) {
        const ownerInteractedPools = await getUserInteractedPools(owner);

        if (ownerInteractedPools.length) {

            for (const pool of ownerInteractedPools) {

                const keys = await getUserStakedKeysOfPool(pool, owner);
                for (const key of keys) {

                    //The key needs to be in the list already
                    //We just need to check if we already mapped the pool because it was staked in one of the operators owned / delegated pools

                    if (!nodeLicenseIds.includes(key)) {
                        cachedLogger(`Error key not found in list of keys to operate, restart the operator to reload ${key.toString()}.`);
                        continue;
                    }

                    if (!keyIdToPoolAddress[key.toString()]) {
                        if (!ownerStakedKey[key.toString()]) {
                            cachedLogger(`Sentry Key ${key.toString()} staked in pool ${pool}.`);
                        }
                        isKYCMap[key.toString()] = true; //If key is in pool it has to be KYCd
                        keyIdToPoolAddress[key.toString()] = pool;
                        currentOwnerStakedKeys[key.toString()] = pool;

                        const nodeLicenseInfo = nodeLicenseStatusMap.get(key);
                        if (nodeLicenseInfo) {
                            keyToOwner[key.toString()] = nodeLicenseInfo.ownerPublicKey;
                            nodeLicenseInfo.ownerPublicKey = pool;
                            nodeLicenseStatusMap.set(key, nodeLicenseInfo);
                            safeStatusCallback();
                        }
                    }
                }
            }
        }
    }

    //Make sure we update if a key is no longer staked
    const cachedStakedKeys = Object.keys(ownerStakedKey);
    for (const key of cachedStakedKeys) {

        if (!currentOwnerStakedKeys[key]) {
            //This key was staked in a pool but was unstaked
            isKYCMap[key] = false; //Remove kyc cache
            cachedLogger(`Sentry Key ${key} no longer staked in pool ${keyIdToPoolAddress[key]}.`);

            delete keyIdToPoolAddress[key]; // remove mapped pool
            const nodeLicenseInfo = nodeLicenseStatusMap.get(BigInt(key));
            if (nodeLicenseInfo) {
                nodeLicenseInfo.ownerPublicKey = keyToOwner[key];
                nodeLicenseStatusMap.set(BigInt(key), nodeLicenseInfo);
                safeStatusCallback();
            }
        }
    }

    ownerStakedKey = currentOwnerStakedKeys;
}

/**
 * Operator runtime function.
 * @param {ethers.Signer} signer - The signer.
 * @param {((status: NodeLicenseStatusMap) => void)} [statusCallback] - Optional function to monitor the status of the runtime.
 * @param {((log: string) => void)} [logFunction] - Optional function to log the process.
 * @param {string[]} [operatorOwners] - Optional array of addresses that should replace "owners" if passed in.
 * @returns {Promise<() => Promise<void>>} The stop function.
 */
export async function operatorRuntime(
    signer: ethers.Signer,
    statusCallback: (status: NodeLicenseStatusMap) => void = (_) => { },
    logFunction: (log: string) => void = (_) => { },
    operatorOwners?: string[],
    onAssertionMissMatch: (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => void = (_) => { }

): Promise<() => Promise<void>> {

    cachedLogger = logFunction;
    cachedSigner = signer;
    onAssertionMissMatchCb = onAssertionMissMatch;

    logFunction(`Booting operator runtime version [${version}].`);

    const provider = getProvider();

    // Create a wrapper for the statusCallback to always send back a fresh copy of the map, so the other side doesn't mutate the map
    safeStatusCallback = () => {
        // Create a fresh copy of the map
        const statusCopy: NodeLicenseStatusMap = new Map(nodeLicenseStatusMap);

        // Call the original statusCallback with the copy
        statusCallback(statusCopy);
    };

    // get the address of the operator
    operatorAddress = await signer.getAddress();
    logFunction(`Fetched address of operator ${operatorAddress}.`);

    // get a list of all the owners that are added to this operator
    logFunction(`Getting all wallets assigned to the operator.`);
    if (operatorOwners) {
        logFunction(`Operator owners were passed in.`);
        owners = Array.from(new Set(operatorOwners));
    } else {
        logFunction(`No operator owners were passed in.`);
        owners = [operatorAddress, ...await retry(async () => await listOwnersForOperator(operatorAddress))];
    }

    logFunction(`Received ${owners.length} wallets to run with this operator. The addresses are: ${owners.join(', ')}`);

    // get a list of all the node licenses for each of the owners
    logFunction(`Getting all node licenses for each owner.`);
    for (const owner of owners) {
        logFunction(`Fetching node licenses for owner ${owner}.`);
        const licensesOfOwner = await listNodeLicenses(owner, (tokenId) => {
            logFunction(`Fetched Sentry Key ${tokenId.toString()} for owner ${owner}.`);
            nodeLicenseStatusMap.set(tokenId, {
                ownerPublicKey: owner,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });
        });

        for (const licenseId of licensesOfOwner) {
            if (!nodeLicenseIds.includes(licenseId)) {
                nodeLicenseIds.push(licenseId);
            }
        }

        logFunction(`Fetched ${licensesOfOwner.length} node licenses for owner ${owner}.`);
    }

    //Check if v2 is enabled
    // Create an instance of the Referee contract
    const stakingV2Enabled = await checkV2Enabled();

    if (stakingV2Enabled) {
        logFunction(`Staking V2 enabled, loading pool keys`);
        // Get Pool related keys
        // Get all user pool addresses as owner and delegated
        operatorPoolAddresses = await getOwnerOrDelegatePools(operatorAddress);

        if (operatorPoolAddresses.length) {
            logFunction(`Found ${operatorPoolAddresses.length} pools for operator.`);
            //For each pool we need to fetch all keys

            for (const pool of operatorPoolAddresses) {
                //Check every key and find out if its already in the nodeLicenseIds list
                logFunction(`Fetching node licenses for pool ${pool}.`);

                const keys = await getKeysOfPool(pool);

                for (const key of keys) {
                    isKYCMap[key.toString()] = true; //If key is in pool it has to be KYCd
                    keyIdToPoolAddress[key.toString()] = pool;

                    if (!nodeLicenseIds.includes(key)) {
                        logFunction(`Fetched Sentry Key ${key.toString()} staked in pool ${pool}.`);
                        nodeLicenseStatusMap.set(key, {
                            ownerPublicKey: pool,
                            status: NodeLicenseStatus.WAITING_IN_QUEUE,
                        });
                        nodeLicenseIds.push(key);
                    } else {

                        //Change pool owner of cached key and remember the owner so we can map back later on
                        const nodeLicenseInfo = nodeLicenseStatusMap.get(key);
                        if (nodeLicenseInfo) {
                            keyToOwner[key.toString()] = nodeLicenseInfo.ownerPublicKey;
                            nodeLicenseInfo.ownerPublicKey = pool;
                            nodeLicenseStatusMap.set(key, nodeLicenseInfo);
                            safeStatusCallback();
                        }

                    }
                }
            }
        }

        await syncOwnerStakedKeys();
    }

    logFunction(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);

    // if (nodeLicenseIds.length === 0) {
    //     throw new Error("No Sentry Keys found.");
    // }

    // create a mapping of all the timestamps these nodeLicenses were created at, so we can easily check the eligibility later
    logFunction(`Checking Sentry Key eligibility.`);
    for (const nodeLicenseId of nodeLicenseIds) {
        logFunction(`Fetching metadata for Sentry Key ${nodeLicenseId}.`);
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.FETCHING_MINT_TIMESTAMP);
        mintTimestamps[nodeLicenseId.toString()] = await retry(async () => await getMintTimestamp(nodeLicenseId));
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
        logFunction(`Fetched metadata for Sentry Key ${nodeLicenseId}.`);
    }
    logFunction(`Finished creating the lookup of metadata for the Sentry Keys.`);

    const closeChallengeListener = listenForChallenges(listenForChallengesCallback);
    logFunction(`Started listener for new challenges.`);

    logFunction(`Processing open challenges.`);
    await listChallenges(false, listenForChallengesCallback);

    logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);

    const fetchBlockNumber = async () => {
        try {
            const blockNumber = await provider.getBlockNumber();
            logFunction(`[cli ${version}] Health Check on JSON RPC, Operator still healthy. Current block number: ${blockNumber}`);
        } catch (error) {
            logFunction(`Error fetching block number, operator may no longer be connected to the JSON RPC: ${JSON.stringify(error)}.`);
        }
    };
    fetchBlockNumber();
    const intervalId = setInterval(fetchBlockNumber, 300000); // 300,000 milliseconds = 5 minutes

    async function stop() {
        clearInterval(intervalId);
        closeChallengeListener();
        logFunction("Challenge listener stopped.");
    }

    return stop;
}
