import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * @returns The current referee version from the graph.
 */
export async function getCurrentRefereeVersionFromGraph(
): Promise<number> {

  const client = new GraphQLClient(config.subgraphEndpoint);
  const refereeConfigQuery = gql`
  query refereeConfig{
    refereeConfig(id: "RefereeConfig") {
      version
    }
  }
  `;

  const result = await client.request(refereeConfigQuery) as any;
  const version = parseInt(result.version, 10); // The second argument is the radix (base 10 here)
  return version;
}