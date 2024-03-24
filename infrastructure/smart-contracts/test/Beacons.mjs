import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {extractAbi} from "../utils/exportAbi.mjs";
import {StakingPoolBeaconAbi, StakingPoolImplementationV1Abi, StakingPoolImplementationV2Abi} from "@sentry/core";

export function Beacons(deployInfrastructure) {
	return function () {
		describe("Testing Beacons...", function () {
			it("Should deploy a beacon, update the implementation address in the beacon, and then call a new function on the new implementation", async function () {
				const {addr1} = await loadFixture(deployInfrastructure);

				// Deploy V1 implementation
				const StakingPoolImplementationV1 = await ethers.deployContract("StakingPoolImplementationV1");
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
				await StakingPoolFactory.connect(addr1).createPool("Pool 1", pool1InitializeKeys);
				const poolCount = await StakingPoolFactory.connect(addr1).getTotalPools();
				expect(poolCount).to.equal(1);

				// Verify pool info checks out
				const pool1Address = await StakingPoolFactory.connect(addr1).pools(poolCount - 1n);
				let pool1 = new Contract(pool1Address, StakingPoolImplementationV1Abi);
				const pool1Name = await pool1.connect(addr1).name();
				const pool1keys1 = await pool1.connect(addr1).keys();
				expect(pool1Name).to.equal(pool1InitializeName);
				expect(pool1keys1).to.equal(pool1InitializeKeys);

				// Expect failure on unstake keys as implementation address has not been updated yet
				let error = "";
				try {
					await pool1.connect(addr1).unstakeKeys(3);
				} catch (e) {
					error = e.toString();
				}
				expect(error).to.include("TypeError: pool1.connect(...).unstakeKeys is not a function");
				const pool1keys2 = await pool1.connect(addr1).keys();
				expect(pool1keys1).to.equal(pool1keys2).to.equal(pool1InitializeKeys);

				// Deploy V2 implementation
				const StakingPoolImplementationV2 = await ethers.deployContract("StakingPoolImplementationV2");
				await extractAbi("StakingPoolImplementationV2", StakingPoolImplementationV2);
				await StakingPoolImplementationV2.waitForDeployment();
				const stakingPoolImplementationV2Address = await StakingPoolImplementationV2.getAddress();
				await extractAbi("StakingPoolImplementationV2", StakingPoolImplementationV2);

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
				expect(pool1keys3).to.equal(pool1InitializeKeys- keysToUnStake);
			});
		});
	}
}
