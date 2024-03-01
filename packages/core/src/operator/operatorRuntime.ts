import { ethers } from "ethers";
import {
    Challenge,
    RefereeAbi,
    claimReward,
    config,
    getMintTimestamp,
    getSubmissionsForChallenges,
    listChallenges,
    listNodeLicenses,
    listOwnersForOperator,
    listenForChallenges,
    submitAssertionToChallenge,
    checkKycStatus,
    getProvider,
    version,
    Submission,
    getBoostFactor
} from "../index.js";
import { retry } from "../index.js";
import axios from "axios";

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

export type PublicNodeBucketInformation = {
    assertion: number,
    blockHash: string,
    sendRoot: string,
    confirmHash: string
}

let cachedSigner: ethers.Signer;
let cachedLogger: (log: string) => void;
let safeStatusCallback: () => void;
let onAssertionMissMatchCb: (publicNodeData: PublicNodeBucketInformation | undefined, challenge: Challenge, message: string) => void;
let nodeLicenseIds: bigint[] = [];
const mintTimestamps: { [nodeLicenseId: string]: bigint } = {};
const nodeLicenseStatusMap: NodeLicenseStatusMap = new Map();
const challengeNumberMap: { [challengeNumber: string]: boolean } = {};
let cachedBoostFactor: { [ownerAddress: string]: bigint } = {};

async function getPublicNodeFromBucket(confirmHash: string) {
    const url = `https://sentry-public-node.xai.games/assertions/${confirmHash.toLowerCase()}.json`;
    const response = await axios.get(url);

    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error("Invalid response status " + response.status);
    }
}

/**
 * Compare a challenge with an assertion posted to the public CDN by the public Xai node.
 * @param {Challenge} challenge - The challenge from the Referee contract.
 * @returns {Promise<() => Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }>>} Returns the assertion data from the CDN or an error on miss match.
 */
async function compareWithCDN(challenge: Challenge): Promise<{ publicNodeBucket: PublicNodeBucketInformation, error?: string }> {

    let attempt = 1;
    let publicNodeBucket: PublicNodeBucketInformation | undefined;
    let lastError;

    while (attempt <= 3) {
        try {
            publicNodeBucket = await getPublicNodeFromBucket(challenge.assertionStateRootOrConfirmData);
            break;
        } catch (error) {
            cachedLogger(`Error loading assertion data from CDN for ${challenge.assertionStateRootOrConfirmData} with attempt ${attempt}.\n${error}`);
            lastError = error;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 20000));
    }

    if (!publicNodeBucket) {
        throw new Error(`Failed to retrieve assertion data from CDN for ${challenge.assertionStateRootOrConfirmData} after ${attempt} attempts.\n${lastError}`);
    }

    if (publicNodeBucket.assertion !== Number(challenge.assertionId)) {
        return { publicNodeBucket, error: `Miss match between PublicNode and Challenge assertion number '${challenge.assertionId}'!` };
    }

    return { publicNodeBucket }
}

function updateNodeLicenseStatus(nodeLicenseId: bigint, newStatus: NodeLicenseStatus | string) {
    const nodeLicenseInfo = nodeLicenseStatusMap.get(nodeLicenseId);
    if (nodeLicenseInfo) {
        nodeLicenseInfo.status = newStatus;
        nodeLicenseStatusMap.set(nodeLicenseId, nodeLicenseInfo);
        safeStatusCallback();
    } else {
        cachedLogger(`NodeLicenseId ${nodeLicenseId} not found in nodeLicenseStatusMap.`);
    }
}

const createAssertionHashAndCheckPayout = (nodeLicenseId: bigint, challengeId: bigint, boostFactor: bigint, confirmData: string, challengerSignedHash: string): [boolean, string] => {
    const assertionHash = ethers.keccak256(ethers.solidityPacked(["uint256", "uint256", "bytes", "bytes"], [nodeLicenseId, challengeId, confirmData, challengerSignedHash]));
    return [Number((BigInt(assertionHash) % BigInt(10_000))) < Number(boostFactor), assertionHash];
}

