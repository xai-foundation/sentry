import { Challenge } from "@sentry/sentry-subgraph-client";
import { GraphQLClient, gql } from 'graphql-request'
import { config } from "../config.js";

/**
 * @returns The challenge entity from the graph.
 */
export async function getChallengesFromGraph(
  first: number = 1,
  skip: number = 0
): Promise<Challenge[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);
  const query = gql`
    query Challenges {
      challenges(first: ${first}, skip: ${skip}, orderBy: challengeNumber, orderDirection: desc) {
        amountClaimedByClaimers
        challengeNumber
        numberOfEligibleClaimers
        createdTimestamp
        amountForGasSubsidy
        rewardAmountForClaimers
        submissions(first: 5000, orderBy: nodeLicenseId, orderDirection: asc) {
          claimed
          eligibleForPayout
          createdTxHash
          claimTxHash
          nodeLicenseId
          submittedFrom
          claimedFrom
        }
      }
    }
  `

  const result = await client.request(query) as any;
  return result.challenges;
}