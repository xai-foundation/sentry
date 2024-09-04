import { Command } from 'commander';
import inquirer from 'inquirer';
import { createBlsKeyPair as coreCreateBlsKeyPair } from "@sentry/core";

/**
 * Function to create a BLS key pair.
 * @param cli - Commander instance
 */
export function createBlsKeyPair(cli: Command): void {
    cli
        .command('create-bls-key-pair')
        .description('Creates a BLS key pair. If a secret key is provided, it will return the corresponding public key. If no secret key is provided, it will generate a new key pair and return both the secret and public keys. Note: The secret key will be lost when the application closes, so please secure it safely.')
        .action(async () => {
            // Prompt user for the secret key (optional)
            const { secretKey } = await inquirer.prompt({
                type: 'password',
                name: 'secretKey',
                message: 'Enter your secret key (optional):',
                mask: '*',
                validate: () => true  // Since this is optional, no validation needed.
            });

            try {
                const { secretKeyHex, publicKeyHex } = await coreCreateBlsKeyPair(secretKey || undefined);

                if (secretKey) {
                    console.log(`Public Key: ${publicKeyHex}`);
                } else {
                    console.log(`Secret Key: ${secretKeyHex}`);
                    console.log(`Public Key: 0x${publicKeyHex}`);
                    console.log('Please secure your secret key safely. It will be lost when the application closes.');
                }
            } catch (error) {
                console.error(`Error creating BLS key pair: ${(error as Error).message}`);
            }
        });
}
