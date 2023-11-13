import Vorpal from "vorpal";import { getSignerFromPrivateKey } from "@sentry/core";

/**
 * Takes in a private key and returns the public key associated with that.
 * @param cli - The Vorpal instance.
 */
export function getPublicKeyFromPrivateKey(cli: Vorpal) {
    cli
        .command('get-public-key-from-private-key', 'Takes in a private key and returns the public key associated with that.')
        .action(async function (this: Vorpal.CommandInstance) {
            const { privateKey } = await this.prompt({
                type: 'input',
                name: 'privateKey',
                message: 'Please enter your private key:',
                mask: '*',
            });
            const { address } = getSignerFromPrivateKey(privateKey);
            this.log(`Address: ${address}`);
        });
}

