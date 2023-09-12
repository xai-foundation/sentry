import * as Vorpal from "vorpal";
import { createBlsKeyPair as coreCreateBlsKeyPair } from "@xai-vanguard-node/core";

export function createBlsKeyPair(cli: Vorpal) {
    cli
        .command('create-bls-key-pair', 'Creates a BLS key pair. If a secret key is provided, it will return the corresponding public key. If no secret key is provided, it will generate a new key pair and return both the secret and public keys. Note: The secret key will be lost when the application closes, so please secure it safely.')
        .action(async function (this: Vorpal.CommandInstance) {
            const secretKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'secretKey',
                message: 'Enter your secret key (optional):',
                mask: '*',
                optional: true
            };
            const {secretKey} = await this.prompt(secretKeyPrompt);
            const { secretKeyHex, publicKeyHex } = await coreCreateBlsKeyPair(secretKey);
            if (secretKey) {
                this.log(`Public Key: ${publicKeyHex}`);
            } else {
                this.log(`Secret Key: ${secretKeyHex}\nPublic Key: ${publicKeyHex}\nPlease secure your secret key safely. It will be lost when the application closes.`);
            }
        });
}