import { SentryKey } from "@sentry/sentry-subgraph-client";
import { operatorState } from "../operatorState.js";
import { getKeysOfPool, getMintTimestamp, getOwnerOrDelegatePools, getUserInteractedPools, getUserStakedKeysOfPool, listNodeLicenses, listOwnersForOperator, NodeLicenseStatus, retry } from "../../../index.js";

/**
 * Load all the operating keys and metadata from the RPC.
 * This should run on every challenge and will find all keys and pool for this operator.
 * It will used cached operators and cached keys from owners but will refresh all pool keys and assigned pools from owner keys
 *  
 * @param operator - The public key of the operator wallet
 * @returns mapped sentry key objects
 */
export const loadOperatorKeysFromRPC_V1 = async (
    operator: string
): Promise<{
    sentryKeysMap: { [keyId: string]: SentryKey },
    nodeLicenseIds: bigint[],
}> => {

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


    const nodeLicenseIds: bigint[] = [];
    let sentryKeysMap: { [keyId: string]: SentryKey } = {}

    //If we don't have cached keys from owner we fetch them and the metadata from the RPC
    if (!operatorState.cachedKeysOfOwner) {
        operatorState.cachedKeysOfOwner = {};

        for (const owner of owners) {
            operatorState.cachedLogger(`Fetching node licenses for owner ${owner}.`);
            const licensesOfOwner = await listNodeLicenses(owner, (keyId) => {
                operatorState.cachedLogger(`Fetched node licenses key ${keyId.toString()}.`);
            });

            for (const licenseId of licensesOfOwner) {

                if (!operatorState.mintTimestamps[licenseId.toString()]) {
                    operatorState.mintTimestamps[licenseId.toString()] = await retry(async () => await getMintTimestamp(licenseId))
                }

                const sentryKey: SentryKey = {
                    assignedPool: "0x",
                    keyId: licenseId,
                    mintTimeStamp: operatorState.mintTimestamps[licenseId.toString()],
                    id: licenseId.toString(),
                    owner: owner,
                    sentryWallet: {} as any,
                    submissions: []
                }
                operatorState.cachedKeysOfOwner[licenseId.toString()] = sentryKey;
                sentryKeysMap[licenseId.toString()] = sentryKey;
            }

            if (licensesOfOwner.length) {
                operatorState.cachedLogger(`Fetched ${licensesOfOwner.length} node licenses for owner ${owner}.`);
            }
        }
    } else {
        sentryKeysMap = { ...operatorState.cachedKeysOfOwner }
    }

    const keysOfOwnersCount = Object.keys(sentryKeysMap).length;
    // Map the keys from pools our operator should operate, filter pools if passedInOwnersAndPools whitelist is enabled
    sentryKeysMap = await reloadPoolKeysForRPC(operator, sentryKeysMap, operatorState.passedInOwnersAndPools);

    // Map all the assigned pools from keys of owners
    sentryKeysMap = await syncOwnerStakedKeysForRPC(owners, sentryKeysMap);

    // Sync the nodeLicenseStatusMap
    Object.keys(sentryKeysMap).forEach(key => {
        nodeLicenseIds.push(BigInt(key))
        operatorState.nodeLicenseStatusMap.set(BigInt(key), {
            ownerPublicKey: sentryKeysMap[key].owner,
            status: NodeLicenseStatus.WAITING_IN_QUEUE,
        });
    });

    //Cleanup removed keys from nodeLicenseStatusMap
    for (const [key] of operatorState.nodeLicenseStatusMap.entries()) {
        if (!sentryKeysMap[key.toString()]) {
            operatorState.nodeLicenseStatusMap.delete(key);
        }
    }

    operatorState.safeStatusCallback();

    operatorState.cachedLogger(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);
    operatorState.cachedLogger(`Fetched ${keysOfOwnersCount} keys of owners.`);
    operatorState.cachedLogger(`Fetched ${Object.keys(sentryKeysMap).length - keysOfOwnersCount} keys of pools.`);

    return { sentryKeysMap, nodeLicenseIds }
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

        operatorState.cachedLogger(`Found ${operatorPoolAddresses.length} pools for operator.`);

        for (const pool of operatorPoolAddresses) {
            //Check every key and find out if its already in the nodeLicenseIds list
            operatorState.cachedLogger(`Fetching node licenses for pool ${pool}.`);

            const keys = await getKeysOfPool(pool);

            for (const key of keys) {


                if (sentryKeysMap[key.toString()]) {

                    sentryKeysMap[key.toString()].assignedPool = pool;

                } else {

                    if (!operatorState.mintTimestamps[key.toString()]) {
                        operatorState.mintTimestamps[key.toString()] = await retry(async () => await getMintTimestamp(key))
                    }

                    sentryKeysMap[key.toString()] = {
                        assignedPool: pool,
                        keyId: key,
                        mintTimeStamp: operatorState.mintTimestamps[key.toString()],
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
                        operatorState.cachedLogger(`Error key not found in list of keys to operate, restart the operator to reload for \nowner: ${owner}, \npool: ${pool}, \nkey: ${key.toString()}.`);
                        continue;
                    }

                    sentryKeysMap[key.toString()].assignedPool = pool;
                }
            }
        }
    }

    return sentryKeysMap;
}
