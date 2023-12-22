import fs from "fs";
import hardhat from "hardhat";
import { NodeLicenseAbi, config } from "@sentry/core";

const { ethers } = hardhat;

const PATH_TO_WHITELIST = "./whitelist.csv"; // CSV Data wallet;amount
const RECEIPT_OUT_PATH = "./receipt.json";

async function main() {
    const whitelistAddressMap = await readWhitelistData();
    const deployer = (await ethers.getSigners())[0];

    const addresses = [];
    const amounts = [];

    Object.keys(whitelistAddressMap).forEach(key => {
        addresses.push(key);
        amounts.push(whitelistAddressMap[key]);
    });

    console.log(`Loaded ${addresses.length} wallets from whitelist`, whitelistAddressMap);

    const nodeLicense = await new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, deployer)
    const receipt = await nodeLicense.updateWhitelistAmounts(addresses, amounts);

    const result = { receipt, whitelistAddressMap }

    fs.writeFileSync(RECEIPT_OUT_PATH, JSON.stringify(result));
    console.log("Added whitelist amounts, written receipt to", RECEIPT_OUT_PATH, receipt);
}

async function readWhitelistData() {

    const addressesMapped = {}; //{[address: string]: number}
    const lines = fs.readFileSync(PATH_TO_WHITELIST).toString().split('\n').filter(Boolean);

    lines.forEach((line, i) => {

        const [address, amount] = line.split(";");

        if (!address || !ethers.isAddress(address) || isNaN(amount)) {
            console.error(`Invalid whitelist data at line ${i} '${line}'`);
            return;
        }

        addressesMapped[address] = Number(amount);

    });

    return addressesMapped;
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});