import { ethers } from "ethers";
import { NodeLicenseStatusMap, PublicNodeBucketInformation, SentryAddressStatusMap } from "../operatorRuntime.js";
import { Challenge } from "../../index.js";
import { SentryKey } from "@sentry/sentry-subgraph-client";

/**
 * Operator state cache type
 */
type OperatorState = {
    cachedSigner: ethers.Signer;
    cachedLogger: (log: string) => void;
    safeStatusCallback: () => void;
    onAssertionMissMatchCb: (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => void;
    operatorAddress: string;
    cachedOperatorWallets: string[];
    mintTimestamps: { [nodeLicenseId: string]: bigint };
    cachedKeysOfOwner: { [keyId: string]: SentryKey };
    nodeLicenseStatusMap: NodeLicenseStatusMap;
    passedInOwnersAndPools: string[] | undefined;
    sentryAddressStatusMap: SentryAddressStatusMap;
};

/**
 * Export the operator state cache to be used in the operator-runtime functions and the operatorRuntime itself
 */
export const operatorState: OperatorState = {
    cachedSigner: ethers.Wallet.createRandom(),
    cachedLogger: (log: string) => {},
    safeStatusCallback: () => {},
    onAssertionMissMatchCb: () => {},
    operatorAddress: '',
    cachedOperatorWallets: [],
    mintTimestamps: {},
    cachedKeysOfOwner: {},
    nodeLicenseStatusMap: new Map(),
    passedInOwnersAndPools: [],
    sentryAddressStatusMap: new Map(),
};