import { ethers } from "ethers";
import { Challenge, RefereeAbi, claimReward, config, getMintTimestamp, getSubmissionsForChallenges, listChallenges, listNodeLicenses, listOwnersForOperator, listenForChallenges, submitAssertionToChallenge, checkKycStatus } from "../index.js";
import { retry } from "../index.js";

export enum NodeLicenseStatus {
    WAITING_IN_QUEUE = "Booting Operator For Key", // waiting to do an action, but in a queue
    FETCHING_MINT_TIMESTAMP = "Eligibility Lookup",
    WAITING_FOR_NEXT_CHALLENGE = "Node is Running, esXAI Will Accrue Every Few Days",
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
    logFunction("Getting all wallets assigned to the operator.");
    const owners = [operatorAddress, ...await retry(async () => await listOwnersForOperator(operatorAddress))];
    logFunction(`Received ${owners.length} wallets that are assigned to this operator.`);

    // get a list of all the node licenses for each of the owners
    let nodeLicenseIds: bigint[] = [];
    logFunction("Getting all node licenses for each owner.");
    for (const owner of owners) {
        logFunction(`Fetching node licenses for owner ${owner}.`);
        const licensesOfOwner = await listNodeLicenses(owner, (tokenId) => {
            logFunction(`Fetched Sentry Key ${tokenId.toString()} for owner ${owner}.`);
            nodeLicenseStatusMap.set(tokenId, {
                ownerPublicKey: owner,
                status: NodeLicenseStatus.WAITING_IN_QUEUE,
            });
            safeStatusCallback();
        });
        nodeLicenseIds = [...nodeLicenseIds, ...licensesOfOwner];
        logFunction(`Fetched ${licensesOfOwner.length} node licenses for owner ${owner}.`);
    }
    logFunction(`Total Sentry Keys fetched: ${nodeLicenseIds.length}.`);

    // create a mapping of all the timestamps these nodeLicenses were created at, so we can easily check the eligibility later
    logFunction("Checking Sentry Key eligibility.");
    const mintTimestamps: { [nodeLicenseId: string]: bigint } = {};
    for (const nodeLicenseId of nodeLicenseIds) {
        logFunction(`Fetching metadata for Sentry Key ${nodeLicenseId}.`);
        nodeLicenseStatusMap.set(nodeLicenseId, {
            ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
            status: NodeLicenseStatus.FETCHING_MINT_TIMESTAMP,
        });
        safeStatusCallback();
        mintTimestamps[nodeLicenseId.toString()] = await retry(async () => await getMintTimestamp(nodeLicenseId));
        nodeLicenseStatusMap.set(nodeLicenseId, {
            ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
            status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
        });
        safeStatusCallback();
        logFunction(`Fetched metadata for Sentry Key ${nodeLicenseId}.`);
    }
    logFunction("Finished creating the lookup of metadata for the Sentry Keys.");

    /**
     * Processes a new challenge for all the node licenses.
     * @param {bigint} challengeNumber - The challenge number.
     * @param {Challenge} challenge - The challenge.
     */
    async function processNewChallenge(challengeNumber: bigint, challenge: Challenge) {
        logFunction(`Processing new challenge with number: ${challengeNumber}.`);

        for (const nodeLicenseId of nodeLicenseIds) {
            logFunction(`Checking eligibility for nodeLicenseId ${nodeLicenseId}.`);

            // check the nodeLicense is eligible to submit to this challenge, it must have been minted before the challenge was opened.
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: NodeLicenseStatus.CHECKING_MINT_TIMESTAMP_ELIGIBILITY,
            });
            safeStatusCallback();

