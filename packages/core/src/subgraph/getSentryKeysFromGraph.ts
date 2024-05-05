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
  submissionsFilter?: { eligibleForPayout: boolean, claimed: boolean }
): Promise<SentryKey[]> {

  let submissionQuery = ``;
  if (includeSubmissions) {
    submissionQuery = `
        submissions(
          ${submissionsFilter ? `where: {eligibleForPayout: ${submissionsFilter.eligibleForPayout}, claimed: ${submissionsFilter.claimed}}` : ``}
        ) { 
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
        sentryKeys(
          where: {${filter}}
        ) {
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