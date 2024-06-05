import { getChallengesFromGraph, retry } from "@sentry/core";
import fs from 'fs';
import os from 'os';
import path from 'path';
import Vorpal from "vorpal";

/**
 * Function to export the following info about all challenges as csv:
 * - challengeNumber
 * - timestamp
 * - amountClaimedByClaimers
 * - numberOfEligibleClaimers
 * - submissions claimed
 * - submissions total
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function exportChallengeInfo(cli: Vorpal) {
    cli
        .command('export-challenge-info', 'Exports information about all past challenges as csv.')
        .action(async function (this: Vorpal.CommandInstance) {
            const cmdInstance = this;

            process.on('SIGINT', async () => {
                cmdInstance.log(`The export has been terminated manually.`);
                process.exit();
            });

            let offset = 0;
            const tableRows = [];

            let totalAmountForChallenges = 0n;
            let totalAmountClaimedFromChallenges = 0n;
            let totalAmountForSubsidy = 0n;

            while (true) {
                const challenges = await retry(() => getChallengesFromGraph(10, 10 * offset), 3);

                if (challenges.length == 0) {
                    this.log("Finished query from graph");
                    break;
                }

                this.log(`Processing challenge ${challenges[0].challengeNumber} - ${(BigInt(challenges[0].challengeNumber) - BigInt(challenges.length)).toString()}...`);

                for (let i = 0; i < challenges.length; i++) {
                    const challenge = challenges[i];

                    const tableRow = {
                        challengeNumber: challenge.challengeNumber,
                        timeStamp: `"${new Date(challenge.createdTimestamp * 1000).toLocaleString()}"`,
                        amountClaimedByClaimers: BigInt(challenge.amountClaimedByClaimers) / BigInt(10 ** 18),
                        rewardAmountForClaimers: BigInt(challenge.rewardAmountForClaimers) / BigInt(10 ** 18),
                        amountForGasSubsidy: BigInt(challenge.amountForGasSubsidy) / BigInt(10 ** 18),
                        numberOfEligibleClaimers: challenge.numberOfEligibleClaimers,
                        submissionsClaimed: challenge.submissions.filter(s => s.claimed).length,
                        submissionsTotal: challenge.submissions.length,
                        submissionsFromSingle: challenge.submissions.filter(s => s.submittedFrom == "submitAssertion").length,
                        submissionsFromMultiple: challenge.submissions.filter(s => s.submittedFrom == "submitMultipleAssertions").length,
                        claimFromSingle: challenge.submissions.filter(s => s.claimedFrom == "claimRewards").length,
                        claimFromMultiple: challenge.submissions.filter(s => s.claimedFrom == "claimMultipleRewards").length,
                        numberOfUnclaimedSubmissions: challenge.submissions.filter(s => s.eligibleForPayout && s.claimedFrom == "unclaimed").length
                    }

                    totalAmountForChallenges += BigInt(challenge.amountClaimedByClaimers) + BigInt(challenge.amountForGasSubsidy)
                    totalAmountClaimedFromChallenges += BigInt(challenge.amountClaimedByClaimers)
                    totalAmountForSubsidy += BigInt(challenge.amountForGasSubsidy)

                    tableRows.push(tableRow);
                }
                offset++
            }

            const headers = Object.keys(tableRows[0]).join(',');
            const rows = tableRows.map(obj => {
                return Object.values(obj).join(',');
            });
            const csv = [headers, ...rows].join('\n');

            const destination = path.join(os.homedir(), `challengesInfo-${Date.now()}.csv`);

            fs.writeFileSync(destination, csv);

            this.log(`CSV export has been saved to "${destination}"`);
        });
}