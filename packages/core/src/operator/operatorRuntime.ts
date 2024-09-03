import { ethers } from "ethers";
import {
    Challenge,
    getProvider,
    version
} from "../index.js";
import { operatorState } from "./operator-runtime/operatorState.js";
import { BulkSubmission } from "@sentry/sentry-subgraph-client";
import { bootOperatorRuntime } from "./operator-runtime/bootOperatorRuntime.js";

export enum NodeLicenseStatus {
    WAITING_IN_QUEUE = "Booting Operator For Key", // waiting to do an action, but in a queue
    FETCHING_MINT_TIMESTAMP = "Eligibility Lookup",
    WAITING_FOR_NEXT_CHALLENGE = "Running, esXAI Will Accrue Every Few Days",
    CHECKING_MINT_TIMESTAMP_ELIGIBILITY = "Eligibility Check",
    CHECKING_IF_ELIGIBLE_FOR_PAYOUT = "Applying Reward Algorithm",
    SUBMITTING_ASSERTION_TO_CHALLENGE = "Reward Algorithm Successful",
    QUERYING_FOR_UNCLAIMED_SUBMISSIONS = "Checking for Unclaimed Rewards"
}

export interface NodeLicenseInformation {
    ownerPublicKey: string
    status: string | NodeLicenseStatus;
}

export type NodeLicenseStatusMap = Map<bigint, NodeLicenseInformation>;


export interface SentryAddressInformation {
    address: string
    keyCount: string
    isPool: boolean
    status: string | NodeLicenseStatus;
}

//New status map for status mapped to a wallet or a pool address
export type SentryAddressStatusMap = Map<string, NodeLicenseInformation>;

export type PublicNodeBucketInformation = {
    assertion: number,
    blockHash: string,
    sendRoot: string,
    confirmHash: string
}

//The total number of challenges we will check for open claims into the past (270 days * 24 challenges per day)
export const MAX_CHALLENGE_CLAIM_AMOUNT = 6480;

export type ProcessChallenge = {
    createdTimestamp: bigint,
    challengerSignedHash: string;
    assertionStateRootOrConfirmData: string;
}

//This is going to be deprecated with bulk submissions
//Used for maximum keysIds in one batch tx
export const KEYS_PER_BATCH = 100;

//Type for shared object of either pool or owner, used for submitting bulk assertions (Referee does not differentiate between pool or owner when doing a bulk submission)
export type BulkOwnerOrPool = {
    address: string,
    isPool: boolean,
    name?: string,
    keyCount: number, // only unstaked keys for owner, totalStakedKeys for pool
    stakedEsXaiAmount: bigint, // used to calculate the boost factor
    bulkSubmissions?: BulkSubmission[]
}

/**
 * Operator runtime function.
 * @param {ethers.Signer} signer - The signer.
 * @param {((status: NodeLicenseStatusMap) => void)} [statusCallback] - Optional function to monitor the status of the runtime.
 * @param {((log: string) => void)} [logFunction] - Optional function to log the process.
 * @param {string[]} [operatorOwners] - Optional array of addresses that should replace "owners" if passed in.
 * @returns {Promise<() => Promise<void>>} The stop function.
 */
export async function operatorRuntime(
    signer: ethers.Signer,
    statusCallback: (status: NodeLicenseStatusMap) => void = (_) => { },
    logFunction: (log: string) => void = (_) => { },
    operatorOwners?: string[],
    onAssertionMissMatch: (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => void = (_) => { }

): Promise<() => Promise<void>> {

    operatorState.cachedLogger = logFunction;
    operatorState.cachedSigner = signer;
    operatorState.onAssertionMissMatchCb = onAssertionMissMatch;
    operatorState.passedInOwnersAndPools = operatorOwners ? operatorOwners.map(o => o.toLowerCase()) : operatorOwners;

    logFunction(`Booting operator runtime version [${version}].`);

    const provider = getProvider();

    // Create a wrapper for the statusCallback to always send back a fresh copy of the map, so the other side doesn't mutate the map
    operatorState.safeStatusCallback = () => {
        // Create a fresh copy of the map
        const statusCopy: NodeLicenseStatusMap = new Map(operatorState.nodeLicenseStatusMap);

        // Call the original statusCallback with the copy
        statusCallback(statusCopy);
    };

    // get the address of the operator
    operatorState.operatorAddress = await signer.getAddress();
    logFunction(`Fetched address of operator ${operatorState.operatorAddress}.`);

    let closeChallengeListener = await bootOperatorRuntime(logFunction);
    logFunction(`Started listener for new challenges.`);

    const fetchBlockNumber = async () => {
        try {
            const blockNumber = await provider.getBlockNumber();
            logFunction(`[cli ${version}] Health Check on JSON RPC, Operator still healthy. Current block number: ${blockNumber}`);
        } catch (error) {
            logFunction(`Error fetching block number, operator may no longer be connected to the JSON RPC: ${JSON.stringify(error)}.`);
        }
    };
    fetchBlockNumber();
    const intervalId = setInterval(fetchBlockNumber, 900000); // 900,000 milliseconds = 15 minutes

    async function stop() {
        clearInterval(intervalId);
        closeChallengeListener();
        logFunction("Challenge listener stopped.");
    }

    return stop;
}
