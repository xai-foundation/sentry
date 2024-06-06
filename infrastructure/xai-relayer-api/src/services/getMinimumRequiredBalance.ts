/**
 * Get the minimum required amount for forwarding a blockchain transaction
 * 
 * @returns {string} Minimum required balance for relaying a transaction in wei
 */
export function getMinimumRequiredBalance(): bigint {

    //TODO Could we look this up from recent transactions ?
    return BigInt("10000000000000");
}