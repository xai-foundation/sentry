import hardhat from "hardhat";
import fs from "fs";
const { ethers, upgrades } = hardhat;
const address = "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66";
const changeFactor = 100; //TODO Set this when final pricing is decided


async function main() {
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("Deployer address", deployerAddress);
    const NodeLicense = await ethers.getContractFactory("NodeLicense8");
    console.log("Got factory");
    const nodeLicense = NodeLicense.attach(address);
    console.log("Got contract");
    // Connect Signer
    const nodeLicenseWithSigner = nodeLicense.connect(deployer);     
    
    // Read the csv from tierUpload.csv, and add the pricing tiers to NodeLicense
    const tiers = parse(fs.readFileSync('tierUpload.csv'), { columns: true });
    for (const tier of tiers) {
        const adjustedPrice = tier.unitCostInEth / changeFactor;
        const adjustedQuantity = tier.quantityBeforeNextTier * changeFactor;
        console.log(`Setting pricing tier ${tier.tierIndex} with unit cost ${adjustedPrice} and quantity before next tier ${adjustedQuantity}`);
        await nodeLicenseWithSigner.setOrAddPricingTier(tier.tierIndex, ethers.parseEther(adjustedPrice), adjustedQuantity);
    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });