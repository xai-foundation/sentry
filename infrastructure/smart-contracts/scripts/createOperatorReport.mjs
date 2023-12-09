import hardhat from "hardhat";
import { RefereeAbi, config } from "@sentry/core";
import { NodeLicenseAbi } from "@sentry/core";
const { ethers, upgrades } = hardhat;
const operator = "";

async function main() {
    console.log("starting script");
    const deployer = (await ethers.getSigners())[0];
    const referee = new ethers.Contract(config.refereeAddress, RefereeAbi, deployer);
    const numberOfOwners = await referee.getOwnerCountForOperator(operator);
    console.log(numberOfOwners);
    const owners = [];


    // find all owners
    for (let i = BigInt(0); i < numberOfOwners; i++) {
        console.log(i);
        const owner = await referee.getOwnerForOperatorAtIndex(operator, i);
        owners.push(owner);
    }

    console.log("All Owners on Operator");
    console.table(owners);

    // find all tokens on those owners
    const nodeLicense = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, deployer);
    const nodeLicenses = [];

    for (const owner of owners) {
        const tokenCount = await nodeLicense.balanceOf(owner);
        for (let i = 0; i < tokenCount; i++) {
            const tokenId = await nodeLicense.tokenOfOwnerByIndex(owner, i);
            nodeLicenses.push(tokenId);
        }
    }

    console.log("All Node Licenses on Owners");
    console.table(nodeLicenses);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});