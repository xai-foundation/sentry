import hardhat from "hardhat";
import { safeVerify } from "../../utils/safeVerify.mjs";
import { createBlsKeyPair } from "@sentry/core";
import tiers from "./tiers.json" assert { type: 'json' };
import crypto from 'crypto';
import { SEPOLIA_DEPLOY_OPTIONS, CHALLENGER_BLS_PRIVATEKEY } from "./configs.mjs";

const { ethers, upgrades } = hardhat;

const options = SEPOLIA_DEPLOY_OPTIONS;

let REFEREE_VERSION = 1;


/**
 * Mapping operator wallets (key owners) to their minted keyIds
 * @type {[wallet: string] => bigint[]}
 */
const WALLET_TO_KEY_IDS = {}

/**
 * Mapping key id to staked pool address
 * @type {[keyId: string] => string}
 */
const KEY_ID_TO_STAKED_POOL = {};

/**
 * Mapping wallet address to nonce, to manage nonce manually
 * @type {[wallet: string] => number}
 */
const WALLET_TO_NONCE = {};


// const BLOCKS_TO_CONFIRM = hre.network.name == "localhost" ? 1 : 3;
const BLOCKS_TO_CONFIRM = 1;

const log = (...args) => {
  console.log(...args);
}

let refereeCurrentContract;
let poolFactoryCurrentContract;
let nodeLicenseCurrentContract;

let deployerAddress;

