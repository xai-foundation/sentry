import { 
    getConfirmDatafromGraph,
    getMultipleChallengeConfirmData,
} from "../index.js";

/**
 * Fetches the confirmData and confirmHash of a given array of assertion Ids.
 * @param assertionIds - The array of assertion IDs.
 * @param isSubgraphHealthy - A boolean indicating whether the subgraph is healthy.
 * @param refereeCalculationsAddress - The address of the referee calculations contract.
 * @returns The confirmData and confirmHashS.
 */
export async function getConfirmDataAndHash(
    assertionIds: number[],
    isSubgraphHealthy: boolean,
    refereeCalculationsAddress: string
): Promise<{confirmData: string[], confirmHash: string}> {

    //declare return variables
    let confirmData: string[];
    let confirmHash: string;
    
    //determine whether to hit subgraph or rpc
    if (isSubgraphHealthy) {
        const res = await getConfirmDatafromGraph(assertionIds);
        confirmData = res.confirmData;
        confirmHash = res.confirmHash;
    } else {
        const res = await getMultipleChallengeConfirmData(refereeCalculationsAddress, assertionIds);
        confirmData = res[0];
        confirmHash = res[1];
    }
    
    return {confirmData: confirmData, confirmHash: confirmHash};
}
