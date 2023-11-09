import { ethers } from "ethers";
import { Challenge, RefereeAbi, config, getMintTimestamp, getSubmissionForChallenge, listChallenges, listNodeLicenses, listOwnersForOperator, listenForChallenges, submitAssertionToChallenge } from "../index.js";

export enum NodeLicenseStatus {
    WAITING_IN_QUEUE = "Waiting in Queue", // waiting to do an action, but in a queue
    FETCHING_MINT_TIMESTAMP = "Fetching Mint Timestamp",
    WAITING_FOR_NEXT_CHALLENGE = "Waiting for Next Challenge",
    CHECKING_MINT_TIMESTAMP_ELIGIBILITY = "Checking Mint Timestamp Eligibility",
    CHECKING_IF_ELIGIBLE_FOR_PAYOUT = "Checking if Eligible for Payout",
    SUBMITTING_ASSERTION_TO_CHALLENGE = "Submitting Assertion to Challenge",
}

export interface NodeLicenseInformation {
    ownerPublicKey: string
    status: NodeLicenseStatus;
}

export type NodeLicenseStatusMap = Map<bigint, NodeLicenseInformation>;

/**
 * Operator runtime function.
 * @param {ethers.Signer} signer - The signer.
 * @param {((status: NodeLicenseStatusMap) => void)} [statusCallback] - Optional function to monitor the status of the runtime.
 * @param {((log: string) => void)} [logFunction] - Optional function to log the process.
 * @returns {Promise<() => Promise<void>>} The stop function.
 */
