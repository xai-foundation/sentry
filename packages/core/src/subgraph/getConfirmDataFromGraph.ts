import { ethers } from "ethers";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * Fetches the confirmation data for multiple challenge assertions from the graph.
 * 
 * @param {number[]} assertionIds - An array of assertion IDs for which confirmation data is required.
 * @returns {Promise<{string[], string}>} A promise that resolves to a tuple containing an array of `bytes32` confirmation data and a `bytes32` confirmation hash.
 */
export async function getConfirmDatafromGraph(assertionIds: number[]): Promise<{confirmData: string[], confirmHash: string}> {
    
    //initialize graph client
    const client = new GraphQLClient(config.subgraphEndpoint);
        
    //craft query
    const assertionIdsStrArray: string[] = assertionIds.map(num => num.toString());
    const assertionIdsStrArrayFormatted = JSON.stringify(assertionIdsStrArray);
    const query = gql`
        query NodeConfirmationQuery {
            nodeConfirmations(where: {id_in: ${assertionIdsStrArrayFormatted}}) {
                id
                confirmData
            }
        }
    `

    //send query
    const result = await client.request(query) as {
        nodeConfirmations: [ 
            {
                id: string;
                confirmData: string;
            }
        ];
    };

    //null guard
    if (!result.nodeConfirmations) {
        throw new Error("Error: nodeConfirmations field is null for subgraph query");
    }

    //calculate confirmHash from array of confirmData
    //NOTE: same as contract logic in RefereeCalculations.getConfirmDataMultipleAssertions
    let confirmDataArray: string[] = [];
    let concatenatedHexStr: string = "0x"; //start with 0x so final result is BytesLike
    result.nodeConfirmations.forEach((nodeConfirmation) => {
        //trim leading 0x, if exists
        let tempConfirmData = nodeConfirmation.confirmData;
        if (tempConfirmData.startsWith('0x')) {
            tempConfirmData = tempConfirmData.slice(2);
        }
        concatenatedHexStr += tempConfirmData;
        //add to confirm data array for return obj
        confirmDataArray.push(nodeConfirmation.confirmData);
    });
    const concatenatedByteArray = ethers.getBytes(concatenatedHexStr);
    const confirmHashHexStr = ethers.keccak256(concatenatedByteArray);
    
    return {confirmData: confirmDataArray, confirmHash: confirmHashHexStr};
}