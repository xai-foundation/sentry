import axios from "axios";
import { config } from "../config.js";
import { gql, GraphQLClient } from "graphql-request";

type HealthStatus = { healthy: boolean; error?: string };
/**
 *
 * @returns Status and possible error from the graph version
 */
export async function getSubgraphHealthStatus(): Promise<HealthStatus> {
  try {
    const client = new GraphQLClient(config.subgraphEndpoint); // your /gn URL

    const query = gql`
      query HealthCheck {
        _meta {
          block {
            number
          }
        }
      }
    `;

    const result = (await client.request(query)) as {
      _meta?: { block?: { number?: string | number | null } } | null;
    };

    const blockNumber = result?._meta?.block?.number;

    if (!result || !blockNumber) {
      return {
        healthy: false,
        error: "Subgraph returned invalid status query response",
      };
    }

    return { healthy: true };
  } catch (ex: any) {
    return {
      healthy: false,
      error: `Something went wrong reading the graph status: ${
        ex && ex.message ? ex.message : String(ex)
      }`,
    };
  }
}
