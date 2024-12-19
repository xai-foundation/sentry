import { parse } from "csv/sync";
import fs from "fs";
import { config, createBlsKeyPair } from "@sentry/core";
import { createPool } from "./utils/createPool.mjs"
import { mintBatchedLicenses } from "./utils/mintLicenses.mjs"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("TinyKeyAirdrop", function () {

    // We define a fixture to reuse the same setup in every test. We use
    // loadFixture to run this setup once, snapshot that state, and reset Hardhat
    // Network to that snapshot in every test.
    async function deployInfrastructure() {
        console.log("Deploying Infrastructure");

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
        const xai = await upgrades.deployProxy(Xai, [], { deployer: deployer });
        await xai.waitForDeployment();

        // Deploy esXai
        const EsXai = await ethers.getContractFactory("esXai");
        const esXai = await upgrades.deployProxy(EsXai, [await xai.getAddress()], { deployer: deployer });
        await esXai.waitForDeployment();

        //Upgrade esXai
        const EsXai2 = await ethers.getContractFactory("esXai2");
        const esXai2 = await upgrades.upgradeProxy((await esXai.getAddress()), EsXai2, { call: { fn: "initialize", args: [(await deployer.getAddress()), BigInt(500)] } });
        await esXai2.waitForDeployment();

        // Set esXai on Xai
        await xai.setEsXaiAddress(await esXai.getAddress());

        // Deploy Gas Subsidy
        const GasSubsidy = await ethers.getContractFactory("GasSubsidy");
        const gasSubsidy = await upgrades.deployProxy(GasSubsidy, [], { deployer: deployer });
        await gasSubsidy.waitForDeployment();

        // Deploy the Staking Pool (implementation only)
        const StakingPool = await ethers.deployContract("StakingPool");
        await StakingPool.waitForDeployment();
        const stakingPoolImplAddress = await StakingPool.getAddress();

        // Deploy the Key Bucket Tracker (implementation only)
        const KeyBucketTracker = await ethers.deployContract("BucketTracker");
        await KeyBucketTracker.waitForDeployment();
        const keyBucketTrackerImplAddress = await KeyBucketTracker.getAddress();

        // Deploy the esXai Bucket Tracker (implementation only)
        const EsXaiBucketTracker = await ethers.deployContract("BucketTracker");
        await EsXaiBucketTracker.waitForDeployment();
        const esXaiBucketTrackerImplAddress = await EsXaiBucketTracker.getAddress();

        // Deploy Referee
        const Referee = await ethers.getContractFactory("Referee");
        const gasSubsidyPercentage = BigInt(15);
        const referee = await upgrades.deployProxy(Referee, [await esXai.getAddress(), await xai.getAddress(), await gasSubsidy.getAddress(), gasSubsidyPercentage], { deployer: deployer });
        await referee.waitForDeployment();

        //Upgrade Referee
        const Referee2 = await ethers.getContractFactory("Referee2");
        const referee2 = await upgrades.upgradeProxy((await referee.getAddress()), Referee2, { call: { fn: "initialize", args: [] } });
        await referee2.waitForDeployment();
        await referee2.enableStaking();

        const Referee3 = await ethers.getContractFactory("Referee3");
        const referee3 = await upgrades.upgradeProxy((await referee.getAddress()), Referee3, { call: { fn: "initialize", args: [] } });
        await referee3.waitForDeployment();
        await referee3.enableStaking();

        const Referee4 = await ethers.getContractFactory("Referee4");
        const referee4 = await upgrades.upgradeProxy((await referee.getAddress()), Referee4);
        await referee4.waitForDeployment();
        await referee4.enableStaking();

        // Deploy Node License
        const NodeLicense = await ethers.getContractFactory("NodeLicense");
        const referralDiscountPercentage = BigInt(10);
        const referralRewardPercentage = BigInt(2);
        const nodeLicense = await upgrades.deployProxy(NodeLicense, [await fundsReceiver.getAddress(), referralDiscountPercentage, referralRewardPercentage], { deployer: deployer });
        await nodeLicense.waitForDeployment();
        // Deploy the Pool Factory
        const PoolFactory = await ethers.getContractFactory("PoolFactory");
        const poolFactory = await upgrades.deployProxy(PoolFactory, [
            await referee.getAddress(),
            await esXai.getAddress(),
            await nodeLicense.getAddress()
        ], { kind: "transparent", deployer });
        await poolFactory.waitForDeployment();
        await poolFactory.enableStaking();
        const poolFactoryAddress = await poolFactory.getAddress();

        // Deploy the StakingPool's PoolBeacon
        const StakingPoolPoolBeacon = await ethers.deployContract("PoolBeacon", [stakingPoolImplAddress]);
        await StakingPoolPoolBeacon.waitForDeployment();
        const stakingPoolPoolBeaconAddress = await StakingPoolPoolBeacon.getAddress();

        // Deploy the key BucketTracker's PoolBeacon
        const KeyBucketTrackerPoolBeacon = await ethers.deployContract("PoolBeacon", [keyBucketTrackerImplAddress]);
        await KeyBucketTrackerPoolBeacon.waitForDeployment();
        const keyBucketTrackerPoolBeaconAddress = await KeyBucketTrackerPoolBeacon.getAddress();

        // Deploy the esXai BucketTracker's PoolBeacon
        const EsXaiBucketTrackerPoolBeacon = await ethers.deployContract("PoolBeacon", [esXaiBucketTrackerImplAddress]);
        await EsXaiBucketTrackerPoolBeacon.waitForDeployment();
        const esXaiBucketTrackerPoolBeaconAddress = await EsXaiBucketTrackerPoolBeacon.getAddress();

        // Deploy the PoolProxyDeployer
        const PoolProxyDeployer = await ethers.getContractFactory("PoolProxyDeployer");
        const poolProxyDeployer = await upgrades.deployProxy(PoolProxyDeployer, [
            poolFactoryAddress,
            stakingPoolPoolBeaconAddress,
            keyBucketTrackerPoolBeaconAddress,
            esXaiBucketTrackerPoolBeaconAddress,
        ]);
        await poolProxyDeployer.waitForDeployment();
        const poolProxyDeployerAddress = await poolProxyDeployer.getAddress();

        // Update the PoolFactory with the PoolProxyDeployer's address
        await poolFactory.updatePoolProxyDeployer(poolProxyDeployerAddress);

        // Referee5
        const Referee5 = await ethers.getContractFactory("Referee5");
        const referee5 = await upgrades.upgradeProxy((await referee.getAddress()), Referee5, { call: { fn: "initialize", args: [poolFactoryAddress] } });
        await referee5.waitForDeployment();
        await referee5.enableStaking();

        // Referee6
        const Referee6 = await ethers.getContractFactory("Referee6");
        const referee6 = await upgrades.upgradeProxy((await referee.getAddress()), Referee6, { call: { fn: "initialize", args: [] } });
        await referee6.waitForDeployment();

        // Referee7
        const Referee7 = await ethers.getContractFactory("Referee7");
        const referee7 = await upgrades.upgradeProxy((await referee.getAddress()), Referee7);
        await referee7.waitForDeployment();

        // Referee8
        const Referee8 = await ethers.getContractFactory("Referee8");
        const referee8 = await upgrades.upgradeProxy((await referee.getAddress()), Referee8, { call: { fn: "initialize", args: [] } });
        await referee8.waitForDeployment();

        // Set Rollup Address
        const rollupAddress = config.rollupAddress;
        await referee.setRollupAddress(rollupAddress);

        // Attach a contract of the Rollup Contract
        // const RollupUserLogic = await ethers.getContractFactory("RollupUserLogic");
        const rollupContract = await ethers.getContractAt("RollupUserLogic", rollupAddress);

        // Set the Node License Address
        await referee.setNodeLicenseAddress(await nodeLicense.getAddress());

        // Read the csv from tierUpload.csv, and add the pricing tiers to NodeLicense
        const tiers = parse(fs.readFileSync('tierUpload.csv'), { columns: true });
        for (const tier of tiers) {
            await nodeLicense.setOrAddPricingTier(tier.tierIndex, ethers.parseEther(tier.unitCostInEth.toString()), tier.quantityBeforeNextTier);
        }

        // set a Challenger Public key
        const { secretKeyHex, publicKeyHex } = await createBlsKeyPair("29dba7dc550c653b085e9c067d2b6c3b0859096204b6892c697982ed52e720f5");
        await referee.setChallengerPublicKey("0x" + publicKeyHex);

        // Setup Xai roles
        const xaiAdminRole = await xai.DEFAULT_ADMIN_ROLE();
        await xai.grantRole(xaiAdminRole, await xaiDefaultAdmin.getAddress());
        const xaiMinterRole = await xai.MINTER_ROLE();
        await xai.grantRole(xaiMinterRole, await xaiMinter.getAddress());
        await xai.grantRole(xaiMinterRole, await referee.getAddress());
        await xai.grantRole(xaiMinterRole, await esXai.getAddress());

        // Setup esXai Roles
        const esXaiAdminRole = await esXai.DEFAULT_ADMIN_ROLE();
        await esXai.grantRole(esXaiAdminRole, await esXaiDefaultAdmin.getAddress());
        await esXai.grantRole(esXaiAdminRole, await poolFactory.getAddress());
        const esXaiMinterRole = await esXai.MINTER_ROLE();
        await esXai.grantRole(esXaiMinterRole, await esXaiMinter.getAddress());
        await esXai.grantRole(esXaiMinterRole, await referee.getAddress());
        await esXai.grantRole(esXaiMinterRole, await xai.getAddress());
        await esXai.addToWhitelist(await referee.getAddress());
        await esXai.addToWhitelist(await poolFactory.getAddress());

        // Setup Node License Roles 
        const nodeLicenseAdminRole = await nodeLicense.DEFAULT_ADMIN_ROLE();
        await nodeLicense.grantRole(nodeLicenseAdminRole, await nodeLicenseDefaultAdmin.getAddress());

        // Setup Gas Subsidy License Roles
        const gasSubsidyAdminRole = await gasSubsidy.DEFAULT_ADMIN_ROLE();
        await gasSubsidy.grantRole(gasSubsidyAdminRole, await gasSubsidyDefaultAdmin.getAddress());
        const gasSubsidyTransferRole = await gasSubsidy.TRANSFER_ROLE();
        await gasSubsidy.grantRole(gasSubsidyTransferRole, await gasSubsidyTransferAdmin.getAddress());

        // TODO What was this doing ?
        // // Set the Rollup Address on Referee
        // await referee.setRollupAddress

        // Setup Referee Roles
        const refereeAdminRole = await referee.DEFAULT_ADMIN_ROLE();
        await referee.grantRole(refereeAdminRole, refereeDefaultAdmin.getAddress());
        const challengerRole = await referee.CHALLENGER_ROLE();
        await referee.grantRole(challengerRole, await challenger.getAddress());
        const kycAdminRole = await referee.KYC_ADMIN_ROLE();
        await referee.grantRole(kycAdminRole, await kycAdmin.getAddress());
        const poolFactoryAdminRole = await poolFactory.DEFAULT_ADMIN_ROLE();
        await poolFactory.grantRole(poolFactoryAdminRole, refereeDefaultAdmin.getAddress());

        // Renounce the default admin role of the deployer
        await referee.renounceRole(refereeAdminRole, await deployer.getAddress());
        await nodeLicense.renounceRole(nodeLicenseAdminRole, await deployer.getAddress());
        await gasSubsidy.renounceRole(gasSubsidyAdminRole, await deployer.getAddress());
        await esXai.renounceRole(esXaiAdminRole, await deployer.getAddress());
        await xai.renounceRole(xaiAdminRole, await deployer.getAddress());
        await poolFactory.renounceRole(poolFactoryAdminRole, await deployer.getAddress());

        // Mint addr1 a node license
        let price = await nodeLicense.price(1, "");
        await nodeLicense.connect(addr1).mint(1, "", { value: price });

        // Mint addr2 10 node licenses
        price = await nodeLicense.price(10, "");
        await nodeLicense.connect(addr2).mint(10, "", { value: price });

        // Mint addr3 2 node licenses
        price = await nodeLicense.price(2, "");
        await nodeLicense.connect(addr3).mint(2, "", { value: price });
        // KYC addr1 and addr 2, but not addr 3
        await referee.connect(kycAdmin).addKycWallet(await addr1.getAddress());
        await referee.connect(kycAdmin).addKycWallet(await addr2.getAddress());

        await mintBatchedLicenses(120, nodeLicense, addr1);
        await mintBatchedLicenses(50, nodeLicense, addr2);
        const keyIdsStaked = await mintBatchedLicenses(120, nodeLicense, addr2);
        await mintBatchedLicenses(100, nodeLicense, addr3);

        //Confirm initial total supply
        const maxSupplyBefore = await nodeLicense.maxSupply();
        const totalSupplyBefore = await nodeLicense.totalSupply();
        const user1BalanceBefore = await nodeLicense.balanceOf(addr1.address);
        const user2BalanceBefore = await nodeLicense.balanceOf(addr2.address);
        const user3BalanceBefore = await nodeLicense.balanceOf(addr3.address);

        // Submit a challenge so that the contract tests will run successfully
        const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const startingAssertion = 100;
        await referee.connect(challenger).submitChallenge(
            startingAssertion,
            startingAssertion - 1,
            stateRoot,
            0,
            stateRoot
        );

        const poolAddress = await createPool(poolFactory, addr1, [1]);

        // User 2 will stake minted keys in the pool
        await poolFactory.connect(addr2).stakeKeys(poolAddress, keyIdsStaked);

        // Add addr 1 to the operator
        await referee.connect(addr1).setApprovalForOperator(await operator.getAddress(), true);

        // Node License2 Upgrade
        const NodeLicense2 = await ethers.getContractFactory("NodeLicense2");
        const nodeLicense2 = await upgrades.upgradeProxy((await nodeLicense.getAddress()), NodeLicense2);
        await nodeLicense2.waitForDeployment();

        // Node License3 Upgrade
        const NodeLicense3 = await ethers.getContractFactory("NodeLicense3");
        const nodeLicense3 = await upgrades.upgradeProxy((await nodeLicense.getAddress()), NodeLicense3, { call: { fn: "initialize", args: [] } });
        await nodeLicense3.waitForDeployment();

        //     // Node License4 Upgrade
        const NodeLicense4 = await ethers.getContractFactory("NodeLicense4");
        const nodeLicense4 = await upgrades.upgradeProxy((await nodeLicense.getAddress()), NodeLicense4);
        await nodeLicense4.waitForDeployment();

        // Node License5 Upgrade
        const NodeLicense5 = await ethers.getContractFactory("NodeLicense5");
        const nodeLicense5 = await upgrades.upgradeProxy((await nodeLicense.getAddress()), NodeLicense5);
        await nodeLicense5.waitForDeployment();

        // Node License6 Upgrade
        const NodeLicense6 = await ethers.getContractFactory("NodeLicense6");
        const nodeLicense6 = await upgrades.upgradeProxy((await nodeLicense.getAddress()), NodeLicense6);
        await nodeLicense6.waitForDeployment();

        // Node License7 Upgrade
        const NodeLicense7 = await ethers.getContractFactory("NodeLicense7");
        const nodeLicense7 = await upgrades.upgradeProxy((await nodeLicense.getAddress()), NodeLicense7);
        await nodeLicense7.waitForDeployment();

        // Deploy Mock Chainlink Aggregator Price Feeds
        const MockChainlinkPriceFeed = await ethers.getContractFactory("MockChainlinkPriceFeed");
        const ethPrice = ethers.parseUnits("3000", 8);
        const chainlinkEthUsdPriceFeed = await MockChainlinkPriceFeed.deploy(ethPrice);
        await chainlinkEthUsdPriceFeed.waitForDeployment();

        const xaiPrice = ethers.parseUnits("1", 8);
        const chainlinkXaiUsdPriceFeed = await MockChainlinkPriceFeed.deploy(xaiPrice);
        await chainlinkXaiUsdPriceFeed.waitForDeployment();

        // Impersonate the rollup controller
        const rollupController = await ethers.getImpersonatedSigner("0x6347446605e6f6680addb7c4ff55da299ecd2e69");
        // Tiny Keys AirDrop
        const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
        const airdropMultiplier = BigInt(5);
        const tinyKeysAirDrop = await upgrades.deployProxy(TinyKeysAirdrop, [await nodeLicense.getAddress(), await referee.getAddress(), await poolFactory.getAddress(), airdropMultiplier]);
        await tinyKeysAirDrop.waitForDeployment();

        // // PoolFactory2 Upgrade - Required For Tiny Keys
        const PoolFactory2 = await ethers.getContractFactory("PoolFactory2");
        const poolFactory2 = await upgrades.upgradeProxy((await poolFactory.getAddress()), PoolFactory2, { call: { fn: "initialize", args: [await tinyKeysAirDrop.getAddress()] } });
        await poolFactory2.waitForDeployment();

        //Deploy sample USDC token
        const usdcName = "Test USDC";
        const usdcSymbol = "USDC";
        const usdcToken = await ethers.deployContract(
            "SampleERC20",
            [usdcName, usdcSymbol]
        );
        await usdcToken.waitForDeployment();

        //Deploy RefereeCalculations
        const RefereeCalculations = await ethers.getContractFactory("RefereeCalculations");
        const refereeCalculations = await upgrades.deployProxy(RefereeCalculations, [], { deployer: deployer });
        await refereeCalculations.waitForDeployment();

        // Node License8 Upgrade - Required For Tiny Keys
        const NodeLicense8 = await ethers.getContractFactory("NodeLicense8");
        const nodeLicense8 = await upgrades.upgradeProxy(
            (await nodeLicense.getAddress()),
            NodeLicense8,
            {
                call:
                {
                    fn: "initialize",
                    args: [
                        await xai.getAddress(),
                        await esXai.getAddress(),
                        await chainlinkEthUsdPriceFeed.getAddress(),
                        await chainlinkXaiUsdPriceFeed.getAddress(),
                        await tinyKeysAirDrop.getAddress(),
                        await usdcToken.getAddress(),
                        await refereeCalculations.getAddress(),
                        await referee.getAddress(),
                    ]
                }
            }
        );
        await nodeLicense8.waitForDeployment();

        // Setup admin mint to role for nodeLicenseDefaultAdmin
        await nodeLicense8.connect(nodeLicenseDefaultAdmin).grantRole(await nodeLicense8.ADMIN_MINT_ROLE(), nodeLicenseDefaultAdmin.address);
        await nodeLicense8.connect(nodeLicenseDefaultAdmin).grantRole(await nodeLicense8.TRANSFER_ROLE(), nodeLicenseDefaultAdmin.address);

        // // Upgrade esXai3 upgrade - Required For Tiny Keys
        const maxKeysNonKyc = BigInt(1);
        const EsXai3 = await ethers.getContractFactory("esXai3");
        const esXai3 = await upgrades.upgradeProxy((await esXai.getAddress()), EsXai3, { call: { fn: "initialize", args: [await referee.getAddress(), await nodeLicense.getAddress(), poolFactoryAddress, maxKeysNonKyc] } });
        await esXai3.waitForDeployment();


        // Referee9
        // This upgrade needs to happen after all the setters are called, Referee 9 will remove the setters that are not needed in prod anymore to save contract size
        const Referee9 = await ethers.getContractFactory("Referee9");
        // Upgrade the Referee
        const referee9 = await upgrades.upgradeProxy((await referee.getAddress()), Referee9, { call: { fn: "initialize", args: [await refereeCalculations.getAddress()] } });
        await referee9.waitForDeployment();

        // // Referee10 upgrade - Required For Tiny Keys
        // // This upgrade needs to happen after all the setters are called, Referee 9 will remove the setters that are not needed in prod anymore to save contract size
        const Referee10 = await ethers.getContractFactory("Referee10");
        // Upgrade the Referee
        const referee10 = await upgrades.upgradeProxy((await referee.getAddress()), Referee10, { call: { fn: "initialize", args: [] } });
        await referee10.waitForDeployment();

        // MockRollup
        const MockRollupContractFactory = await ethers.getContractFactory("MockRollup");
        const mockRollup = await MockRollupContractFactory.deploy();


        // Upgrade the StakingPool
        const NewImplementation = await ethers.deployContract("StakingPool2");
        await NewImplementation.waitForDeployment();
        const newImplementationAddress = await NewImplementation.getAddress();
        await StakingPoolPoolBeacon.update(newImplementationAddress);

        config.esXaiAddress = await esXai.getAddress();
        config.esXaiDeployedBlockNumber = (await esXai.deploymentTransaction()).blockNumber;
        config.gasSubsidyAddress = await gasSubsidy.getAddress();
        config.gasSubsidyDeployedBlockNumber = (await gasSubsidy.deploymentTransaction()).blockNumber;
        config.nodeLicenseAddress = await nodeLicense.getAddress();
        config.nodeLicenseDeployedBlockNumber = (await nodeLicense.deploymentTransaction()).blockNumber;
        config.refereeAddress = await referee.getAddress();
        config.refereeDeployedBlockNumber = (await referee.deploymentTransaction()).blockNumber;
        config.xaiAddress = await xai.getAddress();
        config.xaiDeployedBlockNumber = (await xai.deploymentTransaction()).blockNumber;
        config.defaultRpcUrl = "http://localhost:8545/";

        return {
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
            rollupController,
            tiers,
            secretKeyHex,
            publicKeyHex: "0x" + publicKeyHex,
            referee: referee10,
            nodeLicense: nodeLicense8,
            poolFactory: poolFactory2,
            gasSubsidy,
            esXai: esXai3,
            xai,
            rollupContract,
            chainlinkEthUsdPriceFeed,
            chainlinkXaiUsdPriceFeed,
            tinyKeysAirDrop,
            airdropMultiplier,
            refereeCalculations,
            mockRollup,
            usdcToken,
            maxSupplyBefore,
            totalSupplyBefore,
            user1BalanceBefore,
            user2BalanceBefore,
            user3BalanceBefore,
            poolAddress,
            keyIdsStaked
        };
    }

    // Uncomment these tests for tiny keys
    describe("TinyKeysAirdropTest", TinyKeysAirdropTest(deployInfrastructure).bind(this));

})


