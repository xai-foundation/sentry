import Vorpal from "vorpal";import { removeOperatorFromReferee, getSignerFromPrivateKey } from "@xai-vanguard-node/core";

/**
 * Function to remove an operator from the Referee contract.
 * @param cli - Vorpal instance
 */
export function removeOperator(cli: Vorpal) {
    cli
        .command('remove-operator', 'Removes an operator from the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {operatorAddress} = await this.prompt({
                type: 'input',
                name: 'operatorAddress',
                message: 'Operator address to be removed:' 
            });

            const {privateKey} = await this.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the current address that you want to remove the operator from:',
                mask: '*',
            });

            if (!operatorAddress || !privateKey) {
                this.log('Both operator address and private key are required.');
                return;
            }

            this.log(`Removing operator ${operatorAddress} from the Referee contract...`);

            // Create a signer with the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the removeOperatorFromReferee function to remove the operator from the Referee contract
            await removeOperatorFromReferee(operatorAddress, signer);

            this.log(`Operator ${operatorAddress} has been removed from the Referee contract.`);
        });
}
