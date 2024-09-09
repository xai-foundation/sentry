import { Command } from 'commander';
import inquirer from 'inquirer';
import { getPriceForQuantity as getPriceForQuantityCore } from "@sentry/core";
import { ethers } from "ethers";

/**
 * Function to estimate the price of a node purchase.
 * @param cli - Commander instance
 */
export function getPriceForQuantity(cli: Command): void {
    cli
        .command('estimate-node-purchase-price')
        .description('Estimates the price of a node purchase.')
        .action(async () => {
            // Prompt user for the quantity of nodes to purchase
            const { quantity } = await inquirer.prompt({
                type: 'input',
                name: 'quantity',
                message: 'Please enter the quantity of nodes to purchase:'
            });

            console.log(`Estimating price for ${quantity} nodes...`);

            try {
                const { price, nodesAtEachPrice } = await getPriceForQuantityCore(Number(quantity));

                console.log(`Estimated Total Price: ${ethers.formatEther(price)} ETH`);
                nodesAtEachPrice.forEach((tier) => {
                    console.log(`Price Per License: ${ethers.formatEther(tier.pricePer)} ETH, Quantity: ${tier.quantity.toString()}, Total Price for Tier: ${ethers.formatEther(tier.totalPriceForTier)} ETH`);
                });
            } catch (error) {
                console.error(`Error estimating price: ${(error as Error).message}`);
            }
        });
}
