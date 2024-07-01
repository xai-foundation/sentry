import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { parse } from "csv/sync";
import { expect } from "chai";
import fs from "fs";

/**
 * @title Mint with Xai/esXai Tests
 * @dev Implementation of the mint with Xai/esXai Tests
 */
export function NodeLicenseTinyKeysTest(deployInfrastructure, poolConfigurations) {
	const {
		validShareValues,
		poolMetaData,
		poolSocials,
		poolTrackerDetails,
		noDelegateOwner,
	} = poolConfigurations;

    return function() {

        it("Check the max supply is 50,000", async function() {
            const {nodeLicense} = await loadFixture(deployInfrastructure);
            const maxSupply = await nodeLicense.maxSupply();
            expect(maxSupply).to.eq(BigInt(50000));
        })

        it("Check creating and removing an address promo code", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1, addr2} = await loadFixture(deployInfrastructure);
            const promoCode = await addr2.getAddress().toString();

            // Create a new promo code
            await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, await addr2.getAddress());
            let promoCodeData = await nodeLicense.getPromoCode(promoCode);
            expect(promoCodeData.recipient).to.equal(await addr2.getAddress());
            expect(promoCodeData.active).to.be.true;

            // Remove the promo code
            await nodeLicense.connect(nodeLicenseDefaultAdmin).removePromoCode(promoCode);
            promoCodeData = await nodeLicense.getPromoCode(promoCode);
            expect(promoCodeData.active).to.be.false;
        });

        it("Check all tiers were uploaded properly and the pricing tiers length is correct", async function() {
            const {nodeLicense} = await loadFixture(deployInfrastructure);
            const tiers = parse(fs.readFileSync('tierUpload.csv'), { columns: true });
            const pricingTiersLength = await nodeLicense.getPricingTiersLength();
            expect(pricingTiersLength).to.eq(tiers.length);
            for (const tier of tiers) {
                const tierData = await nodeLicense.getPricingTier(tier.tierIndex);
                expect(tierData.price).to.eq(ethers.parseEther(tier.unitCostInEth.toString()));
                expect(tierData.quantity).to.eq(BigInt(tier.quantityBeforeNextTier));
            }
        });

        it("Check minting an NFT and receiving it with ETH", async function() {
            const {nodeLicense, addr1, fundsReceiver} = await loadFixture(deployInfrastructure);
            const initialBalance = await ethers.provider.getBalance(fundsReceiver.address);
            const price = await nodeLicense.price(1, "");
            const totalSupplyBeforeMint = await nodeLicense.totalSupply();

            // Mint an NFT
            await nodeLicense.connect(addr1).mint(1, "", { value: price });

            // Check the NFT was received
            const owner = await nodeLicense.ownerOf(totalSupplyBeforeMint + BigInt(1));
            expect(owner).to.equal(addr1.address);

            // Check the fundsReceiver received the funds
            const finalBalance = await ethers.provider.getBalance(fundsReceiver.address);
            expect(finalBalance).to.eq(initialBalance + price);

            // Check the total supply increased
            const totalSupplyAfterMint = await nodeLicense.totalSupply();
            expect(totalSupplyAfterMint).to.eq(totalSupplyBeforeMint + BigInt(1));
        });
        it("Check minting an NFT and receiving it with Xai", async function() {

            const {nodeLicense, addr1, fundsReceiver, xai, xaiMinter} = await loadFixture(deployInfrastructure);
            
            // Check the initial balance of the fundsReceiver
            const initialBalanceFundsReceiver = await xai.balanceOf(fundsReceiver.address);

            // Mint some Xai to the minter
            await xai.connect(xaiMinter).mint(addr1.address, ethers.parseEther("3500"));
            const initialBalanceMinter= await xai.balanceOf(addr1.address);

            // Get the price of minting an NFT in Eth
            const priceInEther = await nodeLicense.price(1, "");

            // Convert the price to Xai
            const priceInXai = await nodeLicense.ethToXai(priceInEther);

            // Get the total supply before minting
            const totalSupplyBeforeMint = await nodeLicense.totalSupply();

            // Approve the contract to spend the Xai
            await xai.connect(addr1).approve(await nodeLicense.getAddress(), priceInXai);

            // Mint an NFT
            await nodeLicense.connect(addr1).mintWithXai(1, "", false, priceInEther);

            // Check the NFT was received
            const owner = await nodeLicense.ownerOf(totalSupplyBeforeMint + BigInt(1));
            expect(owner).to.equal(addr1.address);

            // Check the minting address was deducted the correct amount
            const finalBalanceMinter = await xai.balanceOf(addr1.address);
            expect(finalBalanceMinter).to.eq(initialBalanceMinter - priceInXai);

            // Check the fundsReceiver received the funds
            const finalFundsReceiverBalance = await xai.balanceOf(fundsReceiver.address);
            expect(finalFundsReceiverBalance).to.eq(initialBalanceFundsReceiver + priceInXai);

            // Check the total supply increased
            const totalSupplyAfterMint = await nodeLicense.totalSupply();
            expect(totalSupplyAfterMint).to.eq(totalSupplyBeforeMint + BigInt(1));
        });

        it("Check minting with Xai using a string promo code and receiving the correct funds", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1, addr2, fundsReceiver, xai, xaiMinter} = await loadFixture(deployInfrastructure);
            const recipient = addr1;
            const minter = addr2;

            // Check the initial balance of the fundsReceiver
            const initialBalanceFundsReceiver = await xai.balanceOf(fundsReceiver.address);
            const initialBalanceRecipient = await xai.balanceOf(recipient.address);

            // Mint some Xai to the minter
            await xai.connect(xaiMinter).mint(minter.address, ethers.parseEther("3500"));
            const initialBalanceMinter = await xai.balanceOf(minter.address);

            // Create a new promo code
            const promoCode = "PROMO2023";
            await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, recipient.address);

            // Get the price of minting an NFT in Eth
            const discountedPriceInEther = await nodeLicense.price(1, promoCode);
            
            // Convert the price to Xai
            const discountedPriceInXai = await nodeLicense.ethToXai(discountedPriceInEther);

            // Get the total supply before minting
            const totalSupplyBeforeMint = await nodeLicense.totalSupply();

            // Get the referral discount and reward percentages            
            const referralRewardPercentage = await nodeLicense.referralRewardPercentage();

            // Calculate the referral discount and reward
            const referralReward = discountedPriceInXai * referralRewardPercentage / BigInt(100);

            // Approve the contract to spend the Xai
            await xai.connect(minter).approve(await nodeLicense.getAddress(), discountedPriceInXai);

            // Mint an NFT with a promo code - false indicates use of Xai instead of esXai
            await nodeLicense.connect(minter).mintWithXai(1, promoCode, false, discountedPriceInXai);

            // Check the NFT was received
            const owner = await nodeLicense.ownerOf(totalSupplyBeforeMint + BigInt(1));
            expect(owner).to.equal(minter);

            // Check the minting address was deducted the correct amount
            const finalBalanceMinter = await xai.balanceOf(minter);
            expect(finalBalanceMinter).to.eq(initialBalanceMinter - discountedPriceInXai);

            // Check the fundsReceiver received the funds
            const finalBalanceFundsReceiver = await xai.balanceOf(fundsReceiver.address);
            expect(finalBalanceFundsReceiver).to.eq(initialBalanceFundsReceiver + discountedPriceInXai - referralReward);

            // Check the node license contract received the referral reward
            const contractBalance = await xai.balanceOf(await nodeLicense.getAddress());
            expect(contractBalance).to.eq(referralReward);

            // Enable claiming of referral rewards
            await nodeLicense.connect(nodeLicenseDefaultAdmin).setClaimable(true);
            
            // Check the recipient receives the referral reward upon claiming
            await nodeLicense.connect(recipient).claimReferralReward();
            const finalBalanceRecipient = await xai.balanceOf(recipient);
            expect(finalBalanceRecipient).to.eq(initialBalanceRecipient + referralReward);

            // Confirm the contract balance is now 0
            const finalContractBalance = await xai.balanceOf(await nodeLicense.getAddress());
            expect(finalContractBalance).to.eq(0);
        });

        it("Check minting with esXai using an address promo code and receiving the correct funds", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr1, addr2, fundsReceiver, esXai, esXaiMinter, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            const recipient = addr1;
            const minter = addr2;

            // Check the initial balance of the fundsReceiver
            const initialBalanceFundsReceiver = await esXai.balanceOf(fundsReceiver.address);
            const initialBalanceRecipient = await esXai.balanceOf(recipient.address);

            //Add Node License contract to the esXai minter's whitelist
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(await nodeLicense.getAddress());

            // Mint some Xai to the minter
            await esXai.connect(esXaiMinter).mint(minter.address, ethers.parseEther("3500"));
            const initialBalanceMinter = await esXai.balanceOf(minter.address);

            // Create a new promo code
            const promoCode = addr1.address.toString();
            await nodeLicense.connect(nodeLicenseDefaultAdmin).createPromoCode(promoCode, recipient.address);

            // Get the price of minting an NFT in Eth
            const priceInEther = await nodeLicense.price(1, promoCode);

            // Convert the price to Xai
            const priceInEsXai = await nodeLicense.ethToXai(priceInEther);

            // Get the total supply before minting
            const totalSupplyBeforeMint = await nodeLicense.totalSupply();

            // Approve the contract to spend the Xai
            await esXai.connect(minter).approve(await nodeLicense.getAddress(), priceInEsXai);

            // Get the referral discount and reward percentages            
            const referralRewardPercentage = await nodeLicense.referralRewardPercentage();

            // Calculate the referral discount and reward
            const referralReward = priceInEsXai * referralRewardPercentage / BigInt(100);

            // Approve the contract to spend the esXai
            await esXai.connect(minter).approve(await nodeLicense.getAddress(), priceInEsXai);

            // Mint an NFT with a promo code - true indicates use of esXai
            await nodeLicense.connect(minter).mintWithXai(1, promoCode, true, priceInEsXai);

            // Check the NFT was received
            const owner = await nodeLicense.ownerOf(totalSupplyBeforeMint + BigInt(1));
            expect(owner).to.equal(minter);

            // Check the minting address was deducted the correct amount
            const finalBalanceMinter = await esXai.balanceOf(minter);
            expect(finalBalanceMinter).to.eq(initialBalanceMinter - priceInEsXai);

            // Check the fundsReceiver received the funds
            const finalBalanceFundsReceiver = await esXai.balanceOf(fundsReceiver.address);
            expect(finalBalanceFundsReceiver).to.eq(initialBalanceFundsReceiver + priceInEsXai - referralReward);

            // Check the node license contract received the referral reward
            const contractBalance = await esXai.balanceOf(await nodeLicense.getAddress());
            expect(contractBalance).to.eq(referralReward);

            // Enable claiming of referral rewards
            await nodeLicense.connect(nodeLicenseDefaultAdmin).setClaimable(true);
            
            // Check the recipient receives the referral reward upon claiming
            await nodeLicense.connect(recipient).claimReferralReward();
            const finalBalanceRecipient = await esXai.balanceOf(recipient);
            expect(finalBalanceRecipient).to.eq(initialBalanceRecipient + referralReward);

            // Confirm the contract balance is now 0
            const finalContractBalance = await esXai.balanceOf(await nodeLicense.getAddress());
            expect(finalContractBalance).to.eq(0);
        });

        it("Check minting with esXai using an address promo code does not apply discount if address promo code does not own a node license", async function() {
            const {nodeLicense, nodeLicenseDefaultAdmin, addr3, addr4, fundsReceiver, esXai, esXaiMinter, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            const recipientWithNodeLicense = addr3;
            const recipientWithoutNodeLicense = addr4;

            // Confirm recipient 1 has a node license
            const recipientWithNodeLicenseBalance = await nodeLicense.balanceOf(recipientWithNodeLicense.address);
            expect(recipientWithNodeLicenseBalance).to.eq(2);

            // Confirm recipient 2 does not have a node license
            const recipientWithoutNodeLicenseBalance = await nodeLicense.balanceOf(recipientWithoutNodeLicense.address);
            expect(recipientWithoutNodeLicenseBalance).to.eq(0);

            // Convert the addresses to strings
            const recipient1AddressAsPromoCode = recipientWithNodeLicense.address.toString();
            const recipient2AddressAsPromoCode = recipientWithoutNodeLicense.address.toString();

            // Get the price of minting an NFT in Eth using recipient 1's address as a promo code
            const priceWithValidCode = await nodeLicense.price(1, recipient1AddressAsPromoCode);

            // Get the price of minting an NFT in Eth using recipient 2's address as a promo code
            const priceWithInValidCode = await nodeLicense.price(1, recipient2AddressAsPromoCode);

            expect(priceWithValidCode).to.be.below(priceWithInValidCode);
        });

        it("Process the tiny keys airdrop and confirm balances after", async function() {
            const {nodeLicense, refereeDefaultAdmin, addr1, addr2, addr3, addr4, tinyKeysAirDrop, deployer,referee, poolFactory, airdropMultiplier, nodeLicenseDefaultAdmin} = await loadFixture(deployInfrastructure);

            //Confirm initial total supply
            const maxSupplyBefore = await nodeLicense.maxSupply();
            const totalSupplyBefore = await nodeLicense.totalSupply();
            const user1BalanceBefore = await nodeLicense.balanceOf(addr1.address);
            const user2BalanceBefore = await nodeLicense.balanceOf(addr2.address);
            const user3BalanceBefore = await nodeLicense.balanceOf(addr3.address);

            // Create a Stake pool with user 1 as the owner staking a single key
			await poolFactory.connect(addr1).createPool(
				noDelegateOwner,
				[1],
				validShareValues,
				poolMetaData,
				poolSocials,
				poolTrackerDetails
			)

			// Check the user's updated assigned key count
			const user1KeyCountStakedBefore = await referee.connect(addr1).assignedKeysOfUserCount(addr1.address);
			expect(user1KeyCountStakedBefore).to.equal(1);  
            
            const poolAddress = referee.assignedKeyToPool(1);

            // User 2 will stake 4 keys in the pool
            await poolFactory.connect(addr2).stakeKeys(poolAddress, [2, 3, 4, 5]);
            const user2KeyCountStakedBefore = await referee.connect(addr2).assignedKeysOfUserCount(addr2.address);
            expect(user2KeyCountStakedBefore).to.equal(4);      

            // User 3 will stake 0 keys in the pool
            const user3KeyCountStakedBefore = await referee.connect(addr3).assignedKeysOfUserCount(addr3.address);
            expect(user3KeyCountStakedBefore).to.equal(0);

            // Starting Airdrop

            // Confirm staking is enabled
            expect(await referee.stakingEnabled()).to.be.true;
            // Start Airdrop
            await tinyKeysAirDrop.connect(deployer).startAirdrop();

            // Staking Key Should revert
            await expect(poolFactory.connect(addr4).stakeKeys(poolAddress, [6])).to.be.revertedWith("51");

            // Confirm Minting Disabled - Expect a mint to be reverted
            const priceBeforeAirdrop = await nodeLicense.price(1, "");
            await expect(nodeLicense.connect(addr1).mint(1, "", {value: priceBeforeAirdrop})).to.be.revertedWith("Minting is paused");

            // Process Airdrop
            const qtyToProcess = BigInt(50);
            await tinyKeysAirDrop.connect(deployer).processAirdropSegment(qtyToProcess);

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
            expect(totalSupplyAfter).to.equal((totalSupplyBefore * airdropMultiplier)+ totalSupplyBefore);

            // // Confirm Staking re-enabled
            expect(await referee.stakingEnabled()).to.be.true;

            
            // // Confirm minting works after airdrop
            await nodeLicense.connect(addr1).mint(1, "", {value: priceAfterAirdrop});
            const user1BalanceAfterMint = await nodeLicense.balanceOf(addr1.address);
            expect(user1BalanceAfterMint).to.equal(user1BalanceAfter + BigInt(1));
            
            // Confirm staking works after airdrop            
            await poolFactory.connect(addr2).stakeKeys(poolAddress, [6]);
            const user2KeyCountStakedAfterMint = await referee.connect(addr2).assignedKeysOfUserCount(addr2.address);
            expect(user2KeyCountStakedAfterMint).to.equal(user2KeyCountStakedAfter + BigInt(1));

            // Confirm max supply after air drop
            const maxSupplyAfter = await nodeLicense.maxSupply();
            expect(maxSupplyAfter).to.equal(maxSupplyBefore * airdropMultiplier);
            
        
        
        });
    }
}