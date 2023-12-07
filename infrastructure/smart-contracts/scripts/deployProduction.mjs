
import hardhat from "hardhat";
import { extractAbi } from "../utils/exportAbi.mjs";
import { safeVerify } from "../utils/safeVerify.mjs";
import { writeToConfig } from "../utils/writeToConfig.mjs";
import { config } from "@sentry/core";
import { parse } from "csv/sync";
import fs from "fs";
import {getImplementationAddress} from "../utils/getImplementationAddress.mjs"
import { parseEther } from "ethers";
const { ethers, upgrades } = hardhat;

const admin = "0xfeBC06428a15C6618Baa5589C3E9C40ACF71aA79";
const minter = "0x8F1B661C5D4eFbf7A9C72DA1445C3d7B23F856c7";
const fundsReceiver = "0xFCF7248C495d6fd3641eE43F861c48Ebe402c878";
const gasSubsidyTransferAdmin = "0x085F4324F945Fb69bF4C474e9dd5f8046AE9962C";
const xaiKycAdmin = "0x7eC7e03563f781ED4c56BBC4c5F28C1B4dB932ff";
const xpKycAdmin = "0xCBA55AAD91BB119794C48AF09A734Fc31A4CDF56";
const challenger = "0xC74c1e08963CEEf0e1F2F2a2eeB879f443e86836";
const challengerPublicKey = "0x977f9fe1d570ba7e48ea76566718023b260ed56eba368ff20dca06e99e650804126663c1a5febdb065ef139a0156a9ad";

const options = {
    admins: [
        admin
    ],
    transferAdmins: [
        gasSubsidyTransferAdmin
    ],
    kycAdmins: [
        xaiKycAdmin,
        xpKycAdmin,
    ],
    minter: minter,
    challenger: challenger,
    fundsReceiver: fundsReceiver,
    referralDiscountPercentage: 5,
    referralRewardPercentage: 15,
    gasSubsidyPercentage: 15,
  }

