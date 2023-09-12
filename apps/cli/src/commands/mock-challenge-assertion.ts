import * as Vorpal from "vorpal";
import { challengerHashAssertion, getAssertion } from "@xai-vanguard-node/core";

export function mockChallengeAssertion(cli: Vorpal) {
    cli
        .command('mock-challenge-assertion', 'Takes in the BLS secret key and an assertion ID, looks up that assertion and spits out all the data (nicely formatted) from the assertion, including what JS type each of the fields are. Then it hashes the data using challengerHashAssertion and returns the hash.')
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

            this.log(`Looking up the assertion information for ID: ${assertionId}...`);
            const assertionNode = await getAssertion(assertionId);
            this.log(`Assertion data retrieved. Here are the details:`);
            Object.keys(assertionNode).forEach((key: string) => {
                const assertionKey = key as keyof typeof assertionNode;
                this.log(`${assertionKey} (${typeof (assertionNode[assertionKey])}): ${assertionNode[assertionKey]}`);
            });
            this.log(`Starting the hashing process...`);
            const hash = await challengerHashAssertion(
                secretKey,
                assertionId,
                assertionNode.prevNum,
                assertionNode.stateHash,
                assertionNode.createdAtBlock,
            );
            this.log(`Hashing complete: ${hash}`);
        });
}
