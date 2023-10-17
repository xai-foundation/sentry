import Vorpal from "vorpal";
import { getDiscountAndRewardForReferrals as getDiscountAndRewardForReferralsCore } from "@xai-vanguard-node/core";

/**
 * Function to get the referral discount and reward percentages.
 * @param cli - Vorpal instance
 */
export function getReferralDiscountAndRewardPercentages(cli: Vorpal) {
    cli
        .command('get-referral-discount-and-reward-percentages', 'Gets the referral discount and reward percentages.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching referral discount and reward percentages...`);
            const { referralDiscountPercentage, referralRewardPercentage } = await getDiscountAndRewardForReferralsCore();
            this.log(`Referral Discount Percentage: ${referralDiscountPercentage}`);
            this.log(`Referral Reward Percentage: ${referralRewardPercentage}`);
        });
}