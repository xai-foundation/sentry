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
    getPoolInfosFromGraph
} from "../index.js";
import axios from "axios";
import { PoolInfo, RefereeConfig, SentryKey, SentryWallet, Submission } from "@sentry/sentry-subgraph-client";
import { GraphQLClient } from 'graphql-request'

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

const graphClient = new GraphQLClient(config.subgraphEndpoint);

// SUBGRAPH EDIT
let nodeLicenseStatusMap: NodeLicenseStatusMap = new Map();
let cachedOperatorOwners: string[] | undefined;

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
    sentryWalletMap: { [address: string]: SentryWallet },
    mappedPools: { [poolAddress: string]: PoolInfo },
    refereeConfig: RefereeConfig
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
                cachedBoostFactor[keyOwner] = calculateBoostFactor(sentryKey, sentryWalletMap[sentryKey.owner], mappedPools, refereeConfig);
                cachedLogger(`Found chance boost of ${Number(cachedBoostFactor[keyOwner]) / 100}% for ${isPool ? "pool" : "owner"} ${keyOwner}`);
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
            const foundSubmission = sentryKey.submissions.find(s => s.challengeNumber.toString() == challengeNumber.toString());
            if (foundSubmission) {
                cachedLogger(`Sentry Key ${nodeLicenseId} has submitted for challenge ${challengeNumber} by another node. If multiple nodes are running, this message can be ignored.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }

            cachedLogger(`Adding Sentry Key ${nodeLicenseId} to batch for bulk submission for challenge ${challengeNumber}.`);
            batchedWinnerKeys.push(nodeLicenseId);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);

        } catch (error: any) {
            cachedLogger(`Error submitting assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

    }

    cachedLogger(`${nonWinnerKeysCount} / ${nodeLicenseIds.length} keys did not accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);

    if (batchedWinnerKeys.length) {
        await submitMultipleAssertions(batchedWinnerKeys, challengeNumber, challenge.assertionStateRootOrConfirmData, KEYS_PER_BATCH, cachedSigner, cachedLogger);
        cachedLogger(`Submitted assertion for ${batchedWinnerKeys.length} Sentry Keys `);
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
    sentryWalletMap: { [owner: string]: SentryWallet },
    removeSubmissionAfterProcess: boolean = false
) {
    const challengeToEligibleNodeLicensesMap: Map<bigint, bigint[]> = new Map();

    const beforeStatus: { [key: string]: string | undefined } = {}

    for (const nodeLicenseId of nodeLicenseIds) {

        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];
        beforeStatus[nodeLicenseId.toString()] = nodeLicenseStatusMap.get(nodeLicenseId)?.status;
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.QUERYING_FOR_UNCLAIMED_SUBMISSIONS);
        safeStatusCallback();

        updateNodeLicenseStatus(nodeLicenseId, `Checking KYC Status`);
        safeStatusCallback();

        if (!sentryWalletMap[sentryKey.owner].isKYCApproved) {
            cachedLogger(`Checked KYC status of '${sentryKey.owner}' for Sentry Key '${nodeLicenseId}'. It was not KYC'd and not able to claim the reward.`);
            updateNodeLicenseStatus(nodeLicenseId, `Cannot Claim, Failed KYC`);
            safeStatusCallback();
            continue;
        } else {
            updateNodeLicenseStatus(nodeLicenseId, `Checking for unclaimed rewards for challenge '${challengeId}'.`);
            safeStatusCallback();
        }

        try {

            const found = findSubmissionOnSentryKey(sentryKey, challengeId);

            if (found) {
                if (!challengeToEligibleNodeLicensesMap.has(challengeId)) {
                    challengeToEligibleNodeLicensesMap.set(challengeId, []);
                }
                challengeToEligibleNodeLicensesMap.get(challengeId)?.push(BigInt(nodeLicenseId));

                if (removeSubmissionAfterProcess) {
                    sentryKey.submissions.splice(found.index, 1);
                }
            }

        } catch (error: any) {
            cachedLogger(`Error processing submissions for Sentry Key ${nodeLicenseId} - ${error && error.message ? error.message : error}`);
        }
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

    const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } =
        await loadOperatingKeys(operatorAddress, cachedOperatorOwners, challengeNumber - 1n);

    await processNewChallenge(challengeNumber, challenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);

    // check the previous challenge, that should be closed now
    if (challengeNumber > BigInt(1)) {
        await processClosedChallenges(challengeNumber - BigInt(1), nodeLicenseIds, sentryKeysMap, sentryWalletMap);
    }
}

