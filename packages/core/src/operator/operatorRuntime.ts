import { ethers } from "ethers";
import {
    Challenge,
    config,
    listenForChallenges,
    getProvider,
    version,
    submitMultipleAssertions,
    claimRewardsBulk,
    retry,
    getLatestChallengeFromGraph,
    getSentryWalletsForOperator,
    getSentryKeysFromGraph,
    getPoolInfosFromGraph,
    getOwnerOrDelegatePools,
    getKeysOfPool,
    getUserInteractedPools,
    getUserStakedKeysOfPool,
    listNodeLicenses,
    getLatestChallenge,
    getBoostFactor as getBoostFactorRPC,
    getMintTimestamp,
    listOwnersForOperator,
    checkKycStatus,
    getSubmissionsForChallenges
} from "../index.js";
import axios from "axios";
import { PoolInfo, RefereeConfig, SentryKey, SentryWallet, Submission } from "@sentry/sentry-subgraph-client";
import { getSubgraphHealthStatus } from "../subgraph/getSubgraphHealthStatus.js";

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

const MAX_CHALLENGE_CLAIM_AMOUNT = 6480;

type ProcessChallenge = {
    createdTimestamp: bigint,
    challengerSignedHash: string;
    assertionStateRootOrConfirmData: string;
}

let cachedSigner: ethers.Signer;
let cachedLogger: (log: string) => void;
let safeStatusCallback: () => void;
let onAssertionMissMatchCb: (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => void;
let cachedBoostFactor: { [ownerAddress: string]: bigint } = {};
let operatorAddress: string;
const KEYS_PER_BATCH = 100;

// Cache for rpc fallback
// const keyToOwner: { [keyId: string]: string } = {};
let cachedOperatorWallets: string[];
const mintTimestamps: { [nodeLicenseId: string]: bigint } = {};
let cachedKeysOfOwner: { [keyId: string]: SentryKey };

// SUBGRAPH EDIT
let nodeLicenseStatusMap: NodeLicenseStatusMap = new Map();
let passedInOwnersAndPools: string[] | undefined;

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

const getBoostFactor = (
    stakedAmount: bigint,
    stakeAmountTierThresholds: bigint[],
    stakeAmountBoostFactors: bigint[]
): bigint => {

    if (stakedAmount < stakeAmountTierThresholds[0]) {
        return BigInt(100)
    }

    for (let tier = 1; tier < stakeAmountTierThresholds.length; tier++) {
        if (stakedAmount < stakeAmountTierThresholds[tier]) {
            return stakeAmountBoostFactors[tier - 1];
        }
    }

    return stakeAmountBoostFactors[stakeAmountTierThresholds.length - 1];
}


const calculateBoostFactor = (sentryKey: SentryKey, sentryWallet: SentryWallet, mappedPools: { [poolAddress: string]: PoolInfo }, refereeConfig: RefereeConfig): bigint => {

    let stakeAmount = BigInt(sentryWallet.v1EsXaiStakeAmount);
    let keyCount = BigInt(sentryWallet.keyCount) - BigInt(sentryWallet.stakedKeyCount);

    if (sentryKey.assignedPool != "0x") {
        const pool = mappedPools[sentryKey.assignedPool]
        stakeAmount = BigInt(pool.totalStakedEsXaiAmount)
        keyCount = BigInt(pool.totalStakedKeyAmount)
    }

    const maxStakeAmount = keyCount * BigInt(refereeConfig.maxStakeAmountPerLicense);
    if (stakeAmount > maxStakeAmount) {
        stakeAmount = maxStakeAmount;
    }

    return getBoostFactor(
        stakeAmount,
        refereeConfig.stakeAmountTierThresholds.map(s => BigInt(s)),
        refereeConfig.stakeAmountBoostFactors.map(s => BigInt(s))
    )
}

const createAssertionHashAndCheckPayout = (nodeLicenseId: bigint, challengeId: bigint, boostFactor: bigint, confirmData: string, challengerSignedHash: string): [boolean, string] => {
    const assertionHash = ethers.keccak256(ethers.solidityPacked(["uint256", "uint256", "bytes", "bytes"], [nodeLicenseId, challengeId, confirmData, challengerSignedHash]));
    return [Number((BigInt(assertionHash) % BigInt(10_000))) < Number(boostFactor), assertionHash];
}

/**
 * Processes a new challenge for all the node licenses.
 * @param {bigint} challengeNumber - The challenge number.
 * @param {Challenge} challenge - The challenge.
 */
async function processNewChallenge(
    challengeNumber: bigint,
    challenge: ProcessChallenge,
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
    sentryWalletMap?: { [address: string]: SentryWallet },
    mappedPools?: { [poolAddress: string]: PoolInfo },
    refereeConfig?: RefereeConfig
) {
    cachedLogger(`Processing new challenge with number: ${challengeNumber}.`);
    cachedBoostFactor = {};

    const batchedWinnerKeys: bigint[] = []

    cachedLogger(`Checking eligibility for ${nodeLicenseIds.length} Keys.`);

    let nonWinnerKeysCount = 0;

    for (const nodeLicenseId of nodeLicenseIds) {

        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];

        // Check the nodeLicense eligibility for this challenge
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_MINT_TIMESTAMP_ELIGIBILITY);

        if (challenge.createdTimestamp <= sentryKey.mintTimeStamp) {
            cachedLogger(`Sentry Key ${nodeLicenseId} is not eligible for challenge ${challengeNumber}.`);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
            continue;
        }

        // Check if nodeLicense is eligible for a payout
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_IF_ELIGIBLE_FOR_PAYOUT);

        try {
            let isPool = sentryKey.assignedPool != "0x";
            const keyOwner = isPool ? sentryKey.assignedPool : sentryKey.owner;
            if (!cachedBoostFactor[keyOwner]) {
                if (mappedPools && refereeConfig && sentryWalletMap) {
                    cachedBoostFactor[keyOwner] = calculateBoostFactor(sentryKey, sentryWalletMap[sentryKey.owner], mappedPools, refereeConfig);
                    cachedLogger(`Found chance boost of ${Number(cachedBoostFactor[keyOwner]) / 100}% for ${isPool ? `pool: ${mappedPools[keyOwner].metadata[0]} (${keyOwner})` : `owner: ${keyOwner}`}`);
                } else {
                    cachedBoostFactor[keyOwner] = await getBoostFactorRPC(keyOwner);
                    cachedLogger(`Found chance boost of ${Number(cachedBoostFactor[keyOwner]) / 100}% for ${isPool ? `pool:` : `owner:`} ${keyOwner}`);
                }
            }

            const [payoutEligible] = createAssertionHashAndCheckPayout(nodeLicenseId, challengeNumber, cachedBoostFactor[keyOwner], challenge.assertionStateRootOrConfirmData, challenge.challengerSignedHash);

            if (!payoutEligible) {
                nonWinnerKeysCount++;
                // cachedLogger(`Sentry Key ${nodeLicenseId} did not accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }
        } catch (error: any) {
            cachedLogger(`Error checking payout eligible for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

        try {

            let hasSubmission;

            if (mappedPools && refereeConfig && sentryWalletMap) {
                const foundSubmission = sentryKey.submissions.find(s => s.challengeNumber.toString() == challengeNumber.toString());
                if (foundSubmission) {
                    hasSubmission = true;
                }

            } else {
                const [{ submitted }] = await retry(() => getSubmissionsForChallenges([challengeNumber], nodeLicenseId));
                if (submitted) {
                    hasSubmission = true;
                }
            }

            if (hasSubmission) {
                cachedLogger(`Sentry Key ${nodeLicenseId} has submitted for challenge ${challengeNumber} by another node. If multiple nodes are running, this message can be ignored.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }

            batchedWinnerKeys.push(nodeLicenseId);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);

        } catch (error: any) {
            cachedLogger(`Error submitting assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

    }

    cachedLogger(`${nodeLicenseIds.length - nonWinnerKeysCount} / ${nodeLicenseIds.length} keys did accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);

    if (batchedWinnerKeys.length) {
        await submitMultipleAssertions(batchedWinnerKeys, challengeNumber, challenge.assertionStateRootOrConfirmData, KEYS_PER_BATCH, cachedSigner, cachedLogger);
    }
}

