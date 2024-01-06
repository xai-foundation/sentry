import { ArgumentOptions, ArgumentParser } from "argparse";
import { getSignerFromPrivateKey, operatorRuntime, listOwnersForOperator } from "@sentry/core";

/**
 * Initializes the operator internally, using the provided private key, owners, and logging function.
 *
 * @param walletKey - The private key for the wallet.
 * @param owners - An optional array of owner addresses.
 * @param log - The logging function that takes a string parameter.
 * @returns A Promise resolving to a function that, when invoked, stops the internal operator.
 * @throws {Error} If no private key is passed in or if the private key is invalid.
 */
async function bootOperatorInternal(walletKey: string, owners: string[] | undefined, log: (str:string) => any): Promise<() => Promise<void>> {
    if (!walletKey || walletKey.length < 1) {
        throw new Error("No private key passed in. Please provide a valid private key.")
    }

    const { signer } = getSignerFromPrivateKey(walletKey);

    const stopFunction = await operatorRuntime(
        signer,
        undefined,
        log,
        owners,
    );

    return stopFunction;
}


const parser = new ArgumentParser({
    description: 'Boots operator as a service'
});
   
parser.add_argument('-wallet-key', '--wallet-key', {help: 'Specify the wallet key for the application.', required:true});
parser.add_argument("-whitelist", "--whitelist", { help: 'Specify the whitelist address for the operator , separated.' });

async function main() {
    const args: {
        wallet_key: string,
        whielist: string
    } = parser.parse_args();
    await bootOperatorInternal(args.wallet_key, args.whielist ? args.whielist.split(",") : undefined, (s) => (console.log(s)));
}
main();
