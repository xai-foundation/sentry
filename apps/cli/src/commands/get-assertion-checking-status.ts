import Vorpal from "vorpal";import { getIsCheckingAssertions } from "@sentry/core";

export function getAssertionCheckingStatus(cli: Vorpal) {
    cli
        .command('get-assertion-checking-status', 'Fetches the current status of assertion checking.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Fetching the current status of assertion checking...`);
            const isCheckingAssertions = await getIsCheckingAssertions();
            this.log(`Assertion checking status: ${isCheckingAssertions ? 'Enabled' : 'Disabled'}`);
        });
}
