import { Command } from 'commander';
import { generateRevenueReport as generateRevenueReportCore } from "@sentry/core";

/**
 * Function to generate the revenue report.
 * @param cli - Commander instance
 */
export function generateRevenueReport(cli: Command): void {
    cli
        .command('generate-revenue-report')
        .description('Generates the revenue report.')
        .action(async () => {
            console.log('Generating revenue report...');
            try {
                await generateRevenueReportCore();
                console.log('Revenue report generated successfully.');
            } catch (error) {
                console.error(`Error generating revenue report: ${(error as Error).message}`);
            }
        });
}