            if (challenge.createdTimestamp <= mintTimestamps[nodeLicenseId.toString()]) {
                logFunction(`Sentry Key ${nodeLicenseId} is not eligible for challenge ${challengeNumber}.`);
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

            const [payoutEligible] = await retry(async () => await refereeContract.createAssertionHashAndCheckPayout(nodeLicenseId, challengeNumber, challenge.assertionStateRootOrConfirmData, challenge.challengerSignedHash));
            if (!payoutEligible) {
                logFunction(`Sentry Key ${nodeLicenseId} did not accrue esXAI for the challenge ${challengeNumber}. A Sentry Key receives esXAI every few days.`);
                nodeLicenseStatusMap.set(nodeLicenseId, {
                    ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                    status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
                });
                safeStatusCallback();
                continue;
            }

            // check to see if this nodeLicense has already submitted, if we have, then go to next license
            const [{submitted}] = await retry(async () => await getSubmissionsForChallenges([challengeNumber], nodeLicenseId));
            if (submitted) {
                logFunction(`Sentry Key ${nodeLicenseId} has submitted for challenge ${challengeNumber} by another node. If multiple nodes are running, this message can be ignored.`);
                nodeLicenseStatusMap.set(nodeLicenseId, {
                    ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                    status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
                });
                safeStatusCallback();
                return;
            }

            // submit the claim to the challenge
            try {
                logFunction(`Submitting assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber}.`);
                await retry(async () => await submitAssertionToChallenge(nodeLicenseId, challengeNumber, challenge.assertionStateRootOrConfirmData, signer));
                logFunction(`Submitted assertion for Sentry Key ${nodeLicenseId} to challenge ${challengeNumber}. You have accrued esXAI.`);
                nodeLicenseStatusMap.set(nodeLicenseId, {
                    ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                    status: NodeLicenseStatus.WAITING_FOR_NEXT_CHALLENGE,
                });
                safeStatusCallback();
            } catch (err) {
                logFunction(`Sentry Key ${nodeLicenseId} has submitted for challenge ${challengeNumber} by another node. If multiple nodes are running, this message can be ignored.`);
            }

        }
    }

    async function processClaimForChallenge(challengeNumber: bigint, nodeLicenseId: bigint) {

        logFunction(`Checking KYC status of '${nodeLicenseStatusMap.get(nodeLicenseId)!.ownerPublicKey}' for Sentry Key '${nodeLicenseId}'.`);
        nodeLicenseStatusMap.set(nodeLicenseId, {
            ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
            status: `Checking KYC Status`,
        });
        safeStatusCallback();

        // check to see if the owner of teh license is KYC'd
        const [{isKycApproved}] = await retry(async () => await checkKycStatus([nodeLicenseStatusMap.get(nodeLicenseId)!.ownerPublicKey]));
        
        if (isKycApproved) {
            logFunction(`Requesting esXAI reward for challenge '${challengeNumber}'.`);
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: `Requesting esXAI reward for challenge '${challengeNumber}'.'`,
            });
            safeStatusCallback();

            await retry(async () => await claimReward(nodeLicenseId, challengeNumber, signer));

            logFunction(`esXAI claim was successful for Challenge '${challengeNumber}'.`);
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: `esXAI claim was successful for Challenge '${challengeNumber}'`,
            });
            safeStatusCallback();
        } else {
            logFunction(`Checked KYC status of '${nodeLicenseStatusMap.get(nodeLicenseId)!.ownerPublicKey}' for Sentry Key '${nodeLicenseId}'. It was not KYC'd and not able to claim the reward.`);
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: `Cannot Claim, Failed KYC`,
            });
        }

    }

    // start a listener for new challenges
    const challengeNumberMap: { [challengeNumber: string]: boolean } = {};
    async function listenForChallengesCallback(challengeNumber: bigint, challenge: Challenge) {

        if (challenge.openForSubmissions) {
            logFunction(`Received new challenge with number: ${challengeNumber}.`);
            if (!challengeNumberMap[challengeNumber.toString()]) {
                challengeNumberMap[challengeNumber.toString()] = true;
                await processNewChallenge(challengeNumber, challenge);
            }
        } else {
            logFunction(`Looking for previously accrued rewards on Challenge ${challengeNumber}.`);
        }

        // check the previous challenge, that should be closed now
        if (challengeNumber > BigInt(1)) {
            await processClosedChallenges([challengeNumber - BigInt(1)]);
        }

    }
    const closeChallengeListener = await listenForChallenges(listenForChallengesCallback);
    logFunction(`Started listener for new challenges.`);

    // find any open challenges
    logFunction(`Processing open challenges.`);
    const challenges = await listChallenges(false, listenForChallengesCallback);

    // create a function that checks all the submissions for a closed challenge
    async function processClosedChallenges(challengeIds: bigint[]) {
        for (const nodeLicenseId of nodeLicenseIds) {
            const beforeStatus = nodeLicenseStatusMap.get(nodeLicenseId)!.status;
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: NodeLicenseStatus.QUERYING_FOR_UNCLAIMED_SUBMISSIONS,
            });
            safeStatusCallback();
            logFunction(`Checking for unclaimed rewards on Sentry Key '${nodeLicenseId}'.`);
    
            await getSubmissionsForChallenges(challengeIds, nodeLicenseId, async (submission, index) => {
    
                const challengeId = challengeIds[index];
    
                nodeLicenseStatusMap.set(nodeLicenseId, {
                    ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                    status: `Checking For Unclaimed Rewards on Challenge '${challengeId}'`,
                });
                safeStatusCallback();
                logFunction(`Checking for unclaimed rewards on Challenge '${challengeId}'.`);
    
                // call the process claim and update statuses/logs accoridngly
                if (submission.submitted && !submission.claimed) {
                    nodeLicenseStatusMap.set(nodeLicenseId, {
                        ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                        status: `Found Unclaimed Reward for Challenge '${challengeId}'`,
                    });
                    safeStatusCallback();
                    logFunction(`Found unclaimed reward for challenge '${challengeId}'.`);
                    await processClaimForChallenge(challengeId, nodeLicenseId);
                }
            });
    
            nodeLicenseStatusMap.set(nodeLicenseId, {
                ...nodeLicenseStatusMap.get(nodeLicenseId) as NodeLicenseInformation,
                status: beforeStatus,
            });
            safeStatusCallback();
        }
    }

    // iterate over all the challenges that are closed to see if any are available for claiming
    const closedChallengeIds = challenges.filter(([_, challenge]) => !challenge.openForSubmissions).map(([challengeNumber]) => challengeNumber);
    await processClosedChallenges(closedChallengeIds);
    logFunction(`The operator has finished booting. The operator is running successfully. esXAI will accrue every few days.`);

    // Interval function to emit to the logFunction every 5 minutes
    const intervalId = setInterval(() => {
        const timestamp = new Date();
        logFunction(`Current timestamp: ${timestamp.toISOString()}. The operator is still running successfully. esXAI will accrue every few days.`);
    }, 60000); // 60,000 milliseconds = 1 minute

    async function stop() {
        clearInterval(intervalId);
        closeChallengeListener();
        logFunction("Challenge listener stopped.");
    }

    return stop;
}