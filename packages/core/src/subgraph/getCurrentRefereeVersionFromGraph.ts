import { GraphQLClient, gql } from 'graphql-request';
import { config } from "../config.js";

/**
 * Fetches the current referee version from the graph.
 *
 * @returns The current referee version as a number.
 */
export async function getCurrentRefereeVersionFromGraph(): Promise<number> {
  // Initialize the GraphQL client with the subgraph endpoint from the configuration
  const client = new GraphQLClient(config.subgraphEndpoint);

  // Define the GraphQL query to fetch the referee configuration
  const refereeConfigQuery = gql`
    query refereeConfig {
      refereeConfig(id: "RefereeConfig") {
        version
      }
    }
  `;

  // Execute the GraphQL query and cast the result to 'any' type
  const result = await client.request(refereeConfigQuery) as any;

  // Parse the version string to a number using base 10
  const version = parseInt(result.version, 10); // The second argument is the radix (base 10 here)
  
  // Return the parsed version number
  return version;
}
