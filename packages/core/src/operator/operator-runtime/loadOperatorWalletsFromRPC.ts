import { operatorState } from "./operatorState.js";
import { BulkOwnerOrPool, getMultipleUsersInteractedPoolsRpc, getOwnerOrDelegatePools, getPoolInfo, listOwnersForOperator, NodeLicenseStatus, retry } from "../../index.js";
import { getUnStakedKeysOfUser } from "./getUnstakedKeyCountOfOwner.js";
import { getUserV1StakeAmount } from "./getUserV1StakeAmount.js";

/**
 * Load all the operator wallets and pools from the RPC.
 * This should run on every challenge and will find all keys and pool for this operator.
 * It will used cached operators and cached keys from owners but will refresh all pool keys and assigned pools from owner keys
 *  
 * @param operator - The public key of the operator wallet
 * @returns {Promise<BulkOwnerOrPool[]>} mapped sentry key objects
 */
export const loadOperatorWalletsFromRPC = async (
    operator: string
): Promise<BulkOwnerOrPool[]> => {

    let owners;

    //If we don't have the owners we fetch them from the RPC
    if (!operatorState.cachedOperatorWallets) {
        operatorState.cachedLogger(`Loading all wallets assigned to the operator.`);
        //We need to get all approved owners so we can filter against pools
        const ownersForOperator = (await retry(async () => await listOwnersForOperator(operator))).map(o => o.toLowerCase());
        operatorState.cachedLogger(`Found associated owners: ${ownersForOperator.join(', ')}`);
        operatorState.cachedOperatorWallets = [operator.toLowerCase(), ...ownersForOperator];
        // get a list of all the owners that are added to this operator
        if (operatorState.passedInOwnersAndPools && operatorState.passedInOwnersAndPools.length) {
            operatorState.cachedLogger(`Operator owners were passed in. ${operatorState.passedInOwnersAndPools.join(', ')}`);
            operatorState.cachedOperatorWallets = operatorState.cachedOperatorWallets.filter(o => operatorState.passedInOwnersAndPools?.includes(o));
        } else {
            operatorState.cachedLogger(`No operator owners were passed in.`);
        }
    }

    owners = [...operatorState.cachedOperatorWallets]
    operatorState.cachedLogger(`Found ${owners.length} operatorWallets. The addresses are: ${owners.join(', ')}`);

    let bulkOwnerAndPools: BulkOwnerOrPool[] = [];

    for (const owner of owners) {

        const unstakedCount = await getUnStakedKeysOfUser(owner);
        const stakedEsXaiAmount = await getUserV1StakeAmount(owner);

        bulkOwnerAndPools.push({
            address: owner,
            isPool: false,
            keyCount: unstakedCount,
            stakedEsXaiAmount
        });
    }

    const ownedAndDelegatePools = await reloadPoolsFromRPC(operator, operatorState.passedInOwnersAndPools);

    const mappedPools: { [key: string]: BulkOwnerOrPool } = {}
    ownedAndDelegatePools.forEach(p => mappedPools[p.address] = p);

    const interactedPools = await getInteractedPools(owners, ownedAndDelegatePools, operatorState.passedInOwnersAndPools);

    bulkOwnerAndPools = bulkOwnerAndPools.concat(ownedAndDelegatePools).concat(interactedPools);

    bulkOwnerAndPools.forEach(b => {
        operatorState.sentryAddressStatusMap.set(b.address.toLowerCase(), {
            ownerPublicKey: b.address,
            status: NodeLicenseStatus.WAITING_IN_QUEUE,
        });
    })

    //Cleanup removed keys from nodeLicenseStatusMap
    for (const [key] of operatorState.sentryAddressStatusMap.entries()) {
        if (!bulkOwnerAndPools.find(b => b.address.toLowerCase() == key.toLowerCase())) {
            operatorState.sentryAddressStatusMap.delete(key);
        }
    }

    operatorState.safeStatusCallback();

    return bulkOwnerAndPools;
}

//Load all the keys from pool our operator should operate
//Exclude pool that are not in the whitelist
const reloadPoolsFromRPC = async (
    operator: string,
    operatorAllowList?: string[]
): Promise<BulkOwnerOrPool[]> => {

    const bulkPools: BulkOwnerOrPool[] = [];

    let operatorPoolAddresses = await getOwnerOrDelegatePools(operator);

    if (operatorAllowList && operatorAllowList.length) {
        operatorPoolAddresses = operatorPoolAddresses.filter(o => operatorAllowList.includes(o.toLowerCase()))
    }

    if (operatorPoolAddresses.length) {

        operatorState.cachedLogger(`Found ${operatorPoolAddresses.length} pools for operator.`);

        for (const pool of operatorPoolAddresses) {

            const poolInfo = await getPoolInfo(pool);

            bulkPools.push({
                address: pool,
                isPool: true,
                name: poolInfo._name,
                keyCount: Number(poolInfo.baseInfo.keyCount),
                stakedEsXaiAmount: poolInfo.baseInfo.totalStakedAmount as bigint
            });
        }
    }

    return bulkPools;
}


async function getInteractedPools(
    owners: string[],
    alreadyFetchedPools: { [key: string]: any },
    operatorAllowList?: string[]
): Promise<BulkOwnerOrPool[]> {

    const bulkPools: BulkOwnerOrPool[] = [];

    let ownerInteractedPools = await getMultipleUsersInteractedPoolsRpc(owners);

    if (operatorAllowList && operatorAllowList.length) {
        ownerInteractedPools = ownerInteractedPools.filter(o => operatorAllowList.includes(o.toLowerCase()))
    }

    if (ownerInteractedPools.length) {

        for (const pool of ownerInteractedPools) {

            if (!alreadyFetchedPools[pool]) {
                const poolInfo = await getPoolInfo(pool);
                bulkPools.push({
                    address: pool,
                    isPool: true,
                    name: poolInfo._name,
                    keyCount: Number(poolInfo.baseInfo.keyCount),
                    stakedEsXaiAmount: poolInfo.baseInfo.totalStakedAmount as bigint
                });
            }
        }
    }

    return bulkPools;
}
