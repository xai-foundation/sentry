import { Command } from 'commander';
import inquirer from 'inquirer';
import { addOperatorToReferee, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to add an operator to the Referee contract.
 * @param cli - Commander instance
 */
export function addOperator(cli: Command): void {
    cli
        .command('add-operator')
        .description('Adds an operator to the Referee contract.')
        .action(async () => {
            // Prompt user for the operator address to add
            const { operatorAddress } = await inquirer.prompt({
                type: 'input',
                name: 'operatorAddress',
                message: 'Operator address to be added:',
                validate: input => input.trim() === '' ? 'Operator address is required' : true
            });

            // Prompt user for the private key of the current address
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the current address that you want to add the operator to:',
                mask: '*',
                validate: input => input.trim() === '' ? 'Private key is required' : true
            });

            console.log(`Adding operator ${operatorAddress} to the Referee contract...`);

            try {
                // Create a signer with the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the addOperatorToReferee function to add the operator to the Referee contract
                await addOperatorToReferee(operatorAddress, true, signer);

                console.log(`Operator ${operatorAddress} has been added to the Referee contract.`);
            } catch (error) {
                console.error(`Error adding operator: ${(error as Error).message}`);
            }
        });
}
