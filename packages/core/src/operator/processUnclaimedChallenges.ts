import { ethers } from "ethers";
import {
    claimRewardsBulk,
    getLatestChallengeFromGraph,
    getPoolInfosFromGraph,
    getSentryKeysForUnclaimedFromGraph,
    getSentryWalletsForOperator,
    KEYS_PER_BATCH,
    MAX_CHALLENGE_CLAIM_AMOUNT,
    retry
} from "../index.js";
import { PoolInfo, SentryKey } from "@sentry/sentry-subgraph-client";
import { findSubmissionOnSentryKey } from "./operator-runtime/index.js";

// Set this to the last key ID before the TK Airdrop
const MAX_KEY_ID_SOLO_SUBMISSIONS = 40_000;

let cachedLogger: (log: string) => void;
let cachedSigner: ethers.Signer;

/**
 * Function to process unclaimed key-based challenges.
 * @param {ethers.Signer} signer - The signer.
 * @param {((log: string) => void)} [logFunction] - Optional function to log the process.
 * @param {string[]} [allowList] - Optional array of addresses, if passed in we will only claim for these addresses.
 * @returns {Promise<() => Promise<void>>} The stop function.
 */
export async function processUnclaimedChallenges(
    signer: ethers.Signer,
    logFunction: (log: string) => void = (_) => { },
    allowList?: string[]
): Promise<void> {
    cachedSigner = signer;
    cachedLogger = logFunction;

    // get the address of the operator
    const operatorAddress = await signer.getAddress();
    cachedLogger(`Fetched address of operator ${operatorAddress}.`);

    const { wallets, pools } = await retry(() => getSentryWalletsForOperator(operatorAddress, {}, allowList));

    if (wallets.length == 0 && pools.length == 0) {
        cachedLogger(`No operatorWallets found.`);
        return;
    }

    if (wallets.length > 0) {
        cachedLogger(`Found ${wallets.length} operatorWallets.`);
    }

    const mappedPools: { [poolAddress: string]: PoolInfo } = {};

    if (pools.length) {
        pools.forEach(p => { mappedPools[p.address] = p });
        cachedLogger(`Found ${pools.length} pools.`);
    }

    const openChallenge = await retry(() => getLatestChallengeFromGraph());

    // Calculate the latest challenge we should load from the graph
    const latestClaimableChallenge = Number(openChallenge.challengeNumber) <= MAX_CHALLENGE_CLAIM_AMOUNT ? 1 : Number(openChallenge.challengeNumber) - MAX_CHALLENGE_CLAIM_AMOUNT;

    const sentryKeys = await retry(() => getSentryKeysForUnclaimedFromGraph(
        wallets.map(w => w.address),
        pools.map(p => p.address),
        BigInt(latestClaimableChallenge),
        MAX_KEY_ID_SOLO_SUBMISSIONS
    ));

    const sentryKeysMap: { [keyId: string]: SentryKey } = {}
    const nodeLicenseIds: bigint[] = [];
    const keyPools: Set<string> = new Set();


    sentryKeys.forEach(s => {
        sentryKeysMap[s.keyId.toString()] = s;
        if (!nodeLicenseIds.includes(BigInt(s.keyId))) {
            nodeLicenseIds.push(BigInt(s.keyId));
        }
        if (s.assignedPool != "0x") {
            keyPools.add(s.assignedPool);
        }
    });

    if (keyPools.size) {
        const keyPoolsData = await retry(() => getPoolInfosFromGraph([...keyPools]));
        keyPoolsData.pools.forEach(p => {
            mappedPools[p.address] = p;
        })
    }

    await processPastChallenges(
        nodeLicenseIds,
        sentryKeysMap,
        openChallenge.challengeNumber,
        latestClaimableChallenge
    );

    cachedLogger(`Process unclaimed submissions finished.`);
}


const processPastChallenges = async (
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey },
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
    }

    // Sort all challenges that have unclaimed submissions by challengeNumber
    const openChallenges = Object.keys(challengeToKeys);
    cachedLogger(`Found ${openChallenges.length} challenges to process...`);
    openChallenges.sort(function (a, b) { return Number(b) - Number(a) });

    // Process each mapped challenge with only the keys that have submissions
    for (let i = 0; i < openChallenges.length; i++) {
        cachedLogger(`Processing closed challenge ${openChallenges[i]} for ${challengeToKeys[openChallenges[i]].length} keys ...`);
        await processClosedChallenges(BigInt(openChallenges[i]), challengeToKeys[openChallenges[i]], sentryKeysMap);
    }
}

async function processClosedChallenges(
    challengeId: bigint,
    nodeLicenseIds: bigint[],
    sentryKeysMap: { [keyId: string]: SentryKey }
) {
    const challengeToEligibleNodeLicensesMap: Map<bigint, bigint[]> = new Map();

    for (const nodeLicenseId of nodeLicenseIds) {

        const sentryKey = sentryKeysMap[nodeLicenseId.toString()];

        try {
            const found = findSubmissionOnSentryKey(sentryKey, challengeId);
            if (!found) {
                continue;
            }

            if (!challengeToEligibleNodeLicensesMap.has(challengeId)) {
                challengeToEligibleNodeLicensesMap.set(challengeId, []);
            }
            challengeToEligibleNodeLicensesMap.get(challengeId)?.push(BigInt(nodeLicenseId));

        } catch (error: any) {
            cachedLogger(`Error processing submissions for Sentry Key ${nodeLicenseId} - ${error && error.message ? error.message : error}`);
        }
    }

    // Iterate over the map and call processClaimForChallenge for each challenge with its unique list of eligible nodeLicenseIds
    for (const [challengeId, nodeLicenseIds] of challengeToEligibleNodeLicensesMap) {
        const uniqueNodeLicenseIds = [...new Set(nodeLicenseIds)]; // Remove duplicates
        if (uniqueNodeLicenseIds.length > 0) {
            await processClaimForChallenge(challengeId, uniqueNodeLicenseIds, sentryKeysMap);
        }
    }
}

// Helper function to process claim in batches
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