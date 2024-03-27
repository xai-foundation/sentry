import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {expect} from "chai";
import {Contract} from "ethers";
import {StakingPoolAbi} from "@sentry/core";

export function Rewards(deployInfrastructure, poolConfigurations) {
	const {
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

	return function () {
		it("Verify the rewards are correct", async function () {
			const {poolFactory, addr1, addr2, addr3, nodeLicense, kycAdmin, referee, refereeDefaultAdmin, esXai, esXaiMinter} = await loadFixture(deployInfrastructure);

			const rewardModifier = 1_000_000;

			// Mint key to make basic pool
			const addr1KeyQuantity = 1;
			const price = await nodeLicense.price(addr1KeyQuantity, "");
			await nodeLicense.connect(addr1).mint(addr1KeyQuantity, "", {value: price});
			const mintedKeyId = await nodeLicense.totalSupply();

			const ownerShare = 20_000; // 2 %
			const keyBucketShare = 843_750; // 84.375 %
			const esXaiBucketShare = 136_250; // 13.625 %

			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[mintedKeyId],
				[
					ownerShare,
					keyBucketShare,
					esXaiBucketShare
				],
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			);

			// Save reference to the new staking pool
			const stakingPoolAddress = await poolFactory.connect(addr1).getPoolAddress(0);
			const stakingPool = new Contract(stakingPoolAddress, StakingPoolAbi);

			// addresses
			const addr2Address = await addr2.getAddress();
			const addr3Address = await addr3.getAddress();
			const poolFactoryAddress = await poolFactory.getAddress();

			// Mint a key to addr2 & stake
			const addr2KeysToStake = 1;
			const price2 = await nodeLicense.price(addr2KeysToStake, "");
			await nodeLicense.connect(addr2).mint(addr2KeysToStake, "", {value: price2});
			const mintedKeyId2 = await nodeLicense.totalSupply();
			await poolFactory.connect(addr2).stakeKeys(stakingPoolAddress, [mintedKeyId2]);

			// Mint & stake 10 esXai for addr2
			const addr2EsXaiToStake = 10;
			await esXai.connect(esXaiMinter).mint(addr2Address, addr2EsXaiToStake);
			await esXai.connect(addr2).increaseAllowance(poolFactoryAddress, addr2EsXaiToStake);
			await poolFactory.connect(addr2).stakeEsXai(stakingPoolAddress, addr2EsXaiToStake);

			// Mint 10 keys to addr3 & stake
			const addr3KeysToStake = 10
			const price3 = await nodeLicense.price(addr3KeysToStake, "");
			await nodeLicense.connect(addr3).mint(addr3KeysToStake, "", {value: price3});
			const supplyAfterAddr3Mint = await nodeLicense.totalSupply();
			const addr3Keys = [];
			for (let i = mintedKeyId2; i < supplyAfterAddr3Mint; i++) {
				addr3Keys.push(i + 1n);
			}
			await referee.connect(kycAdmin).addKycWallet(addr3Address);
			await poolFactory.connect(addr3).stakeKeys(stakingPoolAddress, addr3Keys);

			// Mint & stake 100 esXai for addr3
			const addr3EsXaiToStake = 100;
			await esXai.connect(esXaiMinter).mint(addr3Address, addr3EsXaiToStake);
			await esXai.connect(addr3).increaseAllowance(poolFactoryAddress, addr3EsXaiToStake);
			await poolFactory.connect(addr3).stakeEsXai(stakingPoolAddress, addr3EsXaiToStake);

			// Mint 1000 esXai to the stakingPool
			const poolAmount = 100_000;
			await esXai.connect(esXaiMinter).mint(stakingPoolAddress, poolAmount);
			const stakingPoolBalance = await esXai.connect(addr1).balanceOf(stakingPoolAddress);
			expect(stakingPoolBalance).to.equal(poolAmount);

			// Calculate rewards for each bucket & amount per key/esXai
			const amountForKeyBucket = Math.floor((poolAmount * keyBucketShare) / rewardModifier);
			const amountForEsXaiBucket = Math.floor((poolAmount * esXaiBucketShare) / rewardModifier);
			const keyBucketTotalSupply = addr1KeyQuantity + addr2KeysToStake + addr3KeysToStake;
			const amountPerKey = Math.floor(amountForKeyBucket / keyBucketTotalSupply);
			const esXaiBucketTotalSupply = addr2EsXaiToStake + addr3EsXaiToStake;
			const amountPerEsXaiStaked = Math.floor(amountForEsXaiBucket / esXaiBucketTotalSupply);

			// Determine addr2 owed amount
			const addr2AmountFromKeys = Math.floor(addr2KeysToStake * amountPerKey);
			const addr2AmountFromEsXai = Math.floor(addr2EsXaiToStake * amountPerEsXaiStaked);
			const addr2TotalClaimAmount = BigInt(addr2AmountFromKeys + addr2AmountFromEsXai);
			const addr2UndistributedClaimAmount1 = await stakingPool.connect(addr2).getUndistributedClaimAmount(addr2Address);
			expect(addr2UndistributedClaimAmount1[0]).to.equal(addr2TotalClaimAmount);

			// Determine addr3 owed amount
			const addr3AmountFromKeys = Math.floor(addr3KeysToStake * amountPerKey);
			const addr3AmountFromEsXai = Math.floor(addr3EsXaiToStake * amountPerEsXaiStaked);
			const addr3UndistributedClaimAmount1 = await stakingPool.connect(addr3).getUndistributedClaimAmount(addr3Address);
			const addr3TotalClaimAmount = BigInt(addr3AmountFromKeys + addr3AmountFromEsXai);
			expect(addr3UndistributedClaimAmount1[0]).to.equal(addr3TotalClaimAmount);
		});
	}
}
