import { execute } from "@sentry/sentry-subgraph-client";

/**
 * 
 * @param owners - The filter for the owner field
 * @param assignedPools - The Filter for assigned pools
 * @returns List of sentry key objects with metadata.
 */
export async function getSentryKeysFromGraph(
    owners: string[],
    assignedPools: string[]
): Promise<any[]> {

        const sentryKeysQuery = `
            query GetSentryKeys {
                sentryKeys(
            ) {
                id
                owner
                keyId
                mintTimeStamp
                assignedPool
            }
          }
        `
        // try {

        //     const sentryKeys = await execute(challengeQuery, {});

        //     console.log(JSON.stringify(challenges));
        //     // const a = await execute(query, {});
        //     // console.log(JSON.stringify(a), "query a");
        //     // const b = await client.request<RefereeStakingEnabledEvent>(query);

        //     // console.log(JSON.stringify(b), "query b");

        // } catch (ex) {
        //     console.log("errors:" ,ex);
        // }

        //TODO map sentryKeys
        return [];
}

// ): Promise<any> {

//     const sdk = getBuiltGraphSDK();

//    sdk.

//    const query: QueryResolvers<RefereeStakingEnabledEventResolvers> = {
       
//    }
//    `
//            query MyQuery {
//                refereeStakingEnabledEvents {
//                  blockNumber
//                  blockTimestamp
//                  transactionHash
//                }
//              }
//            `

//    const a = await execute(query, {});

//    console.log(JSON.stringify(a));

// const query = gql`
        //        query MyQuery {
        //            refereeStakingEnabledEvents {
        //              blockNumber
        //              blockTimestamp
        //              name
        //            }
        //          }
        //        `

        // const challengeQuery = `
        //     query GetChallenges {
        //         challenges(
        //             skip: ${10},
        //             first: ${10},
        //             orderBy: assertionId,
        //             orderDirection: asc,
        //             where: {createdTimestamp_gte: 1711357273}
        //     ) {
        //         id
        //         challengeNumber
        //         assertionId
        //     }
        //   }
        // `
        // try {

        //     const challenges = await execute(challengeQuery, {});

        //     console.log(JSON.stringify(challenges));
        //     // const a = await execute(query, {});
        //     // console.log(JSON.stringify(a), "query a");
        //     // const b = await client.request<RefereeStakingEnabledEvent>(query);

        //     // console.log(JSON.stringify(b), "query b");

        // } catch (ex) {
        //     console.log("errors:" ,ex);
        // }