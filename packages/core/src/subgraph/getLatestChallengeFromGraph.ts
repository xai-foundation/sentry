import { Challenge } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'

/**
 * @returns The challenge entity from the graph.
 */
export async function getLatestChallengeFromGraph(
  client: GraphQLClient
): Promise<Challenge> {

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