async function main() {
    const deployer = (await ethers.getSigners())[0];
    const deployerAddress = await deployer.getAddress();
    console.log("The Deployer is ", deployerAddress);

    console.log("Deploying Xai...");
    const Xai = await ethers.getContractFactory("Xai");
    const xai = await upgrades.deployProxy(Xai, [], { deployer: deployer });
    const { blockNumber: xaiDeployedBlockNumber } = await xai.deploymentTransaction();
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

    console.log("Deploying esXai...");
    const EsXai = await ethers.getContractFactory("esXai");
    const esXai = await upgrades.deployProxy(EsXai, [xaiAddress], { deployer: deployer });
    const { blockNumber: esXaiDeployedBlockNumber } = await esXai.deploymentTransaction();
    const esXaiAddress = await esXai.getAddress();
    console.log("esXai deployed to:", esXaiAddress);

    // Export the ABI of esXai
    await extractAbi("esXai", esXai);
    console.log("esXai Abi exported");

    // Add the esXai address to Xai
    await xai.setEsXaiAddress(esXaiAddress);
    console.log("Set the esXai address in Xai for reverse redemption.");

    console.log("Deploying GasSubsidy...");
    const GasSubsidy = await ethers.getContractFactory("GasSubsidy");
    const gasSubsidy = await upgrades.deployProxy(GasSubsidy, [], { deployer: deployer });
    const { blockNumber: gasSubsidyDeployedBlockNumber } = await gasSubsidy.deploymentTransaction();
    const gasSubsidyAddress = await gasSubsidy.getAddress();
    console.log("GasSubsidy deployed to:", gasSubsidyAddress);

    // Export the ABI of GasSubsidy
    await extractAbi("GasSubsidy", gasSubsidy);
    console.log("GasSubsidy Abi exported");

    // Add default admins to the GasSubsidy
    const gasSubsidyAdminRole = await gasSubsidy.DEFAULT_ADMIN_ROLE();
    for (const address of options.admins) {
        await gasSubsidy.grantRole(gasSubsidyAdminRole, address);
        console.log(`Granted admin role to ${address} on Gas Subsidy`);
    }

    // Add transfer admins to the GasSubsidy
    const gasSubsidyTransferRole = await gasSubsidy.TRANSFER_ROLE();
    for (const address of options.transferAdmins) {
        await gasSubsidy.grantRole(gasSubsidyTransferRole, address);
        console.log(`Granted transfer role to ${address} on GasSubsidy`);
    }

    console.log("Deploying Referee...");
    const Referee = await ethers.getContractFactory("Referee");
    const referee = await upgrades.deployProxy(Referee, [esXaiAddress, xaiAddress, gasSubsidyAddress, options.gasSubsidyPercentage], { deployer: deployer });
    const { blockNumber: refereeDeployedBlockNumber } = await referee.deploymentTransaction();
    const refereeAddress = await referee.getAddress();
    console.log("Referee deployed to:", refereeAddress);

    // Set the rollupAddress
    await referee.setRollupAddress(config.rollupAddress);

    // Export the ABI of referee
    await extractAbi("Referee", referee);
    console.log("Referee Abi exported");

    // Add admins to the referee
    const refereeAdminRole = await referee.DEFAULT_ADMIN_ROLE();
    for (const address of options.admins) {
        await referee.grantRole(refereeAdminRole, address);
        console.log(`Granted admin role to ${address} on Referee`);
    }

    // Add admins to the esXai
    const esXaiAdminRole = await esXai.DEFAULT_ADMIN_ROLE();
    for (const address of options.admins) {
        await esXai.grantRole(esXaiAdminRole, address);
        console.log(`Granted admin role to ${address} on esXai`);
    }

    // Add minter role to the referee for esXai
    const minterRoleEsXai = await esXai.MINTER_ROLE();
    await esXai.grantRole(minterRoleEsXai, refereeAddress);
    console.log(`Granted minter role to ${refereeAddress} on esXai`);
    await esXai.grantRole(minterRoleEsXai, await xai.getAddress());
    console.log(`Granted minter role to ${await xai.getAddress()} on esXai`);
    await esXai.grantRole(minterRoleEsXai, options.minter);
    console.log(`Granted minter role to ${options.minter} on esXai`);

    // Add minter role to the referee for Xai
    const minterRoleXai = await xai.MINTER_ROLE();
    await xai.grantRole(minterRoleXai, refereeAddress);
    console.log(`Granted minter role to ${refereeAddress} on Xai`);
    await xai.grantRole(minterRoleXai, await esXai.getAddress());
    console.log(`Granted minter role to ${await esXai.getAddress()} on Xai`);
    await xai.grantRole(minterRoleXai, options.minter);
    console.log(`Granted minter role to ${options.minter} on Xai`);

    console.log("Deploying NodeLicense...");
    const NodeLicense = await ethers.getContractFactory("NodeLicense");
    const nodeLicense = await upgrades.deployProxy(NodeLicense, [options.fundsReceiver, options.referralDiscountPercentage, options.referralRewardPercentage], { deployer: deployer });
    const { blockNumber: nodeLicenseDeployedBlockNumber } = await nodeLicense.deploymentTransaction();
    const nodeLicenseAddress = await nodeLicense.getAddress();

    // Add admins to the node license
    const nodeLicenseAdminRole = await nodeLicense.DEFAULT_ADMIN_ROLE();
    for (const address of options.admins) {
        await nodeLicense.grantRole(nodeLicenseAdminRole, address);
        console.log(`Granted admin role to ${address} on Node License`);
    }

    // Set the nodeLicenseAddress in the Referee contract
    await referee.setNodeLicenseAddress(nodeLicenseAddress);
    console.log("NodeLicense address set in the Referee contract");

    // Export the ABI of NodeLicense
    await extractAbi("NodeLicense", nodeLicense);
    console.log("NodeLicense Abi exported");

    // Update the referee, NodeLicense, esXai, xai, and GasSubsidy contract addresses in the config
    writeToConfig({
        refereeAddress,
        refereeImplementationAddress: await getImplementationAddress(referee),
        refereeDeployedBlockNumber,
        nodeLicenseAddress,
        nodeLicenseImplementationAddress: await getImplementationAddress(nodeLicense),
        nodeLicenseDeployedBlockNumber,
        esXaiAddress,
        esXaiImplementationAddress: await getImplementationAddress(esXai),
        esXaiDeployedBlockNumber,
        xaiAddress,
        xaiImplementationAddress: await getImplementationAddress(xai),
        xaiDeployedBlockNumber,
        gasSubsidyAddress,
        gasSubsidyImplementationAddress: await getImplementationAddress(gasSubsidy),
        gasSubsidyDeployedBlockNumber
    });
    console.log("Referee, NodeLicense, esXai, xai, and GasSubsidy contract addresses updated in the config");

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
        await xai.mint(mint.address, parseEther(mint.xai));
        console.log(`Minted ${mint.xai} Xai to ${mint.address}`);
        // await esXai.mint(mint.address, parseEther(mint.esXai));
        // console.log(`Minted ${mint.esXai} esXai to ${mint.address}`);
    }

    // Denounce the Minter role
    await xai.renounceRole(xaiMinterRole, deployerAddress);
    console.log(`Renounced minter role of ${deployerAddress} on Xai`);
    await esXai.renounceRole(esXaiMinterRole, deployerAddress);
    console.log(`Renounced minter role of ${deployerAddress} on esXai`);

    // Read the csv from tierUpload.csv, and add the pricing tiers to NodeLicense
    const tiers = parse(fs.readFileSync('tierUpload.csv'), { columns: true });
    for (const tier of tiers) {
        await nodeLicense.setOrAddPricingTier(tier.tierIndex, ethers.parseEther(tier.unitCostInEth.toString()), tier.quantityBeforeNextTier);
        console.log(`Added tier ${tier.tierIndex} with unit cost ${tier.unitCostInEth} and quantity ${tier.quantityBeforeNextTier} to NodeLicense`);
    }

    // Add admins to the node license
    const kycAdminRole = await referee.KYC_ADMIN_ROLE();
    for (const address of options.kycAdmins) {
        await referee.grantRole(kycAdminRole, address);
        console.log(`Granted kyc admin role to ${address} on Node License`);
    }

    // add the challenger
    const challengerRole = await referee.CHALLENGER_ROLE();
    await referee.grantRole(challengerRole, options.challenger);

    // add the public key for the challenger to the referee
    await referee.setChallengerPublicKey(challengerPublicKey);

    await safeVerify({ contract: xai });
    await safeVerify({ contract: referee });
    await safeVerify({ contract: esXai });
    await safeVerify({ contract: nodeLicense });
    await safeVerify({ contract: gasSubsidy });

    console.log("Contracts verified.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  