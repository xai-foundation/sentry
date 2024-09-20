import { Command } from 'commander';
import { createMnemonic as coreCreateMnemonic } from "@sentry/core";

/**
 * Function to create a mnemonic string.
 * @param cli - Commander instance
 */
export function createMnemonic(cli: Command): void {
    cli
        .command('create-mnemonic')
        .description('Creates a Mnemonic string. Note: The mnemonic will be lost when the application closes, so please secure it safely.')
        .action(async () => {
            try {
                const { phrase } = await coreCreateMnemonic();
                console.log(`Mnemonic: ${phrase}\nPlease secure your mnemonic safely. It will be lost when the application closes.`);
            } catch (error) {
                console.error(`Error creating mnemonic: ${(error as Error).message}`);
            }
        });
}
