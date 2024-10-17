import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {findWinningStateRoot} from "../Referee.mjs";
import {submitTestChallenge} from "../utils/submitTestChallenge.mjs";
import {mintBatchedLicenses, mintSingleLicense} from "../utils/mintLicenses.mjs";
import {createPool} from "../utils/createPool.mjs";

/**
 * @title Failed KYC Tests
 * @dev Implementation of the failed KYC tests
 */
export function FailedKycTests(deployInfrastructure) {
    return function() {
    
        it("Check that admin can add and remove kyc fail successfully.", async function() {
            const {refereeDefaultAdmin, addr4, poolFactory} = await loadFixture(deployInfrastructure);

            // Check that the address is not in the failed kyc list
            const kycFailBefore = await poolFactory.failedKyc(await addr4.getAddress());
            expect(kycFailBefore).to.equal(false);
            
            // Add the address to the failed kyc list
            await poolFactory.connect(refereeDefaultAdmin).setFailedKyc(await addr4.getAddress(), true);

            // Check that the address is now in the failed kyc list
            const kycFailAfter = await poolFactory.failedKyc(await addr4.getAddress());
            expect(kycFailAfter).to.equal(true);

            // Remove the address from the failed kyc list
            await poolFactory.connect(refereeDefaultAdmin).setFailedKyc(await addr4.getAddress(), false);

            // Check that the address is no longer in the failed kyc list
            const kycFailAfterRemove = await poolFactory.failedKyc(await addr4.getAddress());
            expect(kycFailAfterRemove).to.equal(false);
        });
    
        it("Check that a failed kyc wallet cannot add stake to a pool.", async function() {
            const {refereeDefaultAdmin, addr1: poolOwner, addr4: failedKycWallet, poolFactory, nodeLicense, referee, esXai, esXaiMinter, challenger} = await loadFixture(deployInfrastructure);

            // Mint Node License to pool owner
            const poolOwnerKeyId = await mintSingleLicense(nodeLicense, poolOwner);

            // Mint Node License to failed kyc wallet
            const failedKycKeyId = await mintSingleLicense(nodeLicense, failedKycWallet);
            
            // Submit a challenge so that a pool can be created (required to prevent overflow subtraction error)
            const challengeId = 0;
            const keys = [poolOwnerKeyId];
			
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);

            // Create a new pool
            const stakingPoolAddress = await createPool(poolFactory, poolOwner, keys);
            
            // Check that the failedKycWallet is not in the failed kyc list
            const kycFailBefore = await poolFactory.failedKyc(await failedKycWallet.getAddress());
            expect(kycFailBefore).to.equal(false);
            
            // Add the failedKycWallet to the failed kyc list
            await poolFactory.connect(refereeDefaultAdmin).setFailedKyc(await failedKycWallet.getAddress(), true);

            // Check that the failedKycWallet is now in the failed kyc list
            const kycFailAfter = await poolFactory.failedKyc(await failedKycWallet.getAddress());
            expect(kycFailAfter).to.equal(true);
            
            const failedKeys = [failedKycKeyId];
            // Check that the failed kyc wallet cannot stake keys in the pool
            await expect(poolFactory.connect(failedKycWallet).stakeKeys(stakingPoolAddress, failedKeys)).to.be.revertedWith("38");

            // Mint some esXai to the failed kyc wallet
            const mintAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(failedKycWallet.address, mintAmount);

            // Check that the failed kyc wallet cannot stake esXai in the pool
            await expect(poolFactory.connect(failedKycWallet).stakeEsXai(stakingPoolAddress, mintAmount)).to.be.revertedWith("38");

        });

        it("Check redemption cannot be initiated for failed kyc wallets.", async function() {
            const {esXai, esXaiMinter, addr3, esXaiDefaultAdmin, addr4: failedKycWallet, poolFactory, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);            
            
            // Check that the failedKycWallet is not in the failed kyc list
            const kycFailBefore = await poolFactory.failedKyc(await failedKycWallet.getAddress());
            expect(kycFailBefore).to.equal(false);
            
            // Add the failedKycWallet to the failed kyc list
            await poolFactory.connect(refereeDefaultAdmin).setFailedKyc(await failedKycWallet.getAddress(), true);

            // Check that the failedKycWallet is now in the failed kyc list
            const kycFailAfter = await poolFactory.failedKyc(await failedKycWallet.getAddress());
            expect(kycFailAfter).to.equal(true);

            await esXai.connect(esXaiDefaultAdmin).changeRedemptionStatus(true);
            const redemptionAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(failedKycWallet.address, redemptionAmount);            
            const duration = 15 * 24 *60 *60;
            await expect (esXai.connect(failedKycWallet).startRedemption(redemptionAmount, duration)).to.be.revertedWith("KYC failed, cannot redeem");
        })


        it("Check redemption cannot be completed for failed kyc wallets.", async function() {
            const {esXai, esXaiMinter, addr3, esXaiDefaultAdmin, addr4: failedKycWallet, poolFactory, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);            
            
            // Check that the failedKycWallet is not in the failed kyc list
            const kycFailBefore = await poolFactory.failedKyc(await failedKycWallet.getAddress());
            expect(kycFailBefore).to.equal(false);

            await esXai.connect(esXaiDefaultAdmin).changeRedemptionStatus(true);
            const redemptionAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(failedKycWallet.address, redemptionAmount);            
            const duration = 15 * 24 *60 *60;
            await esXai.connect(failedKycWallet).startRedemption(redemptionAmount, duration);
            await network.provider.send("evm_increaseTime", [duration]);
            await network.provider.send("evm_mine");
            
            // Add the failedKycWallet to the failed kyc list
            await poolFactory.connect(refereeDefaultAdmin).setFailedKyc(await failedKycWallet.getAddress(), true);

            // Check that the failedKycWallet is now in the failed kyc list
            const kycFailAfter = await poolFactory.failedKyc(await failedKycWallet.getAddress());
            expect(kycFailAfter).to.equal(true);
            await expect (esXai.connect(failedKycWallet).completeRedemption(0)).to.be.revertedWith("KYC failed, cannot redeem")
        })
    }
}