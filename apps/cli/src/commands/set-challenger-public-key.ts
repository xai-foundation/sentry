import { Command } from 'commander';
import inquirer from 'inquirer';
import { getSignerFromPrivateKey, setChallengerPublicKey as coreSetChallengerPublicKey } from "@sentry/core";

/**
 * Function to set the challenger public key in the Referee contract.
 * @param cli - Commander instance
 */
export function setChallengerPublicKey(cli: Command): void {
    cli
        .command('set-challenger-public-key')
        .description('Sets the challenger public key.')
        .action(async () => {
            try {
                // Prompt user for the private key of an admin
                const { privateKey } = await inquirer.prompt({
                    type: 'password',
                    name: 'privateKey',
                    message: 'Enter the private key of an admin:',
                    mask: '*',
                    validate: input => input.trim() === '' ? 'Private key is required' : true
                });

                // Prompt user for the new challenger public key
                const { publicKey } = await inquirer.prompt({
                    type: 'input',
                    name: 'publicKey',
                    message: 'Enter the new challenger public key:',
                    validate: input => input.trim() === '' ? 'Public key is required' : true
                });

                // Get the signer from the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the setChallengerPublicKey function
                await coreSetChallengerPublicKey(signer, publicKey);

                console.log(`Challenger public key set to: ${publicKey}`);
            } catch (error) {
                console.error(`Error setting challenger public key: ${(error as Error).message}`);
            }
        });
}
