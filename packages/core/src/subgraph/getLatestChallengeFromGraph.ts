import { Challenge, execute } from "@sentry/sentry-subgraph-client";

/**
 * @returns The challenge entity from the graph.
 */
export async function getLatestChallengeFromGraph(
): Promise<Challenge> {

  const query = `
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
  const result = await execute(query, {});
  return result.data.challenges[0];
}