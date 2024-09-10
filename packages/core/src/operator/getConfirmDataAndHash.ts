import { 
    getConfirmDatafromGraph, 
    getSubgraphHealthStatus, 
    getMultipleChallengeConfirmData,
} from "../index.js";

/**
 * Fetches the confirmData and confirmHash of a given array of assertion Ids.
 * @param assertionIds - The array of assertion IDs.
 * @returns The submissions.
 */
export async function getConfirmDataAndHash(
    assertionIds: number[],
): Promise<{confirmData: string[], confirmHash: string}> {

    //initialize
    let confirmData: string[]
    let confirmHash: string
    
    //determine whether to hit subgraph or rpc
    const graphStatus = await getSubgraphHealthStatus();
    if (graphStatus.healthy) {
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
