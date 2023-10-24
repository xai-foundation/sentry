import Vorpal from "vorpal";
import { getSignerFromPrivateKey, setDiscountAndRewardForReferrals } from "@xai-vanguard-node/core";

/**
 * Function to set the referral discount and reward percentages in the NodeLicense contract.
 * @param {Vorpal} cli - The Vorpal instance to attach the command to.
 */
export function setReferralDiscountAndRewardPercentages(cli: Vorpal) {
    cli
        .command('set-referral-discount-and-reward-percentages', 'Sets the referral discount and reward percentages.')
        .action(async function (this: Vorpal.CommandInstance) {
            const privateKeyPrompt = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:',
            };
            const referralDiscountPercentagePrompt = {
                type: 'input',
                name: 'referralDiscountPercentage',
                message: 'Enter the new referral discount percentage (as a whole number, e.g., 10 for 10%):'
            };
            const referralRewardPercentagePrompt = {
                type: 'input',
                name: 'referralRewardPercentage',
                message: 'Enter the new referral reward percentage (as a whole number, e.g., 25 for 25%):'
            };
            const { privateKey, referralDiscountPercentage, referralRewardPercentage } = await this.prompt([privateKeyPrompt, referralDiscountPercentagePrompt, referralRewardPercentagePrompt]);

            // Get the signer from the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the setDiscountAndRewardForReferrals function
            await setDiscountAndRewardForReferrals(signer, referralDiscountPercentage, referralRewardPercentage);

            this.log(`Referral discount percentage set to: ${referralDiscountPercentage}`);
            this.log(`Referral reward percentage set to: ${referralRewardPercentage}`);
        });
}