export async function operatorRuntime(
    signer: ethers.Signer,
    statusCallback: (status: NodeLicenseStatusMap) => void = (_) => {},
    logFunction: (log: string) => void = (_) => {},
): Promise<() => Promise<void>> {

    logFunction("Booting operator runtime.");

    // Create a NodeLicenseStatusMap to store the status of each node license
    const nodeLicenseStatusMap: NodeLicenseStatusMap = new Map();

    // Create a wrapper for the statusCallback to always send back a fresh copy of the map, so the other side doesn't mutate the map
    const safeStatusCallback = () => {
        // Create a fresh copy of the map
        const statusCopy: NodeLicenseStatusMap = new Map(nodeLicenseStatusMap);

        // Call the original statusCallback with the copy
        statusCallback(statusCopy);
    };

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // get the address of the operator
    const operatorAddress = await signer.getAddress();
    logFunction(`Fetched address of operator ${operatorAddress}.`);

    // get a list of all the owners that are added to this operator
    logFunction("Getting all addresses attached to the operator.");
    const owners = await listOwnersForOperator(operatorAddress);
    logFunction(`Received ${owners.length} wallets that are attached to this operator.`);

    // get a list of all the node licenses for each of the owners
    let nodeLicenseIds: bigint[] = [];
    logFunction("Getting all node licenses for each owner.");
    for (const owner of owners) {
        logFunction(`Fetching node licenses for owner ${owner}.`);
        const licensesOfOwner = await listNodeLicenses(owner, (tokenId) => {
            logFunction(`Fetched node license ${tokenId.toString()} for owner ${owner}.`);
            nodeLicenseStatusMap.set(tokenId, {
                ownerPublicKey: owner,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });
            safeStatusCallback();
        });
        nodeLicenseIds = [...nodeLicenseIds, ...licensesOfOwner];
        logFunction(`Fetched ${licensesOfOwner.length} node licenses for owner ${owner}.`);
    }
    logFunction(`Total node licenses fetched: ${nodeLicenseIds.length}.`);

    // create a mapping of all the timestamps these nodeLicenses were created at, so we can easily check the eligibility later
    logFunction("Creating a mapping of all the timestamps these nodeLicenses were created at.");
    const mintTimestamps: { [nodeLicenseId: string]: bigint } = {};
    for (const nodeLicenseId of nodeLicenseIds) {
        logFunction(`Fetching mint timestamp for nodeLicenseId ${nodeLicenseId}.`);
        nodeLicenseStatusMap.set(nodeLicenseId, {
            ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
            status: NodeLicenseStatus.FETCHING_MINT_TIMESTAMP,
        });
        safeStatusCallback();
        mintTimestamps[nodeLicenseId.toString()] = await getMintTimestamp(nodeLicenseId);
        nodeLicenseStatusMap.set(nodeLicenseId, {
            ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
            status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
        });
        safeStatusCallback();
        logFunction(`Fetched mint timestamp for nodeLicenseId ${nodeLicenseId}.`);
    }
    logFunction("Finished creating the mapping of mint timestamps.");

    /**
     * Processes a new challenge for all the node licenses.
     * @param {bigint} challengeNumber - The challenge number.
     * @param {Challenge} challenge - The challenge.
     */
    async function processNewChallenge(challengeNumber: bigint, challenge: Challenge) {
        logFunction(`Processing new challenge with number: ${challengeNumber}.`);

        // Update the status of each license to 'waiting in queue'
        nodeLicenseIds.forEach(nodeLicenseId => {
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });
        });
        safeStatusCallback();

        for (const nodeLicenseId of nodeLicenseIds) {
            logFunction(`Checking eligibility for nodeLicenseId ${nodeLicenseId}.`);

            // check the nodeLicense is eligible to submit to this challenge, it must have been minted before the challenge was opened.
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: NodeLicenseStatus.CHECKING_MINT_TIMESTAMP_ELIGIBILITY,
            });
            safeStatusCallback();
            if (challenge.createdTimestamp <= mintTimestamps[nodeLicenseId.toString()]) {
                logFunction(`nodeLicenseId ${nodeLicenseId} is not eligible for challenge ${challengeNumber}.`);
                nodeLicenseStatusMap.set(nodeLicenseId, {
                    ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                    status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
                });
                safeStatusCallback();
                continue;
            }

            // check to see if this nodeLicense would be eligible for a claim, if they are not, then go to next license.
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: NodeLicenseStatus.CHECKING_IF_ELIGIBLE_FOR_PAYOUT,
            });
            safeStatusCallback();
            const [eligibleForClaim] = await refereeContract.createAssertionHashAndCheckPayout(nodeLicenseId, challengeNumber, challenge.assertionStateRoot);
            if (!eligibleForClaim) {
                logFunction(`nodeLicenseId ${nodeLicenseId} is not going to receive a reward for entering the challenge ${challengeNumber}, thus not submmiting an assertion.`);
                nodeLicenseStatusMap.set(nodeLicenseId, {
                    ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                    status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
                });
                safeStatusCallback();
                continue;
            }

            // check to see if this nodeLicense has already submitted, if we have, then go to next license
            const {submitted} = await getSubmissionForChallenge(challengeNumber, nodeLicenseId);
            if (submitted) {
                logFunction(`nodeLicenseId ${nodeLicenseId} has already submitted for challenge ${challengeNumber}.`);
                nodeLicenseStatusMap.set(nodeLicenseId, {
                    ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                    status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
                });
                safeStatusCallback();
                return;
            }

            // submit the claim to the challenge
            logFunction(`Submitting claim for nodeLicenseId ${nodeLicenseId} to challenge ${challengeNumber}.`);
            await submitAssertionToChallenge(nodeLicenseId, challengeNumber, challenge.assertionStateRoot, signer);
            logFunction(`Submitted claim for nodeLicenseId ${nodeLicenseId} to challenge ${challengeNumber}.`);
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
            });
            safeStatusCallback();
        }
    }

    // start a listener for new challenges
    const challengeNumberMap: { [challengeNumber: string]: boolean } = {};
    function listenForChallengesCallback(challengeNumber: bigint, challenge: Challenge) {
        logFunction(`Received new challenge with number: ${challengeNumber}.`);
        if (!challengeNumberMap[challengeNumber.toString()]) {
            logFunction(`Processing new challenge with number: ${challengeNumber}.`);
            challengeNumberMap[challengeNumber.toString()] = true;
            processNewChallenge(challengeNumber, challenge);
        }
    }
    const closeChallengeListener = await listenForChallenges(listenForChallengesCallback);
    logFunction(`Started listener for new challenges.`);

    // find any open challenges
    logFunction(`Processing open challenges.`);
    void listChallenges(true, listenForChallengesCallback);

    async function stop() {
        closeChallengeListener();
        logFunction("Challenge listener stopped.");
    }

    return stop;
}