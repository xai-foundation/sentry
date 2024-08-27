import Vorpal from "vorpal";import { getAssertion, getLatestChallenge, getSignerFromPrivateKey, submitAssertionToReferee } from "@sentry/core";
import { MINIMUM_TIME_BETWEEN_ASSERTIONS } from "./constants/index.js";

export function manuallyChallengeAssertion(cli: Vorpal) {
    cli
        .command('manually-challenge-assertion', 'Takes in the BLS secret key and an assertion ID, looks up that assertion and spits out all the data (nicely formatted) from the assertion, including what JS type each of the fields are. Then it hashes the data using challengerHashAssertion and returns the hash. After it will attempt to submit the assertion to the referee.')
        .action(async function (this: Vorpal.CommandInstance) {
            const secretKeyPrompt: Vorpal.PromptObject = {
                type: 'password',
                name: 'secretKey',
                message: 'Enter the BLS secret key of the challenger:',
                mask: '*'
            };
            const { secretKey } = await this.prompt(secretKeyPrompt);

            const assertionIdPrompt: Vorpal.PromptObject = {
                type: 'input',
                name: 'assertionId',
                message: 'Enter the ID of the assertion:',
            };
            const { assertionId } = await this.prompt(assertionIdPrompt);

            const challengerPrivateKeyPrompt = {
                type: 'password',
                name: 'privateKey',
                message: 'Enter the private key of an challenger wallet:',
                mask: '*'
            };
            const {privateKey} = await this.prompt(challengerPrivateKeyPrompt);

            this.log(`Looking up the assertion information for ID: ${assertionId}...`);
            const assertionNode = await getAssertion(assertionId);
            this.log(`Assertion data retrieved. Here are the details:`);
            Object.keys(assertionNode).forEach((key: string) => {
                const assertionKey = key as keyof typeof assertionNode;
                this.log(`${assertionKey} (${typeof (assertionNode[assertionKey])}): ${assertionNode[assertionKey]}`);
            });
            
            // Get Last Challenge Data
            const challengeData = await getLatestChallenge();
            const currentChallenge = challengeData[1];
            const lastChallengeTime = Number(currentChallenge.assertionTimestamp);

            // Calculate the minimum time to submit an assertion
            const minimumTimeToSubmit = lastChallengeTime + MINIMUM_TIME_BETWEEN_ASSERTIONS;
            if(Math.floor(Date.now() / 1000) > minimumTimeToSubmit) {

                this.log(`Submitting Hash to chain for assertion '${assertionId}'.`);

                // get a signer of the private key
                const {signer} = getSignerFromPrivateKey(privateKey);

                await submitAssertionToReferee(
                    secretKey,
                    assertionId,
                    assertionNode,
                    signer,
                    currentChallenge
                );

                this.log(`Assertion successfully submitted.`);
                return
            }
            this.log(`Minimum time between assertions has not passed. Please wait ${minimumTimeToSubmit - Math.floor(Date.now() / 1000)} seconds before submitting another assertion.`);
        });
}
