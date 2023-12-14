import hardhat from "hardhat";
import { config } from "@sentry/core";
import { NodeLicenseAbi } from "@sentry/core";
const { ethers } = hardhat;

const promoCode = "ARC";
const blockNumber = 159161413;

async function main() {
    console.log("starting script");
    const deployer = (await ethers.getSigners())[0];
    const nodeLicense = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, deployer);

    const _promoCode = await nodeLicense.getPromoCode(promoCode, {blockTag: blockNumber});

    console.log(promoCode, _promoCode);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});