import { operatorState } from "./operatorState.js";
import { BulkOwnerOrPool, getMultipleUsersInteractedPoolsRpc, getOwnerOrDelegatePools, getPoolInfo, getUserInteractedPools, listOwnersForOperator, NodeLicenseStatus, retry } from "../../index.js";
import { getUnStakedKeysOfUser } from "./getUnstakedKeyCountOfOwner.js";
import { getUserV1StakeAmount } from "./getUserV1StakeAmount.js";
import { getUserStakedKeyCount } from "../../node-license/getUserStakedKeyCount.js";

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
    if (!operatorState.cachedOperatorWallets.length) {
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
    operatorState.cachedLogger(`Found ${ownedAndDelegatePools.length} owned/delegated pools. The addresses are: ${Object.keys(mappedPools).join(', ')}`);

    const interactedPools = await getInteractedPools(owners, mappedPools, operatorState.passedInOwnersAndPools);
    const mappedPoolsInteractedPools: { [key: string]: BulkOwnerOrPool } = {}
    interactedPools.forEach(p => mappedPoolsInteractedPools[p.address] = p);
    operatorState.cachedLogger(`Found ${interactedPools.length} pools with stakedKeys. The addresses are: ${Object.keys(mappedPoolsInteractedPools).join(', ')}`);

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
//Exclude pool that are not in the allowList
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


// Get all interacted pools for each owner where they have keys staked in, we want to operate these pools too
async function getInteractedPools(
    owners: string[],
    alreadyFetchedPools: { [key: string]: any },
    operatorAllowList?: string[]
): Promise<BulkOwnerOrPool[]> {

    const bulkPools: BulkOwnerOrPool[] = [];

    for (const owner of owners) {
        let ownerInteractedPools = await getUserInteractedPools(owner);

        if (ownerInteractedPools.length) {

            if (operatorAllowList && operatorAllowList.length) {
                ownerInteractedPools = ownerInteractedPools.filter(o => operatorAllowList.includes(o.toLowerCase()))
            }

            for (const pool of ownerInteractedPools) {

                if (!alreadyFetchedPools[pool]) {
                    const stakedKeyCount = await getUserStakedKeyCount(pool, owner);
                    if (stakedKeyCount > 0) {
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
        }
    }

    return bulkPools;
}
