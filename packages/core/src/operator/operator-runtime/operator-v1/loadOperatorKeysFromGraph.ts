import { SentryKey, SentryWallet, PoolInfo, RefereeConfig } from "@sentry/sentry-subgraph-client";
import { operatorState } from "../operatorState.js";
import { getPoolInfosFromGraph, getSentryKeysFromGraph, NodeLicenseStatus, retry } from "../../../index.js";


/**
 * Load all the operating keys and metadata from the subgraph.
 * This should run on every challenge and will find all keys and pool for this operator, including key timestamps, assigned pools and owner kyc status
 * It will also attach submission objects to each sentryKey for processing the last closed challenge
 *  
 * @param operator - The public key of the operator wallet
 * @param latestChallengeNumber - The latest challenge number we should attach submissions to the sentry keys for
 * @returns mapped sentry key objects, pool objects, owner information and Referee config (this will be used to locally calculate the boost Factor)
 */
export const loadOperatorKeysFromGraph_V1 = async (
    operator: string,    
    wallets: SentryWallet[],
    pools: PoolInfo[],
    refereeConfig: RefereeConfig,
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
    
    operatorState.cachedLogger(`Loading all wallets assigned to the operator.`);
    if (operatorState.passedInOwnersAndPools && operatorState.passedInOwnersAndPools.length) {
        operatorState.cachedLogger(`Operator owners were passed in.`);
    } else {
        operatorState.cachedLogger(`No operator owners were passed in.`);
    }

    if (wallets.length == 0 && pools.length == 0) {
        operatorState.cachedLogger(`No operatorWallets found, approve your wallet for operating keys or delegate it to a staking pool to operate for it.`);
        return { wallets: [], sentryKeys: [], sentryWalletMap: {}, sentryKeysMap: {}, nodeLicenseIds: [], mappedPools: {}, refereeConfig };
    }

    if (wallets.length > 0) {
        operatorState.cachedLogger(`Found ${wallets.length} operatorWallets. The addresses are: ${wallets.map(w => w.address).join(', ')}`);
    }

    const mappedPools: { [poolAddress: string]: PoolInfo } = {};

    if (pools.length) {
        pools.forEach(p => { mappedPools[p.address] = p });
        operatorState.cachedLogger(`Found ${pools.length} pools. The addresses are: ${Object.keys(mappedPools).join(', ')}`);
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
    operatorState.cachedOperatorWallets = [];
    wallets.forEach(w => {
        sentryWalletMap[w.address] = w;
        operatorState.cachedOperatorWallets.push(w.address.toLowerCase());
    })

    let keyOfOwnerCount = 0;
    let keyOfPoolsCount = 0;

    const keyPools: Set<string> = new Set();
    operatorState.cachedKeysOfOwner = {}

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
            if (operatorState.cachedOperatorWallets.includes(s.owner.toLowerCase())) {
                keyOfOwnerCount++;
            } else {
                keyOfPoolsCount++;
            }
        }
        operatorState.nodeLicenseStatusMap.set(BigInt(s.keyId), {
            ownerPublicKey: s.owner,
            status: NodeLicenseStatus.WAITING_IN_QUEUE,
        });

        operatorState.mintTimestamps[s.keyId.toString()] = s.mintTimeStamp;
        if (operatorState.cachedOperatorWallets.includes(s.owner.toLowerCase())) {
            operatorState.cachedKeysOfOwner[s.keyId.toString()] = s;
        }
    });

    //Cleanup removed keys from nodeLicenseStatusMap
    for (const [key] of operatorState.nodeLicenseStatusMap.entries()) {
        if (!sentryKeysMap[key.toString()]) {
            operatorState.nodeLicenseStatusMap.delete(key);
        }
    }

    // If we have keys from pools we would not operate from the owners map the pool metadata for 
    if (keyPools.size) {
        const keyPoolsData = await retry(() => getPoolInfosFromGraph([...keyPools]));
        keyPoolsData.pools.forEach(p => {
            mappedPools[p.address] = p;
        })
    }

    operatorState.safeStatusCallback();

    operatorState.cachedLogger(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);
    operatorState.cachedLogger(`Fetched ${keyOfOwnerCount} keys of owners.`);
    operatorState.cachedLogger(`Fetched ${keyOfPoolsCount} keys of pools.`);

    return { wallets, sentryKeys, sentryWalletMap, sentryKeysMap, nodeLicenseIds, mappedPools, refereeConfig };
}