import { Challenge } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * @returns The challenge entity from the graph.
 */
export async function getLatestChallengeFromGraph(): Promise<Challenge> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  const query = gql`
      query ChallengeQuery {
        challenges(
          where: {status: OpenForSubmissions}
          orderBy: challengeNumber
          orderDirection: desc
        ) {
          assertionId
          challengeNumber
          status
          createdTimestamp
          assertionStateRootOrConfirmData
          challengerSignedHash
        }
      }
    `
  const result = await client.request(query) as any;
  return result.challenges[0];
}