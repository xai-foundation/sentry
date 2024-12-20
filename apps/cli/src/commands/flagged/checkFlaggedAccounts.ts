import { Command } from 'commander';
import { config, NodeLicenseAbi } from "@sentry/core";
import fs from 'fs';
import { parse } from "csv/sync";
import inquirer from 'inquirer';
import {ethers} from "ethers";

/**
 * Function to ...
 * @param cli - Commander instance
 */
export function checkFlaggedAccounts(cli: Command): void {
    cli
        .command('check-flagged-accounts')
        .description('Lists all wallets and their KYC status in the Referee contract.')
        .action(async () => {
            //prompt user for the path to the list
            const { pathToList } = await inquirer.prompt({
                type: 'input',
                name: 'pathToList',
                message: 'Enter the absolute path to the csv containing addresses to check:',
            });

            //validate csv path
            if (!fs.existsSync(pathToList)) {
                console.log("Invalid file path, file does not exists", pathToList);
                return;
            }

            //read addresses from csv
            const addressesToCheck = parse(fs.readFileSync(pathToList), { columns: true });

            //connect to arbitrum one
            const provider = new ethers.JsonRpcProvider(config.arbitrumOneJsonRpcUrl);
            
            //load contract with provider
            const nodeLicense = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
            
            console.log("Checking balances of flagged wallets...");
            let flaggedCount = 0
            try {
                for (let i = 0; i < addressesToCheck.length; i++) {
                    //query balance
                    const bal = await nodeLicense.balanceOf(addressesToCheck[i].address);
    
                    if (bal > 0) {
                        console.log(`Address: ${addressesToCheck[i].address}   Balance: ${bal}`);
                        flaggedCount++;
                    }
                }
                console.log(`Found ${flaggedCount} addresses from list with a non-zero balance.`);
            } catch (error) {
                console.log("Failed to get balances:", error);
            }
        });
}
