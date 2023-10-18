import hardhat from "hardhat";
import { extractAbi } from "../utils/exportAbi.mjs";
import { safeVerify } from "../utils/safeVerify.mjs";
import { writeToConfig } from "../utils/writeToConfig.mjs";
import { config } from "@xai-vanguard-node/core";
import { parse } from "csv/sync";
import fs from "fs";
const { ethers, upgrades } = hardhat;

const options = {
  admins: [
    "0xc32493515E3537E55a323B3F0aF1AC4ED0E71BF4", // Christopher
    "0xd942EBC67d2C91Eb1a0757345D55A48F953D585b" // Avo
  ],
  fundsReceiver: "0xc32493515E3537E55a323B3F0aF1AC4ED0E71BF4", // Christopher
  referralDiscountPercentage: 10,
  referralRewardPercentage: 2
}

async function main() {
  const deployer = (await ethers.getSigners())[0];
  const deployerAddress = await deployer.getAddress();

  console.log("Deploying Xai...");
  const Xai = await ethers.getContractFactory("Xai");
  const xai = await Xai.deploy();
  await xai.deploymentTransaction();
  const xaiAddress = await xai.getAddress();
  console.log("Xai deployed to:", xaiAddress);

  // Export the ABI of xai
  await extractAbi("Xai", xai);
  console.log("Xai Abi exported");

  // Add admins to the xai
  const xaiAdminRole = await xai.DEFAULT_ADMIN_ROLE();
  for (const address of options.admins) {
    await xai.grantRole(xaiAdminRole, address);
    console.log(`Granted admin role to ${address} on Xai`);
  }

  console.log("Deploying Referee...");
  const Referee = await ethers.getContractFactory("Referee");
  const referee = await Referee.deploy();
  await referee.deploymentTransaction();
  const refereeAddress = await referee.getAddress();
  console.log("Referee deployed to:", refereeAddress);

  // Set the rollupAddress
  await referee.setRollupAddress(config.rollupAddress)

  // Export the ABI of referee
  await extractAbi("Referee", referee);
  console.log("Referee Abi exported");

  // Add admins to the referee
  const refereeAdminRole = await referee.DEFAULT_ADMIN_ROLE();
  for (const address of options.admins) {
    await referee.grantRole(refereeAdminRole, address);
    console.log(`Granted admin role to ${address} on Referee`);
  }

  console.log("Deploying esXai...");
  const EsXai = await ethers.getContractFactory("esXai");
  const esXai = await upgrades.deployProxy(EsXai, [xaiAddress], { deployer: deployer });
  const esXaiAddress = await esXai.getAddress();
  console.log("esXai deployed to:", esXaiAddress);

  // Export the ABI of esXai
  await extractAbi("esXai", esXai);
  console.log("esXai Abi exported");

  // Add admins to the esXai
  const esXaiAdminRole = await esXai.DEFAULT_ADMIN_ROLE();
  for (const address of options.admins) {
    await esXai.grantRole(esXaiAdminRole, address);
    console.log(`Granted admin role to ${address} on esXai`);
  }

  // Add minter role to the referee
  const minterRole = await esXai.MINTER_ROLE();
  await esXai.grantRole(minterRole, refereeAddress);
  console.log(`Granted minter role to ${refereeAddress} on esXai`);

  console.log("Deploying NodeLicense...");
  const NodeLicense = await ethers.getContractFactory("NodeLicense");
  const nodeLicense = await NodeLicense.deploy(options.fundsReceiver, options.referralDiscountPercentage, options.referralRewardPercentage);
  const { blockNumber: nodeLicenseDeployedBlockNumber } = await nodeLicense.deploymentTransaction();
  const nodeLicenseAddress = await nodeLicense.getAddress();
  console.log("NodeLicense deployed to:", nodeLicenseAddress);

  // Set the nodeLicenseAddress in the Referee contract
  await referee.setNodeLicenseAddress(nodeLicenseAddress);
  console.log("NodeLicense address set in the Referee contract");

  // Export the ABI of NodeLicense
  await extractAbi("NodeLicense", nodeLicense);
  console.log("NodeLicense Abi exported");

  // Update the referee, NodeLicense, esXai, and xai contract addresses in the config
  writeToConfig({
    refereeAddress,
    nodeLicenseAddress,
    esXaiAddress,
    xaiAddress,
    nodeLicenseDeployedBlockNumber,
  });
  console.log("Referee, NodeLicense, esXai, and xai contract addresses updated in the config");

  // Grant the deployer the minter role on Xai and esXai
  const xaiMinterRole = await xai.MINTER_ROLE();
  await xai.grantRole(xaiMinterRole, deployerAddress);
  console.log(`Granted minter role to ${deployerAddress} on Xai`);

  const esXaiMinterRole = await esXai.MINTER_ROLE();
  await esXai.grantRole(esXaiMinterRole, deployerAddress);
  console.log(`Granted minter role to ${deployerAddress} on esXai`);

  // Read the csv from initialXaiMints.csv, and mint the corresponding amounts to each address in the CSV
  const initialMints = parse(fs.readFileSync('initialXaiMints.csv'), { columns: true });
  for (const mint of initialMints) {
    await xai.mint(mint.address, mint.xai);
    console.log(`Minted ${mint.xai} Xai to ${mint.address}`);
    await esXai.mint(mint.address, mint.esXai);
    console.log(`Minted ${mint.esXai} esXai to ${mint.address}`);
  }

  // Denounce the Minter role
  await xai.renounceRole(xaiMinterRole, deployerAddress);
  console.log(`Renounced minter role of ${deployerAddress} on Xai`);
  await esXai.renounceRole(esXaiMinterRole, deployerAddress);
  console.log(`Renounced minter role of ${deployerAddress} on esXai`);

  // Read the csv from tierUpload.csv, and add the pricing tiers to NodeLicense
  const tiers = parse(fs.readFileSync('tierUpload.csv'), { columns: true });
  for (const tier of tiers) {
    await nodeLicense.setOrAddPricingTier(tier.tierIndex, ethers.parseEther(tier.unitCostinEth.toString()), tier.quantityBeforeNextTier);
    console.log(`Added tier ${tier.tierIndex} with unit cost ${tier.unitCostinEth} and quantity ${tier.quantityBeforeNextTier} to NodeLicense`);
  }

  // denounce the admin role of the deployer on every contract  
  await referee.renounceRole(refereeAdminRole, deployerAddress);
  console.log(`Renounced admin role of ${deployerAddress} on Referee`);
  await esXai.renounceRole(esXaiAdminRole, deployerAddress);
  console.log(`Renounced admin role of ${deployerAddress} on esXai`);
  await xai.renounceRole(xaiAdminRole, deployerAddress);
  console.log(`Renounced admin role of ${deployerAddress} on xai`);

  // Verify the contracts
  await Promise.all([
    safeVerify({ contract: xai }),
    safeVerify({ contract: referee }),
    safeVerify({ contract: esXai }),
    safeVerify({ contract: nodeLicense, constructorArgs: [options.fundsReceiver, options.referralDiscountPercentage, options.referralRewardPercentage] }),
  ]);
  console.log("Contracts verified.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
