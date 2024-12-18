import hardhat from "hardhat";
import fs from 'fs';
import { parse } from "csv/sync";
import { NodeLicenseAbi, config } from "@sentry/core";
const { ethers } = hardhat;

const pathToList = "scripts/flagged/addressesToCheck.csv";

async function main() {
    //validate csv path
    if (!fs.existsSync(pathToList)) {
        console.log("Invalid file path, file does not exists", pathToList);
        return;
    }

    //read addresses from csv
    const addressesToCheck = parse(fs.readFileSync(pathToList), { columns: true });

    //connect to arbitrum one
    const provider = new ethers.JsonRpcProvider(config.arbitrumOneJsonRpcUrl);

    console.log("Checking balances of flagged wallets...");
    let flaggedCount = 0
    for (let i = 0; i < addressesToCheck.length; i++) {
        //load contract with provider
        const nodeLicense = await new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
        
        //query balance
        const bal = await nodeLicense.balanceOf(addressesToCheck[i].address);

        if (bal > 0) {
            console.log(`Address: ${addressesToCheck[i].address}   Balance: ${bal}`);
            flaggedCount++;
        }
    }
    if (flaggedCount > 0) {
        console.log(`Found ${flaggedCount} addresses with a non-zero balance.`);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});