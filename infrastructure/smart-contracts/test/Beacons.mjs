import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {extractAbi} from "../utils/exportAbi.mjs";
import {StakingPoolBeaconAbi, StakingPoolImplementationV1Abi, StakingPoolImplementationV2Abi} from "@sentry/core";
import pkg from 'hardhat';
const {upgrades} = pkg;

const AbiCoder = new ethers.AbiCoder();

export function Beacons(deployInfrastructure) {
	return function () {
		describe("Testing Beacons...", function () {
			it("Should deploy a beacon, update the implementation address in the beacon, and then call a new function on the new implementation", async function () {
				const {addr1} = await loadFixture(deployInfrastructure);

				// Deploy V1 implementation
				const StakingPoolImplementationV1 = await ethers.deployContract("StakingPoolImplementationV1");
				const StakingPoolImplementationV1Factory = await ethers.getContractFactory("StakingPoolImplementationV1");
				await extractAbi("StakingPoolImplementationV1", StakingPoolImplementationV1);
				await StakingPoolImplementationV1.waitForDeployment();
				const stakingPoolImplementationV1Address = await StakingPoolImplementationV1.getAddress();

				// Deploy Factory
				const StakingPoolFactory = await ethers.deployContract("StakingPoolFactory", [stakingPoolImplementationV1Address], addr1);
				await StakingPoolFactory.waitForDeployment();
				const stakingPoolFactoryAddress = await StakingPoolFactory.getAddress();
				const savedImplementation = await StakingPoolFactory.connect(addr1).getImplementation();
				expect(stakingPoolImplementationV1Address).to.equal(savedImplementation);

				// Create the first pool
				const pool1InitializeName = "Pool 1";
				const pool1InitializeKeys = 5;

				// Encode the initialize function info so we can dynamically call the initialize function on the deployed pool
				const pool1InitializeSelector = ethers.FunctionFragment.getSelector("initialize", ["string", "uint256"]);
				const initializePool1Data = AbiCoder.encode(
					["string", "uint256"],
					[pool1InitializeName, pool1InitializeKeys],
				);
				const pool1InitializationData = ethers.hexlify(ethers.concat([pool1InitializeSelector, initializePool1Data]));

				await StakingPoolFactory.connect(addr1).createPool(pool1InitializationData);
				const poolCount1 = await StakingPoolFactory.connect(addr1).getTotalPools();
				expect(poolCount1).to.equal(1);

				// Verify pool info checks out
				const pool1Address = await StakingPoolFactory.connect(addr1).pools(poolCount1 - 1n);
				let pool1 = new Contract(pool1Address, StakingPoolImplementationV1Abi);
				const pool1Name = await pool1.connect(addr1).name();
				const pool1keys1 = await pool1.connect(addr1).keys();
				expect(pool1Name).to.equal(pool1InitializeName);
				expect(pool1keys1).to.equal(pool1InitializeKeys);

				// Expect failure on unstake keys as implementation address has not been updated yet
				let pool1UnStakeKeysError = "";
				try {
					await pool1.connect(addr1).unstakeKeys(3);
				} catch (e) {
					pool1UnStakeKeysError = e.toString();
				}
				expect(pool1UnStakeKeysError).to.include("TypeError: pool1.connect(...).unstakeKeys is not a function");
				const pool1keys2 = await pool1.connect(addr1).keys();
				expect(pool1keys1).to.equal(pool1keys2).to.equal(pool1InitializeKeys);

				// Deploy V2 implementation
				const StakingPoolImplementationV2 = await ethers.deployContract("StakingPoolImplementationV2");
				const StakingPoolImplementationV2Factory = await ethers.getContractFactory("StakingPoolImplementationV2");
				await extractAbi("StakingPoolImplementationV2", StakingPoolImplementationV2);
				await StakingPoolImplementationV2.waitForDeployment();
				const stakingPoolImplementationV2Address = await StakingPoolImplementationV2.getAddress();
				await extractAbi("StakingPoolImplementationV2", StakingPoolImplementationV2);

				// Validate that v2 is upgrade safe
				const stakingPoolImplementation1Reference = await upgrades.forceImport(pool1Address, StakingPoolImplementationV1Factory);
				await upgrades.validateUpgrade(stakingPoolImplementation1Reference, StakingPoolImplementationV2Factory);

				// Check the beacon is deployed with correct address set for implementation
				const stakingPoolBeaconAddress = await StakingPoolFactory.connect(addr1).beacon();
				const stakingPoolBeacon = new Contract(stakingPoolBeaconAddress, StakingPoolBeaconAbi);
				const implementation1 = await stakingPoolBeacon.connect(addr1).implementation();
				expect(implementation1).to.equal(stakingPoolImplementationV1Address).to.equal(savedImplementation);

				// Verify the owner is as expected (deploying address of the StakingPoolFactory)
				const owner = await stakingPoolBeacon.connect(addr1).owner();
				expect(owner).to.equal(await addr1.getAddress());

				// Upgrade the implementation address
				await stakingPoolBeacon.connect(addr1).update(stakingPoolImplementationV2Address);
				const implementation2 = await stakingPoolBeacon.connect(addr1).implementation();
				expect(implementation2).to.equal(stakingPoolImplementationV2Address);

				// Successfully un-stake keys & check the updated balance is correct
				pool1 = new Contract(pool1Address, StakingPoolImplementationV2Abi);
				const keysToUnStake = 3;
				await pool1.connect(addr1).unstakeKeys(keysToUnStake);
				const pool1keys3 = await pool1.connect(addr1).keys();
				expect(pool1keys3).to.equal(pool1InitializeKeys - keysToUnStake);

				// Successfully deploy another pool
				const pool2InitializeName = "Pool 2";
				const pool2InitializeKeys = 10;
				const pool2InitializeSome = 100;

				// Encode the initialize function info for pool2 to match the V1 implementation so we can expect a failure on the createPool call
				const pool2InitializeSelectorBad = ethers.FunctionFragment.getSelector("initialize", ["string", "uint256"]);
				const initializePool2DataBad = AbiCoder.encode(
					["string", "uint256"],
					[pool2InitializeName, pool2InitializeKeys],
				);
				const pool2InitializationDataBad = ethers.hexlify(ethers.concat([pool2InitializeSelectorBad, initializePool2DataBad]));

				let pool2CreationError = "";
				try {
					await StakingPoolFactory.connect(addr1).createPool(pool2InitializationDataBad);
				} catch (e) {
					pool2CreationError = e.toString();
				}
				expect(pool2CreationError).to.include("ProviderError: Error: VM Exception while processing transaction: reverted with reason string 'Address: low-level delegate call failed'");

				// Successfully deploy second pool with correct length of initialize args
				const pool2InitializeSelectorGood = ethers.FunctionFragment.getSelector("initialize", ["string", "uint256", "uint256"]);
				const initializePool2DataGood = AbiCoder.encode(
					["string", "uint256", "uint256"],
					[pool2InitializeName, pool2InitializeKeys, pool2InitializeSome],
				);
				const pool2InitializationDataGood = ethers.hexlify(ethers.concat([pool2InitializeSelectorGood, initializePool2DataGood]));
				await StakingPoolFactory.connect(addr1).createPool(pool2InitializationDataGood);
				const poolCount2 = await StakingPoolFactory.connect(addr1).getTotalPools();
				expect(poolCount2).to.equal(2);

				// Verify pool 2 info checks out
				const pool2Address = await StakingPoolFactory.connect(addr1).pools(poolCount2 - 1n);
				const pool2 = new Contract(pool2Address, StakingPoolImplementationV2Abi);
				const pool2Name = await pool2.connect(addr1).name();
				const pool2keys = await pool2.connect(addr1).keys();
				const pool2Some = await pool2.connect(addr1).some();
				expect(pool2Name).to.equal(pool2InitializeName);
				expect(pool2keys).to.equal(pool2InitializeKeys);
				expect(pool2Some).to.equal(pool2InitializeSome);
			});
		});
	}
}