/**
 * Processes a new challenge for all the node licenses.
 * @param {bigint} challengeNumber - The challenge number.
 * @param {Challenge} challenge - The challenge.
 */
async function processNewChallenge(challengeNumber: bigint, challenge: Challenge) {
    cachedLogger(`Processing new challenge with number: ${challengeNumber}.`);
    cachedBoostFactor = {};
    for (const nodeLicenseId of nodeLicenseIds) {

        cachedLogger(`Checking eligibility for nodeLicenseId ${nodeLicenseId}.`);

        // Check the nodeLicense eligibility for this challenge
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_MINT_TIMESTAMP_ELIGIBILITY);

        if (challenge.createdTimestamp <= mintTimestamps[nodeLicenseId.toString()]) {
            cachedLogger(`Sentry Key ${nodeLicenseId} is not eligible for challenge ${challengeNumber}.`);
            updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
            continue;
        }

        // Check if nodeLicense is eligible for a payout
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.CHECKING_IF_ELIGIBLE_FOR_PAYOUT);

        try {
            const keyOwner = nodeLicenseStatusMap.get(nodeLicenseId)?.ownerPublicKey as string;
            if (!cachedBoostFactor[keyOwner]) {
                try {
                    cachedBoostFactor[keyOwner] = await getBoostFactor(keyOwner);
                } catch (error: any) {
                    const errorMessage: string = error && error.message ? error.message : error;
                    if (errorMessage.includes("missing revert data")) {
                        cachedLogger(`INFO: boostFactor will be enabled on staking release`);
                        cachedBoostFactor[keyOwner] = 100n;
                    } else {
                        cachedLogger(`Error loading boostFactor: ${errorMessage}`);
                        throw new Error(`Error loading boostFactor: ${errorMessage}`);
                    }
                }
            }

            const [payoutEligible] = createAssertionHashAndCheckPayout(nodeLicenseId, challengeNumber, cachedBoostFactor[keyOwner], challenge.assertionStateRootOrConfirmData, challenge.challengerSignedHash);

            if (!payoutEligible) {
                cachedLogger(`Sentry Key ${nodeLicenseId} did not accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }
        } catch (error: any) {
            cachedLogger(`Error checking payout eligible for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

        // Check if nodeLicense has already submitted
        try {
            const [{ submitted }] = await retry(() => getSubmissionsForChallenges([challengeNumber], nodeLicenseId));
            if (submitted) {
                cachedLogger(`Sentry Key ${nodeLicenseId} has submitted for challenge ${challengeNumber} by another node. If multiple nodes are running, this message can be ignored.`);
                updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
                continue;
            }
            // Submit the claim to the challenge
            cachedLogger(`Submitting assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber}.`);
            await retry(() => submitAssertionToChallenge(nodeLicenseId, challengeNumber, challenge.assertionStateRootOrConfirmData, cachedSigner));

        } catch (error: any) {
            cachedLogger(`Error submitting assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
            continue;
        }

        cachedLogger(`Submitted assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber}. You have accrued esXAI.`);
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);

    }
}

async function processClaimForChallenge(challengeNumber: bigint, nodeLicenseId: bigint) {
    cachedLogger(`Checking KYC status of '${nodeLicenseStatusMap.get(nodeLicenseId)?.ownerPublicKey}' for Sentry Key '${nodeLicenseId}'.`);
    updateNodeLicenseStatus(nodeLicenseId, `Checking KYC Status`);
    safeStatusCallback();

    let isKycApproved: boolean;
    try {
        // check to see if the owner of the license is KYC'd
        // TODO we can cache the KYC status per key
        [{ isKycApproved }] = await retry(async () => await checkKycStatus([nodeLicenseStatusMap.get(nodeLicenseId)!.ownerPublicKey]));
    } catch (error: any) {
        cachedLogger(`Error checking KYC for Sentry Key ${nodeLicenseId} - ${error && error.message ? error.message : error}`);
        updateNodeLicenseStatus(nodeLicenseId, `Failed to check KYC status`);
        safeStatusCallback();
        return;
    }

    if (!isKycApproved) {
        cachedLogger(`Checked KYC status of '${nodeLicenseStatusMap.get(nodeLicenseId)?.ownerPublicKey}' for Sentry Key '${nodeLicenseId}'. It was not KYC'd and not able to claim the reward.`);
        updateNodeLicenseStatus(nodeLicenseId, `Cannot Claim, Failed KYC`);
        safeStatusCallback();
        return;
    }

    cachedLogger(`Requesting esXAI reward for challenge '${challengeNumber}'.`);
    updateNodeLicenseStatus(nodeLicenseId, `Requesting esXAI reward for challenge '${challengeNumber}'.`);
    safeStatusCallback();

    try {
        await retry(() => claimReward(nodeLicenseId, challengeNumber, cachedSigner));
    } catch (error: any) {
        cachedLogger(`Error claiming reward for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber} - ${error && error.message ? error.message : error}`);
        updateNodeLicenseStatus(nodeLicenseId, `Failed to claim reward`);
        safeStatusCallback();
        return;
    }

    cachedLogger(`esXAI claim was successful for Challenge '${challengeNumber}'.`);
    updateNodeLicenseStatus(nodeLicenseId, `esXAI claim was successful for Challenge '${challengeNumber}'`);
    safeStatusCallback();
}

const onFoundClosedSubmission = async (challengeId: bigint, nodeLicenseId: bigint, unclaimed: boolean) => {
    cachedLogger(`Checking for unclaimed rewards on Challenge '${challengeId}'.`);
    updateNodeLicenseStatus(nodeLicenseId, `Checking For Unclaimed Rewards on Challenge '${challengeId}'`);
    safeStatusCallback();
    // call the process claim and update statuses/logs accoridngly
    if (unclaimed) {
        updateNodeLicenseStatus(nodeLicenseId, `Found Unclaimed Reward for Challenge '${challengeId}'`);
        safeStatusCallback();
        cachedLogger(`Found unclaimed reward for challenge '${challengeId}'.`);
        await processClaimForChallenge(challengeId, nodeLicenseId);
    }
}

// create a function that checks all the submissions for a closed challenge
async function processClosedChallenges(challengeIds: bigint[]) {
    for (const nodeLicenseId of nodeLicenseIds) {
        const beforeStatus = nodeLicenseStatusMap.get(nodeLicenseId)?.status;
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.QUERYING_FOR_UNCLAIMED_SUBMISSIONS);
        cachedLogger(`Checking for unclaimed rewards on Sentry Key '${nodeLicenseId}'.`);
        let lastProcessedChallengeIndex = 0;

        try {
            await getSubmissionsForChallenges(challengeIds, nodeLicenseId, (submission: Submission, index: number) => {
                lastProcessedChallengeIndex = index;
                return onFoundClosedSubmission(challengeIds[index], nodeLicenseId, submission.submitted && !submission.claimed);
            });
        } catch (error: any) {
            cachedLogger(`Error processing submissions for Sentry Key ${nodeLicenseId} processed ${lastProcessedChallengeIndex}/${challengeIds.length} challenges - ${error && error.message ? error.message : error}`);
        }

        if (beforeStatus) {
            updateNodeLicenseStatus(nodeLicenseId, beforeStatus);
            safeStatusCallback();
        }
    }
}


// start a listener for new challenges
async function listenForChallengesCallback(challengeNumber: bigint, challenge: Challenge, event?: any) {
    if (event && challenge.rollupUsed === config.rollupAddress) {
        compareWithCDN(challenge)
            .then(({ publicNodeBucket, error }) => {
                if (error) {
                    onAssertionMissMatchCb(publicNodeBucket, challenge, error);
                    return;
                }
                cachedLogger(`Comparison between PublicNode and Challenger was successful.`);
            })
            .catch(error => {
                cachedLogger(`Error on CND check for challenge ${Number(challenge.assertionId)}.`);
                cachedLogger(`${error.message}.`);
            });
    }

    if (challenge.openForSubmissions) {
        cachedLogger(`Received new challenge with number: ${challengeNumber}.`);
        if (!challengeNumberMap[challengeNumber.toString()]) {
            challengeNumberMap[challengeNumber.toString()] = true;
            await processNewChallenge(challengeNumber, challenge);
        }
    } else {
        cachedLogger(`Looking for previously accrued rewards on Challenge '${challengeNumber}'.`);
    }

    // check the previous challenge, that should be closed now
    if (challengeNumber > BigInt(1)) {
        await processClosedChallenges([challengeNumber - BigInt(1)]);
    }
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

    cachedLogger = logFunction;
    cachedSigner = signer;
    onAssertionMissMatchCb = onAssertionMissMatch;

    logFunction(`Booting operator runtime.`);

    const provider = getProvider();


    // Create a wrapper for the statusCallback to always send back a fresh copy of the map, so the other side doesn't mutate the map
    safeStatusCallback = () => {
        // Create a fresh copy of the map
        const statusCopy: NodeLicenseStatusMap = new Map(nodeLicenseStatusMap);

        // Call the original statusCallback with the copy
        statusCallback(statusCopy);
    };

    // get the address of the operator
    const operatorAddress = await signer.getAddress();
    logFunction(`Fetched address of operator ${operatorAddress}.`);

    // get a list of all the owners that are added to this operator
    logFunction(`Getting all wallets assigned to the operator.`);
    let owners: string[];
    if (operatorOwners) {
        logFunction(`Operator owners were passed in.`);
        owners = Array.from(new Set(operatorOwners));
    } else {
        logFunction(`No operator owners were passed in.`);
        owners = [operatorAddress, ...await retry(async () => await listOwnersForOperator(operatorAddress))];
    }

    logFunction(`Received ${owners.length} wallets to run with this operator. The addresses are: ${owners.join(', ')}`);

    // get a list of all the node licenses for each of the owners
    logFunction(`Getting all node licenses for each owner.`);
    for (const owner of owners) {
        logFunction(`Fetching node licenses for owner ${owner}.`);
        const licensesOfOwner = await listNodeLicenses(owner, (tokenId) => {
            logFunction(`Fetched Sentry Key ${tokenId.toString()} for owner ${owner}.`);
            nodeLicenseStatusMap.set(tokenId, {
                ownerPublicKey: owner,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });
        });
        nodeLicenseIds = [...nodeLicenseIds, ...licensesOfOwner];
        logFunction(`Fetched ${licensesOfOwner.length} node licenses for owner ${owner}.`);
    }
    logFunction(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);

    // if (nodeLicenseIds.length === 0) {
    //     throw new Error("No Sentry Keys found.");
    // }

    // create a mapping of all the timestamps these nodeLicenses were created at, so we can easily check the eligibility later
    logFunction(`Checking Sentry Key eligibility.`);
    for (const nodeLicenseId of nodeLicenseIds) {
        logFunction(`Fetching metadata for Sentry Key ${nodeLicenseId}.`);
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.FETCHING_MINT_TIMESTAMP);
        mintTimestamps[nodeLicenseId.toString()] = await retry(async () => await getMintTimestamp(nodeLicenseId));
        updateNodeLicenseStatus(nodeLicenseId, NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE);
        logFunction(`Fetched metadata for Sentry Key ${nodeLicenseId}.`);
    }
    logFunction(`Finished creating the lookup of metadata for the Sentry Keys.`);

    const closeChallengeListener = listenForChallenges(listenForChallengesCallback);
    logFunction(`Started listener for new challenges.`);

    logFunction(`Processing open challenges.`);
    await listChallenges(false, listenForChallengesCallback);

    logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);

    const fetchBlockNumber = async () => {
        try {
            const blockNumber = await provider.getBlockNumber();
            logFunction(`[cli ${version}] Health Check on JSON RPC, Operator still healthy. Current block number: ${blockNumber}`);
        } catch (error) {
            logFunction(`Error fetching block number, operator may no longer be connected to the JSON RPC: ${JSON.stringify(error)}.`);
        }
    };
    fetchBlockNumber();
    const intervalId = setInterval(fetchBlockNumber, 300000); // 300,000 milliseconds = 5 minutes

    async function stop() {
        clearInterval(intervalId);
        closeChallengeListener();
        logFunction("Challenge listener stopped.");
    }

    return stop;
}
