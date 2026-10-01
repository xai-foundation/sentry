import { GraphQLClient, gql } from 'graphql-request';
import { config } from "../config.js";

/**
 * The emission related fields of a Referee challenge as indexed by the subgraph.
 * All token amounts are in wei.
 */
export type ChallengeEmission = {
  challengeNumber: bigint;
  createdTimestamp: number;
  /** esXAI allocated to the claimers of this challenge (the esXAI emission of the challenge). */
  rewardAmountForClaimers: bigint;
  /** XAI minted to the gas subsidy recipient when the challenge was submitted. */
  amountForGasSubsidy: bigint;
  /** esXAI actually minted through claims so far. */
  amountClaimedByClaimers: bigint;
};

const PAGE_SIZE = 1000;

/**
 * Loads the emission fields of all challenges created within the given time window,
 * paging by challengeNumber so that the result is not limited by the subgraph page size.
 *
 * @param fromTimestamp - Unix timestamp (seconds), inclusive lower bound on the challenge creation.
 * @param toTimestamp - Optional unix timestamp (seconds), exclusive upper bound on the challenge creation.
 * @returns The challenges sorted by challengeNumber ascending.
 */
export async function getChallengeEmissionsFromGraph(
  fromTimestamp: number,
  toTimestamp?: number
): Promise<ChallengeEmission[]> {

  const client = new GraphQLClient(config.subgraphEndpoint);

  const challenges: ChallengeEmission[] = [];
  let lastChallengeNumber = -1n;

  while (true) {
    const toFilter = toTimestamp !== undefined ? `, createdTimestamp_lt: ${Math.floor(toTimestamp)}` : "";
    const query = gql`
      query ChallengeEmissions {
        challenges(
          first: ${PAGE_SIZE},
          orderBy: challengeNumber,
          orderDirection: asc,
          where: { challengeNumber_gt: ${lastChallengeNumber.toString()}, createdTimestamp_gte: ${Math.floor(fromTimestamp)}${toFilter} }
        ) {
          challengeNumber
          createdTimestamp
          rewardAmountForClaimers
          amountForGasSubsidy
          amountClaimedByClaimers
        }
      }
    `;

    const result = await client.request(query) as any;
    const page: any[] = result.challenges;

    for (const c of page) {
      challenges.push({
        challengeNumber: BigInt(c.challengeNumber),
        createdTimestamp: Number(c.createdTimestamp),
        rewardAmountForClaimers: BigInt(c.rewardAmountForClaimers),
        amountForGasSubsidy: BigInt(c.amountForGasSubsidy),
        amountClaimedByClaimers: BigInt(c.amountClaimedByClaimers),
      });
    }

    if (page.length < PAGE_SIZE) {
      break;
    }
    lastChallengeNumber = BigInt(page[page.length - 1].challengeNumber);
  }

  return challenges;
}
