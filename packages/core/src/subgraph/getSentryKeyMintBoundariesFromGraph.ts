import { GraphQLClient, gql } from 'graphql-request';
import { config } from "../config.js";

export type SentryKeyMint = { keyId: bigint; mintTimeStamp: number };

/**
 * Returns the lowest key id that was minted at or after the given timestamp, or null when no key was minted since then.
 * Key ids are assigned sequentially per mint, so ids increase with the mint timestamp. This query filters on the
 * mint timestamp and gets slow (seconds) once millions of keys exist, so use it only to find a starting point.
 *
 * @param timestamp - Unix timestamp (seconds), inclusive.
 */
export async function getFirstKeyIdMintedSinceFromGraph(timestamp: number): Promise<bigint | null> {
  const client = new GraphQLClient(config.subgraphEndpoint);
  const query = gql`
    query FirstKeyMintedSince {
      sentryKeys(first: 1, orderBy: keyId, orderDirection: asc, where: { mintTimeStamp_gte: ${Math.floor(timestamp)} }) {
        keyId
      }
    }
  `;
  const result = await client.request(query) as any;
  const key = result.sentryKeys[0];
  return key ? BigInt(key.keyId) : null;
}

/**
 * Returns the highest key id minted so far (equals the NodeLicense total supply), or 0n when there are no keys.
 */
export async function getLatestKeyIdFromGraph(): Promise<bigint> {
  const client = new GraphQLClient(config.subgraphEndpoint);
  const query = gql`
    query LatestKey {
      sentryKeys(first: 1, orderBy: keyId, orderDirection: desc) {
        keyId
      }
    }
  `;
  const result = await client.request(query) as any;
  const key = result.sentryKeys[0];
  return key ? BigInt(key.keyId) : 0n;
}

/**
 * Returns the mint timestamp of one key, or null when the key does not exist.
 */
export async function getSentryKeyMintTimestampFromGraph(keyId: bigint): Promise<number | null> {
  const client = new GraphQLClient(config.subgraphEndpoint);
  const query = gql`
    query KeyMintTimestamp {
      sentryKeys(first: 1, where: { keyId: ${keyId.toString()} }) {
        mintTimeStamp
      }
    }
  `;
  const result = await client.request(query) as any;
  const key = result.sentryKeys[0];
  return key ? Number(key.mintTimeStamp) : null;
}

/**
 * Returns one page of keys with keyId in (afterKeyId, toKeyId], ordered by key id. Paging by id is fast on the subgraph.
 *
 * @param afterKeyId - Exclusive lower bound.
 * @param toKeyId - Inclusive upper bound.
 * @param pageSize - Page size, max 1000.
 */
export async function getSentryKeyMintsFromGraph(afterKeyId: bigint, toKeyId: bigint, pageSize: number = 1000): Promise<SentryKeyMint[]> {
  const client = new GraphQLClient(config.subgraphEndpoint);
  const query = gql`
    query SentryKeyMints {
      sentryKeys(first: ${pageSize}, orderBy: keyId, orderDirection: asc, where: { keyId_gt: ${afterKeyId.toString()}, keyId_lte: ${toKeyId.toString()} }) {
        keyId
        mintTimeStamp
      }
    }
  `;
  const result = await client.request(query) as any;
  return (result.sentryKeys as any[]).map((k) => ({ keyId: BigInt(k.keyId), mintTimeStamp: Number(k.mintTimeStamp) }));
}
