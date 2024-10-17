import {expect} from "chai";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {submitTestChallenge} from "../utils/submitTestChallenge.mjs";
import {mintSingleLicense} from "../utils/mintLicenses.mjs";
import {findWinningStateRoot} from "../Referee.mjs";
import {createPool} from "../utils/createPool.mjs";

export function StakeAndUnstakeMultiplePools(deployInfrastructure) {
    

	return function () {
		it("Check that a staker can stake in multiple pools, un-stake and re-stake in same pool.", async function () {
			const {poolFactory, addr1: pool1Owner, addr2: pool2Owner, addr3: staker, nodeLicense, referee, operator, esXai, esXaiMinter, challenger} = await loadFixture(deployInfrastructure);
            
            // Mint licenses for pool1Owner, pool2Owner and staker
            const pool1OwnerKeyId = await mintSingleLicense(nodeLicense, pool1Owner);
            const pool2OwnerKeyId = await mintSingleLicense(nodeLicense, pool2Owner);
            const stakerPool1KeyId = await mintSingleLicense(nodeLicense, staker);
            const stakerPool2KeyId = await mintSingleLicense(nodeLicense, staker);

            // Submit an initial challenge to allow pool creation
            const pool1OwnerKeys = [pool1OwnerKeyId];
            const pool2OwnerKeys = [pool2OwnerKeyId];

			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";		

            // Submit a challenge
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

            // Create Pool with pool1Owner
            const stakingPool1Address = await createPool(poolFactory, pool1Owner, pool1OwnerKeys);

            // Create Pool with pool2Owner
            const stakingPool2Address = await createPool(poolFactory, pool2Owner, pool2OwnerKeys);

            // Confirm the pool has 1 staked key
            expect(await referee.assignedKeysToPoolCount(stakingPool1Address)).to.equal(1);

            // Confirm the pool has 1 staked key
            expect(await referee.assignedKeysToPoolCount(stakingPool2Address)).to.equal(1);    
            
            const stakerPool1TokenIds = [stakerPool1KeyId];
            const stakerPool2TokenIds = [stakerPool2KeyId];

            // Staker stakes in Pool 1
            await poolFactory.connect(staker).stakeKeys(stakingPool1Address, stakerPool1TokenIds);
            expect(await referee.assignedKeysToPoolCount(stakingPool1Address)).to.equal(2);

            // Staker stakes in Pool 2
            await poolFactory.connect(staker).stakeKeys(stakingPool2Address, stakerPool2TokenIds);
            expect(await referee.assignedKeysToPoolCount(stakingPool2Address)).to.equal(2);

            // Staker requests to un-stake 1 key from Pool 2
			await poolFactory.connect(staker).createUnstakeKeyRequest(stakingPool2Address, 1);

            // Wait for unstake request to season
			await ethers.provider.send("evm_increaseTime", [2592000 * 2]);
			await ethers.provider.send("evm_mine");

            // Staker un-stakes key from Pool 2
            await poolFactory.connect(staker).unstakeKeys(stakingPool2Address, 0, stakerPool2TokenIds);
            expect(await referee.assignedKeysToPoolCount(stakingPool2Address)).to.equal(1);

            // Staker re-stakes key in Pool 2        
            await poolFactory.connect(staker).stakeKeys(stakingPool2Address, stakerPool2TokenIds);    
            expect(await referee.assignedKeysToPoolCount(stakingPool2Address)).to.equal(2);
		});
	}
}
