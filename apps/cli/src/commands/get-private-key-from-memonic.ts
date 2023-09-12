import * as Vorpal from "vorpal";
import { getSignerFromMnemonic } from "@xai-vanguard-node/core";

export function getPrivateKeyFromMnemonic(cli: Vorpal) {
    cli
        .command('get-private-key-from-mnemonic', 'Takes in a mnemonic and an index and returns the public key and private key associated with that.')
        .action(async function (this: Vorpal.CommandInstance) {
            const { mnemonic } = await this.prompt({
                type: 'input',
                name: 'mnemonic',
                message: 'Please enter your mnemonic:'
            });
            const { index } = await this.prompt({
                type: 'input',
                name: 'index',
                default: '0',
                message: 'Please enter the index (default is 0):'
            });
            const { address, privateKey } = await getSignerFromMnemonic(mnemonic, parseInt(index));
            this.log(`Address: ${address}\nPrivate Key: ${privateKey}\nPlease secure your keys safely.`);
        });
}