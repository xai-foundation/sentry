import axios from "axios"
import { config } from "../config.js";

/**
 * 
 * @returns Status and possible error from the graph version
 */
export async function getSubgraphHealthStatus(): Promise<{ healthy: boolean, error?: string }> {

    try {
        const subgraphEndpoint = config.subgraphEndpoint;
        const url = subgraphEndpoint.replace(/\/api$/, "/status");
        const response = await axios.get(url);
        if (response.status === 200) {
            const status = response.data.data.indexingStatusForCurrentVersion.health;
            if (status != "healthy") {
                return {
                    healthy: false,
                    error: `Subgraph in invalid state (${status})`
                }
            }

            return {
                healthy: true
            }


        } else {
            return {
                healthy: false,
                error: `Request for graph status failed with response status ${response.status}`
            }
        }
    } catch (ex: any) {

        return {
            healthy: false,
            error: `Something went wrong reading the graph status: ${ex && ex.message ? ex.message : ex}`
        }
    }
}