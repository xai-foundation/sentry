import { SentryKey, execute } from "@sentry/sentry-subgraph-client";

/**
 * 
 * @param owners - The filter for the owner field
 * @param stakingPools - The filter for the assigned pool field
 * @param includeSubmissions - If the submissions should be included
 * @param submissionsFilter - The filter for the submissions if submissions should be included
 * @returns List of sentry key objects with metadata.
 */
export async function getSentryKeysFromGraph(
  owners: string[],
  stakingPools: string[],
  includeSubmissions: boolean,
  submissionsFilter: { eligibleForPayout?: boolean, claimed?: boolean, latestChallengeNumber?: bigint }
): Promise<SentryKey[]> {

  let submissionQuery = ``;
  if (includeSubmissions) {

    let submissionQueryFilter: string[] = [];
    const { eligibleForPayout, claimed, latestChallengeNumber } = submissionsFilter;
    if (eligibleForPayout != undefined) {
      submissionQueryFilter.push(`eligibleForPayout: ${eligibleForPayout}`)
    }
    if (claimed != undefined) {
      submissionQueryFilter.push(`claimed: ${claimed}`)
    }
    if (latestChallengeNumber != undefined) {
      submissionQueryFilter.push(`challengeNumber_gte: ${latestChallengeNumber.toString()}`)
    }

    submissionQuery = `
        submissions(first: 4320, orderBy: challengeNumber, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) { 
          challengeNumber
          nodeLicenseId
          claimAmount 
          claimed 
          eligibleForPayout
        }
      `
  }

  let filter = ``
  if (owners.length && stakingPools.length) {

    filter = `
      or: [
        {owner_in: [${owners.map(o => `"${o.toLowerCase()}"`).join(",")}]}, 
        {assignedPool_in: [${stakingPools.map(o => `"${o.toLowerCase()}"`).join(",")}]}
      ]
    `
  } else {
    if (owners.length) {
      filter = `owner_in: [${owners.map(o => `"${o.toLowerCase()}"`).join(",")}]`;
    }
    if (stakingPools.length) {
      filter = `assignedPool_in: [${stakingPools.map(o => `"${o.toLowerCase()}"`).join(",")}]`;
    }
  }


  const query = `
      query SentryKeysQuery {
        sentryKeys(first: 10000, orderBy: keyId, orderDirection: asc, where: {${filter}} ) {
          assignedPool
          id
          keyId
          mintTimeStamp
          owner
          sentryWallet {
            isKYCApproved
          }
          ${submissionQuery}
        }
      }
    `
  const result = await execute(query, {});
  return result.data.sentryKeys;
}