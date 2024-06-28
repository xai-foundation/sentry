import {NodeLicenseTests} from "./NodeLicense.mjs";
import { parse } from "csv/sync";
import fs from "fs";
import { XaiTests } from "./Xai.mjs";
import { config, createBlsKeyPair } from "@sentry/core";
import { RuntimeTests } from "./Runtime.mjs";
import { UpgradeabilityTests } from "./UpgradeTest.mjs";
import { RefereeTests } from "./Referee.mjs";
import { esXaiTests } from "./esXai.mjs";
import { GasSubsidyTests } from "./GasSubsidy.mjs";
import { MintWithXaiTests } from "./mint-with-xai/mintWithXai.mjs";
import {CNYAirDropTests} from "./CNYAirDrop.mjs";
import {StakingV2} from "./StakingV2.mjs";
import {extractAbi} from "../utils/exportAbi.mjs";
import {Beacons} from "./Beacons.mjs";
import { ethers } from "ethers";

describe("Fixture Tests Run on Fork of Mainnet", function () {

    // We define a fixture to reuse the same setup in every test. We use
    // loadFixture to run this setup once, snapshot that state, and reset Hardhat
    // Network to that snapshot in every test.
    async function deployForkInfrastructure() {

        // Get addresses to use in the tests
        const [
            deployer,
            challenger,
            fundsReceiver,
            refereeDefaultAdmin,
            kycAdmin,
            xaiDefaultAdmin,
            xaiMinter,
            esXaiDefaultAdmin,
            esXaiMinter,
            gasSubsidyDefaultAdmin,
            gasSubsidyTransferAdmin,
            nodeLicenseDefaultAdmin,
            addr1,
            addr2,
            addr3,
            addr4,
            operator,
        ] = await ethers.getSigners();

        // Deploy Xai
        const Xai = await ethers.getContractFactory("Xai");        
        const xai = await Xai.attach(config.xaiAddress);

        // Deploy esXai
        const EsXai = await ethers.getContractFactory("esXai2");
        const esXai = await EsXai.attach(config.esXaiAddress);

        // Deploy Gas Subsidy
        const GasSubsidy = await ethers.getContractFactory("GasSubsidy");
        const gasSubsidy = await GasSubsidy.attach(config.gasSubsidyAddress);

		// // Deploy the Staking Pool (implementation only)
		// const StakingPool = await ethers.deployContract("StakingPool");
		// await StakingPool.waitForDeployment();
		// const stakingPoolImplAddress = await StakingPool.getAddress();
		// await extractAbi("StakingPool", StakingPool);

		// // Deploy the Key Bucket Tracker (implementation only)
		// const KeyBucketTracker = await ethers.deployContract("BucketTracker");
		// await KeyBucketTracker.waitForDeployment();
		// const keyBucketTrackerImplAddress = await KeyBucketTracker.getAddress();
		// await extractAbi("BucketTracker", KeyBucketTracker);

		// // Deploy the esXai Bucket Tracker (implementation only)
		// const EsXaiBucketTracker = await ethers.deployContract("BucketTracker");
		// await EsXaiBucketTracker.waitForDeployment();
		// const esXaiBucketTrackerImplAddress = await EsXaiBucketTracker.getAddress();

		// Deploy Referee
        const Referee = await ethers.getContractFactory("Referee8");
        const referee = await Referee.attach(config.refereeAddress);

		// Deploy Node License
		const NodeLicense = await ethers.getContractFactory("NodeLicense7");
        const nodeLicense = await NodeLicense.attach(config.nodeLicenseAddress);

		// Deploy the Pool Factory
		// const PoolFactory = await ethers.getContractFactory("PoolFactory");
		// const poolFactory = await upgrades.deployProxy(PoolFactory, [
		// 	await referee.getAddress(),
		// 	await esXai.getAddress(),
		// 	await nodeLicense.getAddress()
		// ], { kind: "transparent", deployer });
		// await poolFactory.waitForDeployment();
		// await poolFactory.enableStaking();
		// const poolFactoryAddress = await poolFactory.getAddress();

		// // Deploy the StakingPool's PoolBeacon
		// const StakingPoolPoolBeacon = await ethers.deployContract("PoolBeacon", [stakingPoolImplAddress]);
		// await StakingPoolPoolBeacon.waitForDeployment();
		// const stakingPoolPoolBeaconAddress = await StakingPoolPoolBeacon.getAddress();
		// await extractAbi("PoolBeacon", StakingPoolPoolBeacon);

		// // Deploy the key BucketTracker's PoolBeacon
		// const KeyBucketTrackerPoolBeacon = await ethers.deployContract("PoolBeacon", [keyBucketTrackerImplAddress]);
		// await KeyBucketTrackerPoolBeacon.waitForDeployment();
		// const keyBucketTrackerPoolBeaconAddress = await KeyBucketTrackerPoolBeacon.getAddress();

		// // Deploy the esXai BucketTracker's PoolBeacon
		// const EsXaiBucketTrackerPoolBeacon = await ethers.deployContract("PoolBeacon", [esXaiBucketTrackerImplAddress]);
		// await EsXaiBucketTrackerPoolBeacon.waitForDeployment();
		//const esXaiBucketTrackerPoolBeaconAddress = await EsXaiBucketTrackerPoolBeacon.getAddress();

		// Deploy the PoolProxyDeployer
		// const PoolProxyDeployer = await ethers.getContractFactory("PoolProxyDeployer");
		// const poolProxyDeployer = await upgrades.deployProxy(PoolProxyDeployer, [
		// 	poolFactoryAddress,
		// 	stakingPoolPoolBeaconAddress,
		// 	keyBucketTrackerPoolBeaconAddress,
		// 	esXaiBucketTrackerPoolBeaconAddress,
		// ]);
		// await poolProxyDeployer.waitForDeployment();
		// const poolProxyDeployerAddress = await poolProxyDeployer.getAddress();

		// // Update the PoolFactory with the PoolProxyDeployer's address
		// await poolFactory.updatePoolProxyDeployer(poolProxyDeployerAddress);

        // Attach a contract of the Rollup Contract
        // const RollupUserLogic = await ethers.getContractFactory("RollupUserLogic");
        const rollupContract = await ethers.getContractAt("RollupUserLogic", config.rollupAddress);
        

        // Impersonate the rollup controller
       // const rollupController = await ethers.getImpersonatedSigner("0x6347446605e6f6680addb7c4ff55da299ecd2e69");
        config.defaultRpcUrl = "http://localhost:8545/";

        return {
            deployer,
            addr1,
            addr2,
            addr3,
            addr4,
            operator,
            rollupController,
            secretKeyHex,
            publicKeyHex: "0x" + publicKeyHex,
            referee,
            nodeLicense,
            gasSubsidy,
            esXai,
            xai,
            rollupContract
        };
    }

    // describe("CNY 2024", CNYAirDropTests.bind(this));
    // describe("Xai Gasless Claim", XaiGaslessClaimTests(deployInfrastructure).bind(this));
    // describe("Xai", XaiTests(deployInfrastructure).bind(this));
    // describe("EsXai", esXaiTests(deployInfrastructure).bind(this));
    // describe("Node License", NodeLicenseTests(deployInfrastructure).bind(this));
    // describe("Referee", RefereeTests(deployInfrastructure).bind(this));
    // describe("StakingV2", StakingV2(deployInfrastructure).bind(this));
    // describe("Beacon Tests", Beacons(deployInfrastructure).bind(this));
    // describe("Gas Subsidy", GasSubsidyTests(deployInfrastructure).bind(this));
    // describe("Upgrade Tests", UpgradeabilityTests(deployInfrastructure).bind(this));
   // describe("MintWithXaiTests", MintWithXaiTests(deployForkInfrastructure).bind(this));

    // This doesn't work when running coverage
    // describe("Runtime", RuntimeTests(deployInfrastructure).bind(this));

})