function TinyKeysAirdropTest(deployInfrastructure) {

    return function () {

        it("Process the tiny keys airdrop and confirm staking disabled and check balances after", async function () {
            const { nodeLicense,
                addr1,
                addr2,
                addr3,
                addr4,
                tinyKeysAirDrop,
                deployer,
                referee,
                poolFactory,
                airdropMultiplier,
                poolAddress,
                keyIdsStaked,
                maxSupplyBefore,
                totalSupplyBefore,
                user1BalanceBefore,
                user2BalanceBefore,
                user3BalanceBefore,
            } = await loadFixture(deployInfrastructure);

            // Check the user's updated assigned key count
            const user1KeyCountStakedBefore = await referee.connect(addr1).assignedKeysOfUserCount(addr1.address);
            expect(user1KeyCountStakedBefore).to.equal(1);

            const user2KeyCountStakedBefore = await referee.connect(addr2).assignedKeysOfUserCount(addr2.address);
            expect(user2KeyCountStakedBefore).to.equal(keyIdsStaked.length);

            // User 3 will stake 0 keys in the pool
            const user3KeyCountStakedBefore = await referee.connect(addr3).assignedKeysOfUserCount(addr3.address);
            expect(user3KeyCountStakedBefore).to.equal(0);

            // Confirm staking is enabled
            expect(await referee.stakingEnabled()).to.be.true;

            await expect(tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyMint(10)).to.be.revertedWith("Invalid airdrop state");
            await expect(tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyStake(10)).to.be.revertedWith("Invalid airdrop state");

            await poolFactory.connect(addr2).createUnstakeKeyRequest(poolAddress, 1);

            //Prepare unstake request to test unstake during airdrop
            const unstakeKeysDelayPeriod1 = await poolFactory.unstakeKeysDelayPeriod();
            await ethers.provider.send("evm_increaseTime", [Number(unstakeKeysDelayPeriod1)]);

            // Start Airdrop
            await tinyKeysAirDrop.connect(deployer).startAirdrop();
            await expect(tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyStake(10)).to.be.revertedWith("Cannot stake non airdropped keys");

            // Staking & unstaking keys should revert
            await expect(poolFactory.connect(addr4).stakeKeys(poolAddress, 1)).to.be.revertedWith("52");
            await expect(
                poolFactory.connect(addr2).unstakeKeys(poolAddress, 0)
            ).to.be.revertedWith("52");

            // Confirm Minting Disabled - Expect a mint to be reverted
            const priceBeforeAirdrop = await nodeLicense.price(1, "");
            await expect(nodeLicense.connect(addr1).mint(1, "", { value: priceBeforeAirdrop })).to.be.revertedWithCustomError(nodeLicense, "MintingPaused");

            // Process Airdrop
            let qtyToProcessMint = 10;
            let qtyToProcessStake = 200;

            while (await tinyKeysAirDrop.airdropCounter() <= totalSupplyBefore) {
                await tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyMint(qtyToProcessMint);
            }
            expect(await tinyKeysAirDrop.airdropCounter()).to.equal(totalSupplyBefore + 1n);
            await expect(tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyMint(qtyToProcessMint)).to.be.revertedWith("Airdrop complete");

            while (await tinyKeysAirDrop.stakeCounter() <= totalSupplyBefore) {
                await tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyStake(qtyToProcessStake);
            }
            expect(await tinyKeysAirDrop.stakeCounter()).to.equal(totalSupplyBefore + 1n);
            await expect(tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyMint(qtyToProcessMint)).to.be.revertedWith("Airdrop complete");

            await tinyKeysAirDrop.connect(deployer).completeAirDrop();
            await expect(tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyMint(qtyToProcessMint)).to.be.revertedWith("Invalid airdrop state");
            await expect(tinyKeysAirDrop.connect(deployer).processAirdropSegmentOnlyStake(qtyToProcessMint)).to.be.revertedWith("Invalid airdrop state");

            // Confirm balances after
            const user1BalanceAfter = await nodeLicense.balanceOf(addr1.address);
            const user2BalanceAfter = await nodeLicense.balanceOf(addr2.address);
            const user3BalanceAfter = await nodeLicense.balanceOf(addr3.address);

            expect(user1BalanceAfter).to.equal((user1BalanceBefore * airdropMultiplier) + user1BalanceBefore);
            expect(user2BalanceAfter).to.equal((user2BalanceBefore * airdropMultiplier) + user2BalanceBefore);
            expect(user3BalanceAfter).to.equal((user3BalanceBefore * airdropMultiplier) + user3BalanceBefore);

            // // Confirm staked balances after
            const user1KeyCountStakedAfter = await referee.connect(addr1).assignedKeysOfUserCount(addr1.address);
            expect(user1KeyCountStakedAfter).to.equal((user1KeyCountStakedBefore * airdropMultiplier) + user1KeyCountStakedBefore);

            const user2KeyCountStakedAfter = await referee.connect(addr2).assignedKeysOfUserCount(addr2.address);
            expect(user2KeyCountStakedAfter).to.equal((user2KeyCountStakedBefore * airdropMultiplier) + user2KeyCountStakedBefore);

            const user3KeyCountStakedAfter = await referee.connect(addr3).assignedKeysOfUserCount(addr3.address);

            expect(user3KeyCountStakedAfter).to.equal((user3KeyCountStakedBefore * airdropMultiplier) + user3KeyCountStakedBefore);

            // // Confirm pricing and supply values updated
            const priceAfterAirdrop = await nodeLicense.price(1, "");
            const totalSupplyAfter = await nodeLicense.totalSupply();

            expect(priceAfterAirdrop).to.be.below(priceBeforeAirdrop);
            expect(totalSupplyAfter).to.equal((totalSupplyBefore * airdropMultiplier) + totalSupplyBefore);

            // // Confirm Staking re-enabled
            expect(await referee.stakingEnabled()).to.be.true;

            // Node License9 Upgrade
            const NodeLicense9 = await ethers.getContractFactory("NodeLicense9");
            const nodeLicense9 = await upgrades.upgradeProxy(
                (await nodeLicense.getAddress()),
                NodeLicense9,
                {
                    call:
                    {
                        fn: "initialize",
                        args: []
                    }
                }
            );
            await nodeLicense9.waitForDeployment();

            // // Confirm minting works after airdrop
            await nodeLicense.connect(addr1).mint(1, "", { value: priceAfterAirdrop });
            const user1BalanceAfterMint = await nodeLicense.balanceOf(addr1.address);
            expect(user1BalanceAfterMint).to.equal(user1BalanceAfter + BigInt(1));

            // Confirm staking works after airdrop            
            await poolFactory.connect(addr2).stakeKeys(poolAddress, [6].length);
            const user2KeyCountStakedAfterMint = await referee.connect(addr2).assignedKeysOfUserCount(addr2.address);
            expect(user2KeyCountStakedAfterMint).to.equal(user2KeyCountStakedAfter + BigInt(1));

            await poolFactory.connect(addr2).unstakeKeys(poolAddress, 0)
            const user2KeyCountStakedBeforeUnstake = await referee.connect(addr2).assignedKeysOfUserCount(addr2.address);
            expect(user2KeyCountStakedBeforeUnstake).to.equal(user2KeyCountStakedAfterMint - BigInt(1));

            // Confirm max supply after air drop
            const maxSupplyAfter = await nodeLicense.maxSupply();
            expect(maxSupplyAfter).to.equal((maxSupplyBefore * airdropMultiplier) + maxSupplyBefore);
        });




    }
}