async function main() {
  const deployer = (await ethers.getSigners())[0];
  deployerAddress = await deployer.getAddress();
  log("Deployer", deployerAddress);
  log("SELECTED NETWORK", hre.network.name)

  //Write publicKeys to config
  for (let i = 0; i < options.operators.length; i++) {
    const operator = options.operators[i];
    const opWallet = new ethers.Wallet(operator.privateKey, ethers.provider);
    operator.publicKey = await opWallet.getAddress();
  }

  const challenger = options.challenger;
  const challengerWallet = new ethers.Wallet(challenger.privateKey, ethers.provider);
  challenger.publicKey = await challengerWallet.getAddress();

  const defaultAdmin = options.defaultAdmin;
  const defaultAdminWallet = new ethers.Wallet(defaultAdmin.privateKey, ethers.provider);
  defaultAdmin.publicKey = await defaultAdminWallet.getAddress();

  const delegatedOperator = options.delegatedOperator;
  const delegatedOperatorWallet = new ethers.Wallet(delegatedOperator.privateKey, ethers.provider);
  delegatedOperator.publicKey = await delegatedOperatorWallet.getAddress();


  //SEND SOME FUNDS, should not be needed on sepolia
  for (let i = 0; i < options.operators.length; i++) {
    await deployer.sendTransaction({
      to: options.operators[i].publicKey,
      value: ethers.parseEther("0.3"),
    });
  }
  await deployer.sendTransaction({
    to: options.challenger.publicKey,
    value: ethers.parseEther("0.3"),
  });
  await deployer.sendTransaction({
    to: options.defaultAdmin.publicKey,
    value: ethers.parseEther("0.3"),
  });
  await deployer.sendTransaction({
    to: options.defaultAdmin.publicKey,
    value: ethers.parseEther("0.3"),
  });
  await deployer.sendTransaction({
    to: options.delegatedOperator.publicKey,
    value: ethers.parseEther("0.5"),
  });

  log("///////////////////////////")
  log("/////// INIT DEPLOY ///////")
  log("///////////////////////////")

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

  // Deploy Referee
  const Referee = await ethers.getContractFactory("Referee");
  const gasSubsidyPercentage = BigInt(15);
  refereeCurrentContract = await upgrades.deployProxy(Referee, [await esXai.getAddress(), await xai.getAddress(), await gasSubsidy.getAddress(), gasSubsidyPercentage], { deployer: deployer });
  await refereeCurrentContract.waitForDeployment();

  // Deploy Node License
  const NodeLicense = await ethers.getContractFactory("NodeLicense");
  const referralDiscountPercentage = BigInt(5);
  const referralRewardPercentage = BigInt(15);
  nodeLicenseCurrentContract = await upgrades.deployProxy(NodeLicense, [await deployer.getAddress(), referralDiscountPercentage, referralRewardPercentage], { deployer: deployer });
  await nodeLicenseCurrentContract.waitForDeployment();

  // MockRollup
  const MockRollupContractFactory = await ethers.getContractFactory("MockRollup");
  const mockRollup = await MockRollupContractFactory.deploy();

  await refereeCurrentContract.setRollupAddress(await mockRollup.getAddress());
  await refereeCurrentContract.setNodeLicenseAddress(await nodeLicenseCurrentContract.getAddress());
  await refereeCurrentContract.toggleAssertionChecking();
  // set a Challenger Public key
  const { secretKeyHex, publicKeyHex } = await createBlsKeyPair(CHALLENGER_BLS_PRIVATEKEY);
  await refereeCurrentContract.setChallengerPublicKey("0x" + publicKeyHex);

  // Setup Xai roles
  const xaiAdminRole = await xai.DEFAULT_ADMIN_ROLE();
  await xai.grantRole(xaiAdminRole, options.defaultAdmin.publicKey);
  await xai.grantRole(xaiAdminRole, deployerAddress);
  const xaiMinterRole = await xai.MINTER_ROLE();
  await xai.grantRole(xaiMinterRole, options.defaultAdmin.publicKey);
  await xai.grantRole(xaiMinterRole, await refereeCurrentContract.getAddress());
  await xai.grantRole(xaiMinterRole, await esXai.getAddress());
  await xai.grantRole(xaiMinterRole, deployerAddress);

  // Setup esXai Roles
  const esXaiAdminRole = await esXai.DEFAULT_ADMIN_ROLE();
  await esXai.grantRole(esXaiAdminRole, await deployer.getAddress());
  await esXai.grantRole(esXaiAdminRole, options.defaultAdmin.publicKey);
  const esXaiMinterRole = await esXai.MINTER_ROLE();
  await esXai.grantRole(esXaiMinterRole, deployerAddress);
  await esXai.grantRole(esXaiMinterRole, options.defaultAdmin.publicKey);
  await esXai.grantRole(esXaiMinterRole, await refereeCurrentContract.getAddress());
  await esXai.grantRole(esXaiMinterRole, await xai.getAddress());
  await esXai.addToWhitelist(await refereeCurrentContract.getAddress());

  // Setup Node License Roles 
  const nodeLicenseAdminRole = await nodeLicenseCurrentContract.DEFAULT_ADMIN_ROLE();
  await nodeLicenseCurrentContract.grantRole(nodeLicenseAdminRole, options.defaultAdmin.publicKey);

  // Setup Gas Subsidy License Roles
  const gasSubsidyAdminRole = await gasSubsidy.DEFAULT_ADMIN_ROLE();
  await gasSubsidy.grantRole(gasSubsidyAdminRole, await deployer.getAddress());
  const gasSubsidyTransferRole = await gasSubsidy.TRANSFER_ROLE();
  await gasSubsidy.grantRole(gasSubsidyTransferRole, await deployer.getAddress());

  // Setup Referee Roles
  const refereeAdminRole = await refereeCurrentContract.DEFAULT_ADMIN_ROLE();
  await refereeCurrentContract.grantRole(refereeAdminRole, options.defaultAdmin.publicKey);
  const challengerRole = await refereeCurrentContract.CHALLENGER_ROLE();
  await refereeCurrentContract.grantRole(challengerRole, options.challenger.publicKey);
  const kycAdminRole = await refereeCurrentContract.KYC_ADMIN_ROLE();
  await refereeCurrentContract.grantRole(kycAdminRole, options.defaultAdmin.publicKey);
  await refereeCurrentContract.grantRole(kycAdminRole, deployerAddress);

  log("/////////////////////////////////////////")
  log("/////// NODELICENSE SALE UPGRADES ///////")
  log("/////////////////////////////////////////")

  // Node License2 Upgrade
  const NodeLicense2 = await ethers.getContractFactory("NodeLicense2");
  const nodeLicense2 = await upgrades.upgradeProxy((await nodeLicenseCurrentContract.getAddress()), NodeLicense2);
  await nodeLicense2.waitForDeployment();

  // Node License3 Upgrade
  const NodeLicense3 = await ethers.getContractFactory("NodeLicense3");
  const nodeLicense3 = await upgrades.upgradeProxy((await nodeLicenseCurrentContract.getAddress()), NodeLicense3, { call: { fn: "initialize", args: [] } });
  await nodeLicense3.waitForDeployment();

  //     // Node License4 Upgrade
  const NodeLicense4 = await ethers.getContractFactory("NodeLicense4");
  const nodeLicense4 = await upgrades.upgradeProxy((await nodeLicenseCurrentContract.getAddress()), NodeLicense4);
  await nodeLicense4.waitForDeployment();

  // Node License5 Upgrade
  const NodeLicense5 = await ethers.getContractFactory("NodeLicense5");
  nodeLicenseCurrentContract = await upgrades.upgradeProxy((await nodeLicenseCurrentContract.getAddress()), NodeLicense5);
  await nodeLicenseCurrentContract.waitForDeployment();

  // Node License6 Upgrade
  const NodeLicense6 = await ethers.getContractFactory("NodeLicense6");
  nodeLicenseCurrentContract = await upgrades.upgradeProxy((await nodeLicenseCurrentContract.getAddress()), NodeLicense6);
  await nodeLicenseCurrentContract.waitForDeployment();

  // Node License7 Upgrade
  const NodeLicense7 = await ethers.getContractFactory("NodeLicense7");
  nodeLicenseCurrentContract = await upgrades.upgradeProxy((await nodeLicenseCurrentContract.getAddress()), NodeLicense7);
  await nodeLicenseCurrentContract.waitForDeployment();

  // SET 1st tier to 0 price and mint free keys
  await nodeLicenseCurrentContract.setOrAddPricingTier(0, 0n, 1000);
  await nodeLicenseCurrentContract.createPromoCode("BA", deployerAddress);

  log("//////////////////////////////////")
  log("/////// POPULATE INIT DATA ///////")
  log("//////////////////////////////////")

  // MINT KEYS
  for (const operator of options.operators) {
    const mintCount = 200;
    const minter = new ethers.Wallet(operator.privateKey, ethers.provider);
    const startingSupply = await nodeLicenseCurrentContract.totalSupply();
    await nodeLicenseCurrentContract.connect(minter).mint(mintCount, "", { value: 0n });

    WALLET_TO_KEY_IDS[operator.publicKey] = [];

    for (let keyIdOffset = 0; keyIdOffset < mintCount; keyIdOffset++) {
      WALLET_TO_KEY_IDS[operator.publicKey].push(startingSupply + 1n + BigInt(keyIdOffset));
    }

    // Add KYC to operators
    await refereeCurrentContract.connect(deployer).addKycWallet(await minter.getAddress());
    await refereeCurrentContract.connect(minter).setApprovalForOperator(delegatedOperator.publicKey, true);

    //Mint some esXai to operators
    await esXai.connect(deployer).mint(operator.publicKey, BigInt(10_000_000n * 10n ** 18n));
  }

  // Add the pricing tiers to NodeLicense
  for (let i = 0; i < tiers.length; i++) {
    await nodeLicenseCurrentContract.setOrAddPricingTier(i, BigInt(tiers[i].price), tiers[i].quantity);
  }

  // Run 10 challenges
  await doChallengeRun({ mockRollup, amount: 5 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")


  log("//////////////////////////////////")
  log("/////// UPGRADE STAKING V1 ///////")
  log("//////////////////////////////////")

  //Upgrade Referee
  const Referee2 = await ethers.getContractFactory("Referee2");
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee2, { call: { fn: "initialize", args: [] } });
  await refereeCurrentContract.waitForDeployment();
  await refereeCurrentContract.enableStaking();
  REFEREE_VERSION = 2;

  //STAKE V1
  for (const operator of options.operators) {
    const operatorWallet = new ethers.Wallet(operator.privateKey, ethers.provider);
    if (operator.V1StakeAmount > 0n) {
      await esXai.connect(operatorWallet).approve(await refereeCurrentContract.getAddress(), operator.V1StakeAmount);
      await refereeCurrentContract.connect(operatorWallet).stake(operator.V1StakeAmount);
      log(`V1 staked ${operator.V1StakeAmount / 10n ** 18n} esXai for operator: ${operator.publicKey}`);
    }
  }

  // Run 10 challenges with V1 stake & boost
  await doChallengeRun({ mockRollup, amount: 5 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")

  const Referee3 = await ethers.getContractFactory("Referee3");
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee3, { call: { fn: "initialize", args: [] } });
  await refereeCurrentContract.waitForDeployment();
  REFEREE_VERSION = 3;

  // Run challenges with V1 stake & boost
  await doChallengeRun({ mockRollup, amount: 5 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")

  const Referee4 = await ethers.getContractFactory("Referee4");
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee4);
  await refereeCurrentContract.waitForDeployment();
  REFEREE_VERSION = 4;

  // Run challenges with V1 stake & boost
  await doChallengeRun({ mockRollup, amount: 5 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")

  log("//////////////////////////////////")
  log("/////// UPGRADE STAKING V2 ///////")
  log("//////////////////////////////////")

  // Deploy the Pool Factory
  const PoolFactory = await ethers.getContractFactory("PoolFactory");
  poolFactoryCurrentContract = await upgrades.deployProxy(PoolFactory, [
    await refereeCurrentContract.getAddress(),
    await esXai.getAddress(),
    await nodeLicenseCurrentContract.getAddress()
  ], { kind: "transparent", deployer });
  await poolFactoryCurrentContract.waitForDeployment();
  await poolFactoryCurrentContract.enableStaking();
  const poolFactoryAddress = await poolFactoryCurrentContract.getAddress();

  // Deploy the Staking Pool (implementation only)
  const StakingPool = await ethers.deployContract("StakingPool");
  await StakingPool.waitForDeployment();
  const stakingPoolImplAddress = await StakingPool.getAddress();

  // Deploy the StakingPool's PoolBeacon
  const StakingPoolPoolBeacon = await ethers.deployContract("PoolBeacon", [stakingPoolImplAddress]);
  await StakingPoolPoolBeacon.waitForDeployment();
  const stakingPoolPoolBeaconAddress = await StakingPoolPoolBeacon.getAddress();

  // Deploy the Key Bucket Tracker (implementation only)
  const KeyBucketTracker = await ethers.deployContract("BucketTracker");
  await KeyBucketTracker.waitForDeployment();
  const keyBucketTrackerImplAddress = await KeyBucketTracker.getAddress();

  // Deploy the key BucketTracker's PoolBeacon
  const KeyBucketTrackerPoolBeacon = await ethers.deployContract("PoolBeacon", [keyBucketTrackerImplAddress]);
  await KeyBucketTrackerPoolBeacon.waitForDeployment();
  const keyBucketTrackerPoolBeaconAddress = await KeyBucketTrackerPoolBeacon.getAddress();

  // Deploy the esXai Bucket Tracker (implementation only)
  const EsXaiBucketTracker = await ethers.deployContract("BucketTracker");
  await EsXaiBucketTracker.waitForDeployment();
  const esXaiBucketTrackerImplAddress = await EsXaiBucketTracker.getAddress();

  // Deploy the esXai BucketTracker's PoolBeacon
  const EsXaiBucketTrackerPoolBeacon = await ethers.deployContract("PoolBeacon", [esXaiBucketTrackerImplAddress]);
  await EsXaiBucketTrackerPoolBeacon.waitForDeployment();
  const esXaiBucketTrackerPoolBeaconAddress = await EsXaiBucketTrackerPoolBeacon.getAddress();

  //Deploy Beacon proxy for auto verify later on
  const KeyBucketBeaconProxy = await ethers.deployContract("BeaconProxy", [keyBucketTrackerPoolBeaconAddress, "0x"]);
  await KeyBucketBeaconProxy.waitForDeployment();
  const keyBucketBeaconProxyAddress = await KeyBucketBeaconProxy.getAddress();

  const EsXaiBucketBeaconProxy = await ethers.deployContract("BeaconProxy", [esXaiBucketTrackerPoolBeaconAddress, "0x"]);
  await EsXaiBucketBeaconProxy.waitForDeployment();
  const esXaiBucketBeaconProxyAddress = await EsXaiBucketBeaconProxy.getAddress();

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
  await poolFactoryCurrentContract.updatePoolProxyDeployer(poolProxyDeployerAddress);

  // Referee5
  const Referee5 = await ethers.getContractFactory("Referee5");
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee5, { call: { fn: "initialize", args: [poolFactoryAddress] } });
  await refereeCurrentContract.waitForDeployment();
  REFEREE_VERSION = 5;

  const poolFactoryAdminRole = await poolFactoryCurrentContract.DEFAULT_ADMIN_ROLE();
  await poolFactoryCurrentContract.grantRole(poolFactoryAdminRole, options.defaultAdmin.publicKey);

  await esXai.grantRole(esXaiAdminRole, await poolFactoryCurrentContract.getAddress());
  await esXai.addToWhitelist(await poolFactoryCurrentContract.getAddress());

  await refereeCurrentContract.enableStaking();

  log({
    referee: await refereeCurrentContract.getAddress(),
    nodeLicense: await nodeLicenseCurrentContract.getAddress(),
    esXai: await esXai.getAddress(),
    xai: await xai.getAddress(),
    poolFactory: await poolFactoryCurrentContract.getAddress(),
    mockRollup: await mockRollup.getAddress()
  });

  log("//////////////////////////////////")
  log("/////// POPULATE POOL DATA ///////")
  log("//////////////////////////////////")

  // CREATE POOLS
  // STAKE KEYS & EsXAI

  for (const operator of options.operators) {
    const operatorWallet = new ethers.Wallet(operator.privateKey, ethers.provider);
    if (operator.poolData) {
      const keysToStake = WALLET_TO_KEY_IDS[operator.publicKey].slice(0, 100);
      const poolAddress = await createPoolForOperator(operator, poolFactoryCurrentContract, keysToStake);
      log(`Pool created ${poolAddress} for operator: ${operator.publicKey}`);
      operator.poolData.poolAddress = poolAddress;
      for (const keyId of keysToStake) {
        KEY_ID_TO_STAKED_POOL[keyId.toString()] = poolAddress;
      }

      await esXai.connect(operatorWallet).approve(await poolFactoryCurrentContract.getAddress(), ethers.MaxUint256);
      await poolFactoryCurrentContract.connect(operatorWallet).stakeEsXai(poolAddress, operator.V2StakeAmount);
      log(`V2 staked pool: ${poolAddress}, amount: ${operator.V2StakeAmount / 10n ** 18n} esXai for operator: ${operator.publicKey}`);
    }
  }


  // Run challenges with V2 stake & boost
  await doChallengeRun({ mockRollup, amount: 10 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")

  // Referee6
  const Referee6 = await ethers.getContractFactory("Referee6");
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee6, { call: { fn: "initialize", args: [] } });
  await refereeCurrentContract.waitForDeployment();

  // Run challenges with V2 stake & boost
  await doChallengeRun({ mockRollup, amount: 10 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")

  // Referee7
  const Referee7 = await ethers.getContractFactory("Referee7");
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee7);
  await refereeCurrentContract.waitForDeployment();

  // Referee8
  const Referee8 = await ethers.getContractFactory("Referee8");
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee8, { call: { fn: "initialize", args: [] } });
  await refereeCurrentContract.waitForDeployment();
  REFEREE_VERSION = 8;

  // Run challenges with V2 stake & boost
  await doChallengeRun({ mockRollup, amount: 10 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")

  //Deploy RefereeCalculations
  const RefereeCalculations = await ethers.getContractFactory("RefereeCalculations");
  const refereeCalculations = await upgrades.deployProxy(RefereeCalculations, [], { deployer: deployer });
  await refereeCalculations.waitForDeployment();

  // Referee9
  // This upgrade needs to happen after all the setters are called, Referee 9 will remove the setters that are not needed in prod anymore to save contract size
  const Referee9 = await ethers.getContractFactory("Referee9");
  // Upgrade the Referee
  refereeCurrentContract = await upgrades.upgradeProxy((await refereeCurrentContract.getAddress()), Referee9, { call: { fn: "initialize", args: [await refereeCalculations.getAddress()] } });
  await refereeCurrentContract.waitForDeployment();
  REFEREE_VERSION = 9;

  await doChallengeRun({ mockRollup, amount: 10 });
  log("//////////////////////////////////")
  log("/////// FINISHED CHALLENGE RUN ///////")
  log("//////////////////////////////////")

  // Deploy Mock Chainlink Aggregator Price Feeds
  const MockChainlinkPriceFeed = await ethers.getContractFactory("MockChainlinkPriceFeed");
  const ethPrice = ethers.parseUnits("3000", 8);
  const chainlinkEthUsdPriceFeed = await MockChainlinkPriceFeed.deploy(ethPrice);
  await chainlinkEthUsdPriceFeed.waitForDeployment();

  const xaiPrice = ethers.parseUnits("1", 8);
  const chainlinkXaiUsdPriceFeed = await MockChainlinkPriceFeed.deploy(xaiPrice);
  await chainlinkXaiUsdPriceFeed.waitForDeployment();

  log({
    referee: await refereeCurrentContract.getAddress(),
    nodeLicense: await nodeLicenseCurrentContract.getAddress(),
    esXai: await esXai.getAddress(),
    xai: await xai.getAddress(),
    poolFactory: await poolFactoryCurrentContract.getAddress(),
    mockRollup: await mockRollup.getAddress(),
    chainlinkEthUsdPriceFeed: await chainlinkEthUsdPriceFeed.getAddress(),
    chainlinkXaiUsdPriceFeed: await chainlinkXaiUsdPriceFeed.getAddress(),
    // tinyKeysAirDrop: await tinyKeysAirDrop.getAddress(),
    StakingPool: await StakingPool.getAddress(),
    KeyBucketTracker: await KeyBucketTracker.getAddress(),
    EsXaiBucketTracker: await EsXaiBucketTracker.getAddress(),
    poolProxyDeployer: await poolProxyDeployer.getAddress(),
    StakingPoolPoolBeacon: await StakingPoolPoolBeacon.getAddress(),
    KeyBucketTrackerPoolBeacon: await KeyBucketTrackerPoolBeacon.getAddress(),
    EsXaiBucketTrackerPoolBeacon: await EsXaiBucketTrackerPoolBeacon.getAddress(),
    KeyBucketBeaconProxy: await KeyBucketBeaconProxy.getAddress(),
    EsXaiBucketBeaconProxy: await EsXaiBucketBeaconProxy.getAddress(),
  });

  if (hre.network.name != "localhost") {
    // Verify the contracts
    await safeVerify({ skipWaitForDeployTx: true, contract: refereeCurrentContract })
    await safeVerify({ skipWaitForDeployTx: true, contract: nodeLicenseCurrentContract, contractPath: "contracts/upgrades/node-license/NodeLicense7.sol:NodeLicense7" })
    await safeVerify({ skipWaitForDeployTx: true, contract: esXai2 })
    await safeVerify({ skipWaitForDeployTx: true, contract: xai })
    await safeVerify({ skipWaitForDeployTx: true, contract: poolFactoryCurrentContract })
    await safeVerify({ skipWaitForDeployTx: true, contract: mockRollup })
    await safeVerify({ skipWaitForDeployTx: true, contract: chainlinkEthUsdPriceFeed, constructorArgs: [ethPrice] })
    await safeVerify({ skipWaitForDeployTx: true, contract: chainlinkXaiUsdPriceFeed, constructorArgs: [xaiPrice] })
    await safeVerify({ skipWaitForDeployTx: true, contract: refereeCalculations })
    await safeVerify({ skipWaitForDeployTx: true, contract: StakingPool })
    await safeVerify({ skipWaitForDeployTx: true, contract: KeyBucketTracker })
    await safeVerify({ skipWaitForDeployTx: true, contract: EsXaiBucketTracker })
    await safeVerify({ skipWaitForDeployTx: true, contract: poolProxyDeployer })
    await safeVerify({ skipWaitForDeployTx: true, contract: StakingPoolPoolBeacon, constructorArgs: [stakingPoolImplAddress], contractPath: "contracts/staking-v2/PoolBeacon.sol:PoolBeacon" })
    await safeVerify({ skipWaitForDeployTx: true, contract: KeyBucketTrackerPoolBeacon, constructorArgs: [keyBucketTrackerImplAddress], contractPath: "contracts/staking-v2/PoolBeacon.sol:PoolBeacon" })
    await safeVerify({ skipWaitForDeployTx: true, contract: EsXaiBucketTrackerPoolBeacon, constructorArgs: [esXaiBucketTrackerImplAddress], contractPath: "contracts/staking-v2/PoolBeacon.sol:PoolBeacon" })
    await safeVerify({ skipWaitForDeployTx: true, contract: KeyBucketBeaconProxy, constructorArgs: [keyBucketTrackerPoolBeaconAddress, "0x"] })
    await safeVerify({ skipWaitForDeployTx: true, contract: EsXaiBucketBeaconProxy, constructorArgs: [esXaiBucketTrackerPoolBeaconAddress, "0x"] })
  }
  log("Contracts verified.");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


const getChallenge = async (challengeId, refereeContract) => {
  const [
    openForSubmissions,
    expiredForRewarding,
    assertionId,
    assertionStateRootOrConfirmData,
    assertionTimestamp,
    challengerSignedHash,
    activeChallengerPublicKey,
    rollupUsed,
    createdTimestamp,
    totalSupplyOfNodesAtChallengeStart,
    rewardAmountForClaimers,
    amountForGasSubsidy,
    numberOfEligibleClaimers,
    amountClaimedByClaimers
  ] = await refereeContract.getChallenge(challengeId);
  return {
    openForSubmissions,
    expiredForRewarding,
    assertionId: BigInt(assertionId),
    assertionStateRootOrConfirmData,
    assertionTimestamp: BigInt(assertionTimestamp),
    challengerSignedHash,
    activeChallengerPublicKey,
    rollupUsed,
    createdTimestamp: BigInt(createdTimestamp),
    totalSupplyOfNodesAtChallengeStart: BigInt(totalSupplyOfNodesAtChallengeStart),
    rewardAmountForClaimers: BigInt(rewardAmountForClaimers),
    amountForGasSubsidy: BigInt(amountForGasSubsidy),
    numberOfEligibleClaimers: BigInt(numberOfEligibleClaimers),
    amountClaimedByClaimers: BigInt(amountClaimedByClaimers)
  }
}

const submitChallenge = async (refereeContract, mockRollup) => {
  const challengerWallet = new ethers.Wallet(options.challenger.privateKey, ethers.provider);

  const counter = Number(await refereeContract.challengeCounter());

  let latestChallenge = {
    assertionId: 0
  };

  if (counter > 0) {
    latestChallenge = await getChallenge(BigInt(counter) - BigInt(1), refereeContract);
  }

  const blockHash = generateRandomHexHash();
  const sendRoot = generateRandomHexHash();
  const nextAssertionId = BigInt(latestChallenge.assertionId) + BigInt(1);
  const createTx1 = await mockRollup.createNode(nextAssertionId, blockHash, sendRoot, { nonce: WALLET_TO_NONCE[deployerAddress] });
  await createTx1.wait(BLOCKS_TO_CONFIRM);
  WALLET_TO_NONCE[deployerAddress]++;
  const confirmTx1 = await mockRollup.confirmNode(nextAssertionId, blockHash, sendRoot, { nonce: WALLET_TO_NONCE[deployerAddress] });
  await confirmTx1.wait(BLOCKS_TO_CONFIRM);
  WALLET_TO_NONCE[deployerAddress]++;

  const [
    stateHash,
    challengeHash,
    confirmData,
    prevNum,
    deadlineBlock,
    noChildConfirmedBeforeBlock,
    stakerCount,
    childStakerCount,
    firstChildBlock,
    latestChildNumber,
    createdAtBlock,
    nodeHash
  ] = await mockRollup.getNode(nextAssertionId);

  let challenge = {
    assertionId: nextAssertionId,
    predecessorAssertionId: latestChallenge.assertionId,
    confirmData: confirmData,
    assertionTimestamp: createdAtBlock,
    challengerSignedHash: generateRandomHexHash(96),
    challengeNumber: counter
  }

  // Submit the challenge to the Referee contract
  const tx = await refereeContract.connect(challengerWallet).submitChallenge(
    challenge.assertionId,
    challenge.predecessorAssertionId,
    challenge.confirmData,
    challenge.assertionTimestamp,
    challenge.challengerSignedHash,
    { nonce: WALLET_TO_NONCE[options.challenger.publicKey] }
  );

  await tx.wait(BLOCKS_TO_CONFIRM);
  WALLET_TO_NONCE[options.challenger.publicKey]++;

  log(`Submitted test challenge ${challenge.challengeNumber}`);

  return challenge;

}

const getLocalAssertionHashAndCheck = (nodeLicenseId, challengeId, boostFactor, confirmData, challengerSignedHash) => {
  const assertionHash = ethers.keccak256(ethers.solidityPacked(["uint256", "uint256", "bytes", "bytes"], [nodeLicenseId, challengeId, confirmData, challengerSignedHash]));
  let hashNumber = BigInt(assertionHash);
  if (REFEREE_VERSION == 1) {
    return [Number((hashNumber % BigInt(100))) == 0, assertionHash];
  } else if (REFEREE_VERSION == 2) {
    return [Number((hashNumber % BigInt(100))) < boostFactor, assertionHash];
  } else {
    return [Number((hashNumber % BigInt(10_000))) < boostFactor, assertionHash];
  }
}


const submitAssertionsForWinningKeys = async (referee, operator, nodeLicenseIds, challengeId, confirmData, challengerSignedHash, boostFactor) => {

  const winningKeys = [];

  /**
   * Mapping poolAddress to boostFactor
   * @type {[poolAddress: string] => number}
   */
  const cachedPoolBoosts = {};

  for (let i = 0; i < nodeLicenseIds.length; i++) {
    const nodeId = nodeLicenseIds[i];
    const stakedPool = KEY_ID_TO_STAKED_POOL[nodeId.toString()];
    if (stakedPool) {
      if (!cachedPoolBoosts[stakedPool]) {
        cachedPoolBoosts[stakedPool] = Number(await referee.getBoostFactorForStaker(KEY_ID_TO_STAKED_POOL[nodeId.toString()]));
        log(`Found boost ${boostFactor} for Pool ${stakedPool}`)
      }
      boostFactor = cachedPoolBoosts[stakedPool];
    }
    const [winning, _] = getLocalAssertionHashAndCheck(nodeId, challengeId, boostFactor, confirmData, challengerSignedHash);
    if (winning) {
      winningKeys.push(nodeId);
      if (REFEREE_VERSION < 5) {
        const tx = await referee.connect(operator).submitAssertionToChallenge(nodeId, challengeId, confirmData, { nonce: WALLET_TO_NONCE[operator.address] });
        await tx.wait(BLOCKS_TO_CONFIRM);
        WALLET_TO_NONCE[operator.address]++;
      }
    }
  }

  if (REFEREE_VERSION >= 5) {
    const tx = await referee.connect(operator).submitMultipleAssertions(winningKeys, challengeId, confirmData, { nonce: WALLET_TO_NONCE[operator.address] });
    await tx.wait(BLOCKS_TO_CONFIRM);
    WALLET_TO_NONCE[operator.address]++;
  }

  log(`Submit assertion to challenge: ${challengeId} - Operator: ${operator.address} - WinningKeyCount: ${winningKeys.length}`);
  return winningKeys;
}


const claimChallengeRewards = async (referee, operator, challengeId, keyIds, claimForAddress) => {
  // log(`Claim for challenge: ${challengeId} - Operator: ${operator.address} - keyIds: ${keyIds.length}`);

  if (REFEREE_VERSION >= 5) {
    const tx = await referee.connect(operator).claimMultipleRewards(keyIds, challengeId, claimForAddress, { nonce: WALLET_TO_NONCE[operator.address] })
    await tx.wait(BLOCKS_TO_CONFIRM);
    WALLET_TO_NONCE[operator.address]++;
  } else {
    for (const key of keyIds) {
      const tx = await referee.connect(operator).claimReward(key, challengeId, { nonce: WALLET_TO_NONCE[operator.address] });
      await tx.wait(BLOCKS_TO_CONFIRM);
      WALLET_TO_NONCE[operator.address]++;
    }
  }
}


function generateRandomHexHash(length) {
  if (!length) {
    length = 32;
  }
  // 32 bytes is 256 bits, and each byte is represented by two hex characters
  const randomBytes = crypto.randomBytes(length);
  return "0x" + randomBytes.toString('hex');
}

// Create challenges
// For each challenge submit assertions for each operator's keys
const doChallengeRun = async ({ mockRollup, amount }) => {
  let challenge;
  let winningKeys = {};

  //Update chached nonce for smooth submission
  let deployerNonce = await ethers.provider.getTransactionCount(deployerAddress, "pending");
  WALLET_TO_NONCE[deployerAddress] = deployerNonce;

  let challengerNonce = await ethers.provider.getTransactionCount(options.challenger.publicKey, "pending");
  WALLET_TO_NONCE[options.challenger.publicKey] = challengerNonce;

  for (const operator of options.operators) {
    let nonce = await ethers.provider.getTransactionCount(operator.publicKey, "pending");
    WALLET_TO_NONCE[operator.publicKey] = nonce;
  }

  for (let challengeCount = 0; challengeCount < amount; challengeCount++) {

    challenge = await submitChallenge(refereeCurrentContract, mockRollup);
    winningKeys[challenge.challengeNumber] = {}

    const submitPromises = [];

    for (const operator of options.operators) {
      async function submitForOperator() {
        const operatorWallet = new ethers.Wallet(operator.privateKey, ethers.provider);
        let boostFactor = 0;
        if (REFEREE_VERSION > 1) {
          boostFactor = Number(await refereeCurrentContract.getBoostFactorForStaker(operator.publicKey));
          log(`Found boost ${boostFactor} for operator ${operator.publicKey}`)
        }
        const keys = await submitAssertionsForWinningKeys(refereeCurrentContract, operatorWallet, WALLET_TO_KEY_IDS[operator.publicKey], challenge.challengeNumber, challenge.confirmData, challenge.challengerSignedHash, boostFactor);
        winningKeys[challenge.challengeNumber][operator.publicKey] = keys;
      }
      submitPromises.push(submitForOperator());
    }

    await Promise.all(submitPromises);

    //Process previous challenge
    if (challenge.challengeNumber > 0) {
      //Claim previous challenge    
      const claimPromises = [];
      for (const operator of options.operators) {
        if (winningKeys[challenge.challengeNumber - 1] && winningKeys[challenge.challengeNumber - 1][operator.publicKey]) {
          const winningKeyIds = winningKeys[challenge.challengeNumber - 1][operator.publicKey];
          if (winningKeyIds.length) {
            const operatorWallet = new ethers.Wallet(operator.privateKey, ethers.provider);
            claimPromises.push(claimChallengeRewards(refereeCurrentContract, operatorWallet, challenge.challengeNumber - 1, winningKeyIds, operator.publicKey));
          }
        }
      }
      await Promise.all(claimPromises);
    }
  }
}


/**
 * Handles the setup or processing of an operator pool configuration.
 * @param {Object} operatorConfig - The operator configuration object.
 * @param {string} operatorConfig.publicKey - The public key of the operator.
 * @param {string} operatorConfig.privateKey - The private key of the operator.
 * @param {BigInt} operatorConfig.V1StakeAmount - The amount of stake in the operator pool (e.g., 10,000 * 10^18).
 * @param {Object} operatorConfig.poolData - Pool create for the operator
 * @param {string[]} operatorConfig.poolData.metaData - Pool name, description and logo url
 * @param {string[]} operatorConfig.poolData.socials - Social media links for the pool.
 * @param {Array.<string[]>} operatorConfig.poolData.trackerDetails - Pool BucketTracker name and symbol
 * @param {Array.<string[]>} operatorConfig.poolData.rewardSplit - The reward split for owner, key staker, esXai staker (base points 4 decimals)
 * @param {ethers.Contract} poolFactory - The poolFactory contract instance
 * @param {BigInt[]} keysToStake - Array of keys to stake for the pool init
 * @returns {Promise<string>} Returns the pool address
 */
const createPoolForOperator = async (operatorConfig, poolFactory, keysToStake) => {

  // Use zero address if no delegate is provided
  const operatorWallet = new ethers.Wallet(operatorConfig.privateKey, ethers.provider);

  // Connect the pool factory to the pool owner's signer and create the pool
  const tx = await poolFactory.connect(operatorWallet).createPool(
    options.delegatedOperator.publicKey,
    keysToStake,
    operatorConfig.poolData.rewardSplit,
    operatorConfig.poolData.metaData,
    operatorConfig.poolData.socials,
    operatorConfig.poolData.trackerDetails
  );
  await tx.wait(BLOCKS_TO_CONFIRM);

  // Get the number of pools to determine the address of the newly created pool
  const numberOfPools = await poolFactory.getPoolsOfUserCount(operatorConfig.publicKey);
  // Return the address user pool
  return poolFactory.getPoolAddressOfUser(operatorConfig.publicKey, numberOfPools - 1n);
}