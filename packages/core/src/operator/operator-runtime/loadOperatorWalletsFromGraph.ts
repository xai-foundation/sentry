import { SentryWallet, PoolInfo } from "@sentry/sentry-subgraph-client";
import { operatorState } from "./operatorState.js";
import { BulkOwnerOrPool, NodeLicenseStatus, retry } from "../../index.js";
import { getUserStakedPoolsFromGraph } from "../../subgraph/getUserStakedPoolsFromGraph.js";

/**
 * Load all the wallets and pools we should operate from the subgraph.
 * This should run on every challenge and will find all wallets and pools for this operator
 *  
 * @param operator - The public key of the operator wallet
 * @param sentryWalletData - The sentryWallets, PoolInfos and RefereeConfig queried from getSentryWalletsForOperator for the operatorWallet
 * @param latestChallengeNumber - The latest challenge number we should attach submissions to the sentry keys for
 * @returns {Promise<BulkOwnerOrPool[]>} mapped wallet / pool objects with their submissions
 */
export const loadOperatorWalletsFromGraph = async (
    operator: string,
    sentryWalletData: { wallets: SentryWallet[], pools: PoolInfo[] },
    latestChallengeNumber?: bigint,
): Promise<BulkOwnerOrPool[]> => {
    operatorState.cachedLogger(`Loading all wallets assigned to the operator.`);
    if (operatorState.passedInOwnersAndPools && operatorState.passedInOwnersAndPools.length) {
        operatorState.cachedLogger(`Operator owners were passed in.`);
    } else {
        operatorState.cachedLogger(`No operator owners were passed in.`);
    }

    const { wallets, pools } = sentryWalletData;

    if (wallets.length == 0 && pools.length == 0) {
        operatorState.cachedLogger(`No operatorWallets found, approve your wallet for operating keys or delegate it to a staking pool to operate for it.`);
        return [];
    }

    const bulkOwnerAndPools: BulkOwnerOrPool[] = [];

    //Map sentry wallets to BulkOwnerOrPool
    if (wallets.length > 0) {
        operatorState.cachedOperatorWallets = [];
        operatorState.cachedLogger(`Found ${wallets.length} operatorWallets. The addresses are: ${wallets.map(w => w.address).join(', ')}`);
        wallets.forEach(w => {
            operatorState.cachedOperatorWallets.push(w.address.toLowerCase());
            bulkOwnerAndPools.push({ ...w, keyCount: w.keyCount - w.stakedKeyCount, isPool: false, stakedEsXaiAmount: w.v1EsXaiStakeAmount })
            operatorState.sentryAddressStatusMap.set(w.address.toLowerCase(), {
                ownerPublicKey: w.address,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });
        });
    }

    const mappedPools: { [poolAddress: string]: PoolInfo } = {};

    //Map PoolInfos to BulkOwnerOrPool
    if (pools.length) {
        pools.forEach(p => {
            mappedPools[p.address] = p;
            bulkOwnerAndPools.push({ ...p, keyCount: p.totalStakedKeyAmount, isPool: true, name: p.metadata[0], bulkSubmissions: p.submissions, stakedEsXaiAmount: p.totalStakedEsXaiAmount })
            operatorState.sentryAddressStatusMap.set(p.address.toLowerCase(), {
                ownerPublicKey: p.address,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });
        });
        operatorState.cachedLogger(`Found ${pools.length} owned/delegated pools. The addresses are: ${Object.keys(mappedPools).join(', ')}`);
    }

    //Load pools our operators have keys staked in
    const stakedPools = await retry(async () => getUserStakedPoolsFromGraph(wallets.map(w => w.address), pools.map(p => p.address), true, { winningKeyCount: true, claimed: false, latestChallengeNumber }))

    const mappedPoolsInteractedPools: { [key: string]: BulkOwnerOrPool } = {}
    stakedPools.forEach(p => {
        if (!mappedPools[p.address]) {
            if (
                operatorState.passedInOwnersAndPools && operatorState.passedInOwnersAndPools.length &&
                !operatorState.passedInOwnersAndPools.includes(p.address.toLowerCase())
            ) {
                return;
            }

            mappedPoolsInteractedPools[p.address.toLowerCase()] = p;
            bulkOwnerAndPools.push(p)
            operatorState.sentryAddressStatusMap.set(p.address.toLowerCase(), {
                ownerPublicKey: p.address,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });

        }
    })

    operatorState.cachedLogger(`Found ${Object.keys(mappedPoolsInteractedPools).length} pools with stakedKeys. The addresses are: ${Object.keys(mappedPoolsInteractedPools).join(', ')}`);

    //Cleanup removed keys from nodeLicenseStatusMap
    for (const [key] of operatorState.sentryAddressStatusMap.entries()) {
        if (!bulkOwnerAndPools.find(b => b.address.toLowerCase() == key.toLowerCase())) {
            operatorState.sentryAddressStatusMap.delete(key);
        }
    }

    return bulkOwnerAndPools;
}