async function processClaimForChallenge(challengeNumber: bigint, eligibleNodeLicenseIds: bigint[], sentryKeysMap: { [keyId: string]: SentryKey }) {
    const claimGroups: Map<string, bigint[]> = new Map();

    // Group eligible nodeLicenseIds by their claimForAddressInBatch
    for (const nodeLicenseId of eligibleNodeLicenseIds) {
        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];
        let isPool = sentryKey.assignedPool != "0x";

        let claimForAddressInBatch: string;

        // Determine the claimForAddressInBatch based on whether the key is in a pool
        if (isPool) {
            claimForAddressInBatch = sentryKey.assignedPool;
        } else {
            claimForAddressInBatch = sentryKey.owner;
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

const findSubmissionOnSentryKey = (sentryKey: SentryKey, challengeNumber: bigint): { submission: Submission, index: number } | null => {
    for (let i = 0; i < sentryKey.submissions.length; i++) {
        if (sentryKey.submissions[i].challengeNumber.toString() === challengeNumber.toString()) {
            return { submission: sentryKey.submissions[i], index: i }
        }
    }
    return null;
}

async function processClosedChallenges(
    challengeId: bigint,
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
    sentryWalletMap?: { [owner: string]: SentryWallet }
) {
    const challengeToEligibleNodeLicensesMap: Map<bigint, bigint[]> = new Map();
    const beforeStatus: { [key: string]: string | undefined } = {}
    const nonKYCWallets: { [wallet: string]: number } = {}
    const ownerKYCStatus: { [keyId: string]: boolean } = {};

    for (const nodeLicenseId of nodeLicenseIds) {

        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];
        beforeStatus[nodeLicenseId.toString()] = nodeLicenseStatusMap.get(nodeLicenseId)?.status;
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.QUERYING_FOR_UNCLAIMED_SUBMISSIONS);
        safeStatusCallback();

        try {
            let hasSubmission: boolean = false;
            if (sentryWalletMap) {
                ownerKYCStatus[sentryKey.owner] = sentryWalletMap[sentryKey.owner].isKYCApproved;

                const found = findSubmissionOnSentryKey(sentryKey, challengeId);
                if (found) {
                    hasSubmission = true;
                }
            } else {
                const foundSubmission = await retry(() => getSubmissionsForChallenges([challengeId], nodeLicenseId), 3);
                if (foundSubmission[0] && foundSubmission[0].eligibleForPayout && !foundSubmission[0].claimed) {
                    hasSubmission = true;
                }
            }

            if (!hasSubmission) {
                updateNodeLicenseStatus(nodeLicenseId, beforeStatus[nodeLicenseId.toString()] || "Waiting for next challenge");
                safeStatusCallback();
                continue;
            }

            updateNodeLicenseStatus(nodeLicenseId, `Checking KYC Status`);
            safeStatusCallback();

            let isKYC: boolean = false;
            if (sentryWalletMap) {
                isKYC = sentryWalletMap[sentryKey.owner].isKYCApproved;
            } else {
                //If we are running on RPC we should not check every single pool key that did not come from an owner for KYC. 
                //The Referee will let the transaction go through but won't claim
                if (sentryKey.assignedPool != "0x") {
                    isKYC = true;
                } else {
                    //Cache KYC status on owner basis for each challenge
                    if (ownerKYCStatus[sentryKey.owner] === undefined) {
                        const [{ isKycApproved }] = await retry(async () => await checkKycStatus([sentryKey.owner]));
                        ownerKYCStatus[sentryKey.owner] = isKycApproved
                    }
                    isKYC = ownerKYCStatus[sentryKey.owner];
                }
            }

            if (isKYC) {
                if (!challengeToEligibleNodeLicensesMap.has(challengeId)) {
                    challengeToEligibleNodeLicensesMap.set(challengeId, []);
                }
                challengeToEligibleNodeLicensesMap.get(challengeId)?.push(BigInt(nodeLicenseId));

                updateNodeLicenseStatus(nodeLicenseId, `Claiming esXAI...`);
                safeStatusCallback();
            } else {

                if (!nonKYCWallets[sentryKey.owner]) {
                    nonKYCWallets[sentryKey.owner] = 0;
                }
                nonKYCWallets[sentryKey.owner]++;

                updateNodeLicenseStatus(nodeLicenseId, `Cannot Claim, Failed KYC`);
                safeStatusCallback();
            }

        } catch (error: any) {
            cachedLogger(`Error processing submissions for Sentry Key ${nodeLicenseId} - ${error && error.message ? error.message : error}`);
        }
    }

    const nonKYC = Object.keys(nonKYCWallets);
    if (nonKYC.length) {
        cachedLogger(`Failed KYC check for ${nonKYC.length} owners: `);
        nonKYC.forEach(w => {
            cachedLogger(`${w} (${nonKYCWallets[w]} keys)`);
        })
    }

    // Iterate over the map and call processClaimForChallenge for each challenge with its unique list of eligible nodeLicenseIds
    for (const [challengeId, nodeLicenseIds] of challengeToEligibleNodeLicensesMap) {
        const uniqueNodeLicenseIds = [...new Set(nodeLicenseIds)]; // Remove duplicates
        if (uniqueNodeLicenseIds.length > 0) {
            await processClaimForChallenge(challengeId, uniqueNodeLicenseIds, sentryKeysMap);
            uniqueNodeLicenseIds.forEach(key => {
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

    cachedLogger(`Received new challenge with number: ${challengeNumber}.`);
    cachedLogger(`Processing challenge...`);

    // Add a delay of 1 -300 seconds to the new challenge process so not all operators request the subgraph at the same time
    const delay = Math.floor(Math.random() * 301);
    await new Promise((resolve) => {
        setTimeout(resolve, delay * 1000);
    })

    try {
        const graphStatus = await getSubgraphHealthStatus();
        if (graphStatus.healthy) {
            const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } =
                await loadOperatorKeysFromGraph(operatorAddress, challengeNumber - 1n);

            await processNewChallenge(challengeNumber, challenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);
            // check the previous challenge, that should be closed now
            if (challengeNumber > BigInt(1)) {
                await processClosedChallenges(challengeNumber - BigInt(1), nodeLicenseIds, sentryKeysMap, sentryWalletMap);
            }


        } else {
            cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: ${graphStatus.error}`)

            const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC(operatorAddress);

            await processNewChallenge(challengeNumber, challenge, nodeLicenseIds, sentryKeysMap);
            // check the previous challenge, that should be closed now
            if (challengeNumber > BigInt(1)) {
                await processClosedChallenges(challengeNumber - BigInt(1), nodeLicenseIds, sentryKeysMap);
            }
        }
    } catch (error: any) {
        cachedLogger(`Error processing new challenge in listener callback: - ${error && error.message ? error.message : error}`);
    }


}


//Set the assignedPool field to our owner keys should they be staked
async function syncOwnerStakedKeysForRPC(owners: string[], sentryKeysMap: { [keyId: string]: SentryKey }): Promise<{ [keyId: string]: SentryKey }> {

    for (const owner of owners) {
        const ownerInteractedPools = await getUserInteractedPools(owner);

        if (ownerInteractedPools.length) {

            for (const pool of ownerInteractedPools) {

                const keys = await getUserStakedKeysOfPool(pool, owner);
                for (const key of keys) {

                    //The key needs to be in the list already
                    //We just need to check if we already mapped the pool because it was staked in one of the operators owned / delegated pools

                    if (!sentryKeysMap[key.toString()]) {
                        cachedLogger(`Error key not found in list of keys to operate, restart the operator to reload for \nowner: ${owner}, \npool: ${pool}, \nkey: ${key.toString()}.`);
                        continue;
                    }

                    sentryKeysMap[key.toString()].assignedPool = pool;
                }
            }
        }
    }

    return sentryKeysMap;
}

//Load all the keys from pool our operator should operate
//Exclude pool that are not in the whitelist
const reloadPoolKeysForRPC = async (
    operator: string,
    sentryKeysMap: { [keyId: string]: SentryKey },
    operatorOwners?: string[]
): Promise<{ [keyId: string]: SentryKey }> => {

    let operatorPoolAddresses = await getOwnerOrDelegatePools(operator);

    if (operatorOwners && operatorOwners.length) {
        operatorPoolAddresses = operatorPoolAddresses.filter(o => operatorOwners.includes(o.toLowerCase()))
    }

    if (operatorPoolAddresses.length) {

        cachedLogger(`Found ${operatorPoolAddresses.length} pools for operator.`);

        for (const pool of operatorPoolAddresses) {
            //Check every key and find out if its already in the nodeLicenseIds list
            cachedLogger(`Fetching node licenses for pool ${pool}.`);

            const keys = await getKeysOfPool(pool);

            for (const key of keys) {


                if (sentryKeysMap[key.toString()]) {

                    sentryKeysMap[key.toString()].assignedPool = pool;

                } else {

                    if (!mintTimestamps[key.toString()]) {
                        mintTimestamps[key.toString()] = await retry(async () => await getMintTimestamp(key))
                    }

                    sentryKeysMap[key.toString()] = {
                        assignedPool: pool,
                        keyId: key,
                        mintTimeStamp: mintTimestamps[key.toString()],
                        id: key.toString(),
                        owner: "",
                        sentryWallet: {} as any,
                        submissions: []
                    }
                }

            }
        }
    }

    return sentryKeysMap;
}


/**
 * Load all the operating keys and metadata from the subgraph.
 * This should run on every challenge and will find all keys and pool for this operator, including key timestamps, assigned pools and owner kyc status
 * It will also attach submission objects to each sentryKey for processing the last closed challenge
 *  
 * @param operator - The public key of the operator wallet
 * @param latestChallengeNumber - The latest challenge number we should attach submissions to the sentry keys for
 * @param submissionsFilter - The filter for the submissions if submissions should be included
 * @returns mapped sentry key objects, pool objects, owner information and Referee config (this will be used to locally calculate the boost Factor)
 */
const loadOperatorKeysFromGraph = async (
    operator: string,
    latestChallengeNumber?: bigint
): Promise<{
    wallets: SentryWallet[],
    sentryKeys: SentryKey[],
    sentryWalletMap: { [owner: string]: SentryWallet },
    sentryKeysMap: { [keyId: string]: SentryKey },
    nodeLicenseIds: bigint[],
    mappedPools: { [poolAddress: string]: PoolInfo },
    refereeConfig: RefereeConfig
}> => {
    cachedLogger(`Loading all wallets assigned to the operator.`);
    if (passedInOwnersAndPools && passedInOwnersAndPools.length) {
        cachedLogger(`Operator owners were passed in.`);
    } else {
        cachedLogger(`No operator owners were passed in.`);
    }

    // Load all operator addresses and pool addresses, pass in the whitelist to get them filtered
    // refereeConfig will be used to locally calculate the boos factor (hold tier thresholds and boostFactors as well as max staking capacity per key)
    const { wallets, pools, refereeConfig } = await retry(() => getSentryWalletsForOperator(operator, passedInOwnersAndPools));

    const mappedPools: { [poolAddress: string]: PoolInfo } = {};

    cachedLogger(`Found ${wallets.length} operatorWallets. The addresses are: ${wallets.map(w => w.address).join(', ')}`);
    if (pools.length) {
        pools.forEach(p => { mappedPools[p.address] = p });
        cachedLogger(`Found ${pools.length} pools. The addresses are: ${Object.keys(mappedPools).join(', ')}`);
    }

    // Load SentryKey objects from the subgraph
    const sentryKeys = await retry(() => getSentryKeysFromGraph(
        wallets.map(w => w.address),
        pools.map(p => p.address),
        true,
        { latestChallengeNumber, eligibleForPayout: true, claimed: false }
    ));

    const sentryWalletMap: { [owner: string]: SentryWallet } = {}
    const sentryKeysMap: { [keyId: string]: SentryKey } = {}
    const nodeLicenseIds: bigint[] = [];

    //Map the sentryWallet object and cache the owners so we can use them should the subgraph go down during runtime
    cachedOperatorWallets = [];
    wallets.forEach(w => {
        sentryWalletMap[w.address] = w;
        cachedOperatorWallets.push(w.address.toLowerCase());
    })

    let keyOfOwnerCount = 0;
    let keyOfPoolsCount = 0;

    const keyPools: Set<string> = new Set();
    cachedKeysOfOwner = {}

    //Map the sentryKeys for use in operator
    //Create the updated nodeLicenseIds array
    //Cache the owner keys so we can use them should the subgraph go down during runtime
    sentryKeys.forEach(s => {
        if (!sentryWalletMap[s.owner]) {
            sentryWalletMap[s.owner] = s.sentryWallet
        }
        sentryKeysMap[s.keyId.toString()] = s;
        if (!nodeLicenseIds.includes(BigInt(s.keyId))) {
            nodeLicenseIds.push(BigInt(s.keyId));
        }
        if (s.assignedPool == "0x") {
            keyOfOwnerCount++;
        } else {
            keyPools.add(s.assignedPool);
            if (cachedOperatorWallets.includes(s.owner.toLowerCase())) {
                keyOfOwnerCount++;
            } else {
                keyOfPoolsCount++;
            }
        }
        nodeLicenseStatusMap.set(BigInt(s.keyId), {
            ownerPublicKey: s.owner,
            status: NodeLicenseStatus.WAITING_IN_QUEUE,
        });

        mintTimestamps[s.keyId.toString()] = s.mintTimeStamp;
        if (cachedOperatorWallets.includes(s.owner.toLowerCase())) {
            cachedKeysOfOwner[s.keyId.toString()] = s;
        }
    });

    //Cleanup removed keys from nodeLicenseStatusMap
    for (const [key] of nodeLicenseStatusMap.entries()) {
        if (!sentryKeysMap[key.toString()]) {
            nodeLicenseStatusMap.delete(key);
        }
    }

    // If we have keys from pools we would not operate from the owners map the pool metadata for 
    if (keyPools.size) {
        const keyPoolsData = await retry(() => getPoolInfosFromGraph([...keyPools]));
        keyPoolsData.pools.forEach(p => {
            mappedPools[p.address] = p;
        })
    }

    safeStatusCallback();

    cachedLogger(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);
    cachedLogger(`Fetched ${keyOfOwnerCount} keys of owners.`);
    cachedLogger(`Fetched ${keyOfPoolsCount} keys of pools.`);

    return { wallets, sentryKeys, sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig };
}

/**
 * Load all the operating keys and metadata from the RPC.
 * This should run on every challenge and will find all keys and pool for this operator.
 * It will used cached operators and cached keys from owners but will refresh all pool keys and assigned pools from owner keys
 *  
 * @param operator - The public key of the operator wallet
 * @returns mapped sentry key objects
 */
const loadOperatorKeysFromRPC = async (
    operator: string
): Promise<{
    sentryKeysMap: { [keyId: string]: SentryKey },
    nodeLicenseIds: bigint[],
}> => {

    let owners;

    //If we don't have the owners we fetch them from the RPC
    if (!cachedOperatorWallets) {
        cachedLogger(`Loading all wallets assigned to the operator.`);
        //We need to get all approved owners so we can filter against pools
        const ownersForOperator = (await retry(async () => await listOwnersForOperator(operator))).map(o => o.toLowerCase());
        cachedLogger(`Found associated owners: ${ownersForOperator.join(', ')}`);
        cachedOperatorWallets = [operator.toLowerCase(), ...ownersForOperator];
        // get a list of all the owners that are added to this operator
        if (passedInOwnersAndPools && passedInOwnersAndPools.length) {
            cachedLogger(`Operator owners were passed in. ${passedInOwnersAndPools.join(', ')}`);
            cachedOperatorWallets = cachedOperatorWallets.filter(o => passedInOwnersAndPools?.includes(o));
        } else {
            cachedLogger(`No operator owners were passed in.`);
        }
    }

    owners = [...cachedOperatorWallets]
    cachedLogger(`Found ${owners.length} operatorWallets. The addresses are: ${owners.join(', ')}`);


    const nodeLicenseIds: bigint[] = [];
    let sentryKeysMap: { [keyId: string]: SentryKey } = {}

    //If we don't have cached keys from owner we fetch them and the metadata from the RPC
    if (!cachedKeysOfOwner) {
        cachedKeysOfOwner = {};

        for (const owner of owners) {
            cachedLogger(`Fetching node licenses for owner ${owner}.`);
            const licensesOfOwner = await listNodeLicenses(owner, (keyId) => {
                cachedLogger(`Fetched node licenses key ${keyId.toString()}.`);
            });

            for (const licenseId of licensesOfOwner) {

                if (!mintTimestamps[licenseId.toString()]) {
                    mintTimestamps[licenseId.toString()] = await retry(async () => await getMintTimestamp(licenseId))
                }

                const sentryKey: SentryKey = {
                    assignedPool: "0x",
                    keyId: licenseId,
                    mintTimeStamp: mintTimestamps[licenseId.toString()],
                    id: licenseId.toString(),
                    owner: owner,
                    sentryWallet: {} as any,
                    submissions: []
                }
                cachedKeysOfOwner[licenseId.toString()] = sentryKey;
                sentryKeysMap[licenseId.toString()] = sentryKey;
            }

            if (licensesOfOwner.length) {
                cachedLogger(`Fetched ${licensesOfOwner.length} node licenses for owner ${owner}.`);
            }
        }
    } else {
        sentryKeysMap = { ...cachedKeysOfOwner }
    }

    const keysOfOwnersCount = Object.keys(sentryKeysMap).length;
    // Map the keys from pools our operator should operate, filter pools if passedInOwnersAndPools whitelist is enabled
    sentryKeysMap = await reloadPoolKeysForRPC(operator, sentryKeysMap, passedInOwnersAndPools);

    // Map all the assigned pools from keys of owners
    sentryKeysMap = await syncOwnerStakedKeysForRPC(owners, sentryKeysMap);

    // Sync the nodeLicenseStatusMap
    Object.keys(sentryKeysMap).forEach(key => {
        nodeLicenseIds.push(BigInt(key))
        nodeLicenseStatusMap.set(BigInt(key), {
            ownerPublicKey: sentryKeysMap[key].owner,
            status: NodeLicenseStatus.WAITING_IN_QUEUE,
        });
    });

    //Cleanup removed keys from nodeLicenseStatusMap
    for (const [key] of nodeLicenseStatusMap.entries()) {
        if (!sentryKeysMap[key.toString()]) {
            nodeLicenseStatusMap.delete(key);
        }
    }

    safeStatusCallback();

    cachedLogger(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);
    cachedLogger(`Fetched ${keysOfOwnersCount} keys of owners.`);
    cachedLogger(`Fetched ${Object.keys(sentryKeysMap).length - keysOfOwnersCount} keys of pools.`);

    return { sentryKeysMap, nodeLicenseIds }
}

// Process past challenges from subgraph submissions
// This will first sort all keys and their submissions by challenge and then process each challenge
// This could block the thread since its not loading any additional information from any external resource so a await for a timeout is required
// In future updates it should be considered to run this in its own thread but the desktop client and cli will both have to support the implementation
const processPastChallenges = async (
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
    sentryWalletMap: { [owner: string]: SentryWallet },
    openChallengeNumber: number,
    latestClaimableChallenge: number
) => {

    cachedLogger(`Processing closed challenges ${openChallengeNumber} - ${latestClaimableChallenge} for ${nodeLicenseIds.length} keys.`);

    const challengeToKeys: { [challenge: string]: bigint[] } = {}

    // For each key map all submissions to the challengeNumber
    for (let i = 0; i < nodeLicenseIds.length; i++) {
        const keyId = nodeLicenseIds[i].toString();

        if (sentryKeysMap[keyId].submissions.length) {
            //Map each submission of the key to the challengeNumber
            sentryKeysMap[keyId].submissions.forEach(s => {
                if (!challengeToKeys[s.challengeNumber.toString()]) {
                    challengeToKeys[s.challengeNumber.toString()] = []
                }
                challengeToKeys[s.challengeNumber.toString()].push(nodeLicenseIds[i])
            })
        }

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }

    // Sort all challenges that have unclaimed submissions by challengeNumber
    const openChallenges = Object.keys(challengeToKeys);
    cachedLogger(`Found ${openChallenges.length} challenges to process...`);
    openChallenges.sort(function (a, b) { return Number(b) - Number(a) });

    // Process each mapped challenge with only the keys that have submissions
    for (let i = 0; i < openChallenges.length; i++) {
        cachedLogger(`Processing closed challenge ${openChallenges[i]} for ${challengeToKeys[openChallenges[i]].length} keys ...`);
        await processClosedChallenges(BigInt(openChallenges[i]), challengeToKeys[openChallenges[i]], sentryKeysMap, sentryWalletMap);

        await new Promise((resolve) => {
            setTimeout(resolve, 100);
        });
    }
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
    passedInOwnersAndPools = operatorOwners ? operatorOwners.map(o => o.toLowerCase()) : operatorOwners;

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

    let closeChallengeListener: () => void;
    logFunction(`Started listener for new challenges.`);

    const graphStatus = await getSubgraphHealthStatus();
    if (graphStatus.healthy) {
        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        const openChallenge = await retry(() => getLatestChallengeFromGraph());
        // Calculate the latest challenge we should load from the graph
        const latestClaimableChallenge = Number(openChallenge.challengeNumber) <= MAX_CHALLENGE_CLAIM_AMOUNT ? 1 : Number(openChallenge.challengeNumber) - MAX_CHALLENGE_CLAIM_AMOUNT;

        // Load all sentryKey objects including all winning and unclaimed submissions up until latestClaimableChallenge
        const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } =
            await retry(() => loadOperatorKeysFromGraph(operatorAddress, BigInt(latestClaimableChallenge)));

        await processNewChallenge(BigInt(openChallenge.challengeNumber), openChallenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);
        logFunction(`Processing open challenges.`);

        //Remove submissions for current challenge so we don't process it again
        nodeLicenseIds.forEach(n => {
            const found = findSubmissionOnSentryKey(sentryKeysMap[n.toString()], BigInt(openChallenge.challengeNumber));
            if (found) {
                sentryKeysMap[n.toString()].submissions.splice(found.index, 1);
            }
        });

        //Process all past challenges check for unclaimed
        processPastChallenges(
            nodeLicenseIds,
            sentryKeysMap,
            sentryWalletMap,
            openChallenge.challengeNumber,
            latestClaimableChallenge
        ).then(() => {
            logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
        })

    } else {
        cachedLogger(`Revert to RPC call instead of using subgraph. Subgraph status error: ${graphStatus.error}`)

        const { sentryKeysMap, nodeLicenseIds } = await loadOperatorKeysFromRPC(operatorAddress);

        const [latestChallengeNumber, latestChallenge] = await getLatestChallenge();
        await processNewChallenge(latestChallengeNumber, latestChallenge, nodeLicenseIds, sentryKeysMap);

        closeChallengeListener = listenForChallenges(listenForChallengesCallback)

        logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);
    }

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
