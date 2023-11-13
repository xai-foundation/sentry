import Vorpal from "vorpal";import { addOperatorToReferee, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to add an operator to the Referee contract.
 * @param cli - Vorpal instance
 */
export function addOperator(cli: Vorpal) {
    cli
        .command('add-operator', 'Adds an operator to the Referee contract.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {operatorAddress} = await this.prompt({
                type: 'input',
                name: 'operatorAddress',
                message: 'Operator address to be added:' 
            });

            const {privateKey} = await this.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the current address that you want to add the operator to:',
                mask: '*',
            });

            if (!operatorAddress || !privateKey) {
                this.log('Both operator address and private key are required.');
                return;
            }

            this.log(`Adding operator ${operatorAddress} to the Referee contract...`);

            // Create a signer with the private key
            const { signer } = getSignerFromPrivateKey(privateKey);

            // Call the addOperatorToReferee function to add the operator to the Referee contract
            await addOperatorToReferee(operatorAddress, true, signer);

            this.log(`Operator ${operatorAddress} has been added to the Referee contract.`);
        });
}
