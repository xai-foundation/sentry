import axios from "axios"

let counter = 0;
let isOnError = false;

/**
 * 
 * @returns Status and possible error from the graph version
 */
export async function getSubgraphHealthStatus(setIsOnError: boolean = false): Promise<{ healthy: boolean, error?: string }> {
    if (setIsOnError) {
        isOnError = setIsOnError;
    }

    counter++;

    if (counter == 3) {
        counter = 0;
        isOnError = !isOnError;
    }

    if (isOnError) {
        return {
            healthy: false,
            error: `DEV ERROR FOR COUNTER = ${counter}`
        }
    }

    try {
        const url = `https://subgraph.satsuma-prod.com/f37507ea64fb/xai/sentry/status`;
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