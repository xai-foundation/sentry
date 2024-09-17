import { Command } from 'commander';
import inquirer from 'inquirer';
import { getAssertion, getSignerFromPrivateKey, submitAssertionToReferee, isChallengeSubmitTime } from "@sentry/core";

/**
 * Function to manually challenge an assertion.
 * @param cli - Commander instance
 */
export function manuallyChallengeAssertion(cli: Command): void {
    cli
        .command('manually-challenge-assertion')
        .description('Takes in the BLS secret key and an assertion ID, looks up that assertion and spits out all the data (nicely formatted) from the assertion, including what JS type each of the fields are. Then it hashes the data using challengerHashAssertion and returns the hash. After it will attempt to submit the assertion to the referee.')
        .action(async () => {
            try {
                // Prompt user for the BLS secret key
                const { secretKey } = await inquirer.prompt({
                    type: 'password',
                    name: 'secretKey',
                    message: 'Enter the BLS secret key of the challenger:',
                    mask: '*',
                    validate: input => input.trim() === '' ? 'BLS secret key is required' : true
                });

                // Prompt user for the assertion ID
                const { assertionId } = await inquirer.prompt({
                    type: 'input',
                    name: 'assertionId',
                    message: 'Enter the ID of the assertion:',
                    validate: input => input.trim() === '' ? 'Assertion ID is required' : true
                });

                // Prompt user for the private key of the challenger wallet
                const { privateKey } = await inquirer.prompt({
                    type: 'password',
                    name: 'privateKey',
                    message: 'Enter the private key of a challenger wallet:',
                    mask: '*',
                    validate: input => input.trim() === '' ? 'Private key is required' : true
                });

                console.log(`Looking up the assertion information for ID: ${assertionId}...`);
                const assertionNode = await getAssertion(assertionId);
                console.log(`Assertion data retrieved. Here are the details:`);
                Object.keys(assertionNode).forEach((key: string) => {
                    const assertionKey = key as keyof typeof assertionNode;
                    console.log(`${assertionKey} (${typeof (assertionNode[assertionKey])}): ${assertionNode[assertionKey]}`);
                });

                // Get Last Challenge Data
                // Check if enough time has passed that we can submit an assertion
                const { isSubmitTime, currentChallenge } = await isChallengeSubmitTime();

                if (isSubmitTime) {

                    console.log(`Submitting Hash to chain for assertion '${assertionId}'.`);

                    // get a signer of the private key
                    const { signer } = getSignerFromPrivateKey(privateKey);

                    await submitAssertionToReferee(
                        secretKey,
                        assertionId,
                        assertionNode,
                        signer,
                        currentChallenge.assertionId
                    );

                    console.log(`Assertion successfully submitted.`);
                    return
                }
                console.log(`Minimum time between assertions has not passed. The last challenge was submitted at ${currentChallenge.assertionTimestamp} Please wait before submitting another assertion.`);
            } catch (error) {
                console.error(`Error processing assertion: ${(error as Error).message}`);
            }
        });
}
