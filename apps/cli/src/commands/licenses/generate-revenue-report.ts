import Vorpal from "vorpal";
import { generateRevenueReport as generateRevenueReportCore } from "@sentry/core";

/**
 * Function to generate the revenue report.
 * @param cli - Vorpal instance
 */
export function generateRevenueReport(cli: Vorpal) {
    cli
        .command('generate-revenue-report', 'Generates the revenue report.')
        .action(async function (this: Vorpal.CommandInstance) {
            this.log(`Generating revenue report...`);
            await generateRevenueReportCore();
        });
}
