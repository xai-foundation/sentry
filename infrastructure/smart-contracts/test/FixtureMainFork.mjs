import {NodeLicenseTests} from "./NodeLicense.mjs";
import { parse } from "csv/sync";
import fs from "fs";
import { XaiTests } from "./Xai.mjs";
import { config, createBlsKeyPair } from "@sentry/core";
import { RuntimeTests } from "./Runtime.mjs";
import { UpgradeabilityTests } from "./UpgradeTest.mjs";
import { RefereeTests } from "./Referee.mjs";
import { esXaiTests } from "./esXai.mjs";
import {Contract} from "ethers";
import { GasSubsidyTests } from "./GasSubsidy.mjs";
import { XaiGaslessClaimTests } from "./XaiGaslessClaim.mjs";
import {CNYAirDropTests} from "./CNYAirDrop.mjs";
import {StakingV2} from "./StakingV2.mjs";
import {extractAbi} from "../utils/exportAbi.mjs";

/**
 * @notice these tests are only intended to be run on a local fork of the main network
 * they will fail on a local hardhat network unless it is forked from mainnet
 */

describe("Fixture Tests For Mainnet Fork", function () {
    // We define a fixture to reuse the same setup in every test. We use
    // loadFixture to run this setup once, snapshot that state, and reset Hardhat
    // Network to that snapshot in every test.
    async function deployInfrastructure() {
        
		// Connect to Node License contract on mainnet fork
		const NodeLicense7 = await ethers.getContractFactory("NodeLicense7");
        const nodeLicense7 =  new Contract(config.nodeLicenseAddress, NodeLicense7);

        // Connect to Referee contract on mainnet fork
		const Referee8 = await ethers.getContractFactory("Referee8");
        const referee8 = new Contract(config.refereeAddress, Referee8);

        // Deploy Tiny Keys Airdrop
        const qtyToAirdropPerKey = 99;
        const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
        const tinyKeysAirdrop = await TinyKeysAirdrop.deployProxy(TinyKeysAirdrop, [config.nodeLicenseAddress, config.refereeAddress, qtyToAirdropPerKey], { deployer: deployer });
        await tinyKeysAirdrop.waitForDeployment();

        // Upgrade Staking Pools
        // Disable Staking in Referee
        // Start Airdrop
        // Process Airdrop
        // Update Prices and Supply Tiers in Node License
        // Enable Staking in Referee        


        // Impersonate the rollup controller
       // const rollupController = await ethers.getImpersonatedSigner("0x6347446605e6f6680addb7c4ff55da299ecd2e69");

        // config.esXaiAddress = await esXai.getAddress();
        // config.esXaiDeployedBlockNumber = (await esXai.deploymentTransaction()).blockNumber;
        // config.gasSubsidyAddress = await gasSubsidy.getAddress();
        // config.gasSubsidyDeployedBlockNumber = (await gasSubsidy.deploymentTransaction()).blockNumber;
        // config.nodeLicenseAddress = await nodeLicense.getAddress();
        // config.nodeLicenseDeployedBlockNumber = (await nodeLicense.deploymentTransaction()).blockNumber;
        // config.refereeAddress = await referee.getAddress();
        // config.refereeDeployedBlockNumber = (await referee.deploymentTransaction()).blockNumber;
        // config.xaiAddress = await xai.getAddress();
        // config.xaiDeployedBlockNumber = (await xai.deploymentTransaction()).blockNumber;
        // config.defaultRpcUrl = "http://localhost:8545/";

        return {
            nodeLicense,
            referee,
            tinyKeysAirdrop,
       
        };
    }

     //describe("Tiny Keys Airdrop", GasSubsidyTests(deployInfrastructure).bind(this));

})
