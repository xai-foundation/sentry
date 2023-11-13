import Vorpal from "vorpal";
import { getPriceForQuantity as getPriceForQuantityCore } from "@sentry/core";
import {ethers} from "ethers";

/**
 * Function to estimate the price of a node purchase.
 * @param cli - Vorpal instance
 */
export function getPriceForQuantity(cli: Vorpal) {
    cli
        .command('estimate-node-purchase-price', 'Estimates the price of a node purchase.')
        .action(async function (this: Vorpal.CommandInstance) {
            const {quantity} = await this.prompt({
                type: 'input',
                name: 'quantity',
                message: 'Please enter the quantity of nodes to purchase:'
            });
            this.log(`Estimating price for ${quantity} nodes...`);
            const { price, nodesAtEachPrice } = await getPriceForQuantityCore(Number(quantity));
            this.log(`Estimated Total Price: ${ethers.formatEther(price)} eth`);
            nodesAtEachPrice.forEach((tier) => {
                this.log(`Price Per License: ${ethers.formatEther(tier.pricePer)} eth, Quantity: ${tier.quantity.toString()}, Total Price for Tier: ${ethers.formatEther(tier.totalPriceForTier)} eth`);
            });
        });
}
