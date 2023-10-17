import Vorpal from "vorpal";
import { getReferralRewards as getReferralRewardsCore, ReferralReward } from "@xai-vanguard-node/core";
import Table from 'cli-table3';
import { ethers } from "ethers";
import datePrompt from "date-prompt";

/**
 * Function to get all referral rewards for node licenses.
 * @param cli - Vorpal instance
 */
export function getReferralRewards(cli: Vorpal) {
    cli
        .command('get-referral-rewards', 'Gets all referral rewards for node licenses.')
        .action(async function (this: Vorpal.CommandInstance) {
            const includeTimeRange = await this.prompt({
                type: 'confirm',
                name: 'timeRange',
                message: 'Do you want to include a time range? This can help speed up large requests.',
                default: false
            });

            let fromTimestamp: number | undefined;
            let toTimestamp: number | undefined;

            if (includeTimeRange.timeRange) {
                const fromIsoString = await datePrompt('When do you want to search from?');
                const toIsoString = await datePrompt('When do you want to search to?');
                fromTimestamp = Date.parse(fromIsoString) / 1000;
                toTimestamp = Date.parse(toIsoString) / 1000;
            }

            const includeBuyerAddress = await this.prompt({
                type: 'confirm',
                name: 'buyerAddress',
                message: 'Do you want to include a specific buyer address?',
                default: false
            });

            let buyerAddress: string | undefined;

            if (includeBuyerAddress.buyerAddress) {
                const {buyerAddress: _buyerAddress} = await this.prompt({
                    type: 'input',
                    name: 'buyerAddress',
                    message: 'Please enter the buyer address:',
                });
                buyerAddress = _buyerAddress
            }

            const includeReferralAddress = await this.prompt({
                type: 'confirm',
                name: 'referralAddress',
                message: 'Do you want to include a specific referral address?',
                default: false
            });

            let referralAddress: string | undefined;

            if (includeReferralAddress.referralAddress) {
                const {referralAddress: _referallAddress} = await this.prompt({
                    type: 'input',
                    name: 'referralAddress',
                    message: 'Please enter the referral address:',
                });
                referralAddress = _referallAddress;
            }

            this.log(`Fetching all referral rewards for node licenses...`);
            const rewards = await getReferralRewardsCore(fromTimestamp, toTimestamp, buyerAddress, referralAddress, (logs, from, to) => {
                this.log(`Fetched ${from} -> ${to} logs. ${logs?.length} referrals found.`);
            });
            for (const address in rewards) {
                const reward = rewards[address];
                this.log(`Address: ${reward.address}, Total Received: ${ethers.formatEther(reward.totalReceived)} eth`);
                const table = new Table({
                    head: ['Transaction Hash', 'Buyer', 'Amount'],
                });
                for (const transaction of reward.transactions) {
                    table.push([transaction.transactionHash, transaction.buyer, ethers.formatEther(transaction.amount) + " eth"]);
                }
                this.log(table.toString());
            }
            this.log(`Referral rewards retrieved.`);
        });
}
