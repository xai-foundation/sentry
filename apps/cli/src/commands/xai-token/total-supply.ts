import Vorpal from "vorpal";import { getTotalSupply } from "@sentry/core";

export function totalSupply(cli: Vorpal) {
    cli
        .command('total-supply', 'Returns the total supply of tokens in circulation.')
        .action(async function (this: Vorpal.CommandInstance) {
            const { esXaiTotalSupply, xaiTotalSupply, totalSupply } = await getTotalSupply();
            this.log(`esXai Total Supply: ${esXaiTotalSupply}\nXai Total Supply: ${xaiTotalSupply}\nTotal Supply: ${totalSupply}`);
        });
}
