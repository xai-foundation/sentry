import hardhat from "hardhat";
import { NodeLicenseAbi, config } from "@sentry/core";
const { ethers } = hardhat;

//insert addresses to check here
const addressesToCheck = [
    "0x5c14ce4E3C685AFe3fC5216e390eA7f008d8A4b3"
];

async function main() {
    //connect to arbitrum one
    const provider = new ethers.JsonRpcProvider(config.arbitrumOneJsonRpcUrl);

    console.log("Checking balances of flagged wallets...");
    for (let i = 0; i < addressesToCheck.length; i++) {
        //load contract with provider
        const nodeLicense = await new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
        
        //query balance
        const bal = await nodeLicense.balanceOf(addressesToCheck[i]);

        console.log(`Address: ${addressesToCheck[i]}   Balance: ${bal}`);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});