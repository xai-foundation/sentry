import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {extractAbi} from "../utils/exportAbi.mjs";
import {StakingPoolBeaconAbi, StakingPoolImplementationV1Abi, StakingPoolImplementationV2Abi} from "@sentry/core";
import pkg from 'hardhat';
const {upgrades} = pkg;

const AbiCoder = new ethers.AbiCoder();

export function TinyKeysAirdrop(deployInfrastructure) {
	return function () {
		describe("Testing Beacons...", function () {
			it("Should deploy a beacon, update the implementation address in the beacon, and then call a new function on the new implementation", async function () {
			//	const {addr1} = await loadFixture(deployInfrastructure);

			});
		});
	}
}
