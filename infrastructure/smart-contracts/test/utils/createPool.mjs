const POOL_NAME = "Testing Pool";
const POOL_DESCRIPTION = "This is for testing purposes only!!";
const POOL_LOGO = "Pool Logo";
const POOL_META_DATA = [POOL_NAME, POOL_DESCRIPTION, POOL_LOGO];
const POOL_SOCIALS = ["Social 1", "Social 2", "Social 3"];
const POOL_TRACKER_DETAILS = [
    ["Tracker Name 1", "TS1"],
    ["Tracker Name 2", "TS2"],
];
const VALID_SHARE_VALUES = [50_000n, 850_000n, 100_000n];

/**
 * Creates a new pool using the provided pool factory.
 * @param {Contract} poolFactory - The pool factory contract instance.
 * @param {Wallet} poolOwner - The wallet of the pool owner creating the pool.
 * @param {BigInt} keysToStake - The number of keys to stake in the pool.
 * @param {string} [poolDelegate] - The address of the pool delegate. Defaults to zero address if not provided.
 * @returns {Promise<string>} - The address of the newly created pool.
 */
export const createPool = async (poolFactory, poolOwner, keysToStake, poolDelegate) => {
    // Use zero address if no delegate is provided
    const delegateAddress = poolDelegate || ethers.ZeroAddress;

    // Connect the pool factory to the pool owner's signer and create the pool
    await poolFactory.connect(poolOwner).createPool(
        delegateAddress,
        keysToStake,
        VALID_SHARE_VALUES,
        POOL_META_DATA,
        POOL_SOCIALS,
        POOL_TRACKER_DETAILS
    );

    // Get the number of pools to determine the address of the newly created pool
    const numberOfPools = await poolFactory.getPoolsCount();
    
    // Return the address of the last created pool
    return poolFactory.getPoolAddress(numberOfPools - 1n);
};
