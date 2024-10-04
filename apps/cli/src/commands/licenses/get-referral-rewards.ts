import { Command } from 'commander';
import inquirer from 'inquirer';
import { getReferralRewards as getReferralRewardsCore, ReferralReward } from "@sentry/core";
import Table from 'cli-table3';
import { BlockTag, ethers, Log } from "ethers";
import datePrompt from "date-prompt";

/**
 * Function to get all referral rewards for node licenses.
 * @param cli - Commander instance
 */
export function getReferralRewards(cli: Command): void {
    cli
        .command('get-referral-rewards')
        .description('Gets all referral rewards for node licenses.')
        .action(async () => {
            // Prompt user to include a time range
            const { timeRange } = await inquirer.prompt({
                type: 'confirm',
                name: 'timeRange',
                message: 'Do you want to include a time range? This can help speed up large requests.',
                default: false
            });

            let fromTimestamp: number | undefined;
            let toTimestamp: number | undefined;

            if (timeRange) {
                const fromIsoString = await datePrompt('When do you want to search from?');
                const toIsoString = await datePrompt('When do you want to search to?');
                fromTimestamp = Date.parse(fromIsoString) / 1000;
                toTimestamp = Date.parse(toIsoString) / 1000;
            }

            // Prompt user to include a specific buyer address
            const { buyerAddress: includeBuyerAddress } = await inquirer.prompt({
                type: 'confirm',
                name: 'buyerAddress',
                message: 'Do you want to include a specific buyer address?',
                default: false
            });

            let buyerAddress: string | undefined;

            if (includeBuyerAddress) {
                const { buyerAddress: _buyerAddress } = await inquirer.prompt({
                    type: 'input',
                    name: 'buyerAddress',
                    message: 'Please enter the buyer address:',
                });
                buyerAddress = _buyerAddress;
            }

            // Prompt user to include a specific referral address
            const { referralAddress: includeReferralAddress } = await inquirer.prompt({
                type: 'confirm',
                name: 'referralAddress',
                message: 'Do you want to include a specific referral address?',
                default: false
            });

            let referralAddress: string | undefined;

            if (includeReferralAddress) {
                const { referralAddress: _referralAddress } = await inquirer.prompt({
                    type: 'input',
                    name: 'referralAddress',
                    message: 'Please enter the referral address:',
                });
                referralAddress = _referralAddress;
            }

            console.log(`Fetching all referral rewards for node licenses...`);

            try {
                const rewards = await getReferralRewardsCore(
                    fromTimestamp,
                    toTimestamp,
                    buyerAddress,
                    referralAddress,
                    (logs?: Log[], from?: BlockTag, to?: BlockTag) => {
                        console.log(`Fetched ${from} -> ${to} logs. ${logs?.length || 0} referrals found.`);
                    }
                );

                for (const address in rewards) {
                    const reward: ReferralReward = rewards[address];
                    console.log(`Address: ${reward.address}, Total Received: ${ethers.formatEther(reward.totalReceived)} ETH`);
                    const table = new Table({
                        head: ['Transaction Hash', 'Buyer', 'Amount'],
                    });
                    for (const transaction of reward.transactions) {
                        table.push([
                            transaction.transactionHash,
                            transaction.buyer,
                            ethers.formatEther(transaction.amount) + " ETH"
                        ]);
                    }
                    console.log(table.toString());
                }
                console.log(`Referral rewards retrieved.`);
            } catch (error) {
                console.error(`Error fetching referral rewards: ${(error as Error).message}`);
            }
        });
}
