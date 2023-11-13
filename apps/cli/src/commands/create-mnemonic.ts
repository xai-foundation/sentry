
import Vorpal from "vorpal";import { createMnemonic as coreCreateMnemonic } from "@sentry/core";

export function createMnemonic(cli: Vorpal) {
    cli
        .command('create-mnemonic', 'Creates a Mnemonic string. Note: The mnemonic will be lost when the application closes, so please secure it safely.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {phrase} = await coreCreateMnemonic();
            this.log(`Mnemonic: ${phrase}\nPlease secure your mnemonic safely. It will be lost when the application closes.`);
        });
}
