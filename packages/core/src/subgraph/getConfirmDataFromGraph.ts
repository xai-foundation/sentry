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

    //query for each assertion id (aka nodeNum)
    let confirmDataArray: string[] = [];
    for (let i = 0; i < assertionIds.length; i++) {
        
        //craft query
        const query = gql`
            query NodeConfirmationQuery {
                nodeConfirmation(id: ${assertionIds[i]}) {
                    id
                    confirmData
                }
            }
        `

        //send query
        const result = await client.request(query) as {
            nodeConfirmation: {
                id: string;
                confirmData: string;
            } | null;
        };

        //null guard
        if (!result.nodeConfirmation) {
            console.log(`Error: nodeConfirmation field is null for assertion id: ${assertionIds[i]}`);
            continue;
        }

        confirmDataArray.push(result.nodeConfirmation.confirmData);
    }

    //calculate confirmHash from array of confirmData
    //NOTE: same as contract logic in RefereeCalculations.getConfirmDataMultipleAssertions
    let concatenatedHexStr: string = "0x"; //start with 0x so final result is BytesLike
    confirmDataArray.forEach((confirmData) => {
        //trim leading 0x, if exists
        let tempConfirmData = confirmData;
        if (tempConfirmData.startsWith('0x')) {
            tempConfirmData = tempConfirmData.slice(2);
        }
        concatenatedHexStr += tempConfirmData;
    });
    const concatenatedByteArray = ethers.getBytes(concatenatedHexStr);
    const confirmHashHexStr = ethers.keccak256(concatenatedByteArray);
    
    return {confirmData: confirmDataArray, confirmHash: confirmHashHexStr};
}