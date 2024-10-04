import { 
    getConfirmDatafromGraph,
    getMultipleChallengeConfirmData,
} from "../index.js";

/**
 * Fetches the confirmData and confirmHash of a given array of assertion Ids.
 * @param assertionIds - The array of assertion IDs.
 * @returns The confirmData and confirmHashS.
 */
export async function getConfirmDataAndHash(
    assertionIds: number[],
    isSubgraphHealthy: boolean
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
        const res = await getMultipleChallengeConfirmData(assertionIds);
        confirmData = res[0];
        confirmHash = res[1];
    }
    
    return {confirmData: confirmData, confirmHash: confirmHash};
}
