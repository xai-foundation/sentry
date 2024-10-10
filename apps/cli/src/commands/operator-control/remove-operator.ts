import { Command } from 'commander';
import inquirer from 'inquirer';
import { removeOperatorFromReferee, getSignerFromPrivateKey } from "@sentry/core";

/**
 * Function to remove an operator from the Referee contract.
 * @param cli - Commander instance
 */
export function removeOperator(cli: Command): void {
    cli
        .command('remove-operator')
        .description('Removes an operator from the Referee contract.')
        .action(async () => {
            // Prompt user for the operator address to be removed
            const { operatorAddress } = await inquirer.prompt({
                type: 'input',
                name: 'operatorAddress',
                message: 'Operator address to be removed:',
                validate: input => input.trim() === '' ? 'Operator address is required' : true
            });

            // Prompt user for the private key of the current address
            const { privateKey } = await inquirer.prompt({
                type: 'password',
                name: 'privateKey',
                message: 'Private key of the current address that you want to remove the operator from:',
                mask: '*',
                validate: input => input.trim() === '' ? 'Private key is required' : true
            });

            console.log(`Removing operator ${operatorAddress} from the Referee contract...`);

            try {
                // Create a signer with the private key
                const { signer } = getSignerFromPrivateKey(privateKey);

                // Call the removeOperatorFromReferee function to remove the operator
                await removeOperatorFromReferee(operatorAddress, signer);

                console.log(`Operator ${operatorAddress} has been removed from the Referee contract.`);
            } catch (error) {
                console.error(`Error removing operator: ${(error as Error).message}`);
            }
        });
}