const loadOperatingKeys = async (operator: string, operatorOwners?: string[], latestChallengeNumber?: bigint) => {

    cachedLogger(`Getting all wallets assigned to the operator.`);
    if (operatorOwners && operatorOwners.length) {
        cachedLogger(`Operator owners were passed in.`);
    } else {
        cachedLogger(`No operator owners were passed in.`);
    }
    const { wallets, pools, refereeConfig } = await retry(() => getSentryWalletsForOperator(graphClient, operator, operatorOwners));

    const mappedPools: { [poolAddress: string]: PoolInfo } = {};

    cachedLogger(`Found ${wallets.length} operatorWallets. The addresses are: ${wallets.map(w => w.address).join(', ')}`);
    if (pools.length) {
        pools.forEach(p => { mappedPools[p.address] = p });
        cachedLogger(`Found ${pools.length} pools. The addresses are: ${Object.keys(mappedPools).join(', ')}`);
    }

    const sentryKeys = await retry(() => getSentryKeysFromGraph(
        graphClient,
        wallets.map(w => w.address),
        pools.map(p => p.address),
        true,
        { latestChallengeNumber, eligibleForPayout: true, claimed: false }
    ));

    const sentryWalletMap: { [owner: string]: SentryWallet } = {}
    const sentryKeysMap: { [keyId: string]: SentryKey } = {}
    const nodeLicenseIds: bigint[] = [];

    wallets.forEach(w => {
        sentryWalletMap[w.address] = w;
    })

    let keyOfOwnerCount = 0;
    let keyOfPoolsCount = 0;

    const keyPools: Set<string> = new Set();

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
            keyOfPoolsCount++;
        }
        nodeLicenseStatusMap.set(BigInt(s.keyId), {
            ownerPublicKey: s.owner,
            status: NodeLicenseStatus.WAITING_IN_QUEUE,
        });
    });

    if (keyPools.size) {
        const keyPoolInfos = await getPoolInfosFromGraph(graphClient, [...keyPools]);
        keyPoolInfos.forEach(p => {
            mappedPools[p.address] = p;
        })
    }

    safeStatusCallback();
    cachedLogger(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);
    cachedLogger(`Fetched ${keyOfOwnerCount} keys of owners and ${keyOfPoolsCount} keys staked in pools.`);

    return { wallets, sentryKeys, sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig };
}

const processPastChallenges = async (
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
    sentryWalletMap: { [owner: string]: SentryWallet },
    openChallengeNumber: number,
    latestClaimableChallenge: number
) => {

    cachedLogger(`Processing closed challenges ${openChallengeNumber} - ${latestClaimableChallenge} for ${nodeLicenseIds.length} keys.`);

    let filteredLicenseIds = nodeLicenseIds.filter(n => {
        return sentryKeysMap[n.toString()].submissions.length > 0
    });;

    for (let i = openChallengeNumber - 1; i >= latestClaimableChallenge; i--) {
        if (filteredLicenseIds.length == 0) {
            break;
        }

        cachedLogger(`Processing closed challenge ${i} for ${filteredLicenseIds.length} keys ...`);
        await processClosedChallenges(BigInt(i), filteredLicenseIds, sentryKeysMap, sentryWalletMap, true);

        await new Promise((resolve) => {
            filteredLicenseIds = filteredLicenseIds.filter(n => {
                return sentryKeysMap[n.toString()].submissions.length > 0
            });
            //Add sleep so we don't block the challenge listener.
            //This should be refactored using web workers
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
    cachedOperatorOwners = operatorOwners;

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

    const closeChallengeListener = listenForChallenges(listenForChallengesCallback);
    logFunction(`Started listener for new challenges.`);

    // Process open challenge
    const openChallenge = await retry(() => getLatestChallengeFromGraph(graphClient));

    const latestClaimableChallenge = Number(openChallenge.challengeNumber) <= 4320 ? 1 : Number(openChallenge.challengeNumber) - 4320;
    const { sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig } = await loadOperatingKeys(operatorAddress, operatorOwners, BigInt(latestClaimableChallenge));

    logFunction(`Processing open challenges.`);

    await processNewChallenge(BigInt(openChallenge.challengeNumber), openChallenge, nodeLicenseIds, sentryKeysMap, sentryWalletMap, mappedPools, refereeConfig);

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
