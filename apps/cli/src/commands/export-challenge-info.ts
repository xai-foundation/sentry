import { Command } from 'commander';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getChallengesFromGraph, retry } from "@sentry/core";

/**
 * Function to export the following info about all challenges as CSV:
 * - challengeNumber
 * - timestamp
 * - amountClaimedByClaimers
 * - numberOfEligibleClaimers
 * - submissions claimed
 * - submissions total
 * @param cli - Commander instance
 */
export function exportChallengeInfo(cli: Command): void {
    cli
        .command('export-challenge-info')
        .description('Exports information about all past challenges as CSV.')
        .action(async () => {
            console.log('Starting the export of challenge info...');

            process.on('SIGINT', async () => {
                console.log('The export has been terminated manually.');
                process.exit();
            });

            let offset = 0;
            const tableRows = [];

            let totalAmountForChallenges = 0n;
            let totalAmountClaimedFromChallenges = 0n;
            let totalAmountForSubsidy = 0n;

            while (true) {
                try {
                    const challenges = await retry(() => getChallengesFromGraph(10, 10 * offset), 3);

                    if (challenges.length === 0) {
                        console.log("Finished query from graph");
                        break;
                    }

                    console.log(`Processing challenge ${challenges[0].challengeNumber} - ${(BigInt(challenges[0].challengeNumber) - BigInt(challenges.length)).toString()}...`);

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
                        };

                        totalAmountForChallenges += BigInt(challenge.amountClaimedByClaimers) + BigInt(challenge.amountForGasSubsidy);
                        totalAmountClaimedFromChallenges += BigInt(challenge.amountClaimedByClaimers);
                        totalAmountForSubsidy += BigInt(challenge.amountForGasSubsidy);

                        tableRows.push(tableRow);
                    }
                    offset++;
                } catch (error) {
                    console.error(`Error fetching challenges: ${(error as Error).message}`);
                    break;
                }
            }

            if (tableRows.length > 0) {
                const headers = Object.keys(tableRows[0]).join(',');
                const rows = tableRows.map(obj => Object.values(obj).join(','));
                const csv = [headers, ...rows].join('\n');

                const destination = path.join(os.homedir(), `challengesInfo-${Date.now()}.csv`);

                try {
                    fs.writeFileSync(destination, csv);
                    console.log(`CSV export has been saved to "${destination}"`);
                } catch (error) {
                    console.error(`Error saving CSV file: ${(error as Error).message}`);
                }
            } else {
                console.log('No challenges were retrieved to export.');
            }
        });
}
