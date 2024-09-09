import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, setDiscountAndRewardForReferrals } from "@sentry/core";

/**
 * Function to set the referral discount and reward percentages in the NodeLicense contract.
 * @param cli - Commander instance
 */
export function setReferralDiscountAndRewardPercentages(cli: Command): void {
    cli
        .command('set-referral-discount-and-reward-percentages')
        .description('Sets the referral discount and reward percentages.')
        .action(async () => {
            // Prompt user for the admin's private key
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an admin:',
                mask: '*',
            });

            // Prompt user for the new referral discount percentage
            const { referralDiscountPercentage } = await inquirer.prompt({
                type: 'input',
                name: 'referralDiscountPercentage',
                message: 'Enter the new referral discount percentage (as a whole number, e.g., 10 for 10%):',
                validate: (input) => {
                    const percentage = parseInt(input);
                    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                        return 'Please enter a valid percentage between 0 and 100.';
                    }
                    return true;
                }
            });

            // Prompt user for the new referral reward percentage
            const { referralRewardPercentage } = await inquirer.prompt({
                type: 'input',
                name: 'referralRewardPercentage',
                message: 'Enter the new referral reward percentage (as a whole number, e.g., 25 for 25%):',
                validate: (input) => {
                    const percentage = parseInt(input);
                    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                        return 'Please enter a valid percentage between 0 and 100.';
                    }
                    return true;
                }
            });

            try {
                // Get the signer from the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the setDiscountAndRewardForReferrals function
                await setDiscountAndRewardForReferrals(
                    signer,
                    parseInt(referralDiscountPercentage),
                    parseInt(referralRewardPercentage)
                );

                console.log(`Referral discount percentage set to: ${referralDiscountPercentage}`);
                console.log(`Referral reward percentage set to: ${referralRewardPercentage}`);
            } catch (error) {
                console.error(`Error setting referral percentages: ${(error as Error).message}`);
            }
        });
}
