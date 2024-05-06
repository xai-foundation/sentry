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
  submissionsFilter: { eligibleForPayout?: boolean, claimed?: boolean, challengeNumber?: bigint }
): Promise<SentryKey[]> {

  let submissionQuery = ``;
  if (includeSubmissions) {

    let submissionQueryFilter: string[] = [];
    const { eligibleForPayout, claimed, challengeNumber } = submissionsFilter;
    if (eligibleForPayout != undefined) {
      submissionQueryFilter.push(`eligibleForPayout: ${eligibleForPayout}`)
    }
    if (claimed != undefined) {
      submissionQueryFilter.push(`claimed: ${claimed}`)
    }
    if (challengeNumber != undefined) {
      submissionQueryFilter.push(`challengeNumber: ${challengeNumber.toString()}`)
    }

    submissionQuery = `
        submissions(first: 4000, orderBy: challengeNumber, orderDirection: desc, where: {${submissionQueryFilter.join(",")}}) { 
          challengeNumber
          nodeLicenseId
          claimAmount 
          claimed 
          eligibleForPayout
        }
      `
  }

  let filter = ``
  if (owners.length) {
    filter = `owner_in: [${owners.map(o => `"${o.toLowerCase()}"`).join(",")}]`;
  }
  if (stakingPools.length) {
    if (filter.length) {
      filter += ", "
    }
    filter += `assignedPool_in: [${stakingPools.map(o => `"${o.toLowerCase()}"`).join(",")}]`;
  }

  const query = `
      query SentryKeysQuery {
        sentryKeys(first: 10000, orderBy: keyId, orderDirection: asc, where: {${filter}} ) {
          assignedPool
          id
          keyId
          mintTimeStamp
          owner
          ${submissionQuery}
        }
      }
    `
  const result = await execute(query, {});
  return result.data.sentryKeys;
}