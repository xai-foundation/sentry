import { Command } from 'commander';
import { getDiscountAndRewardForReferrals as getDiscountAndRewardForReferralsCore } from "@sentry/core";

/**
 * Function to get the referral discount and reward percentages.
 * @param cli - Commander instance
 */
export function getReferralDiscountAndRewardPercentages(cli: Command): void {
    cli
        .command('get-referral-discount-and-reward-percentages')
        .description('Gets the referral discount and reward percentages.')
        .action(async () => {
            console.log('Fetching referral discount and reward percentages...');
            try {
                const { referralDiscountPercentage, referralRewardPercentage } = await getDiscountAndRewardForReferralsCore();
                console.log(`Referral Discount Percentage: ${referralDiscountPercentage}`);
                console.log(`Referral Reward Percentage: ${referralRewardPercentage}`);
            } catch (error) {
                console.error(`Error fetching data: ${(error as Error).message}`);
            }
        });
}
